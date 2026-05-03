import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Robots.txt generado automáticamente. Permite todo lo público,
// bloquea áreas privadas (admin, cuenta, carrito) y rutas API.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/mi-cuenta',
          '/pedidos',
          '/carrito',
          '/favoritos',
          '/login',
          '/registro',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
