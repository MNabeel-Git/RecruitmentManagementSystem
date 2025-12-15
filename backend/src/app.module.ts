import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesPermissionsModule } from './roles-permissions/roles-permissions.module';
import { ClientsModule } from './clients/clients.module';
import { JobTemplatesModule } from './job-templates/job-templates.module';
import { JobVacanciesModule } from './job-vacancies/job-vacancies.module';
import { AgenciesModule } from './agencies/agencies.module';
import { CandidatesModule } from './candidates/candidates.module';
import { AuditModule } from './audit/audit.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
        dbName: process.env.MONGODB_DB
      })
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesPermissionsModule,
    ClientsModule,
    JobTemplatesModule,
    JobVacanciesModule,
    AgenciesModule,
    CandidatesModule,
    AuditModule
  ]
})
export class AppModule {}


