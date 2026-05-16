import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) { }

  @Post()
  create(@Body() createCouponDto: CreateCouponDto, @Req() req: any) {
    return this.couponsService.create(createCouponDto, req.user);
  }

  @Get("laundry/:id")
  findAll(@Req() req: any, @Param('id') id: string) {
    return this.couponsService.findAll(req.user, id);
  }

  @Get('validate/:code')
  findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Post('use/:code')
  useCoupon(@Param('code') code: string, @Req() req: any, @Body() body: { serviceId: string }) {
    return this.couponsService.useCoupon(code, req.user, body.serviceId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto, @Req() req: any) {
    return this.couponsService.update(id, updateCouponDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.couponsService.remove(id, req.user);
  }
}
