// Server component del panel admin de "obras en proceso".
// Es la MISMA UI que /admin/productos pero entra directo en la pestaña de
// obras en proceso (initialTab="wip"). Pre-carga la lista en el servidor
// (verificando admin) para que aparezca al instante, sin spinner.
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductosClient from '../productos/ProductosClient';

export const dynamic = 'force-dynamic'; // session-dependent

const LIST_PROJECTION: any = {
  title: 1, description: 1, price: 1, stock: 1, availability: 1,
  category: 1, isActive: 1, featured: 1, status: 1, progress: 1,
  createdAt: 1, updatedAt: 1,
  images: { $slice: 1 },
};

async function getInitialData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') return { initialProducts: [] };
    await connectDB();
    const products = await Product.find({}, LIST_PROJECTION).sort({ createdAt: -1 }).limit(100).lean();
    return { initialProducts: JSON.parse(JSON.stringify(products)) };
  } catch (err) {
    console.error('[admin/proceso SSR]', err);
    return { initialProducts: [] };
  }
}

export default async function AdminProcesoPage() {
  const data = await getInitialData();
  return <ProductosClient {...data} initialTab="wip" />;
}
