// Server component del panel admin de productos.
// Pre-carga la lista en el servidor (verificando que el usuario sea admin)
// para que al entrar al panel los productos aparezcan al instante, sin
// spinner ni fetch-tras-hidratacion.
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductosClient from './ProductosClient';

export const dynamic = 'force-dynamic'; // session-dependent

const LIST_PROJECTION: any = {
  title: 1, description: 1, price: 1, stock: 1, availability: 1,
  category: 1, isActive: 1, featured: 1, createdAt: 1, updatedAt: 1,
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
    console.error('[admin/productos SSR]', err);
    return { initialProducts: [] };
  }
}

export default async function AdminProductosPage() {
  const data = await getInitialData();
  return <ProductosClient {...data} />;
}
