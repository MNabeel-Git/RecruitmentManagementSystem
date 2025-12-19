import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobVacancy, JobVacancyDocument } from './schemas/job-vacancy.schema';
import { CreateJobVacancyDto } from './dto/create-job-vacancy.dto';
import { UpdateJobVacancyDto } from './dto/update-job-vacancy.dto';
import { JobTemplate } from '../job-templates/schemas/job-template.schema';
import { Client } from '../clients/schemas/client.schema';

@Injectable()
export class JobVacanciesService {
  constructor(
    @InjectModel(JobVacancy.name) private jobVacancyModel: Model<JobVacancyDocument>,
    @InjectModel(JobTemplate.name) private jobTemplateModel: Model<any>,
    @InjectModel(Client.name) private clientModel: Model<any>
  ) {}

  async create(createJobVacancyDto: CreateJobVacancyDto, userId: string, userRoleNames: string[]): Promise<JobVacancyDocument> {
    const isAdmin = userRoleNames.includes('Admin');
    const isEmployee = userRoleNames.includes('Employee');

    if (!isAdmin && !isEmployee) {
      throw new ForbiddenException('Only admins and employees can create job vacancies');
    }

    if (!isAdmin && isEmployee) {
      const hasAccess = await this.checkEmployeeAccess(createJobVacancyDto.client, userId);
      if (!hasAccess) {
        throw new ForbiddenException('You can only create job vacancies for your assigned clients');
      }
    }

    const template = await this.jobTemplateModel.findById(createJobVacancyDto.jobTemplate).exec();
    if (!template) {
      throw new NotFoundException('Job template not found');
    }

    const candidateDataSchema = createJobVacancyDto.candidateDataSchema || template.candidateDataSchema;

    const vacancyData = {
      ...createJobVacancyDto,
      candidateDataSchema,
      createdBy: userId
    };

    const vacancy = await this.jobVacancyModel.create(vacancyData);
    return vacancy.toObject();
  }

  async findAll(clientId?: string, userId?: string, userRoleNames?: string[], page: number = 1, limit: number = 10): Promise<{ data: JobVacancyDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: any = { isActive: true };

    if (clientId) {
      query.client = clientId;
    }

    if (userRoleNames && !userRoleNames.includes('Admin') && userId) {
      const clientIds = await this.getClientIdsForEmployee(userId);
      if (clientIds.length === 0) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
      query.client = { $in: clientIds };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.jobVacancyModel.find(query)
        .populate('client', 'name')
        .populate('jobTemplate', 'name')
        .populate('assignedAgencies', 'name')
        .populate('createdBy', 'fullName email')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.jobVacancyModel.countDocuments(query).exec()
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string, userId?: string, userRoleNames?: string[]): Promise<JobVacancyDocument> {
    const vacancy = await this.jobVacancyModel.findById(id)
      .populate('client', 'name')
      .populate('jobTemplate', 'name')
      .populate('assignedAgencies', 'name')
      .populate('createdBy', 'fullName email')
      .exec();

    if (!vacancy) {
      throw new NotFoundException('Job vacancy not found');
    }

    if (userRoleNames && !userRoleNames.includes('Admin') && userId) {
      const hasAccess = await this.checkEmployeeAccess(vacancy.client.toString(), userId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this job vacancy');
      }
    }

    return vacancy;
  }

  async update(id: string, updateJobVacancyDto: UpdateJobVacancyDto, userId: string, userRoleNames: string[]): Promise<JobVacancyDocument> {
    const vacancy = await this.jobVacancyModel.findById(id).lean().exec();

    if (!vacancy) {
      throw new NotFoundException('Job vacancy not found');
    }

    const isAdmin = userRoleNames.includes('Admin');
    const isEmployee = userRoleNames.includes('Employee');

    if (!isAdmin && !isEmployee) {
      throw new ForbiddenException('Only admins and employees can update job vacancies');
    }

    if (!isAdmin && isEmployee) {
      if (vacancy.createdBy.toString() !== userId) {
        throw new ForbiddenException('You can only update job vacancies you created');
      }

      if (updateJobVacancyDto.client) {
        const hasAccess = await this.checkEmployeeAccess(updateJobVacancyDto.client, userId);
        if (!hasAccess) {
          throw new ForbiddenException('You can only assign job vacancies to your assigned clients');
        }
      }
    }

    if (updateJobVacancyDto.jobTemplate) {
      const template = await this.jobTemplateModel.findById(updateJobVacancyDto.jobTemplate).lean().exec();
      if (!template) {
        throw new NotFoundException('Job template not found');
      }

      if (!updateJobVacancyDto.candidateDataSchema) {
        updateJobVacancyDto.candidateDataSchema = template.candidateDataSchema;
      }
    }

    const updatedVacancy = await this.jobVacancyModel.findByIdAndUpdate(
      id,
      updateJobVacancyDto,
      { new: true }
    )
      .populate('client', 'name')
      .populate('jobTemplate', 'name')
      .populate('assignedAgencies', 'name')
      .populate('createdBy', 'fullName email')
      .lean()
      .exec();

    if (!updatedVacancy) {
      throw new NotFoundException('Job vacancy not found');
    }

    return updatedVacancy as any;
  }

  async remove(id: string, userId: string, userRoleNames: string[]): Promise<void> {
    const vacancy = await this.jobVacancyModel.findById(id).lean().exec();

    if (!vacancy) {
      throw new NotFoundException('Job vacancy not found');
    }

    const isAdmin = userRoleNames.includes('Admin');
    const isEmployee = userRoleNames.includes('Employee');

    if (!isAdmin && !isEmployee) {
      throw new ForbiddenException('Only admins and employees can delete job vacancies');
    }

    if (!isAdmin && isEmployee) {
      if (vacancy.createdBy.toString() !== userId) {
        throw new ForbiddenException('You can only delete job vacancies you created');
      }
    }

    await this.jobVacancyModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async getCandidatesByJob(jobId: string, userId?: string, userRoleNames?: string[]): Promise<any[]> {
    const vacancy = await this.jobVacancyModel.findById(jobId).lean().exec();

    if (!vacancy) {
      throw new NotFoundException('Job vacancy not found');
    }

    if (userRoleNames && !userRoleNames.includes('Admin') && userId) {
      const hasAccess = await this.checkEmployeeAccess(vacancy.client.toString(), userId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this job vacancy');
      }
    }

    const { Model } = await import('mongoose');
    const candidateModel = this.jobVacancyModel.db.models.Candidate || this.jobVacancyModel.db.model('Candidate');
    const candidates = await candidateModel.find({ jobVacancy: jobId, isActive: true }).exec();
    return candidates;
  }

  private async checkEmployeeAccess(clientId: string, userId: string): Promise<boolean> {
    const client = await this.clientModel.findById(clientId).exec();
    return client && client.assignedEmployee && client.assignedEmployee.toString() === userId;
  }

  private async getClientIdsForEmployee(userId: string): Promise<string[]> {
    const clients = await this.clientModel.find({ assignedEmployee: userId, isActive: true }).select('_id').exec();
    return clients.map(c => c._id.toString());
  }
}

