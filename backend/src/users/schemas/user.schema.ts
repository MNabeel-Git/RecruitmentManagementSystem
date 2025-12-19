import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }], default: [] })
  roles: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt: Date;

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ isActive: 1 });
UserSchema.index({ roles: 1 });

UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

UserSchema.set('toObject', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

