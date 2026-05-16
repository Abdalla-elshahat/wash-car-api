import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LaundryDocument = Laundry & Document;

@Schema({ timestamps: true })
export class Laundry {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  ownerId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name?: string;

  @Prop()
  description?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  })

  location?: { type: string; coordinates: number[] };

  @Prop({ type: MongooseSchema.Types.Mixed })
  workingHours?: any;

  @Prop()
  logo?: string;

  @Prop({ type: Number, default: 0 })
  rating?: number;

  @Prop({ type: Number, default: 0 })
  totalReviews?: number;

  @Prop({ default: false })
  isActive?: boolean;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status?: String;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const LaundrySchema = SchemaFactory.createForClass(Laundry);
