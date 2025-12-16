import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { RolesPermissionsService } from '../../roles-permissions/roles-permissions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private rolesPermissionsService: RolesPermissionsService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const roleIds = user.roles.map((role: any) => role.toString());
    const permissions = await this.rolesPermissionsService.getUserPermissions(roleIds);
    
    const roleNames: string[] = [];
    for (const roleId of roleIds) {
      const role = await this.rolesPermissionsService.findRoleById(roleId);
      if (role && role.isActive) {
        roleNames.push(role.name);
      }
    }

    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      roles: roleIds,
      roleNames,
      permissions
    };
  }
}

