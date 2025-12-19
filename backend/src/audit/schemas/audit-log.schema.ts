import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT'
}

export enum AuditResource {
  USER = 'USER',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  CLIENT = 'CLIENT',
  JOB_TEMPLATE = 'JOB_TEMPLATE',
  JOB_VACANCY = 'JOB_VACANCY',
  CANDIDATE = 'CANDIDATE'
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  action: AuditAction;

  @Prop({ required: true, index: true })
  resource: AuditResource;

  @Prop({ type: Types.ObjectId, index: true })
  resourceId: Types.ObjectId;

  @Prop({ type: Object })
  oldValues: Record<string, any>;

  @Prop({ type: Object })
  newValues: Record<string, any>;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  status: string;

  @Prop()
  errorMessage: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ createdAt: -1 });

