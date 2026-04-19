// Server component — pre-carga productos, destacados y categorias desde la DB
// y los pasa al client component. Beneficio clave:
//
//   * En la PRIMERA visita (sin cache de cliente) el HTML inicial ya llega con
//     el catalogo pintado. El usuario ve los productos al instante, sin
//     esperar a que hidrate React + useEffect + fetch.
//   * Queries directas a Mongo (sin hop extra al /api) — ~50-200ms mas rapido.
//   * Revalida cada 5s en el servidor con ISR: los productos publicados por
//     el admin aparecen casi al instante en una visita nueva.
//   * Si la DB falla, devuelve arrays vacios y el client component hace su
//     fetch normal como fallback — nada se rompe.
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import CatalogClient from './CatalogClient';

export const revalidate = 5; // ISR: re-renderiza el HTML a los 5s si hay trafico.

const LIST_PROJECTION: any = {
  title: 1, description: 1, price: 1, stock: 1, availability: 1,
  category: 1, isActive: 1, featured: 1, createdAt: 1, updatedAt: 1,
  images: { $slice: 1 }, // solo la primera imagen para mantener el payload chico
};

async function getInitialData() {
  try {
    await connectDB();
    const [products, featured, categories] = await Promise.all([
      Product.find({ isActive: true }, LIST_PROJECTION).sort({ createdAt: -1 }).limit(50).lean(),
      Product.find({ isActive: true, featured: true }, LIST_PROJECTION).sort({ createdAt: -1 }).limit(8).lean(),
      Category.find({ isActive: true }).sort({ order: 1 }).lean(),
    ]);
    // JSON.stringify/parse: objetos de Mongoose traen ObjectId/Date, los
    // serializamos para poder pasarlos como props a un client component.
    return {
      initialProducts: JSON.parse(JSON.stringify(products)),
      initialFeatured: JSON.parse(JSON.stringify(featured)),
      initialCategories: JSON.parse(JSON.stringify(categories)),
    };
  } catch (err) {
    // Si la DB falla, el cliente hace su fetch normal — no rompe la pagina.
    console.error('[catalogo SSR] fallback sin datos iniciales:', err);
    return { initialProducts: [], initialFeatured: [], initialCategories: [] };
  }
}

export default async function CatalogoPage() {
  const data = await getInitialData();
  return <CatalogClient {...data} />;
}
