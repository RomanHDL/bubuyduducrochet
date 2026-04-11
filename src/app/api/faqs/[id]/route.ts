import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const faq = await FAQ.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json(faq);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await connectDB();
  await FAQ.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
