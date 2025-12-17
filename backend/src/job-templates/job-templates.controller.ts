import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Version
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobTemplatesService } from './job-templates.service';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { JobTemplateResponseDto } from './dto/job-template-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Job Templates')
@ApiBearerAuth('JWT-auth')
@Controller({
  path: 'job-templates',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobTemplatesController {
  constructor(private readonly jobTemplatesService: JobTemplatesService) {}

  @Post()
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Create job template', description: 'Create a new job template. Admin only. Templates are immutable once created.' })
  @ApiResponse({ status: 201, description: 'Job template created successfully', type: JobTemplateResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(
    @Body() createJobTemplateDto: CreateJobTemplateDto,
    @GetUser() user: any
  ): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplatesService.create(createJobTemplateDto, user.id, user.roleNames || []);
    return this.mapToResponseDto(template);
  }

  @Get()
  @Version('1')
  @ApiQuery({ name: 'clientId', required: false, description: 'Filter by client ID' })
  @ApiOperation({
    summary: 'Get all job templates',
    description: 'Get all job templates. Admins see all, Employees see only templates for their assigned clients.'
  })
  @ApiResponse({ status: 200, description: 'List of job templates', type: [JobTemplateResponseDto] })
  async findAll(
    @Query('clientId') clientId?: string,
    @GetUser() user?: any
  ): Promise<JobTemplateResponseDto[]> {
    const templates = await this.jobTemplatesService.findAll(
      clientId,
      user?.id,
      user?.roleNames || []
    );
    return templates.map(template => this.mapToResponseDto(template));
  }

  @Get('client/:clientId')
  @Version('1')
  @ApiOperation({
    summary: 'Get templates by client',
    description: 'Get all job templates for a specific client. Employees can only access their assigned clients.'
  })
  @ApiResponse({ status: 200, description: 'List of job templates', type: [JobTemplateResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async findByClient(
    @Param('clientId') clientId: string,
    @GetUser() user?: any
  ): Promise<JobTemplateResponseDto[]> {
    const templates = await this.jobTemplatesService.findByClient(
      clientId,
      user?.id,
      user?.roleNames || []
    );
    return templates.map(template => this.mapToResponseDto(template));
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({
    summary: 'Get job template by ID',
    description: 'Get a specific job template. Employees can only access templates for their assigned clients.'
  })
  @ApiResponse({ status: 200, description: 'Job template details', type: JobTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Job template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async findOne(
    @Param('id') id: string,
    @GetUser() user?: any
  ): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplatesService.findOne(id, user?.id, user?.roleNames || []);
    return this.mapToResponseDto(template);
  }

  @Delete(':id')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete job template', description: 'Soft delete a job template. Admin only.' })
  @ApiResponse({ status: 200, description: 'Job template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async remove(
    @Param('id') id: string,
    @GetUser() user: any
  ): Promise<{ message: string }> {
    await this.jobTemplatesService.remove(id, user.id, user.roleNames || []);
    return { message: 'Job template deleted successfully' };
  }

  private mapToResponseDto(template: any): JobTemplateResponseDto {
    return {
      id: template._id.toString(),
      name: template.name,
      description: template.description,
      client: template.client._id ? template.client._id.toString() : template.client.toString(),
      candidateDataSchema: template.candidateDataSchema,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
  }
}

