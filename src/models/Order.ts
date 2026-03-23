import { Schema, models, model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface IOrder {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress?: string;
  notes?: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  shippingAddress: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default models.Order || model<IOrder>('Order', OrderSchema);
