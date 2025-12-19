import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobTemplate, JobTemplateDocument } from './schemas/job-template.schema';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { Client } from '../clients/schemas/client.schema';

@Injectable()
export class JobTemplatesService {
  constructor(
    @InjectModel(JobTemplate.name) private jobTemplateModel: Model<JobTemplateDocument>,
    @InjectModel(Client.name) private clientModel: Model<any>
  ) {}

  async create(createJobTemplateDto: CreateJobTemplateDto, userId: string, userRoleNames: string[], tenantId?: string): Promise<JobTemplateDocument> {
    const isAdmin = userRoleNames.includes('Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can create job templates');
    }

    const templateData = tenantId ? { ...createJobTemplateDto, tenantId } : createJobTemplateDto;
    const template = new this.jobTemplateModel(templateData);
    return template.save();
  }

  async findAll(clientId?: string, userId?: string, userRoleNames?: string[], tenantId?: string, page: number = 1, limit: number = 10): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: any = { isActive: true };

    if (tenantId) {
      query.tenantId = tenantId;
    }

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
      this.jobTemplateModel.find(query)
        .populate('client', 'name')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.jobTemplateModel.countDocuments(query).exec()
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string, userId?: string, userRoleNames?: string[], tenantId?: string): Promise<JobTemplateDocument> {
    const query: any = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const template = await this.jobTemplateModel.findOne(query).populate('client', 'name').exec();

    if (!template) {
      throw new NotFoundException('Job template not found');
    }

    if (userRoleNames && !userRoleNames.includes('Admin') && userId) {
      const hasAccess = await this.checkEmployeeAccess(template.client.toString(), userId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this job template');
      }
    }

    return template;
  }

  async findByClient(clientId: string, userId?: string, userRoleNames?: string[]): Promise<any[]> {
    if (userRoleNames && !userRoleNames.includes('Admin') && userId) {
      const hasAccess = await this.checkEmployeeAccess(clientId, userId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this client\'s templates');
      }
    }

    return this.jobTemplateModel.find({ client: clientId, isActive: true }).populate('client', 'name').lean().exec();
  }

  async remove(id: string, userId: string, userRoleNames: string[], tenantId?: string): Promise<void> {
    const query: any = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const template = await this.jobTemplateModel.findOne(query).lean().exec();

    if (!template) {
      throw new NotFoundException('Job template not found');
    }

    const isAdmin = userRoleNames.includes('Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can delete job templates');
    }

    await this.jobTemplateModel.findByIdAndUpdate(id, { isActive: false }).exec();
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

