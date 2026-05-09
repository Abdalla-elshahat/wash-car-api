import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { orderService} from './orders.service';
import { OrdersController } from './orders.controller';
import {  Order, orderSchema,} from './orders.schema';
import { Client, ClientSchema } from 'src/clients/clients.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Order.name, schema: orderSchema }]),
MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),],
    controllers: [OrdersController],
    providers: [orderService],
    exports: [orderService],
})
export class OrdersModule { }
