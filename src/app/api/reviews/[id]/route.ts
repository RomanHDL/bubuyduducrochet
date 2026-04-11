import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const review = await Review.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json(review);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await connectDB();
  await Review.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
