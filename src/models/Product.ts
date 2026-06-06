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

export type ProductAvailability = 'disponible' | 'por_pedido';

// Estado de publicacion:
// - 'publicado'   → producto normal del catalogo (default; respeta `isActive`).
// - 'en_proceso'  → "obra en proceso": la pieza se esta tejiendo. NUNCA aparece
//                   en la tienda (se guarda con isActive:false) hasta que el admin
//                   la lleva al 100% y la "Sube a catalogo" (status:'publicado').
export type ProductStatus = 'en_proceso' | 'publicado';

export interface IProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  availability: ProductAvailability;
  category: string;
  isActive: boolean;
  featured: boolean;
  status: ProductStatus;
  progress: number; // 0-100, % de avance del tejido (solo relevante en 'en_proceso')
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
  availability: { type: String, enum: ['disponible', 'por_pedido'], default: 'disponible' },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  // Defaults pensados para que TODOS los productos existentes sigan tratandose
  // como publicados al 100% sin necesidad de migracion.
  status: { type: String, enum: ['en_proceso', 'publicado'], default: 'publicado' },
  progress: { type: Number, default: 100, min: 0, max: 100 },
  createdBy: { type: String },
  elaboration: { type: ElaborationSchema, default: undefined },
}, { timestamps: true });

export default models.Product || model<IProduct>('Product', ProductSchema);
