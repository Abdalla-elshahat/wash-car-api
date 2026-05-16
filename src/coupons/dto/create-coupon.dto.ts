import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, IsBoolean, IsMongoId } from 'class-validator';

export class CreateCouponDto {
  @IsMongoId()
  laundryId: string;

  @IsOptional()
  @IsMongoId()
  serviceId?: string;

  @IsString()
  code: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['percentage', 'fixed'])
  discountType: string;

  @IsNumber()
  discountValue: number;

  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  usagePerUser?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: Date;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @IsOptional()
  @IsEnum(['all_services', 'specific_service', 'first_order'])
  appliesTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
