import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { orderService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './orders.schema';
import { User, UserSchema } from 'src/users/users.schema';
import { OrderStatusHistory, OrderStatusHistorySchema } from './schemas/order-status-history.schema';
import { Laundry, LaundrySchema } from '../laundries/laundry.schema';
import { services, servicesSchema } from '../services/services.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: User.name, schema: UserSchema },
            { name: OrderStatusHistory.name, schema: OrderStatusHistorySchema },
            { name: Laundry.name, schema: LaundrySchema },
            { name: services.name, schema: servicesSchema },
        ]),
    ],
    controllers: [OrdersController],
    providers: [orderService],
    exports: [orderService],
})
export class OrdersModule { }
