import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Permission name', example: 'CREATE_JOB' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Permission description', example: 'Permission to create job vacancies' })
  @IsString()
  @IsOptional()
  description?: string;
}

