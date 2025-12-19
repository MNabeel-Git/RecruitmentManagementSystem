import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role, RoleDocument } from '../roles-permissions/schemas/role.schema';
import { Permission, PermissionDocument } from '../roles-permissions/schemas/permission.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { JobTemplate, JobTemplateDocument } from '../job-templates/schemas/job-template.schema';
import { JobVacancy, JobVacancyDocument } from '../job-vacancies/schemas/job-vacancy.schema';
import { Candidate, CandidateDocument } from '../candidates/schemas/candidate.schema';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(JobTemplate.name) private jobTemplateModel: Model<JobTemplateDocument>,
    @InjectModel(JobVacancy.name) private jobVacancyModel: Model<JobVacancyDocument>,
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    private usersService: UsersService
  ) {}

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting database seeding...');

      const tenant = await this.seedTenant();
      const permissions = await this.seedPermissions(tenant._id.toString());
      const roles = await this.seedRoles(tenant._id.toString(), permissions);
      const users = await this.seedUsers(tenant._id.toString(), roles);
      const clients = await this.seedClients(tenant._id.toString(), users);
      const jobTemplates = await this.seedJobTemplates(tenant._id.toString(), clients);
      const jobVacancies = await this.seedJobVacancies(tenant._id.toString(), clients, jobTemplates, users);
      await this.seedCandidates(tenant._id.toString(), jobVacancies, users);

      this.logger.log('Database seeding completed successfully!');
      this.logger.log('Sample credentials:');
      this.logger.log('Admin: admin@rms.com / password123');
      this.logger.log('Employee: employee@rms.com / password123');
      this.logger.log('Agency: agency@rms.com / password123');
    } catch (error) {
      this.logger.error('Error seeding database:', error);
      throw error;
    }
  }

  private async seedTenant(): Promise<TenantDocument> {
    let tenant = await this.tenantModel.findOne({ name: 'Default Tenant' }).exec();
    
    if (!tenant) {
      tenant = await this.tenantModel.create({
        name: 'Default Tenant',
        description: 'Default tenant for RMS',
        domain: 'rms.local',
        isActive: true
      });
      this.logger.log('Created default tenant');
    } else {
      this.logger.log('Tenant already exists, skipping...');
    }
    
    return tenant;
  }

  private async seedPermissions(tenantId: string): Promise<PermissionDocument[]> {
    const permissionsData = [
      { name: 'CREATE_JOB', description: 'Permission to create job vacancies' },
      { name: 'UPDATE_JOB', description: 'Permission to update job vacancies' },
      { name: 'DELETE_JOB', description: 'Permission to delete job vacancies' },
      { name: 'VIEW_CANDIDATES', description: 'Permission to view candidates' },
      { name: 'CREATE_CANDIDATE', description: 'Permission to create candidates' },
      { name: 'UPDATE_CANDIDATE', description: 'Permission to update candidates' },
      { name: 'DELETE_CANDIDATE', description: 'Permission to delete candidates' },
      { name: 'MANAGE_CLIENTS', description: 'Permission to manage clients' },
      { name: 'MANAGE_TEMPLATES', description: 'Permission to manage job templates' },
      { name: 'MANAGE_USERS', description: 'Permission to manage users' },
      { name: 'MANAGE_ROLES', description: 'Permission to manage roles and permissions' }
    ];

    const permissions: PermissionDocument[] = [];

    for (const permData of permissionsData) {
      let permission = await this.permissionModel.findOne({ 
        name: permData.name,
        tenantId 
      }).exec();

      if (!permission) {
        permission = await this.permissionModel.create({
          ...permData,
          tenantId,
          isActive: true
        });
        this.logger.log(`Created permission: ${permData.name}`);
      }

      permissions.push(permission);
    }

    return permissions;
  }

  private async seedRoles(tenantId: string, permissions: PermissionDocument[]): Promise<Map<string, RoleDocument>> {
    const rolesMap = new Map<string, RoleDocument>();

    const adminRole = await this.roleModel.findOne({ name: 'Admin', tenantId }).exec();
    if (!adminRole) {
      const adminPermissions = permissions.map(p => p._id);
      const createdAdmin = await this.roleModel.create({
        name: 'Admin',
        description: 'Administrator with full system access',
        permissions: adminPermissions,
        tenantId,
        isActive: true
      });
      rolesMap.set('Admin', createdAdmin);
      this.logger.log('Created Admin role');
    } else {
      rolesMap.set('Admin', adminRole);
    }

    const employeeRole = await this.roleModel.findOne({ name: 'Employee', tenantId }).exec();
    if (!employeeRole) {
      const employeePermissions = permissions
        .filter(p => ['CREATE_JOB', 'UPDATE_JOB', 'VIEW_CANDIDATES', 'MANAGE_CLIENTS'].includes(p.name))
        .map(p => p._id);
      const createdEmployee = await this.roleModel.create({
        name: 'Employee',
        description: 'Employee managing clients and job vacancies',
        permissions: employeePermissions,
        tenantId,
        isActive: true
      });
      rolesMap.set('Employee', createdEmployee);
      this.logger.log('Created Employee role');
    } else {
      rolesMap.set('Employee', employeeRole);
    }

    const agencyRole = await this.roleModel.findOne({ name: 'Agency', tenantId }).exec();
    if (!agencyRole) {
      const agencyPermissions = permissions
        .filter(p => ['VIEW_CANDIDATES', 'CREATE_CANDIDATE', 'UPDATE_CANDIDATE', 'DELETE_CANDIDATE'].includes(p.name))
        .map(p => p._id);
      const createdAgency = await this.roleModel.create({
        name: 'Agency',
        description: 'Agency user managing candidates',
        permissions: agencyPermissions,
        tenantId,
        isActive: true
      });
      rolesMap.set('Agency', createdAgency);
      this.logger.log('Created Agency role');
    } else {
      rolesMap.set('Agency', agencyRole);
    }

    return rolesMap;
  }

  private async seedUsers(tenantId: string, roles: Map<string, RoleDocument>): Promise<Map<string, UserDocument>> {
    const usersMap = new Map<string, UserDocument>();
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersData = [
      {
        email: 'admin@rms.com',
        password: hashedPassword,
        fullName: 'Admin User',
        roleName: 'Admin'
      },
      {
        email: 'employee@rms.com',
        password: hashedPassword,
        fullName: 'Employee User',
        roleName: 'Employee'
      },
      {
        email: 'agency@rms.com',
        password: hashedPassword,
        fullName: 'Agency User',
        roleName: 'Agency'
      }
    ];

    for (const userData of usersData) {
      let user = await this.userModel.findOne({ email: userData.email }).exec();
      
      if (!user) {
        const role = roles.get(userData.roleName);
        user = await this.userModel.create({
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          tenantId,
          roles: role ? [role._id] : [],
          isActive: true
        });
        this.logger.log(`Created user: ${userData.email}`);
      } else {
        const role = roles.get(userData.roleName);
        user = await this.userModel.findByIdAndUpdate(
          user._id,
          {
            password: userData.password,
            fullName: userData.fullName,
            tenantId,
            roles: role ? [role._id] : [],
            isActive: true
          },
          { new: true }
        ).exec();
        this.logger.log(`Updated user: ${userData.email}`);
      }
      
      usersMap.set(userData.roleName, user);
    }

    return usersMap;
  }

  private async seedClients(tenantId: string, users: Map<string, UserDocument>): Promise<ClientDocument[]> {
    const employee = users.get('Employee');
    if (!employee) {
      this.logger.warn('Employee user not found, skipping clients seed');
      return [];
    }

    const clientsData = [
      {
        name: 'TechCorp Solutions',
        description: 'Leading technology solutions provider',
        contactEmail: 'contact@techcorp.com',
        contactPhone: '+1-555-0101',
        address: '123 Tech Street, San Francisco, CA 94105',
        assignedEmployee: employee._id
      },
      {
        name: 'Global Finance Inc',
        description: 'International financial services company',
        contactEmail: 'info@globalfinance.com',
        contactPhone: '+1-555-0202',
        address: '456 Finance Avenue, New York, NY 10001',
        assignedEmployee: employee._id
      },
      {
        name: 'Healthcare Partners',
        description: 'Healthcare management organization',
        contactEmail: 'hello@healthcarepartners.com',
        contactPhone: '+1-555-0303',
        address: '789 Health Boulevard, Boston, MA 02115',
        assignedEmployee: employee._id
      }
    ];

    const clients: ClientDocument[] = [];

    for (const clientData of clientsData) {
      let client = await this.clientModel.findOne({ 
        name: clientData.name,
        tenantId 
      }).exec();

      if (!client) {
        client = await this.clientModel.create({
          ...clientData,
          tenantId,
          isActive: true
        });
        this.logger.log(`Created client: ${clientData.name}`);
      }

      clients.push(client);
    }

    return clients;
  }

  private async seedJobTemplates(tenantId: string, clients: ClientDocument[]): Promise<JobTemplateDocument[]> {
    if (clients.length === 0) {
      this.logger.warn('No clients found, skipping job templates seed');
      return [];
    }

    const templatesData = [
      {
        name: 'Software Developer',
        description: 'Full-stack software developer position',
        client: clients[0]._id,
        candidateDataSchema: [
          { key: 'fullName', type: 'text', required: true, label: 'Full Name' },
          { key: 'email', type: 'email', required: true, label: 'Email Address' },
          { key: 'phone', type: 'text', required: false, label: 'Phone Number' },
          { key: 'experience', type: 'number', required: true, label: 'Years of Experience' },
          { key: 'skills', type: 'textarea', required: true, label: 'Technical Skills' },
          { key: 'education', type: 'text', required: false, label: 'Education Level' }
        ]
      },
      {
        name: 'Financial Analyst',
        description: 'Financial analysis and reporting role',
        client: clients[1]._id,
        candidateDataSchema: [
          { key: 'fullName', type: 'text', required: true, label: 'Full Name' },
          { key: 'email', type: 'email', required: true, label: 'Email Address' },
          { key: 'experience', type: 'number', required: true, label: 'Years of Experience' },
          { key: 'certifications', type: 'text', required: false, label: 'Professional Certifications' },
          { key: 'currentSalary', type: 'number', required: false, label: 'Current Salary' }
        ]
      },
      {
        name: 'Healthcare Administrator',
        description: 'Healthcare facility administration role',
        client: clients[2]._id,
        candidateDataSchema: [
          { key: 'fullName', type: 'text', required: true, label: 'Full Name' },
          { key: 'email', type: 'email', required: true, label: 'Email Address' },
          { key: 'licenseNumber', type: 'text', required: true, label: 'Professional License Number' },
          { key: 'experience', type: 'number', required: true, label: 'Years of Experience' }
        ]
      }
    ];

    const templates: JobTemplateDocument[] = [];

    for (const templateData of templatesData) {
      let template = await this.jobTemplateModel.findOne({ 
        name: templateData.name,
        client: templateData.client,
        tenantId 
      }).exec();

      if (!template) {
        template = await this.jobTemplateModel.create({
          ...templateData,
          tenantId,
          isActive: true
        });
        this.logger.log(`Created job template: ${templateData.name}`);
      }

      templates.push(template);
    }

    return templates;
  }

  private async seedJobVacancies(
    tenantId: string,
    clients: ClientDocument[],
    templates: JobTemplateDocument[],
    users: Map<string, UserDocument>
  ): Promise<JobVacancyDocument[]> {
    if (templates.length === 0 || clients.length === 0) {
      this.logger.warn('No templates or clients found, skipping job vacancies seed');
      return [];
    }

    const employee = users.get('Employee');
    if (!employee) {
      this.logger.warn('Employee user not found, skipping job vacancies seed');
      return [];
    }

    const vacanciesData = [
      {
        name: 'Senior Software Developer',
        description: 'Looking for experienced full-stack developer',
        client: clients[0]._id,
        jobTemplate: templates[0]._id,
        candidateDataSchema: templates[0].candidateDataSchema,
        assignedAgencies: [],
        createdBy: employee._id
      },
      {
        name: 'Junior Financial Analyst',
        description: 'Entry-level financial analyst position',
        client: clients[1]._id,
        jobTemplate: templates[1]._id,
        candidateDataSchema: templates[1].candidateDataSchema,
        assignedAgencies: [],
        createdBy: employee._id
      }
    ];

    const vacancies: JobVacancyDocument[] = [];

    for (const vacancyData of vacanciesData) {
      let vacancy = await this.jobVacancyModel.findOne({ 
        name: vacancyData.name,
        client: vacancyData.client,
        tenantId 
      }).exec();

      if (!vacancy) {
        vacancy = await this.jobVacancyModel.create({
          ...vacancyData,
          tenantId,
          isActive: true
        });
        this.logger.log(`Created job vacancy: ${vacancyData.name}`);
      }

      vacancies.push(vacancy);
    }

    return vacancies;
  }

  private async seedCandidates(
    tenantId: string,
    jobVacancies: JobVacancyDocument[],
    users: Map<string, UserDocument>
  ): Promise<void> {
    if (jobVacancies.length === 0) {
      this.logger.warn('No job vacancies found, skipping candidates seed');
      return;
    }

    const agency = users.get('Agency');
    if (!agency) {
      this.logger.warn('Agency user not found, skipping candidates seed');
      return;
    }

    const candidatesData = [
      {
        jobVacancy: jobVacancies[0]._id,
        createdBy: agency._id,
        data: {
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-1001',
          experience: 5,
          skills: 'JavaScript, TypeScript, Node.js, React, MongoDB',
          education: 'Bachelor of Science in Computer Science'
        }
      },
      {
        jobVacancy: jobVacancies[0]._id,
        createdBy: agency._id,
        data: {
          fullName: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-1002',
          experience: 3,
          skills: 'Python, Django, PostgreSQL, Docker',
          education: 'Master of Science in Software Engineering'
        }
      },
      {
        jobVacancy: jobVacancies[1]._id,
        createdBy: agency._id,
        data: {
          fullName: 'Robert Johnson',
          email: 'robert.johnson@example.com',
          experience: 2,
          certifications: 'CFA Level 1',
          currentSalary: 60000
        }
      }
    ];

    for (const candidateData of candidatesData) {
      const existing = await this.candidateModel.findOne({
        jobVacancy: candidateData.jobVacancy,
        'data.email': candidateData.data.email,
        tenantId
      }).exec();

      if (!existing) {
        await this.candidateModel.create({
          ...candidateData,
          tenantId,
          isActive: true
        });
        this.logger.log(`Created candidate: ${candidateData.data.fullName}`);
      }
    }
  }
}

