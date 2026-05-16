import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './reviews.schema';
import { Laundry, LaundryDocument } from 'src/laundries/laundry.schema';
import { updateLaundryRating } from './reviews.helper';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Laundry.name) private laundryModel: Model<LaundryDocument>) { }

  async create(data: any, user: any): Promise<Review> {
    if (!mongoose.Types.ObjectId.isValid(data.laundryId)) {
      throw new HttpException({ message: 'Invalid Laundry ID format' }, HttpStatus.BAD_REQUEST);
    }
    const exitLaundry = await this.laundryModel.findById(data.laundryId).exec();
    if (!exitLaundry) {
      throw new HttpException({ message: 'Laundry not found' }, HttpStatus.NOT_FOUND);
    }

    try {
      const reviewData = {
        ...data,
        clientId: new mongoose.Types.ObjectId(user.id),
      };
      const review = await this.reviewModel.create(reviewData);

      await updateLaundryRating(review.laundryId, this.reviewModel, this.laundryModel);

      return review;
    } catch (error) {
      throw new HttpException({ message: 'Failed to create review', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(laundryId?: string): Promise<Review[]> {
    if (laundryId && !mongoose.Types.ObjectId.isValid(laundryId)) {
      throw new HttpException({ message: 'Invalid Laundry ID format' }, HttpStatus.BAD_REQUEST);
    }
    try {
      const query = laundryId ? { laundryId: new mongoose.Types.ObjectId(laundryId) } : {};
      return await this.reviewModel.find(query).populate('clientId', 'fullname role profileImage').exec();
    } catch (error) {
      throw new HttpException({ message: 'Failed to fetch reviews', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, data: any, user: any): Promise<Review> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException({ message: 'Invalid Review ID format' }, HttpStatus.BAD_REQUEST);
    }
    try {
      const review = await this.reviewModel.findById(id).exec();
      if (!review) {
        throw new HttpException({ message: 'Review not found' }, HttpStatus.NOT_FOUND);
      }

      if (user.role !== 'admin' && review.clientId?.toString() !== user.id) {
        throw new HttpException({ message: 'Access denied: You can only update your own reviews' }, HttpStatus.FORBIDDEN);
      }

      const updatedReview = await this.reviewModel.findByIdAndUpdate(id, data, { new: true }).exec();
      if (!updatedReview) {
        throw new HttpException({ message: 'Review not found' }, HttpStatus.NOT_FOUND);
      }

      await updateLaundryRating(updatedReview.laundryId, this.reviewModel, this.laundryModel);

      return updatedReview;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException({ message: 'Failed to update review', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string, user: any): Promise<{ message: string }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException({ message: 'Invalid Review ID format' }, HttpStatus.BAD_REQUEST);
    }
    try {
      const review = await this.reviewModel.findById(id).exec();
      if (!review) {
        throw new HttpException({ message: 'Review not found' }, HttpStatus.NOT_FOUND);
      }

      if (user.role !== 'admin' && review.clientId?.toString() !== user.id) {
        throw new HttpException({ message: 'Access denied: You can only delete your own reviews' }, HttpStatus.FORBIDDEN);
      }

      await this.reviewModel.findByIdAndDelete(id).exec();

      await updateLaundryRating(review.laundryId, this.reviewModel, this.laundryModel);

      return { message: 'Review deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException({ message: 'Failed to delete review', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
