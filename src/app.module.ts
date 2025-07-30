import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { ClientsController } from './clients/clients.controller';
import { ClientsModule } from './clients/clients.module';
import { OrdersModule } from './orders/orders.module';
import { OrdersController } from './orders/orders.controller';
import { servicesController } from './services/services.controller';
import { servicesModule } from './services/services.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/wash-car'),
    ClientsModule,
    OrdersModule,
    servicesModule
  ],
  controllers: [
    AppController,
    ClientsController,
    servicesController,
    OrdersController],
  providers: [AppService],
})
export class AppModule { }
