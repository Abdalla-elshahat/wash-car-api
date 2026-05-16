// users/schemas/users.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { IsEmail, IsString } from 'class-validator'
export type UserDocument = User & Document;
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullname?: string;

  @Prop()
  password?: string;

  @Prop()
  profileImage?: string;

  @Prop({ enum: ['Admin', 'client', 'laundry_owner'], default: 'client' })
  role?: string;

  @Prop({ required: true, unique: true })
  @IsEmail()
  email?: string;

  @Prop({ required: false, unique: false })
  phone?: string;

  @Prop()
  isVerified?: boolean;

  @Prop({ type: String })
  otpCode?: string;

  @Prop({ type: Number })
  otpExpires?: number;

  @Prop({ type: String, required: false })
  resetPasswordOTP?: string;

  @Prop({ type: Date, required: false })
  resetPasswordExpires?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] })
  orders?: mongoose.Types.ObjectId[];

}

export const UserSchema = SchemaFactory.createForClass(User);
