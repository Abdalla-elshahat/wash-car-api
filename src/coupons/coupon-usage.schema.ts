import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CouponUsageDocument = CouponUsage & Document;

@Schema({ timestamps: true })
export class CouponUsage {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Coupon', required: true })
  couponId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: false })
  orderId?: MongooseSchema.Types.ObjectId;
}

export const CouponUsageSchema = SchemaFactory.createForClass(CouponUsage);
CouponUsageSchema.index({ couponId: 1, userId: 1 });
