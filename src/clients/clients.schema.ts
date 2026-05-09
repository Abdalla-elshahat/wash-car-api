// clients/schemas/client.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsEmail, IsString } from 'class-validator'
export type ClientDocument = Client & Document;
@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true })
  username?: string;

  @Prop()
  password?: string;

  @Prop({ required: false, default: 'client' })
  role?: string;

  @Prop({ required: true, unique: true })
  @IsEmail()
  email?: string;

  @Prop({ type: [String], required: false })
  phonenumber?: string[];

  @Prop()
  address?: string;

  @Prop()
  notes?: string;


  @Prop({ type: [String], default: [] })
  orders?: string[];

  @Prop({ type: [String], default: [] })
  OrdersFinshed?: string[];


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

}


export const ClientSchema = SchemaFactory.createForClass(Client);
