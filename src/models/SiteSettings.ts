import mongoose, { Schema, models, model } from 'mongoose';
import { THEME_IDS, type ThemeId } from '@/lib/themes';

// Singleton: solo existe un documento, identificado por key='global'.
// Guarda configuración de sitio que afecta a todos los visitantes (ej. tema activo).

export interface ISiteSettings {
  _id: string;
  key: 'global';
  themeId: ThemeId;
  themeMode: 'manual' | 'auto';
  updatedBy?: string;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, enum: ['global'], required: true, unique: true, default: 'global' },
    themeId: { type: String, enum: THEME_IDS as string[], default: 'none' },
    themeMode: { type: String, enum: ['manual', 'auto'], default: 'manual' },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true },
);

export default models.SiteSettings || model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
