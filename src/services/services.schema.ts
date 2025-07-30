// clients/schemas/client.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type servicesDocument =services & Document;

@Schema()
export class services {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop()
  imageUrl?: string; // صورة للخدمة لو هتعرضها في واجهة المستخدم

  @Prop({ default: true })
  active: boolean; // لو الخدمة متاحة حاليًا أو لأ
  
  @Prop()
  orderDate: Date;

  getpriceafterdiscount(price: number, discount: number): number {
    return price - (price * discount) / 100;
  }
}

export const servicesSchema = SchemaFactory.createForClass(services);
