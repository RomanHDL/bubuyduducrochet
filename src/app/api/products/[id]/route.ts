import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

// GET single product (public)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const product = await Product.findById(params.id);
  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  return NextResponse.json(product);
}

// PUT update product (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const product = await Product.findByIdAndUpdate(params.id, body, { new: true });
  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  return NextResponse.json(product);
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
