import { ApiProperty } from '@nestjs/swagger';

export class TemplateFieldResponseDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  required: boolean;

  @ApiProperty({ required: false })
  label?: string;

  @ApiProperty({ required: false, type: [String] })
  options?: string[];
}

export class JobTemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  client: string;

  @ApiProperty({ type: [TemplateFieldResponseDto] })
  candidateDataSchema: TemplateFieldResponseDto[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

