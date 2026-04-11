import { Schema, models, model } from 'mongoose';

export interface ICategory {
  _id: string;
  slug: string;
  name: string;
  emoji: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  emoji: { type: String, default: '🧸' },
  color: { type: String, default: 'bg-blush-50 border-blush-200' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default models.Category || model<ICategory>('Category', CategorySchema);
