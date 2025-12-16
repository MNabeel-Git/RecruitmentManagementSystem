import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { Permission, PermissionDocument } from './schemas/permission.schema';

@Injectable()
export class RolesPermissionsService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>
  ) {}

  async findRoleById(id: string): Promise<RoleDocument | null> {
    return this.roleModel.findById(id).populate('permissions').exec();
  }

  async findRoleByName(name: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name, isActive: true }).populate('permissions').exec();
  }

  async findPermissionById(id: string): Promise<PermissionDocument | null> {
    return this.permissionModel.findById(id).exec();
  }

  async getUserPermissions(userRoles: string[]): Promise<string[]> {
    const roles = await this.roleModel
      .find({ _id: { $in: userRoles }, isActive: true })
      .populate('permissions')
      .exec();

    const permissionSet = new Set<string>();
    roles.forEach((role) => {
      role.permissions.forEach((permission: any) => {
        if (permission.isActive) {
          permissionSet.add(permission.name);
        }
      });
    });

    return Array.from(permissionSet);
  }
}

