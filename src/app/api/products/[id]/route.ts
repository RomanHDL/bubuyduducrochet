import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

// GET single product (public)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const product = await Product.findById(params.id).lean();
  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  const res = NextResponse.json(product);
  res.headers.set('Cache-Control', 'no-store, must-revalidate');
  return res;
}

// PUT update product (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado (inicia sesion como admin)' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const product = await Product.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err: any) {
    console.error('[PUT /api/products/:id] error:', err);
    const msg = err?.name === 'ValidationError'
      ? Object.values((err as any).errors || {}).map((e: any) => e?.message).filter(Boolean).join('; ') || 'Datos invalidos'
      : (err?.message || 'Error al actualizar el producto');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE product (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();
  await Product.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
