import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

// GET all products (public)
export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');
  const limit = parseInt(searchParams.get('limit') || '50');

  const filter: any = { isActive: true };
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  return NextResponse.json(products);
}

// POST create product (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();

  const product = await Product.create({
    ...body,
    createdBy: (session.user as any).id,
  });

  return NextResponse.json(product, { status: 201 });
}
