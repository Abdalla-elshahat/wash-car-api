import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  orderId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount?: number;

  @Prop({ enum: ['cash', 'card', 'online'], required: true })
  method?: string;

  @Prop({ enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' })
  status?: string;

  @Prop()
  transactionId?: string;

  @Prop({ type: Date })
  paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
