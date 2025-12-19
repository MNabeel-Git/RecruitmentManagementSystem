import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate, CandidateDocument } from './schemas/candidate.schema';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JobVacancy } from '../job-vacancies/schemas/job-vacancy.schema';
import { TemplateField } from '../job-templates/schemas/job-template.schema';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(JobVacancy.name) private jobVacancyModel: Model<any>
  ) {}

  async create(createCandidateDto: CreateCandidateDto, userId: string, userRoleNames: string[], tenantId?: string): Promise<CandidateDocument> {
    const isAgency = userRoleNames.includes('Agency');
    if (!isAgency) {
      throw new ForbiddenException('Only agency users can create candidates');
    }

    const jobVacancy = await this.jobVacancyModel.findById(createCandidateDto.jobVacancy).exec();
    if (!jobVacancy) {
      throw new NotFoundException('Job vacancy not found');
    }

    const hasAccess = await this.checkAgencyAccess(jobVacancy, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You can only add candidates to jobs assigned to your agency');
    }

    this.validateCandidateData(createCandidateDto.data, jobVacancy.candidateDataSchema);

    const candidateData: any = {
      jobVacancy: createCandidateDto.jobVacancy,
      data: createCandidateDto.data,
      createdBy: userId
    };
    if (tenantId) {
      candidateData.tenantId = tenantId;
    }

    const candidate = new this.candidateModel(candidateData);

    return candidate.save();
  }

  async findAll(jobVacancyId?: string, userId?: string, userRoleNames?: string[], tenantId?: string, page: number = 1, limit: number = 10): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: any = { isActive: true };

    if (tenantId) {
      query.tenantId = tenantId;
    }

    if (jobVacancyId) {
      query.jobVacancy = jobVacancyId;
    }

    if (userRoleNames && userRoleNames.includes('Agency') && userId) {
      query.createdBy = userId;
    }

    if (userRoleNames && (userRoleNames.includes('Admin') || userRoleNames.includes('Employee')) && jobVacancyId) {
      const jobVacancy = await this.jobVacancyModel.findById(jobVacancyId).lean().exec();
      if (!jobVacancy) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }

      if (userRoleNames.includes('Employee') && !userRoleNames.includes('Admin')) {
        const { Model } = await import('mongoose');
        const clientModel = this.candidateModel.db.models.Client || this.candidateModel.db.model('Client');
        const client = await clientModel.findById((jobVacancy as any).client).lean().exec();
        if (!client || !(client as any).assignedEmployee || (client as any).assignedEmployee.toString() !== userId) {
          return { data: [], total: 0, page, limit, totalPages: 0 };
        }
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.candidateModel.find(query)
        .populate('jobVacancy', 'name')
        .populate('createdBy', 'fullName email')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.candidateModel.countDocuments(query).exec()
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string, userId: string, userRoleNames: string[], tenantId?: string): Promise<CandidateDocument> {
    const query: any = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const candidate = await this.candidateModel.findOne(query)
      .populate('jobVacancy')
      .populate('createdBy', 'fullName email')
      .exec();

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const isAgency = userRoleNames.includes('Agency');
    const isAdmin = userRoleNames.includes('Admin');
    const isEmployee = userRoleNames.includes('Employee');

    if (isAgency) {
      if (candidate.createdBy.toString() !== userId) {
        throw new ForbiddenException('You can only access candidates you created');
      }
    } else if (isEmployee && !isAdmin) {
      const jobVacancy = await this.jobVacancyModel.findById(candidate.jobVacancy).exec();
      if (jobVacancy) {
        const { Model } = await import('mongoose');
        const clientModel = this.candidateModel.db.models.Client || this.candidateModel.db.model('Client');
        const client = await clientModel.findById(jobVacancy.client).exec();
        if (!client || client.assignedEmployee.toString() !== userId) {
          throw new ForbiddenException('You do not have access to this candidate');
        }
      }
    }

    return candidate;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto, userId: string, userRoleNames: string[], tenantId?: string): Promise<any> {
    const query: any = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const candidate = await this.candidateModel.findOne(query).lean().exec();

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const isAgency = userRoleNames.includes('Agency');
    if (!isAgency) {
      throw new ForbiddenException('Only agency users can update candidates');
    }

    if (candidate.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only update candidates you created');
    }

    const jobVacancy = await this.jobVacancyModel.findById(candidate.jobVacancy).lean().exec();
    if (!jobVacancy) {
      throw new NotFoundException('Job vacancy not found');
    }

    if (updateCandidateDto.data) {
      this.validateCandidateData(updateCandidateDto.data, (jobVacancy as any).candidateDataSchema);
    }

    const updatedCandidate = await this.candidateModel.findByIdAndUpdate(
      id,
      updateCandidateDto,
      { new: true }
    ).lean().exec();

    if (!updatedCandidate) {
      throw new NotFoundException('Candidate not found');
    }

    return updatedCandidate;
  }

  async remove(id: string, userId: string, userRoleNames: string[], tenantId?: string): Promise<void> {
    const query: any = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const candidate = await this.candidateModel.findOne(query).lean().exec();

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const isAgency = userRoleNames.includes('Agency');
    if (!isAgency) {
      throw new ForbiddenException('Only agency users can delete candidates');
    }

    if (candidate.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete candidates you created');
    }

    await this.candidateModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  private async checkAgencyAccess(jobVacancy: any, userId: string): Promise<boolean> {
    if (!jobVacancy.assignedAgencies || jobVacancy.assignedAgencies.length === 0) {
      return false;
    }

    const { Model } = await import('mongoose');
    const agencyModel = this.candidateModel.db.models.Agency || this.candidateModel.db.model('Agency');
    
    if (!agencyModel) {
      return false;
    }

    for (const agencyId of jobVacancy.assignedAgencies) {
      const agency = await agencyModel.findById(agencyId).exec();
      if (agency) {
        if (agency.users && Array.isArray(agency.users)) {
          const userIds = agency.users.map((u: any) => u.toString());
          if (userIds.includes(userId)) {
            return true;
          }
        }
        if (agency.user && agency.user.toString() === userId) {
          return true;
        }
      }
    }

    return false;
  }

  private validateCandidateData(data: Record<string, any>, schema: TemplateField[]): void {
    if (!schema || schema.length === 0) {
      return;
    }

    const schemaMap = new Map<string, TemplateField>();
    schema.forEach(field => {
      schemaMap.set(field.key, field);
    });

    for (const field of schema) {
      const value = data[field.key];

      if (field.required && (value === undefined || value === null || value === '')) {
        throw new BadRequestException(`Field '${field.key}' is required`);
      }

      if (value !== undefined && value !== null && value !== '') {
        this.validateFieldType(field, value);
      }
    }

    const dataKeys = Object.keys(data);
    for (const key of dataKeys) {
      if (!schemaMap.has(key)) {
        throw new BadRequestException(`Field '${key}' is not defined in the schema`);
      }
    }
  }

  private validateFieldType(field: TemplateField, value: any): void {
    switch (field.type) {
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          throw new BadRequestException(`Field '${field.key}' must be a string`);
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new BadRequestException(`Field '${field.key}' must be a valid email address`);
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          throw new BadRequestException(`Field '${field.key}' must be a number`);
        }
        break;

      case 'date':
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          throw new BadRequestException(`Field '${field.key}' must be a valid date`);
        }
        break;

      case 'select':
        if (!field.options || !field.options.includes(value)) {
          throw new BadRequestException(`Field '${field.key}' must be one of: ${field.options?.join(', ')}`);
        }
        break;

      default:
        throw new BadRequestException(`Unknown field type '${field.type}' for field '${field.key}'`);
    }
  }
}

