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

  async create(createClientDto: CreateClientDto, userId: string): Promise<ClientDocument> {
    const client = new this.clientModel(createClientDto);
    return client.save();
  }

  async findAll(userId: string, userRoleNames: string[], page: number = 1, limit: number = 10): Promise<{ data: ClientDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const isAdmin = userRoleNames.includes('Admin');
    const query = isAdmin 
      ? { isActive: true }
      : { assignedEmployee: userId, isActive: true };
    
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

  async findOne(id: string, userId: string, userRoleNames: string[]): Promise<ClientDocument> {
    const client = await this.clientModel.findById(id).populate('assignedEmployee', 'fullName email').exec();
    
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const isAdmin = userRoleNames.includes('Admin');
    if (!isAdmin && client.assignedEmployee.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this client');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string, userRoleNames: string[]): Promise<ClientDocument> {
    const client = await this.clientModel.findById(id).lean().exec();
    
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

    return updatedClient as any;
  }

  async remove(id: string, userId: string, userRoleNames: string[]): Promise<void> {
    const client = await this.clientModel.findById(id).lean().exec();
    
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

