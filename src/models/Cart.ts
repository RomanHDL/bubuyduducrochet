import { Schema, models, model } from 'mongoose';

export interface ICartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ICart {
  _id: string;
  userId: string;
  userEmail?: string;
  items: ICartItem[];
  total: number;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const CartSchema = new Schema<ICart>({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, index: true, lowercase: true },
  items: [CartItemSchema],
  total: { type: Number, default: 0 },
}, { timestamps: true });

export default models.Cart || model<ICart>('Cart', CartSchema);
