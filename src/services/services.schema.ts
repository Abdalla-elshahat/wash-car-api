
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type servicesDocument = services & Document;

@Schema()
export class services {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  image?: string;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  orderDate: Date;

  getpriceafterdiscount(price: number, discount: number): number {
    return price - (price * discount) / 100;
  }
}

export const servicesSchema = SchemaFactory.createForClass(services);
