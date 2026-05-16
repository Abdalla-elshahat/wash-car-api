import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  clientId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Laundry', required: true })
  laundryId?: MongooseSchema.Types.ObjectId;

  // @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Car', required: true })
  // carId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'services', required: true })
  serviceId?: MongooseSchema.Types.ObjectId;

  @Prop({
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status?: string;

  @Prop({ type: Number })
  originalPrice?: number;

  @Prop({ type: Number, default: 0 })
  discountAmount?: number;

  @Prop({ type: Number })
  totalAmount?: number;

  @Prop({ type: Number })
  platformFee?: number;

  @Prop({ type: Number })
  laundryEarning?: number;

  @Prop({
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  })
  paymentStatus?: string;

  @Prop()
  notes?: string;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
