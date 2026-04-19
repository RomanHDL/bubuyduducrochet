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
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado (inicia sesion como admin)' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // Normalizar payload — evita que campos vacios/tipicos del form rompan el schema
    const doc: any = {
      title: (body.title || '').trim(),
      description: (body.description || '').trim(),
      price: Number(body.price) || 0,
      images: Array.isArray(body.images) ? body.images.filter((u: any) => typeof u === 'string' && u.trim()) : [],
      stock: Number(body.stock) || 0,
      availability: body.availability === 'por_pedido' ? 'por_pedido' : 'disponible',
      category: (body.category || 'otro').trim() || 'otro',
      isActive: body.isActive !== false,
      featured: !!body.featured,
      createdBy: (session.user as any).id,
    };
    if (body.elaboration && typeof body.elaboration === 'object') {
      doc.elaboration = body.elaboration;
    }

    if (!doc.title) return NextResponse.json({ error: 'El titulo es obligatorio' }, { status: 400 });
    if (!doc.description) return NextResponse.json({ error: 'La descripcion es obligatoria' }, { status: 400 });

    const product = await Product.create(doc);
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/products] error:', err);
    const msg = err?.name === 'ValidationError'
      ? Object.values((err as any).errors || {}).map((e: any) => e?.message).filter(Boolean).join('; ') || 'Datos invalidos'
      : (err?.message || 'Error al crear el producto');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
