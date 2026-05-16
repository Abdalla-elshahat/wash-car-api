import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { servicesModule } from './services/services.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './auth/Email/email.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CouponsModule } from './coupons/coupons.module';
import { PlatformSettingsModule } from './platform-settings/platform-settings.module';
import { LaundriesModule } from './laundries/laundries.module';
import { AdminMiddleware } from './middleware/admin.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';
import { OwnerMiddleware } from './middleware/owner.middleware';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/wash-car'),
    UsersModule,
    OrdersModule,
    servicesModule,
    AuthModule,
    EmailModule,
    ReviewsModule,
    NotificationsModule,
    CouponsModule,
    PlatformSettingsModule,
    LaundriesModule
  ],
  controllers: [
    AppController],
  providers: [AppService],
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'users/login', method: RequestMethod.POST },
        { path: 'users/signup', method: RequestMethod.POST },
        { path: 'users/verify-email', method: RequestMethod.POST },
        { path: 'users/Resend-otp-email', method: RequestMethod.POST },
        { path: 'users/forgot-password', method: RequestMethod.POST },
        { path: 'users/reset-password', method: RequestMethod.POST },
        { path: 'users/verifyOtpForResetPassword', method: RequestMethod.POST },
        { path: 'users/resendOtpForgetPassword', method: RequestMethod.POST },
      )
      .forRoutes(
        'users',
        'services',
        'coupons',
        'reviews',
        'notifications',
        'platform-settings',
        'laundries',
        'orders'
      );
    consumer.apply(AuthMiddleware, AdminMiddleware).forRoutes(
      { path: 'orders', method: RequestMethod.UNLOCK },
      { path: 'users/return', method: RequestMethod.PATCH },
      { path: 'laundries/activate/:id', method: RequestMethod.PATCH },
      { path: 'laundries/inactive/all', method: RequestMethod.GET },

    );
    consumer.apply(AuthMiddleware, OwnerMiddleware).forRoutes(
      { path: 'laundries', method: RequestMethod.POST },
      { path: 'laundries/:id', method: RequestMethod.PATCH },
      { path: 'laundries/:id', method: RequestMethod.DELETE },
      { path: 'services', method: RequestMethod.POST },
      { path: 'services/:id', method: RequestMethod.PATCH },
      { path: 'services/:id', method: RequestMethod.DELETE },
      { path: 'coupons', method: RequestMethod.POST },
      { path: 'coupons/:id', method: RequestMethod.PATCH },
      { path: 'coupons/:id', method: RequestMethod.DELETE },
      { path: 'coupons', method: RequestMethod.GET },
    );
  }


}
