import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';

// GET orders (user sees own, admin sees all)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await connectDB();
  const isAdmin = (session.user as any).role === 'admin';
  const filter = isAdmin ? {} : { userId: (session.user as any).id };

  const orders = await Order.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(orders);
}

// POST create order from cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  const body = await req.json();

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'El carrito esta vacio' }, { status: 400 });
  }

  // Auto-increment order number
  const lastOrder = await Order.findOne({}).sort({ orderNumber: -1 }).lean() as any;
  const nextNumber = (lastOrder?.orderNumber || 0) + 1;

  const order = await Order.create({
    orderNumber: nextNumber,
    userId,
    userName: session.user?.name || 'Cliente',
    userEmail: session.user?.email || '',
    items: cart.items,
    total: cart.total,
    shippingAddress: body.shippingAddress || '',
    notes: body.notes || '',
    status: 'pending',
    paymentStatus: 'pending',
  });

  // Clear cart after order
  cart.items = [];
  cart.total = 0;
  await cart.save();

  return NextResponse.json(order, { status: 201 });
}
