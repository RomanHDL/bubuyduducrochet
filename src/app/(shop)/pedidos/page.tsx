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
    if (!session) return [];
    const userId = (session.user as any)?.id;
    const userEmail = (session.user?.email || '').toLowerCase();
    if (!userId && !userEmail) return [];

    await connectDB();
    // Misma logica que GET /api/orders?mine=1: match por userId O email
    // case-insensitive. Antes era exact-match por email, lo cual fallaba si
    // los pedidos antiguos quedaron guardados con casing distinto.
    const ors: any[] = [];
    if (userId) ors.push({ userId });
    if (userEmail) {
      const safe = userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      ors.push({ userEmail: { $regex: `^${safe}$`, $options: 'i' } });
    }
    const orders = await Order.find({ $or: ors }).sort({ createdAt: -1 }).limit(100).lean();
    console.log(`[shop/pedidos SSR] user=${userEmail} → ${orders.length} pedidos`);
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
