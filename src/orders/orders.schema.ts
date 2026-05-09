// src/orders/orders.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Client } from 'src/clients/clients.schema';
import { services } from 'src/services/services.schema';

export type orderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Client.name, required: true })
  clientId: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: services.name, required: true })
  serviceId: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wash' })
  washId: string;

  @Prop()
  address: string;

  @Prop({ required: true })
  cartype?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: new Date(), required: false })
  orderDate: Date;

  @Prop({
    required: true,
    enum: ['Received', 'pending', 'completed', 'cancelled', 'delivered',],
    default: 'pending',
  })
  status?: string;

  @Prop({
    enum: ['cash', 'credit', 'vodafone_cash'],
    default: 'cash',
  })
  paymentMethod: string;

  @Prop({
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  })
  paymentStatus: string;
}

export const orderSchema = SchemaFactory.createForClass(Order);
