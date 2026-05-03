// Constantes centrales para SEO. Todos los archivos de metadata, sitemap,
// robots, manifest y JSON-LD leen de aquí — un solo lugar para mantener.

export const SITE_URL = 'https://www.mundoacrochet.store';
export const SITE_NAME = 'Mundo A Crochet';
export const SITE_LEGAL_NAME = 'Mundo A Crochet';
export const SITE_DESCRIPTION =
  'Tienda de crochet artesanal mexicana. Amigurumis, accesorios y creaciones únicas hechas a mano con amor desde Monterrey, Nuevo León.';
export const SITE_LOCALE = 'es_MX';
export const SITE_LANG = 'es-MX';

// Logo principal — imagen del navbar/footer. Externa por ahora (Pinterest CDN).
export const SITE_LOGO =
  'https://i.pinimg.com/originals/f7/97/e0/f797e0d435f74e1b41a49ba08f908d25.png';

// Imagen Open Graph default (compartir en redes / WhatsApp). Mismo logo.
export const SITE_OG_IMAGE = SITE_LOGO;

// Datos de contacto y dirección física
export const BUSINESS_PHONE = '+528187087288';
export const BUSINESS_PHONE_DISPLAY = '81 8708 7288';
export const BUSINESS_EMAIL = 'veroguadalupita@gmail.com';
export const BUSINESS_WHATSAPP = `https://wa.me/${BUSINESS_PHONE.replace('+', '')}`;
export const BUSINESS_CITY = 'Monterrey';
export const BUSINESS_REGION = 'Nuevo León';
export const BUSINESS_COUNTRY = 'MX';
export const BUSINESS_FOUNDED = '2024';

// Horarios para LocalBusiness JSON-LD
export const BUSINESS_HOURS = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '19:00',
  },
];

// Marca de color (theme-color, manifest, etc.)
export const BRAND_COLOR = '#FF8FA3';
export const BRAND_BG = '#FFFDF7';

// Prefijo de URLs absolutas
export function abs(path: string = ''): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
