import mongoose, { Schema, models, model } from 'mongoose';
import { THEME_IDS, type ThemeId } from '@/lib/themes';

// Singleton: solo existe un documento, identificado por key='global'.
// Guarda configuración de sitio que afecta a todos los visitantes
// (tema activo, barra de promociones, etc.).

export interface IPromoBar {
  active: boolean;
  text: string;
  link?: string;
  linkLabel?: string;
}

export interface ISiteSettings {
  _id: string;
  key: 'global';
  themeId: ThemeId;
  themeMode: 'manual' | 'auto';
  promoBar?: IPromoBar;
  updatedBy?: string;
  updatedAt: Date;
}

const PromoBarSchema = new Schema<IPromoBar>({
  active: { type: Boolean, default: false },
  text: { type: String, default: '' },
  link: { type: String, default: '' },
  linkLabel: { type: String, default: '' },
}, { _id: false });

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, enum: ['global'], required: true, unique: true, default: 'global' },
    themeId: { type: String, enum: THEME_IDS as string[], default: 'none' },
    themeMode: { type: String, enum: ['manual', 'auto'], default: 'manual' },
    promoBar: { type: PromoBarSchema, default: () => ({ active: false, text: '', link: '', linkLabel: '' }) },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true },
);

export default models.SiteSettings || model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
