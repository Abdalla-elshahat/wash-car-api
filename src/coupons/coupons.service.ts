import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './coupons.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Laundry, LaundryDocument } from '../laundries/laundry.schema';
import { services, servicesDocument } from '../services/services.schema';
import { CouponUsage, CouponUsageDocument } from './coupon-usage.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Laundry.name) private laundryModel: Model<LaundryDocument>,
    @InjectModel(services.name) private servicesModel: Model<servicesDocument>,
    @InjectModel(CouponUsage.name) private couponUsageModel: Model<CouponUsageDocument>,
  ) { }

  async create(createCouponDto: CreateCouponDto, user: any): Promise<CouponDocument> {
    // Check if laundry exists and belongs to the owner
    const laundry = await this.laundryModel.findById(createCouponDto.laundryId);
    if (!laundry) {
      throw new NotFoundException('Laundry not found');
    }
    if (createCouponDto.serviceId) {
      const services = await this.servicesModel.findOne({ _id: createCouponDto.serviceId, laundryId: createCouponDto.laundryId });
      if (!services) {
        throw new NotFoundException('services not found for this laundry');
      }
    }
    if (!laundry.ownerId || laundry.ownerId.toString() !== user.id) {
      throw new ForbiddenException('You do not own this laundry');
    }

    // Adjust appliesTo based on presence of serviceId
    if (createCouponDto.serviceId) {
      // coupon applies to a specific service
      createCouponDto.appliesTo = 'specific_service';
    } else {
      // default to all services if not set
      createCouponDto.appliesTo = createCouponDto.appliesTo ?? 'all_services';
    }

    // Check if coupon code already exists for this laundry (compound uniqueness)
    const existingCoupon = await this.couponModel.findOne({
      code: createCouponDto.code,
      laundryId: createCouponDto.laundryId,
    }).exec();
    if (existingCoupon) {
      throw new BadRequestException('Coupon code already exists for this laundry');
    }

    const createdCoupon = new this.couponModel(createCouponDto);
    return createdCoupon.save();
  }

  async findAll(user: any, id: string): Promise<CouponDocument[]> {

    // 2. Try to find if this user owns a laundry
    const laundry = await this.laundryModel.findById(id).exec();
    if (laundry) {
      console.log(laundry._id);
      // Return all coupons for their laundry
      return this.couponModel.find({ laundryId: laundry._id, isActive: true }).exec();
    }

    // 3. If user is a client, return all active coupons
    if (user.role === 'client') {
      return this.couponModel.find({ isActive: true }).exec();
    }

    throw new NotFoundException('Laundry not found for this owner');
  }


  async findByCode(idOrCode: string): Promise<CouponDocument> {
    const query: any = { isActive: true, $or: [{ code: idOrCode }] };

    if (idOrCode.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: idOrCode });
    }

    const coupon = await this.couponModel.findOne(query).exec();
    if (!coupon) {
      throw new NotFoundException(`Coupon with code or ID ${idOrCode} not found or inactive`);
    }

    // Check expiration
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('Coupon has expired');
    }

    // Check usage limit
    const usageLimit = coupon.usageLimit ?? 0;
    const usedCount = coupon.usedCount ?? 0;
    if (usageLimit > 0 && usedCount >= usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    return coupon;
  }

  async useCoupon(code: string, user: any, serviceId?: string): Promise<any> {
    const coupon = await this.findByCode(code);

    // Validate if the coupon applies to the requested service
    if (coupon.appliesTo === 'specific_service' && (!coupon.serviceId || coupon.serviceId.toString() !== serviceId)) {
      throw new BadRequestException('This coupon cannot be used for this service');
    }

    // Check usage per user
    const usagePerUser = coupon.usagePerUser ?? 1;
    if (usagePerUser > 0) {
      const userUsageCount = await this.couponUsageModel.countDocuments({
        couponId: coupon._id,
        userId: user.id,
      });

      if (userUsageCount >= usagePerUser) {
        throw new BadRequestException(`You have already used this coupon the maximum allowed times (${usagePerUser})`);
      }
    }

    let priceAfterDiscount: number | null = null;
    if (serviceId) {
      const service = await this.servicesModel.findById(serviceId);
      if (service) {
        let discount = 0;
        if (coupon.discountType === 'percentage') {
          discount = (service.price * (coupon.discountValue ?? 0)) / 100;
        } else if (coupon.discountType === 'fixed') {
          discount = coupon.discountValue ?? 0;
        }
        priceAfterDiscount = Math.max(0, service.price - discount);
      }
    }

    // Increment usedCount
    coupon.usedCount = (coupon.usedCount ?? 0) + 1;

    // Check if total usage limit reached after increment
    const usageLimit = coupon.usageLimit ?? 0;
    if (usageLimit > 0 && coupon.usedCount > usageLimit) {
      throw new BadRequestException('Coupon total usage limit reached');
    }

    await coupon.save();

    // Record this usage
    await new this.couponUsageModel({
      couponId: coupon._id,
      userId: user.id,
    }).save();

    return {
      message: 'Coupon used successfully',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      priceAfterDiscount,
    };
  }

  async update(id: string, updateCouponDto: UpdateCouponDto, user: any): Promise<CouponDocument> {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    const laundry = await this.laundryModel.findById(coupon.laundryId);
    if (!laundry || !laundry.ownerId || laundry.ownerId.toString() !== user.id) {
      throw new ForbiddenException('You do not have permission to update this coupon');
    }

    const updatedCoupon = await this.couponModel.findByIdAndUpdate(id, updateCouponDto, { new: true }).exec();
    if (!updatedCoupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found after update`);
    }
    return updatedCoupon;
  }

  async remove(id: string, user: any): Promise<any> {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    const laundry = await this.laundryModel.findById(coupon.laundryId);
    if (!laundry || !laundry.ownerId || laundry.ownerId.toString() !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this coupon');
    }

    const deletedCoupon = await this.couponModel.findByIdAndDelete(id).exec();
    if (!deletedCoupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found after deletion`);
    }
    return { message: 'Coupon deleted successfully' };
  }
}
