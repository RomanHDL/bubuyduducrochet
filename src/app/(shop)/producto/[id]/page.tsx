// Server component — busca el producto por id en Mongo antes de renderizar
// y lo manda al client component como prop. Beneficios:
//   * El HTML inicial ya trae el producto pintado → sin spinner.
//   * Los links al detalle (shared, WhatsApp, etc.) abren al instante.
//   * Si no existe el id, muestra el 404 nativo de Next.js.
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 5;

async function getProduct(id: string) {
  try {
    await connectDB();
    const doc = await Product.findById(id).lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
  } catch (err) {
    console.error('[producto/:id SSR]', err);
    return null;
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const initialProduct = await getProduct(params.id);
  return <ProductDetailClient initialProduct={initialProduct} />;
}
