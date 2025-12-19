import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Version
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobVacanciesService } from './job-vacancies.service';
import { CreateJobVacancyDto } from './dto/create-job-vacancy.dto';
import { UpdateJobVacancyDto } from './dto/update-job-vacancy.dto';
import { JobVacancyResponseDto } from './dto/job-vacancy-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { Audit } from '../audit/decorators/audit.decorator';
import { AuditAction, AuditResource } from '../audit/schemas/audit-log.schema';

@ApiTags('Job Vacancies')
@ApiBearerAuth('JWT-auth')
@Controller({
  path: 'job-vacancies',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobVacanciesController {
  constructor(private readonly jobVacanciesService: JobVacanciesService) {}

  @Post()
  @Version('1')
  @Roles('Admin', 'Employee')
  @Audit(AuditAction.CREATE, AuditResource.JOB_VACANCY)
  @ApiOperation({
    summary: 'Create job vacancy',
    description: 'Create a new job vacancy. Employees can create for their assigned clients only.'
  })
  @ApiResponse({ status: 201, description: 'Job vacancy created successfully', type: JobVacancyResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async create(
    @Body() createJobVacancyDto: CreateJobVacancyDto,
    @GetUser() user: any
  ): Promise<JobVacancyResponseDto> {
    const vacancy = await this.jobVacanciesService.create(createJobVacancyDto, user.id, user.roleNames || [], user.tenantId);
    return this.mapToResponseDto(vacancy);
  }

  @Get()
  @Version('1')
  @ApiQuery({ name: 'clientId', required: false, description: 'Filter by client ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({
    summary: 'Get all job vacancies',
    description: 'Get all job vacancies with pagination. Admins see all, Employees see only vacancies for their assigned clients.'
  })
  @ApiResponse({ status: 200, description: 'Paginated list of job vacancies' })
  async findAll(
    @Query('clientId') clientId?: string,
    @Query() pagination?: PaginationDto,
    @GetUser() user?: any
  ): Promise<PaginatedResponseDto<JobVacancyResponseDto>> {
    const result = await this.jobVacanciesService.findAll(
      clientId,
      user?.id,
      user?.roleNames || [],
      user?.tenantId,
      pagination?.page,
      pagination?.limit
    );
    return {
      ...result,
      data: result.data.map(vacancy => this.mapToResponseDto(vacancy))
    };
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({
    summary: 'Get job vacancy by ID',
    description: 'Get a specific job vacancy. Employees can only access vacancies for their assigned clients.'
  })
  @ApiResponse({ status: 200, description: 'Job vacancy details', type: JobVacancyResponseDto })
  @ApiResponse({ status: 404, description: 'Job vacancy not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async findOne(
    @Param('id') id: string,
    @GetUser() user?: any
  ): Promise<JobVacancyResponseDto> {
    const vacancy = await this.jobVacanciesService.findOne(id, user?.id, user?.roleNames || [], user?.tenantId);
    return this.mapToResponseDto(vacancy);
  }

  @Get(':id/candidates')
  @Version('1')
  @ApiOperation({
    summary: 'Get candidates by job vacancy',
    description: 'Get all candidates for a specific job vacancy. Employees can only access vacancies for their assigned clients.'
  })
  @ApiResponse({ status: 200, description: 'List of candidates' })
  @ApiResponse({ status: 404, description: 'Job vacancy not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async getCandidatesByJob(
    @Param('id') id: string,
    @GetUser() user?: any
  ): Promise<any[]> {
    return this.jobVacanciesService.getCandidatesByJob(id, user?.id, user?.roleNames || [], user?.tenantId);
  }

  @Patch(':id')
  @Version('1')
  @Roles('Admin', 'Employee')
  @Audit(AuditAction.UPDATE, AuditResource.JOB_VACANCY)
  @ApiOperation({
    summary: 'Update job vacancy',
    description: 'Update a job vacancy. Employees can only update vacancies they created. Edits do not affect the original template.'
  })
  @ApiResponse({ status: 200, description: 'Job vacancy updated successfully', type: JobVacancyResponseDto })
  @ApiResponse({ status: 404, description: 'Job vacancy not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async update(
    @Param('id') id: string,
    @Body() updateJobVacancyDto: UpdateJobVacancyDto,
    @GetUser() user: any
  ): Promise<JobVacancyResponseDto> {
    const vacancy = await this.jobVacanciesService.update(id, updateJobVacancyDto, user.id, user.roleNames || [], user.tenantId);
    return this.mapToResponseDto(vacancy);
  }

  @Delete(':id')
  @Version('1')
  @Roles('Admin', 'Employee')
  @Audit(AuditAction.DELETE, AuditResource.JOB_VACANCY)
  @ApiOperation({
    summary: 'Delete job vacancy',
    description: 'Soft delete a job vacancy. Employees can only delete vacancies they created.'
  })
  @ApiResponse({ status: 200, description: 'Job vacancy deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job vacancy not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async remove(
    @Param('id') id: string,
    @GetUser() user: any
  ): Promise<{ message: string }> {
    await this.jobVacanciesService.remove(id, user.id, user.roleNames || [], user.tenantId);
    return { message: 'Job vacancy deleted successfully' };
  }

  private mapToResponseDto(vacancy: any): JobVacancyResponseDto {
    return {
      id: vacancy._id.toString(),
      name: vacancy.name,
      description: vacancy.description,
      client: vacancy.client._id ? vacancy.client._id.toString() : vacancy.client.toString(),
      jobTemplate: vacancy.jobTemplate._id ? vacancy.jobTemplate._id.toString() : vacancy.jobTemplate.toString(),
      candidateDataSchema: vacancy.candidateDataSchema,
      assignedAgencies: vacancy.assignedAgencies
        ? vacancy.assignedAgencies.map((agency: any) => agency._id ? agency._id.toString() : agency.toString())
        : [],
      createdBy: vacancy.createdBy._id ? vacancy.createdBy._id.toString() : vacancy.createdBy.toString(),
      isActive: vacancy.isActive,
      createdAt: vacancy.createdAt,
      updatedAt: vacancy.updatedAt
    };
  }
}

