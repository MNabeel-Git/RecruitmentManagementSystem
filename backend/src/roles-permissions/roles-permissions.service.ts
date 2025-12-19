import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class RolesPermissionsService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<RoleDocument> {
    const existingRole = await this.roleModel.findOne({ name: createRoleDto.name }).exec();
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = new this.roleModel(createRoleDto);
    return role.save();
  }

  async findAllRoles(): Promise<RoleDocument[]> {
    return this.roleModel.find({ isActive: true }).populate('permissions').lean().exec();
  }

  async findRoleById(id: string): Promise<RoleDocument | null> {
    return this.roleModel.findById(id).populate('permissions').lean().exec();
  }

  async findRoleByName(name: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name, isActive: true }).populate('permissions').lean().exec();
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleDocument> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleModel.findOne({ name: updateRoleDto.name }).exec();
      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    const updatedRole = await this.roleModel.findByIdAndUpdate(
      id,
      updateRoleDto,
      { new: true }
    ).populate('permissions').lean().exec();

    if (!updatedRole) {
      throw new NotFoundException('Role not found');
    }

    return updatedRole as any;
  }

  async removeRole(id: string): Promise<void> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.roleModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async createPermission(createPermissionDto: CreatePermissionDto): Promise<PermissionDocument> {
    const existingPermission = await this.permissionModel.findOne({ name: createPermissionDto.name }).exec();
    if (existingPermission) {
      throw new ConflictException('Permission with this name already exists');
    }

    const permission = await this.permissionModel.create(createPermissionDto);
    return permission.toObject();
  }

  async findAllPermissions(): Promise<PermissionDocument[]> {
    return this.permissionModel.find({ isActive: true }).lean().exec();
  }

  async findPermissionById(id: string): Promise<PermissionDocument | null> {
    return this.permissionModel.findById(id).lean().exec();
  }

  async findPermissionByName(name: string): Promise<PermissionDocument | null> {
    return this.permissionModel.findOne({ name, isActive: true }).lean().exec();
  }

  async updatePermission(id: string, updateDto: Partial<CreatePermissionDto>): Promise<PermissionDocument> {
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (updateDto.name && updateDto.name !== permission.name) {
      const existingPermission = await this.permissionModel.findOne({ name: updateDto.name }).exec();
      if (existingPermission) {
        throw new ConflictException('Permission with this name already exists');
      }
    }

    const updatedPermission = await this.permissionModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true }
    ).lean().exec();

    if (!updatedPermission) {
      throw new NotFoundException('Permission not found');
    }

    return updatedPermission as any;
  }

  async removePermission(id: string): Promise<void> {
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async getUserPermissions(userRoles: string[]): Promise<string[]> {
    const roles = await this.roleModel
      .find({ _id: { $in: userRoles }, isActive: true })
      .populate('permissions')
      .lean()
      .exec();

    const permissionSet = new Set<string>();
    roles.forEach((role: any) => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((permission: any) => {
          if (permission.isActive) {
            permissionSet.add(permission.name);
          }
        });
      }
    });

    return Array.from(permissionSet);
  }
}

