// clients/schemas/client.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsEmail, IsString } from 'class-validator'
export type ClientDocument = Client & Document;
@Schema()
export class Client {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, type: [String] })
  phonenumber: string[]; // عدة أرقام لو عنده أكتر من رقم

  @Prop({ required: true })
  address: string;

  @Prop()
  @IsEmail()
  email?: string;

  @Prop()
  notes?: string; // ملاحظات مثل "عنده سجاد كبير" أو "يريد خدمة كل أسبوع"
}


export const ClientSchema = SchemaFactory.createForClass(Client);
