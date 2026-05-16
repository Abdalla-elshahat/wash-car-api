import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Laundry', required: true })
  laundryId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'LaundryService', required: false })
  serviceId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  code?: string;


  @Prop({ enum: ['percentage', 'fixed'], required: true })
  discountType?: string;

  @Prop({ required: true, type: Number })
  discountValue?: number;

  @Prop({ type: Number })
  maxDiscountAmount?: number;

  @Prop({ type: Number, default: 0 })
  usageLimit?: number;


  @Prop({ type: Number, default: 1 })
  usagePerUser?: number;

  @Prop({ type: Number, default: 0 })
  usedCount?: number;

  @Prop({ type: Date })
  validFrom?: Date;

  @Prop({ type: Date, index: { expiresAfterSeconds: 0 } })
  expiresAt?: Date;

  @Prop({ enum: ['all_services', 'specific_service', 'first_order'], default: 'all_services' })
  appliesTo?: string;

  @Prop({ default: true })
  isActive?: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

// Compound unique index: same code can be reused across laundries, but must be unique per laundry
CouponSchema.index({ code: 1, laundryId: 1 }, { unique: true });
