import { IsString, IsNotEmpty, IsArray, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'Manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Role description', example: 'Manager role with elevated permissions' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Permission IDs to assign to this role',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String]
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  permissions?: string[];
}

