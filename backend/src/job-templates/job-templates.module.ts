import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobTemplatesController } from './job-templates.controller';
import { JobTemplatesService } from './job-templates.service';
import { JobTemplate, JobTemplateSchema } from './schemas/job-template.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobTemplate.name, schema: JobTemplateSchema },
      { name: Client.name, schema: ClientSchema }
    ])
  ],
  controllers: [JobTemplatesController],
  providers: [JobTemplatesService],
  exports: [JobTemplatesService]
})
export class JobTemplatesModule {}


