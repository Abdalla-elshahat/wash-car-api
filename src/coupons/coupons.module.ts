import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from './coupons.schema';
import { CouponUsage, CouponUsageSchema } from './coupon-usage.schema';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { Laundry, LaundrySchema } from '../laundries/laundry.schema';
import { services, servicesSchema } from '../services/services.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: CouponUsage.name, schema: CouponUsageSchema },
      { name: Laundry.name, schema: LaundrySchema },
      { name: services.name, schema: servicesSchema },
    ]),
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService, MongooseModule],
})
export class CouponsModule {}
