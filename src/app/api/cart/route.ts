import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';

// GET user's cart
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [], total: 0 });
  }
  return NextResponse.json(cart);
}

// POST add/update item in cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;
  const { productId, title, price, image, quantity } = await req.json();

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [], total: 0 });
  }

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
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  const cart = await Cart.findOne({ userId });
  if (!cart) return NextResponse.json({ items: [], total: 0 });

  if (productId) {
    cart.items = cart.items.filter((i: any) => i.productId !== productId);
  } else {
    cart.items = [];
  }

  cart.total = cart.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  await cart.save();

  return NextResponse.json(cart);
}
