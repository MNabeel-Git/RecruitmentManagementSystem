import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  contactEmail: string;

  @Prop()
  contactPhone: string;

  @Prop()
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  assignedEmployee: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

ClientSchema.index({ assignedEmployee: 1 });
ClientSchema.index({ isActive: 1 });
ClientSchema.index({ name: 1 });

