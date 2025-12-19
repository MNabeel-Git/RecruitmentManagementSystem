import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Role, RoleSchema } from '../roles-permissions/schemas/role.schema';
import { Permission, PermissionSchema } from '../roles-permissions/schemas/permission.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { JobTemplate, JobTemplateSchema } from '../job-templates/schemas/job-template.schema';
import { JobVacancy, JobVacancySchema } from '../job-vacancies/schemas/job-vacancy.schema';
import { Candidate, CandidateSchema } from '../candidates/schemas/candidate.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Client.name, schema: ClientSchema },
      { name: JobTemplate.name, schema: JobTemplateSchema },
      { name: JobVacancy.name, schema: JobVacancySchema },
      { name: Candidate.name, schema: CandidateSchema }
    ]),
    UsersModule
  ],
  providers: [SeedService],
  exports: [SeedService]
})
export class SeedModule {}

