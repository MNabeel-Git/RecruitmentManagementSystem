import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { RolesPermissionsService } from './roles-permissions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema }
    ])
  ],
  providers: [RolesPermissionsService],
  exports: [RolesPermissionsService]
})
export class RolesPermissionsModule {}


