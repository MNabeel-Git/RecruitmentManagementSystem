import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Version,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Clients')
@ApiBearerAuth('JWT-auth')
@Controller({
  path: 'clients',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Create client', description: 'Create a new client. Admin only.' })
  @ApiResponse({ status: 201, description: 'Client created successfully', type: ClientResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(
    @Body() createClientDto: CreateClientDto,
    @GetUser() user: any
  ): Promise<ClientResponseDto> {
    const client = await this.clientsService.create(createClientDto, user.id);
    return this.mapToResponseDto(client);
  }

  @Get()
  @Version('1')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ 
    summary: 'Get all clients', 
    description: 'Get all clients with pagination. Admins see all, Employees see only assigned clients.' 
  })
  @ApiResponse({ status: 200, description: 'Paginated list of clients' })
  async findAll(
    @Query() pagination: PaginationDto,
    @GetUser() user: any
  ): Promise<PaginatedResponseDto<ClientResponseDto>> {
    const result = await this.clientsService.findAll(
      user.id,
      user.roleNames || [],
      pagination.page,
      pagination.limit
    );
    return {
      ...result,
      data: result.data.map(client => this.mapToResponseDto(client))
    };
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ 
    summary: 'Get client by ID', 
    description: 'Get a specific client. Employees can only access their assigned clients.' 
  })
  @ApiResponse({ status: 200, description: 'Client details', type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied' })
  async findOne(@Param('id') id: string, @GetUser() user: any): Promise<ClientResponseDto> {
    const client = await this.clientsService.findOne(id, user.id, user.roleNames || []);
    return this.mapToResponseDto(client);
  }

  @Patch(':id')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update client', description: 'Update a client. Admin only.' })
  @ApiResponse({ status: 200, description: 'Client updated successfully', type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @GetUser() user: any
  ): Promise<ClientResponseDto> {
    const client = await this.clientsService.update(id, updateClientDto, user.id, user.roleNames || []);
    return this.mapToResponseDto(client);
  }

  @Delete(':id')
  @Version('1')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete client', description: 'Soft delete a client. Admin only.' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async remove(@Param('id') id: string, @GetUser() user: any): Promise<{ message: string }> {
    await this.clientsService.remove(id, user.id, user.roleNames || []);
    return { message: 'Client deleted successfully' };
  }

  private mapToResponseDto(client: any): ClientResponseDto {
    return {
      id: client._id.toString(),
      name: client.name,
      description: client.description,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone,
      address: client.address,
      assignedEmployee: client.assignedEmployee._id ? client.assignedEmployee._id.toString() : client.assignedEmployee.toString(),
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    };
  }
}

