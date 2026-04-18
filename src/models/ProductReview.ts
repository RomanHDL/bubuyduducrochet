import { Schema, models, model } from 'mongoose';

export interface IProductReview {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text?: string;
  images: string[];
  createdAt: Date;
}

const ProductReviewSchema = new Schema<IProductReview>({
  productId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: false, default: '' },
  images: [{ type: String }],
}, { timestamps: true });

export default models.ProductReview || model<IProductReview>('ProductReview', ProductReviewSchema);
