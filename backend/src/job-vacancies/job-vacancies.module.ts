import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobVacanciesController } from './job-vacancies.controller';
import { JobVacanciesService } from './job-vacancies.service';
import { JobVacancy, JobVacancySchema } from './schemas/job-vacancy.schema';
import { JobTemplate, JobTemplateSchema } from '../job-templates/schemas/job-template.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobVacancy.name, schema: JobVacancySchema },
      { name: JobTemplate.name, schema: JobTemplateSchema },
      { name: Client.name, schema: ClientSchema }
    ])
  ],
  controllers: [JobVacanciesController],
  providers: [JobVacanciesService],
  exports: [JobVacanciesService]
})
export class JobVacanciesModule {}


