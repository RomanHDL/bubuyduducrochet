import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ProductReview from '@/models/ProductReview';

// PUT — admin only: aprobar o rechazar una reseña de producto
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  await connectDB();
  const body = await req.json().catch(() => ({}));
  const update: any = {};
  if (typeof body.isApproved === 'boolean') update.isApproved = body.isApproved;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Sin cambios' }, { status: 400 });
  }
  const review = await ProductReview.findByIdAndUpdate(params.id, update, { new: true });
  if (!review) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json(review);
}

// DELETE — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  await connectDB();
  await ProductReview.findByIdAndDelete(params.id);
  return NextResponse.json({ deleted: true });
}
