import { ApiProperty } from '@nestjs/swagger';
import { TemplateFieldResponseDto } from '../../job-templates/dto/job-template-response.dto';

export class JobVacancyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  client: string;

  @ApiProperty()
  jobTemplate: string;

  @ApiProperty({ type: [TemplateFieldResponseDto] })
  candidateDataSchema: TemplateFieldResponseDto[];

  @ApiProperty({ type: [String] })
  assignedAgencies: string[];

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

