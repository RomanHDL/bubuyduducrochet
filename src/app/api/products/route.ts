import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

// Campos livianos para listados (sin elaboration, que puede pesar cientos de KB)
const LIST_FIELDS = 'title description price images stock availability category isActive featured createdAt updatedAt';

// GET all products (public)
export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');
  const limit = parseInt(searchParams.get('limit') || '50');
  const includeElaboration = searchParams.get('includeElaboration') === 'true';

  const filter: any = { isActive: true };
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // .lean() y select excluyen el objeto elaboration en listados (mejora 5–10× el payload)
  const query = Product.find(filter).sort({ createdAt: -1 }).limit(limit);
  if (!includeElaboration) query.select(LIST_FIELDS);

  const products = await query.lean();

  const res = NextResponse.json(products);
  // Sin cache: el catalogo se actualiza al instante cuando se crea/edita/elimina
  // un producto o cambia la disponibilidad. Evita publicaciones "fantasma".
  res.headers.set('Cache-Control', 'no-store, must-revalidate');
  return res;
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
