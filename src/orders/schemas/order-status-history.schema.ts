import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderStatusHistoryDocument = OrderStatusHistory & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class OrderStatusHistory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  orderId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  status?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  changedBy?: MongooseSchema.Types.ObjectId;
}

export const OrderStatusHistorySchema = SchemaFactory.createForClass(OrderStatusHistory);
