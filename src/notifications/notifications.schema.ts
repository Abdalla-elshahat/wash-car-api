import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title?: string;

  @Prop({ required: true })
  message?: string;

  @Prop({ default: false })
  isRead?: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
