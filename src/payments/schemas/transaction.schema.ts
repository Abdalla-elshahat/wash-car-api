import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  orderId?: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['platform_fee', 'laundry_payout'], required: true })
  type?: string;

  @Prop({ type: Number, required: true })
  amount?: number;

  @Prop({ enum: ['pending', 'completed', 'failed'], default: 'pending' })
  status?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  relatedTo?: MongooseSchema.Types.ObjectId;

  @Prop()
  transactionId?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
