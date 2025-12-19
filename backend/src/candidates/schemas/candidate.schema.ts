import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobVacancy', required: true, index: true })
  jobVacancy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Object, required: true })
  data: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);

CandidateSchema.index({ jobVacancy: 1 });
CandidateSchema.index({ createdBy: 1 });
CandidateSchema.index({ isActive: 1 });
CandidateSchema.index({ jobVacancy: 1, createdBy: 1 });
CandidateSchema.index({ tenantId: 1 });

