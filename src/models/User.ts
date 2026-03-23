import mongoose, { Schema, models, model } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider: 'local' | 'google';
  role: 'admin' | 'customer';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
}, { timestamps: true });

export default models.User || model<IUser>('User', UserSchema);
