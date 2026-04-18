import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

// GET /api/admin/new-orders?since=<orderNumber>
// Devuelve pedidos con orderNumber > since (independiente del estado o pago)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  await connectDB();

  const { searchParams } = new URL(req.url);
  const since = Number(searchParams.get('since') || 0);

  const query: any = since > 0 ? { orderNumber: { $gt: since } } : {};
  const orders = await Order.find(query)
    .sort({ orderNumber: -1 })
    .limit(10)
    .select('orderNumber userName userEmail total status paymentStatus createdAt')
    .lean();

  return NextResponse.json(orders);
}
