import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { JobVacancy, JobVacancySchema } from '../job-vacancies/schemas/job-vacancy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: JobVacancy.name, schema: JobVacancySchema }
    ])
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService]
})
export class CandidatesModule {}


