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

  async create(createJobTemplateDto: CreateJobTemplateDto, userId: string, userRoleNames: string[]): Promise<JobTemplateDocument> {
    const isAdmin = userRoleNames.includes('Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can create job templates');
    }

    const template = new this.jobTemplateModel(createJobTemplateDto);
    return template.save();
  }

  async findAll(clientId?: string, userId?: string, userRoleNames?: string[]): Promise<JobTemplateDocument[]> {
    const query: any = { isActive: true };

    if (clientId) {
      query.client = clientId;
    }

    if (userRoleNames && !userRoleNames.includes('Admin') && userId) {
      const clientIds = await this.getClientIdsForEmployee(userId);
      if (clientIds.length === 0) {
        return [];
      }
      query.client = { $in: clientIds };
    }

    return this.jobTemplateModel.find(query).populate('client', 'name').exec();
  }

  async findOne(id: string, userId?: string, userRoleNames?: string[]): Promise<JobTemplateDocument> {
    const template = await this.jobTemplateModel.findById(id).populate('client', 'name').exec();

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

  async findByClient(clientId: string, userId?: string, userRoleNames?: string[]): Promise<JobTemplateDocument[]> {
    if (userRoleNames && !userRoleNames.includes('Admin') && userId) {
      const hasAccess = await this.checkEmployeeAccess(clientId, userId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this client\'s templates');
      }
    }

    return this.jobTemplateModel.find({ client: clientId, isActive: true }).populate('client', 'name').exec();
  }

  async remove(id: string, userId: string, userRoleNames: string[]): Promise<void> {
    const template = await this.jobTemplateModel.findById(id).exec();

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

