import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { sendOrderNotificationEmail } from '@/lib/email';

// GET orders
// - Admin por defecto: todos los pedidos
// - Usuario normal: sólo los suyos
// - ?mine=1: fuerza filtro por usuario, útil para que un admin vea SU pagina
//   de "Mis pedidos" sin mezclarse con los pedidos de todos
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const onlyMine = searchParams.get('mine') === '1' || searchParams.get('mine') === 'true';
  const isAdmin = (session.user as any).role === 'admin';
  const userId = (session.user as any).id;
  const userEmail = (session.user?.email || '').toLowerCase();

  const forceUserFilter = onlyMine || !isAdmin;

  const filter: any = forceUserFilter
    ? {
        // Match por userId O por email. Cubre casos en los que el ID cambió entre
        // sesiones (reautenticación, cambios en el provider) pero el email sigue siendo el mismo.
        $or: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ userEmail: { $regex: `^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }] : []),
        ],
      }
    : {}; // admin sin ?mine → todos

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
    userEmail: (session.user?.email || '').toLowerCase(),
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

  // Email a los admins — no-blocking: si Resend falla, el pedido se crea de todas formas.
  // Se dispara en el servidor (Vercel function) y no depende de que el admin tenga la pestaña abierta.
  sendOrderNotificationEmail({
    orderNumber: order.orderNumber,
    userName: order.userName,
    userEmail: order.userEmail,
    total: order.total,
    items: order.items,
    shippingAddress: order.shippingAddress,
    notes: order.notes,
    createdAt: order.createdAt,
  }).then(r => {
    if (!r.ok) console.error('[orders] email notify failed:', r.error);
  }).catch(err => console.error('[orders] email notify exception:', err));

  return NextResponse.json(order, { status: 201 });
}
