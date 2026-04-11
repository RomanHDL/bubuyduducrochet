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

// DELETE — admin: remove unpaid orders permanently; customer: cancel pending
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  await connectDB();
  const order = await Order.findById(params.id);
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

  const isAdmin = (session.user as any).role === 'admin';
  const isOwner = order.userId === (session.user as any).id;

  if (!isAdmin && !isOwner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  // Admin can permanently delete unpaid orders
  if (isAdmin && order.paymentStatus !== 'paid') {
    await Order.findByIdAndDelete(params.id);
    return NextResponse.json({ deleted: true });
  }

  // Customer can only cancel pending orders
  if (!isAdmin && order.status !== 'pending') {
    return NextResponse.json({ error: 'Solo puedes cancelar pedidos pendientes' }, { status: 400 });
  }

  order.status = 'cancelled';
  await order.save();
  return NextResponse.json(order);
}
