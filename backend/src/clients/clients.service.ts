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

  async findAll(userId: string, userRoleNames: string[]): Promise<ClientDocument[]> {
    const isAdmin = userRoleNames.includes('Admin');
    
    if (isAdmin) {
      return this.clientModel.find({ isActive: true }).populate('assignedEmployee', 'fullName email').exec();
    }
    
    return this.clientModel.find({ assignedEmployee: userId, isActive: true })
      .populate('assignedEmployee', 'fullName email')
      .exec();
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
    const client = await this.clientModel.findById(id).exec();
    
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const isAdmin = userRoleNames.includes('Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can update clients');
    }

    Object.assign(client, updateClientDto);
    return client.save();
  }

  async remove(id: string, userId: string, userRoleNames: string[]): Promise<void> {
    const client = await this.clientModel.findById(id).exec();
    
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

