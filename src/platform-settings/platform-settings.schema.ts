import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlatformSettingsDocument = PlatformSettings & Document;

@Schema({ timestamps: true })
export class PlatformSettings {
  @Prop({ type: Number, default: 0 })
  platformFeePercentage?: number;

  @Prop()
  supportPhone?: string;

  @Prop()
  supportEmail?: string;

  @Prop({ type: Number, default: 0 })
  minimumOrderAmount?: number;
}

export const PlatformSettingsSchema = SchemaFactory.createForClass(PlatformSettings);
