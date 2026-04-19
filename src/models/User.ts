import mongoose, { Schema, models, model } from 'mongoose';

export type ProfileFrame =
  | 'none'
  | 'terminal'
  | 'neon'
  | 'matrix'
  | 'cyberpunk'
  | 'hacker'
  | 'rgb'
  | 'pixel'
  | 'hologram'
  | 'elite'
  // Legacy (mantener para no romper perfiles existentes)
  | 'gold' | 'rose' | 'lavender' | 'mint' | 'glitter' | 'rainbow' | 'crown' | 'hearts' | 'stars';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider: 'local' | 'google';
  role: 'admin' | 'customer';
  profile?: {
    frame?: ProfileFrame;
    accentColor?: string;
    badge?: string;
    bio?: string;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  profile: {
    frame: {
      type: String,
      enum: ['none','terminal','neon','matrix','cyberpunk','hacker','rgb','pixel','hologram','elite','gold','rose','lavender','mint','glitter','rainbow','crown','hearts','stars'],
      default: 'none',
    },
    accentColor: { type: String, default: '' },
    badge: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
}, { timestamps: true });

export default models.User || model<IUser>('User', UserSchema);
