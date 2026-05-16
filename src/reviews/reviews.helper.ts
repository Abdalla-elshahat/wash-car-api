import { Model } from 'mongoose';
import { ReviewDocument } from './reviews.schema';
import { LaundryDocument } from '../laundries/laundry.schema';

export async function updateLaundryRating(
  laundryId: any,
  reviewModel: Model<ReviewDocument>,
  laundryModel: Model<LaundryDocument>,
) {
  const laundryReviews = await reviewModel.find({ laundryId }).exec();
  const totalReviews = laundryReviews.length;
  const totalRating = laundryReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

  await laundryModel.findByIdAndUpdate(laundryId, {
    totalReviews: totalReviews,
    rating: averageRating,
  }).exec();
}
