import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

// GET all products (public)
//
// Optimizacion clave de performance:
// En el listado traemos SOLO la primera imagen (images[0]) via projection con
// $slice. Si cada producto tiene 3-5 imagenes base64 en Mongo, el payload del
// catalogo puede pasar de 20-30MB a ~1-2MB — con la misma UX, porque la Card
// solo pinta `images[0]` de todos modos. Las imagenes completas se sirven en
// GET /api/products/:id cuando abres el detalle o editas el producto.
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

  // Projection liviana: excluye `elaboration` (pesa cientos de KB) y recorta
  // `images` a la primera entrada (via $slice). Mongo no envia ni carga las
  // demas — 10× mas rapido tanto en DB como en red.
  const projection: any = {
    title: 1, description: 1, price: 1, stock: 1, availability: 1,
    category: 1, isActive: 1, featured: 1, createdAt: 1, updatedAt: 1,
    images: includeElaboration ? 1 : { $slice: 1 },
  };
  if (includeElaboration) projection.elaboration = 1;

  const products = await Product.find(filter, projection)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

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
    // Invalida el HTML SSR del catalogo → el nuevo producto aparece al instante
    // para visitantes nuevos (sin tener que esperar los 5s de ISR).
    try { revalidatePath('/catalogo'); } catch {}
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/products] error:', err);
    const msg = err?.name === 'ValidationError'
      ? Object.values((err as any).errors || {}).map((e: any) => e?.message).filter(Boolean).join('; ') || 'Datos invalidos'
      : (err?.message || 'Error al crear el producto');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
