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
  const limit = Math.max(1, Math.min(20, Number(searchParams.get('limit') || 10)));

  const query: any = since > 0 ? { orderNumber: { $gt: since } } : {};
  const orders = await Order.find(query)
    .sort({ orderNumber: -1 })
    .limit(limit)
    .select('orderNumber userName userEmail total status paymentStatus createdAt')
    .lean();

  return NextResponse.json(orders);
}
