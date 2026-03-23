import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

// PUT update order status (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const order = await Order.findByIdAndUpdate(params.id, body, { new: true });
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  return NextResponse.json(order);
}
