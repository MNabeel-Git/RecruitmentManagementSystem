import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TemplateField } from '../../job-templates/schemas/job-template.schema';

export type JobVacancyDocument = JobVacancy & Document;

@Schema({ timestamps: true })
export class JobVacancy {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true, index: true })
  client: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobTemplate', required: true, index: true })
  jobTemplate: Types.ObjectId;

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Agency' }], default: [], index: true })
  assignedAgencies: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const JobVacancySchema = SchemaFactory.createForClass(JobVacancy);

JobVacancySchema.index({ client: 1 });
JobVacancySchema.index({ jobTemplate: 1 });
JobVacancySchema.index({ assignedAgencies: 1 });
JobVacancySchema.index({ createdBy: 1 });
JobVacancySchema.index({ isActive: 1 });
JobVacancySchema.index({ name: 1 });

