// Server component — pre-carga los pedidos del usuario logueado.
// Si no hay sesion, initialOrders va vacio y el cliente muestra el estado
// "inicia sesion para ver tus pedidos" como ya lo hacia antes.
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import MisPedidosClient from './MisPedidosClient';

export const dynamic = 'force-dynamic';

async function getInitialOrders() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = (session?.user as any)?.email;
    if (!userEmail) return [];
    await connectDB();
    // Misma logica que GET /api/orders?mine=1: solo las ordenes del email logueado.
    const orders = await Order.find({ userEmail }).sort({ createdAt: -1 }).limit(100).lean();
    return JSON.parse(JSON.stringify(orders));
  } catch (err) {
    console.error('[shop/pedidos SSR]', err);
    return [];
  }
}

export default async function MisPedidosPage() {
  const initialOrders = await getInitialOrders();
  return <MisPedidosClient initialOrders={initialOrders} />;
}
