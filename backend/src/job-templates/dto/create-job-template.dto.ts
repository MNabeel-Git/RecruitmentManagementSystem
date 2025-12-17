import { IsString, IsNotEmpty, IsArray, ValidateNested, IsMongoId, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TemplateFieldDto {
  @ApiProperty({ description: 'Field key/name', example: 'fullName' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Field type', example: 'text', enum: ['text', 'email', 'number', 'date', 'select', 'textarea'] })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['text', 'email', 'number', 'date', 'select', 'textarea'])
  type: string;

  @ApiProperty({ description: 'Is field required', example: true })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({ description: 'Field label', example: 'Full Name' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ description: 'Options for select type', example: ['Option 1', 'Option 2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}

export class CreateJobTemplateDto {
  @ApiProperty({ description: 'Job template name', example: 'Software Developer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Job template description', example: 'Full-stack developer position' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Client ID', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  client: string;

  @ApiProperty({
    description: 'Candidate data schema',
    example: [
      { key: 'fullName', type: 'text', required: true, label: 'Full Name' },
      { key: 'email', type: 'email', required: true, label: 'Email Address' },
      { key: 'experience', type: 'number', required: false, label: 'Years of Experience' }
    ],
    type: [TemplateFieldDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateFieldDto)
  candidateDataSchema: TemplateFieldDto[];
}

