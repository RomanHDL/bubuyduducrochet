import { Schema, models, model } from 'mongoose';

export interface IReview {
  _id: string;
  userName: string;
  userEmail: string;
  text: string;
  rating: number;
  emoji: string;
  isApproved: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  emoji: { type: String, default: '🧸' },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

export default models.Review || model<IReview>('Review', ReviewSchema);
