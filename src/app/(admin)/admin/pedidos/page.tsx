import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import PedidosClient from './PedidosClient';

export const dynamic = 'force-dynamic';

async function getInitialOrders() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') return [];
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(200).lean();
    return JSON.parse(JSON.stringify(orders));
  } catch (err) {
    console.error('[admin/pedidos SSR]', err);
    return [];
  }
}

export default async function AdminPedidosPage() {
  const initialOrders = await getInitialOrders();
  return <PedidosClient initialOrders={initialOrders} />;
}
