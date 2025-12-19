import { ApiProperty } from '@nestjs/swagger';

export class CandidateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  jobVacancy: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ type: Object })
  data: Record<string, any>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

