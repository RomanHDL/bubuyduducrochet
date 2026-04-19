import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';

export const dynamic = 'force-dynamic';

/**
 * Encuentra (o crea) el carrito del usuario actual.
 * Busca por userId O por email, unifica si hay varios, y asegura que el
 * documento quede con ambos campos actualizados — así si el session.user.id
 * cambia entre logins pero el email es el mismo, el carrito NO se pierde.
 */
async function findOrCreateCart(session: any) {
  const userId = (session.user as any).id as string | undefined;
  const userEmail = (session.user?.email || '').toLowerCase();

  // Buscar cualquier carrito existente del usuario por cualquiera de los dos keys
  const ors: any[] = [];
  if (userId) ors.push({ userId });
  if (userEmail) ors.push({ userEmail });

  let carts = ors.length > 0 ? await Cart.find({ $or: ors }).sort({ updatedAt: -1 }) : [];

  if (carts.length === 0) {
    const cart = await Cart.create({ userId: userId || '', userEmail, items: [], total: 0 });
    return cart;
  }

  // Si hay más de un documento (por userId + email antiguos), fusionarlos en uno
  let primary = carts[0];
  if (carts.length > 1) {
    // Unir items de todos, sumando cantidades por productId
    const byProduct: Record<string, any> = {};
    for (const c of carts) {
      for (const it of c.items) {
        if (byProduct[it.productId]) {
          byProduct[it.productId].quantity += it.quantity;
        } else {
          byProduct[it.productId] = { ...(it as any).toObject?.() || it };
        }
      }
    }
    primary.items = Object.values(byProduct) as any;
    primary.total = primary.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    // Asegurar ambos campos
    if (userId) primary.userId = userId;
    if (userEmail) primary.userEmail = userEmail;
    await primary.save();
    // Eliminar los duplicados
    await Cart.deleteMany({ _id: { $in: carts.slice(1).map(c => c._id) } });
  } else {
    // Un solo carrito — asegurar que tenga ambos campos actualizados
    let dirty = false;
    if (userId && primary.userId !== userId) { primary.userId = userId; dirty = true; }
    if (userEmail && primary.userEmail !== userEmail) { primary.userEmail = userEmail; dirty = true; }
    if (dirty) await primary.save();
  }

  return primary;
}

// GET user's cart
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await connectDB();
  const cart = await findOrCreateCart(session);
  return NextResponse.json(cart);
}

// POST add/update item in cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await connectDB();
  const { productId, title, price, image, quantity } = await req.json();

  const cart = await findOrCreateCart(session);

  const existingIdx = cart.items.findIndex((i: any) => i.productId === productId);
  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity = quantity;
    if (quantity <= 0) cart.items.splice(existingIdx, 1);
  } else if (quantity > 0) {
    cart.items.push({ productId, title, price, image, quantity });
  }

  cart.total = cart.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  await cart.save();

  return NextResponse.json(cart);
}

// DELETE clear cart or remove item
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  const cart = await findOrCreateCart(session);

  if (productId) {
    cart.items = cart.items.filter((i: any) => i.productId !== productId);
  } else {
    cart.items = [] as any;
  }

  cart.total = cart.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  await cart.save();

  return NextResponse.json(cart);
}
