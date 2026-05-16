import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderItemDocument = OrderItem & Document;

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  orderId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'LaundryService', required: true })
  serviceId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, required: true })
  originalPrice?: number;

  @Prop({ type: Number, required: true })
  discountAmount?: number;

  @Prop({ type: Number, required: true })
  totalAmount?: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
