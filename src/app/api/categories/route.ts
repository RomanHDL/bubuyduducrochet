import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';

const DEFAULTS = [
  { slug: 'amigurumis', name: 'Amigurumis', emoji: '🧸', color: 'bg-blush-50 border-blush-200', order: 1 },
  { slug: 'accesorios', name: 'Accesorios', emoji: '🎀', color: 'bg-lavender-50 border-lavender-200', order: 2 },
  { slug: 'decoracion', name: 'Decoracion', emoji: '🌸', color: 'bg-mint-50 border-mint-200', order: 3 },
  { slug: 'ropa-bebe', name: 'Ropa Bebe', emoji: '👶', color: 'bg-sky-50 border-sky-200', order: 4 },
];

export async function GET() {
  await connectDB();
  let cats = await Category.find({ isActive: true }).sort({ order: 1 });
  if (cats.length === 0) {
    await Category.insertMany(DEFAULTS.map(c => ({ ...c, isActive: true })));
    cats = await Category.find({ isActive: true }).sort({ order: 1 });
  }
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  if (!body.slug || !body.name) return NextResponse.json({ error: 'Slug y nombre requeridos' }, { status: 400 });
  const cat = await Category.create({ ...body, isActive: true });
  return NextResponse.json(cat, { status: 201 });
}
