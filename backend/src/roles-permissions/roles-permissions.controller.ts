import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Version,
  NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesPermissionsService } from './roles-permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { RoleResponseDto, PermissionResponseDto } from './dto/role-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Roles & Permissions')
@ApiBearerAuth('JWT-auth')
@Controller({
  path: 'roles-permissions',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesPermissionsController {
  constructor(private readonly rolesPermissionsService: RolesPermissionsService) {}

  @Post('roles')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Create role', description: 'Create a new role. Admin only.' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesPermissionsService.createRole(createRoleDto);
    return this.mapRoleToResponse(role);
  }

  @Get('roles')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all roles', description: 'Get all active roles. Admin only.' })
  @ApiResponse({ status: 200, description: 'List of roles', type: [RoleResponseDto] })
  async findAllRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.rolesPermissionsService.findAllRoles();
    return roles.map(role => this.mapRoleToResponse(role));
  }

  @Get('roles/:id')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get role by ID', description: 'Get a specific role. Admin only.' })
  @ApiResponse({ status: 200, description: 'Role details', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findRoleById(@Param('id') id: string): Promise<RoleResponseDto> {
    const role = await this.rolesPermissionsService.findRoleById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.mapRoleToResponse(role);
  }

  @Patch('roles/:id')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update role', description: 'Update a role. Admin only.' })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ): Promise<RoleResponseDto> {
    const role = await this.rolesPermissionsService.updateRole(id, updateRoleDto);
    return this.mapRoleToResponse(role);
  }

  @Delete('roles/:id')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete role', description: 'Soft delete a role. Admin only.' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async removeRole(@Param('id') id: string): Promise<{ message: string }> {
    await this.rolesPermissionsService.removeRole(id);
    return { message: 'Role deleted successfully' };
  }

  @Post('permissions')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Create permission', description: 'Create a new permission. Admin only.' })
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const permission = await this.rolesPermissionsService.createPermission(createPermissionDto);
    return this.mapPermissionToResponse(permission);
  }

  @Get('permissions')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all permissions', description: 'Get all active permissions. Admin only.' })
  @ApiResponse({ status: 200, description: 'List of permissions', type: [PermissionResponseDto] })
  async findAllPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.rolesPermissionsService.findAllPermissions();
    return permissions.map(permission => this.mapPermissionToResponse(permission));
  }

  @Get('permissions/:id')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get permission by ID', description: 'Get a specific permission. Admin only.' })
  @ApiResponse({ status: 200, description: 'Permission details', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findPermissionById(@Param('id') id: string): Promise<PermissionResponseDto> {
    const permission = await this.rolesPermissionsService.findPermissionById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return this.mapPermissionToResponse(permission);
  }

  @Patch('permissions/:id')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update permission', description: 'Update a permission. Admin only.' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async updatePermission(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreatePermissionDto>
  ): Promise<PermissionResponseDto> {
    const permission = await this.rolesPermissionsService.updatePermission(id, updateDto);
    return this.mapPermissionToResponse(permission);
  }

  @Delete('permissions/:id')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete permission', description: 'Soft delete a permission. Admin only.' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async removePermission(@Param('id') id: string): Promise<{ message: string }> {
    await this.rolesPermissionsService.removePermission(id);
    return { message: 'Permission deleted successfully' };
  }

  private mapRoleToResponse(role: any): RoleResponseDto {
    return {
      id: role._id.toString(),
      name: role.name,
      description: role.description,
      permissions: role.permissions
        ? role.permissions.map((p: any) => ({
            id: p._id ? p._id.toString() : p.toString(),
            name: p.name || p,
            description: p.description,
            isActive: p.isActive !== undefined ? p.isActive : true
          }))
        : [],
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };
  }

  private mapPermissionToResponse(permission: any): PermissionResponseDto {
    return {
      id: permission._id.toString(),
      name: permission.name,
      description: permission.description,
      isActive: permission.isActive
    };
  }
}

