import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_DESCRIPTION, BRAND_COLOR, BRAND_BG, SITE_LANG } from '@/lib/seo';

// PWA manifest. Permite "instalar" el sitio como app en celular y desktop.
// Usa los iconos generados por icon.svg / apple-icon.svg en la misma app/.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'Crochet MX',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: BRAND_BG,
    theme_color: BRAND_COLOR,
    orientation: 'portrait',
    lang: SITE_LANG,
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
