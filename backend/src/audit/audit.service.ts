import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction, AuditResource } from './schemas/audit-log.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>
  ) {}

  async log(
    tenantId: string,
    userId: string,
    action: AuditAction,
    resource: AuditResource,
    resourceId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
    status: string = 'SUCCESS',
    errorMessage?: string
  ): Promise<void> {
    try {
      const auditLog = new this.auditLogModel({
        tenantId: tenantId || null,
        userId: userId || null,
        action,
        resource,
        resourceId: resourceId || null,
        oldValues: oldValues || {},
        newValues: newValues || {},
        ipAddress,
        userAgent,
        status,
        errorMessage
      });

      await auditLog.save();
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  async getLogs(
    tenantId?: string,
    userId?: string,
    resource?: AuditResource,
    resourceId?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: any = {};

    if (tenantId) {
      query.tenantId = tenantId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (resource) {
      query.resource = resource;
    }

    if (resourceId) {
      query.resourceId = resourceId;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.auditLogModel.find(query)
        .populate('tenantId', 'name')
        .populate('userId', 'email fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditLogModel.countDocuments(query).exec()
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

