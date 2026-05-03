import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { SITE_URL } from '@/lib/seo';

// Sitemap dinámico — incluye páginas estáticas + productos + categorías.
// Next regenera cada hora vía revalidate. Google se entera de productos
// nuevos automáticamente.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Páginas estáticas: home, catálogo, FAQ, contacto + 4 legales
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/catalogo`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/preguntas`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/aviso-privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terminos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/envios`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/devoluciones`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  let products: any[] = [];
  let categories: any[] = [];
  try {
    await connectDB();
    [products, categories] = await Promise.all([
      Product.find({ isActive: true }, { _id: 1, updatedAt: 1 }).lean(),
      Category.find({ isActive: true }, { slug: 1, updatedAt: 1 }).lean(),
    ]);
  } catch (err) {
    // Si DB falla, regresamos solo las estáticas — no rompe el sitemap.
    console.error('[sitemap] DB error:', err);
  }

  const productEntries: MetadataRoute.Sitemap = (products || []).map((p: any) => ({
    url: `${SITE_URL}/producto/${p._id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = (categories || []).map((c: any) => ({
    url: `${SITE_URL}/catalogo?category=${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
