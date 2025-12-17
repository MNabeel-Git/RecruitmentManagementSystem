import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobTemplateDocument = JobTemplate & Document;

export interface TemplateField {
  key: string;
  type: string;
  required: boolean;
  label?: string;
  options?: string[];
}

@Schema({ timestamps: true })
export class JobTemplate {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true, index: true })
  client: Types.ObjectId;

  @Prop({
    type: [
      {
        key: { type: String, required: true },
        type: { type: String, required: true },
        required: { type: Boolean, default: false },
        label: { type: String },
        options: { type: [String] }
      }
    ],
    default: []
  })
  candidateDataSchema: TemplateField[];

  @Prop({ default: true })
  isActive: boolean;
}

export const JobTemplateSchema = SchemaFactory.createForClass(JobTemplate);

JobTemplateSchema.index({ client: 1 });
JobTemplateSchema.index({ isActive: 1 });
JobTemplateSchema.index({ name: 1 });

