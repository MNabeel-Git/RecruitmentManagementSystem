import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>
  ) {}

  async create(createClientDto: CreateClientDto, userId: string, tenantId?: string): Promise<ClientDocument> {
    const clientData = tenantId ? { ...createClientDto, tenantId } : createClientDto;
    const client = new this.clientModel(clientData);
    return client.save();
  }

  async findAll(userId: string, userRoleNames: string[], tenantId?: string, page: number = 1, limit: number = 10): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const isAdmin = userRoleNames.includes('Admin');
    const query: any = isAdmin 
      ? { isActive: true }
      : { assignedEmployee: userId, isActive: true };
    
    if (tenantId) {
      query.tenantId = tenantId;
    }
    
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.clientModel.find(query)
        .populate('assignedEmployee', 'fullName email')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.clientModel.countDocuments(query).exec()
    ]);
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string, userId: string, userRoleNames: string[], tenantId?: string): Promise<ClientDocument> {
    const query: any = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const client = await this.clientModel.findOne(query).populate('assignedEmployee', 'fullName email').exec();
    
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const isAdmin = userRoleNames.includes('Admin');
    if (!isAdmin && client.assignedEmployee.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this client');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string, userRoleNames: string[], tenantId?: string): Promise<any> {
    const query: any = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const client = await this.clientModel.findOne(query).lean().exec();
    
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const isAdmin = userRoleNames.includes('Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can update clients');
    }

    const updatedClient = await this.clientModel.findByIdAndUpdate(
      id,
      updateClientDto,
      { new: true }
    ).populate('assignedEmployee', 'fullName email').lean().exec();

    if (!updatedClient) {
      throw new NotFoundException('Client not found');
    }

    return updatedClient;
  }

  async remove(id: string, userId: string, userRoleNames: string[], tenantId?: string): Promise<void> {
    const query: any = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    const client = await this.clientModel.findOne(query).lean().exec();
    
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const isAdmin = userRoleNames.includes('Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can delete clients');
    }

    await this.clientModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }
}

