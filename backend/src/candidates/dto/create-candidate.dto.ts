import { IsNotEmpty, IsMongoId, IsObject, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ description: 'Job Vacancy ID', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  jobVacancy: string;

  @ApiProperty({
    description: 'Candidate data following the job vacancy schema',
    example: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      experience: 5
    }
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}

