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

  async createRole(createRoleDto: CreateRoleDto, tenantId?: string): Promise<RoleDocument> {
    const query: any = { name: createRoleDto.name };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const existingRole = await this.roleModel.findOne(query).exec();
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const roleData = tenantId ? { ...createRoleDto, tenantId } : createRoleDto;
    const role = new this.roleModel(roleData);
    return role.save();
  }

  async findAllRoles(tenantId?: string): Promise<any[]> {
    const query: any = { isActive: true };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    return this.roleModel.find(query).populate('permissions').lean().exec();
  }

  async findRoleById(id: string): Promise<any> {
    return this.roleModel.findById(id).populate('permissions').lean().exec();
  }

  async findRoleByName(name: string, tenantId?: string): Promise<any> {
    const query: any = { name, isActive: true };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    return this.roleModel.findOne(query).populate('permissions').lean().exec();
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto, tenantId?: string): Promise<any> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const updateData: any = updateRoleDto;
    if ((updateData as any).name && (updateData as any).name !== role.name) {
      const query: any = { name: (updateData as any).name };
      if (tenantId) {
        query.tenantId = tenantId;
      }
      const existingRole = await this.roleModel.findOne(query).exec();
      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    const updatedRole = await this.roleModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('permissions').lean().exec();

    if (!updatedRole) {
      throw new NotFoundException('Role not found');
    }

    return updatedRole;
  }

  async removeRole(id: string): Promise<void> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.roleModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async createPermission(createPermissionDto: CreatePermissionDto, tenantId?: string): Promise<PermissionDocument> {
    const query: any = { name: createPermissionDto.name };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const existingPermission = await this.permissionModel.findOne(query).exec();
    if (existingPermission) {
      throw new ConflictException('Permission with this name already exists');
    }

    const permissionData = tenantId ? { ...createPermissionDto, tenantId } : createPermissionDto;
    const permission = await this.permissionModel.create(permissionData);
    return permission.toObject();
  }

  async findAllPermissions(tenantId?: string): Promise<any[]> {
    const query: any = { isActive: true };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    return this.permissionModel.find(query).lean().exec();
  }

  async findPermissionById(id: string): Promise<any> {
    return this.permissionModel.findById(id).lean().exec();
  }

  async findPermissionByName(name: string, tenantId?: string): Promise<any> {
    const query: any = { name, isActive: true };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    return this.permissionModel.findOne(query).lean().exec();
  }

  async updatePermission(id: string, updateDto: Partial<CreatePermissionDto>, tenantId?: string): Promise<any> {
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const updateData: any = updateDto;
    if (updateData.name && updateData.name !== permission.name) {
      const query: any = { name: updateData.name };
      if (tenantId) {
        query.tenantId = tenantId;
      }
      const existingPermission = await this.permissionModel.findOne(query).exec();
      if (existingPermission) {
        throw new ConflictException('Permission with this name already exists');
      }
    }

    const updatedPermission = await this.permissionModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean().exec();

    if (!updatedPermission) {
      throw new NotFoundException('Permission not found');
    }

    return updatedPermission;
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

