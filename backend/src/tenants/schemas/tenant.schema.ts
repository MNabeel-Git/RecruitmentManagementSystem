import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  domain: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

TenantSchema.index({ name: 1 }, { unique: true });
TenantSchema.index({ domain: 1 });
TenantSchema.index({ isActive: 1 });

