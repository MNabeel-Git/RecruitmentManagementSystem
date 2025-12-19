import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: '671234567890123',
      email: 'user@example.com',
      fullName: 'John Doe',
      roles: ['671234567890124'],
      permissions: ['CREATE_JOB', 'VIEW_CANDIDATES']
    }
  })
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
  };
}

