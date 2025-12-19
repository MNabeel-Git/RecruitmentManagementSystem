import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RolesPermissionsService } from '../roles-permissions/roles-permissions.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesPermissionsService: RolesPermissionsService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto & { refreshToken: string }> {
    const user = await this.usersService.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.updateLastLogin(user._id.toString());

    const roleIds = user.roles.map((role: any) => role.toString());
    const permissions = await this.rolesPermissionsService.getUserPermissions(roleIds);

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      roles: roleIds
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn')
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn')
    });

    await this.usersService.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        roles: roleIds,
        permissions
      }
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret')
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive || user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const roleIds = user.roles.map((role: any) => role.toString());
      const newPayload = {
        sub: user._id.toString(),
        email: user.email,
        roles: roleIds
      };

      const accessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn')
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

