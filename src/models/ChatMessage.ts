import { Schema, models, model, Types } from 'mongoose';

/*
 * ChatMessage: cada mensaje individual dentro de un thread.
 * - sender es el User que lo escribio (customer o admin)
 * - senderRole se snapshot-ea al guardar para no tener que joinear al
 *   User al renderizar (los chats se cargan muy seguido).
 * - readAt: timestamp de cuando el destinatario lo marco como leido.
 *   Solo se setea una vez.
 */

export interface IChatMessage {
  _id: string;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  senderRole: 'customer' | 'admin';
  senderName?: string;
  senderImage?: string;
  text: string;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'ChatConversation', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['customer', 'admin'], required: true },
    senderName: { type: String },
    senderImage: { type: String },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ conversation: 1, createdAt: 1 });

export default models.ChatMessage || model<IChatMessage>('ChatMessage', ChatMessageSchema);
