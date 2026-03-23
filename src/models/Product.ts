import { Schema, models, model } from 'mongoose';

export interface IProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
  isActive: boolean;
  featured: boolean;
  createdBy: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  stock: { type: Number, default: 0, min: 0 },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  createdBy: { type: String },
}, { timestamps: true });

export default models.Product || model<IProduct>('Product', ProductSchema);
