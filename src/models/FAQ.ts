import { Schema, models, model } from 'mongoose';

export type FAQStatus = 'pending' | 'approved';

export interface IFAQ {
  _id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  status: FAQStatus;
  submittedBy?: string;
  submittedByName?: string;
  createdAt: Date;
}

const FAQSchema = new Schema<IFAQ>({
  category: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['pending', 'approved'], default: 'approved' },
  submittedBy: { type: String },
  submittedByName: { type: String },
}, { timestamps: true });

export default models.FAQ || model<IFAQ>('FAQ', FAQSchema);
