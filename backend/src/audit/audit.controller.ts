import { Controller, Get, Query, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { AuditResource } from './schemas/audit-log.schema';

@ApiTags('Audit Logs')
@ApiBearerAuth('JWT-auth')
@Controller({
  path: 'audit-logs',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Version('1')
  @Roles('Admin')
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'resource', required: false, enum: AuditResource, description: 'Filter by resource type' })
  @ApiQuery({ name: 'resourceId', required: false, description: 'Filter by resource ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({
    summary: 'Get audit logs',
    description: 'Get audit logs with filters. Admin only. Automatically filtered by tenant.'
  })
  @ApiResponse({ status: 200, description: 'Paginated list of audit logs' })
  async getLogs(
    @Query('userId') userId?: string,
    @Query('resource') resource?: AuditResource,
    @Query('resourceId') resourceId?: string,
    @Query() pagination?: PaginationDto,
    @GetUser() user?: any
  ): Promise<PaginatedResponseDto<any>> {
    return this.auditService.getLogs(
      user?.tenantId,
      userId,
      resource,
      resourceId,
      pagination?.page,
      pagination?.limit
    );
  }
}

