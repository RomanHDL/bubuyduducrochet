import { Schema, models, model } from 'mongoose';

export interface IFavorite {
  _id: string;
  userId: string;
  userEmail: string;
  productId: string;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true, index: true, lowercase: true },
  productId: { type: String, required: true, index: true },
}, { timestamps: true });

// Un usuario no puede marcar 2 veces el mismo producto
FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default models.Favorite || model<IFavorite>('Favorite', FavoriteSchema);
