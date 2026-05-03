import { Schema, models, model } from 'mongoose';

// Suscriptores al newsletter. Sin contraseña, sin compras necesarias —
// solo el correo y la fecha en que se suscribieron, más metadata mínima
// (origen, ip parcial) para detectar abuso o desuscripciones futuras.

export interface ISubscriber {
  _id: string;
  email: string;
  source: string;
  isActive: boolean;
  unsubscribedAt?: Date;
  createdAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    source: { type: String, default: 'footer' },
    isActive: { type: Boolean, default: true },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true },
);

export default models.Subscriber || model<ISubscriber>('Subscriber', SubscriberSchema);
