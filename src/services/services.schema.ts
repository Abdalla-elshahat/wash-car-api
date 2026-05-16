
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
export type servicesDocument = services & Document;

@Schema()
export class services {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Laundry', required: true })
  laundryId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: false })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  image?: string;

  @Prop({ default: true })
  active: boolean;
}

export const servicesSchema = SchemaFactory.createForClass(services);
servicesSchema.index({ title: 1, laundryId: 1 }, { unique: true });
