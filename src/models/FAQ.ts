import { Schema, models, model } from 'mongoose';

export interface IFAQ {
  _id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

const FAQSchema = new Schema<IFAQ>({
  category: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default models.FAQ || model<IFAQ>('FAQ', FAQSchema);
