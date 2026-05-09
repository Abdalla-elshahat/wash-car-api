import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { OrdersModule } from './orders/orders.module';
import { servicesModule } from './services/services.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './auth/Email/email.module';
import { AdminMiddleware } from './middleware/admin.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';
@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/wash-car'),
    ClientsModule,
    OrdersModule,
    servicesModule,
    AuthModule,
    EmailModule
  ],
  controllers: [
    AppController],
  providers: [AppService],
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('orders');
    consumer.apply(AdminMiddleware).forRoutes(
      { path: 'clients', method: RequestMethod.ALL },
      { path: 'services', method: RequestMethod.UNLOCK },
      { path: 'orders', method: RequestMethod.UNLOCK }
    );
  }


}
