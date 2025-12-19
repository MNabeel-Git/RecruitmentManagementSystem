import { IsString, IsNotEmpty, IsArray, ValidateNested, IsMongoId, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateFieldDto } from '../../job-templates/dto/create-job-template.dto';

export class CreateJobVacancyDto {
  @ApiProperty({ description: 'Job vacancy name', example: 'Senior Software Developer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Job vacancy description', example: 'Looking for experienced developer' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Client ID', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  client: string;

  @ApiProperty({ description: 'Job Template ID', example: '507f1f77bcf86cd799439012' })
  @IsMongoId()
  @IsNotEmpty()
  jobTemplate: string;

  @ApiPropertyOptional({
    description: 'Custom candidate data schema (overrides template schema if provided)',
    type: [TemplateFieldDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateFieldDto)
  @IsOptional()
  candidateDataSchema?: TemplateFieldDto[];

  @ApiPropertyOptional({
    description: 'Assigned agency IDs',
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
    type: [String]
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  assignedAgencies?: string[];
}

