import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Material from '@/models/Material';

// PUT — update
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  await connectDB();
  const body = await req.json();
  const material = await Material.findByIdAndUpdate(params.id, body, { new: true });
  if (!material) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(material);
}

// DELETE
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  await connectDB();
  await Material.findByIdAndDelete(params.id);
  return NextResponse.json({ deleted: true });
}
