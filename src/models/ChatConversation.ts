import { Schema, models, model, Types } from 'mongoose';

/*
 * Conversation: una por cliente. La vendedora (admin) responde dentro
 * del mismo thread. La conversacion guarda metadata para listar en el
 * inbox del admin (ultimo mensaje, contador de no-leidos, fecha).
 *
 * Los mensajes en si viven en la coleccion ChatMessage para no
 * inflar el documento de la conversacion cuando crece.
 */

export interface IChatConversation {
  _id: string;
  customer: Types.ObjectId;       // User que abrio el thread
  customerName?: string;          // snapshot al momento de la primera msg
  customerEmail?: string;
  customerImage?: string;
  unreadByAdmin: number;          // mensajes del cliente que el admin no leyo
  unreadByCustomer: number;       // respuestas del admin que el cliente no leyo
  lastMessageAt?: Date;
  lastMessage?: string;
  lastSenderRole?: 'customer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    customerName: { type: String },
    customerEmail: { type: String },
    customerImage: { type: String },
    unreadByAdmin: { type: Number, default: 0 },
    unreadByCustomer: { type: Number, default: 0 },
    lastMessageAt: { type: Date, index: true },
    lastMessage: { type: String, maxlength: 200 },
    lastSenderRole: { type: String, enum: ['customer', 'admin'] },
  },
  { timestamps: true }
);

export default models.ChatConversation || model<IChatConversation>('ChatConversation', ChatConversationSchema);
