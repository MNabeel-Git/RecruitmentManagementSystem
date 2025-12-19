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
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CandidateResponseDto } from './dto/candidate-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { Audit } from '../audit/decorators/audit.decorator';
import { AuditAction, AuditResource } from '../audit/schemas/audit-log.schema';

@ApiTags('Candidates')
@ApiBearerAuth('JWT-auth')
@Controller({
  path: 'candidates',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @Version('1')
  @Roles('Agency')
  @Audit(AuditAction.CREATE, AuditResource.CANDIDATE)
  @ApiOperation({
    summary: 'Create candidate',
    description: 'Create a new candidate. Agency users can only add candidates to jobs assigned to their agency. Candidate data must follow the job vacancy schema.'
  })
  @ApiResponse({ status: 201, description: 'Candidate created successfully', type: CandidateResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Agency access required or job not assigned' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error' })
  async create(
    @Body() createCandidateDto: CreateCandidateDto,
    @GetUser() user: any
  ): Promise<CandidateResponseDto> {
    const candidate = await this.candidatesService.create(createCandidateDto, user.id, user.roleNames || [], user.tenantId);
    return this.mapToResponseDto(candidate);
  }

  @Get()
  @Version('1')
  @ApiQuery({ name: 'jobVacancyId', required: false, description: 'Filter by job vacancy ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({
    summary: 'Get all candidates',
    description: 'Get all candidates with pagination. Agency users see only their candidates. Employees/Admins see candidates for their accessible jobs.'
  })
  @ApiResponse({ status: 200, description: 'Paginated list of candidates' })
  async findAll(
    @Query('jobVacancyId') jobVacancyId?: string,
    @Query() pagination?: PaginationDto,
    @GetUser() user?: any
  ): Promise<PaginatedResponseDto<CandidateResponseDto>> {
    const result = await this.candidatesService.findAll(
      jobVacancyId,
      user?.id,
      user?.roleNames || [],
      user?.tenantId,
      pagination?.page,
      pagination?.limit
    );
    return {
      ...result,
      data: result.data.map(candidate => this.mapToResponseDto(candidate))
    };
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({
    summary: 'Get candidate by ID',
    description: 'Get a specific candidate. Agency users can only access their candidates. Employees can access candidates for their assigned clients.'
  })
  @ApiResponse({ status: 200, description: 'Candidate details', type: CandidateResponseDto })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: any
  ): Promise<CandidateResponseDto> {
    const candidate = await this.candidatesService.findOne(id, user.id, user.roleNames || [], user.tenantId);
    return this.mapToResponseDto(candidate);
  }

  @Patch(':id')
  @Version('1')
  @Roles('Agency')
  @Audit(AuditAction.UPDATE, AuditResource.CANDIDATE)
  @ApiOperation({
    summary: 'Update candidate',
    description: 'Update a candidate. Agency users can only update candidates they created. Candidate data must follow the job vacancy schema.'
  })
  @ApiResponse({ status: 200, description: 'Candidate updated successfully', type: CandidateResponseDto })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error' })
  async update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @GetUser() user: any
  ): Promise<CandidateResponseDto> {
    const candidate = await this.candidatesService.update(id, updateCandidateDto, user.id, user.roleNames || [], user.tenantId);
    return this.mapToResponseDto(candidate);
  }

  @Delete(':id')
  @Version('1')
  @Roles('Agency')
  @Audit(AuditAction.DELETE, AuditResource.CANDIDATE)
  @ApiOperation({
    summary: 'Delete candidate',
    description: 'Soft delete a candidate. Agency users can only delete candidates they created.'
  })
  @ApiResponse({ status: 200, description: 'Candidate deleted successfully' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async remove(
    @Param('id') id: string,
    @GetUser() user: any
  ): Promise<{ message: string }> {
    await this.candidatesService.remove(id, user.id, user.roleNames || [], user.tenantId);
    return { message: 'Candidate deleted successfully' };
  }

  private mapToResponseDto(candidate: any): CandidateResponseDto {
    return {
      id: candidate._id.toString(),
      jobVacancy: candidate.jobVacancy._id ? candidate.jobVacancy._id.toString() : candidate.jobVacancy.toString(),
      createdBy: candidate.createdBy._id ? candidate.createdBy._id.toString() : candidate.createdBy.toString(),
      data: candidate.data,
      isActive: candidate.isActive,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt
    };
  }
}

