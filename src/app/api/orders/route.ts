import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { sendOrderNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// GET orders
// - Admin por defecto: todos los pedidos
// - Usuario normal: sólo los suyos
// - ?mine=1: fuerza filtro por usuario, útil para que un admin vea SU pagina
//   de "Mis pedidos" sin mezclarse con los pedidos de todos
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const onlyMine = searchParams.get('mine') === '1' || searchParams.get('mine') === 'true';
    const isAdmin = (session.user as any).role === 'admin';
    const userId = (session.user as any).id;
    const userEmail = (session.user?.email || '').toLowerCase();

    const forceUserFilter = onlyMine || !isAdmin;

    let filter: any = {}; // admin sin ?mine → todos
    if (forceUserFilter) {
      // Match por userId O por email. Cubre casos en los que el ID cambió entre
      // sesiones (reautenticación, cambios en el provider) pero el email sigue siendo el mismo.
      const ors: any[] = [];
      if (userId) ors.push({ userId });
      if (userEmail) {
        const safe = userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        ors.push({ userEmail: { $regex: `^${safe}$`, $options: 'i' } });
      }
      // Sin identificadores no podemos filtrar — devolver vacio en vez de
      // mandar `$or: []` (Mongo lanza "must be a non-empty array").
      if (ors.length === 0) return NextResponse.json([]);
      filter = { $or: ors };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    console.log(`[orders GET] user=${(session.user as any).email} mine=${onlyMine} isAdmin=${isAdmin} → ${orders.length} pedidos`);
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error('[orders GET] error:', err?.message || err);
    return NextResponse.json({ error: 'Error al cargar pedidos', details: err?.message || String(err) }, { status: 500 });
  }
}

// POST create order from cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  const userEmail = (session.user?.email || '').toLowerCase();
  const body = await req.json();

  // Buscar el carrito por userId O userEmail — mismo criterio que /api/cart, para que
  // si el userId cambió entre sesiones (re-auth, cambio de provider) el checkout
  // encuentre el carrito que el usuario realmente vio.
  const ors: any[] = [];
  if (userId) ors.push({ userId });
  if (userEmail) ors.push({ userEmail });
  const cart = ors.length > 0
    ? await Cart.findOne({ $or: ors }).sort({ updatedAt: -1 })
    : null;

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
