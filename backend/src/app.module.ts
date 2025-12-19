import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { TenantsModule } from './tenants/tenants.module';
import { SeedModule } from './database/seed.module';
import { CustomThrottleGuard } from './common/guards/throttle.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const ttl = configService.get<number>('throttle.ttl') || 60;
        const limit = configService.get<number>('throttle.limit') || 10;
        return {
          throttlers: [{
            ttl: ttl * 1000,
            limit: limit
          }]
        };
      },
      inject: [ConfigService]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        dbName: configService.get<string>('mongodb.db')
      }),
      inject: [ConfigService]
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
    AuditModule,
    TenantsModule,
    SeedModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottleGuard
    }
  ]
})
export class AppModule {}


