import { Schema, models, model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

// Direccion de envío estructurada — reemplaza el campo string libre.
// Mantenemos el viejo shippingAddress (string) por compatibilidad con
// pedidos creados antes del refactor (back-compat sin migración).
export interface IShipping {
  recipientName: string;
  phone: string;
  street: string;
  exterior: string;
  interior?: string;
  neighborhood: string;
  postalCode: string;
  city: string;
  state: string;
  references?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: number;
  userId: string;
  userName: string;
  userEmail: string;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shipping?: IShipping;
  shippingAddress?: string; // legado — pedidos viejos
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

const ShippingSchema = new Schema<IShipping>({
  recipientName: { type: String, default: '' },
  phone: { type: String, default: '' },
  street: { type: String, default: '' },
  exterior: { type: String, default: '' },
  interior: { type: String, default: '' },
  neighborhood: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  references: { type: String, default: '' },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: Number, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  shipping: { type: ShippingSchema, default: undefined },
  shippingAddress: { type: String }, // legado
  notes: { type: String },
}, { timestamps: true });

export default models.Order || model<IOrder>('Order', OrderSchema);
