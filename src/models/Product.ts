import { Schema, models, model } from 'mongoose';

export interface IMaterial {
  name: string;
  type: string;
  quantity: string;
  notes: string;
}

export interface IMeasurement {
  name: string;
  value: string;
  unit: string;
}

export interface IPattern {
  name: string;
  imageUrl: string;
  description: string;
}

export interface IElaboration {
  materials: IMaterial[];
  measurements: IMeasurement[];
  patterns: IPattern[];
  instructions: string;
  difficulty: 'facil' | 'intermedio' | 'avanzado';
  estimatedTime: string;
}

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
  elaboration: IElaboration;
  createdAt: Date;
}

const MaterialSchema = new Schema({
  name: { type: String },
  type: { type: String },
  quantity: { type: String },
  notes: { type: String },
}, { _id: false });

const MeasurementSchema = new Schema({
  name: { type: String },
  value: { type: String },
  unit: { type: String },
}, { _id: false });

const PatternSchema = new Schema({
  name: { type: String },
  imageUrl: { type: String },
  description: { type: String },
}, { _id: false });

const ElaborationSchema = new Schema({
  materials: [MaterialSchema],
  measurements: [MeasurementSchema],
  patterns: [PatternSchema],
  instructions: { type: String },
  difficulty: { type: String, enum: ['facil', 'intermedio', 'avanzado'] },
  estimatedTime: { type: String },
}, { _id: false });

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
  elaboration: { type: ElaborationSchema, default: undefined },
}, { timestamps: true });

export default models.Product || model<IProduct>('Product', ProductSchema);
