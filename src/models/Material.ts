import { Schema, models, model } from 'mongoose';

export interface IMaterial {
  _id: string;
  name: string;
  category: string;
  brand: string;
  color: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  notes: string;
  createdAt: Date;
}

const MaterialSchema = new Schema<IMaterial>({
  name: { type: String, required: true },
  category: { type: String, required: true, default: 'hilo' },
  brand: { type: String, default: '' },
  color: { type: String, default: '' },
  quantity: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: 'piezas' },
  minStock: { type: Number, default: 1 },
  price: { type: Number, default: 0, min: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default models.Material || model<IMaterial>('Material', MaterialSchema);
