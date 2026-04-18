import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Favorite from '@/models/Favorite';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

function getOwnerFilter(session: any) {
  const userId = (session.user as any).id;
  const userEmail = (session.user?.email || '').toLowerCase();
  return {
    $or: [
      ...(userId ? [{ userId }] : []),
      ...(userEmail ? [{ userEmail }] : []),
    ],
  };
}

// GET — productos favoritos del usuario logueado, con JOIN a Product
// Devuelve sólo productos que siguen existiendo (limpia automáticamente huérfanos).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([]);
  await connectDB();

  const favs = await Favorite.find(getOwnerFilter(session)).lean();
  if (favs.length === 0) return NextResponse.json([]);

  const productIds = favs.map(f => f.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p: any) => [String(p._id), p]));

  // Limpiar huérfanos (favoritos cuyo producto ya no existe)
  const orphanIds = favs.filter(f => !productMap.has(f.productId)).map(f => f._id);
  if (orphanIds.length > 0) {
    await Favorite.deleteMany({ _id: { $in: orphanIds } });
  }

  const result = favs
    .filter(f => productMap.has(f.productId))
    .map(f => productMap.get(f.productId));

  return NextResponse.json(result);
}

// POST — marcar un producto como favorito
// body: { productId: string }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Inicia sesion' }, { status: 401 });
  await connectDB();

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 });

  // Verificar que el producto exista
  const exists = await Product.exists({ _id: productId });
  if (!exists) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  const userId = (session.user as any).id;
  const userEmail = (session.user?.email || '').toLowerCase();

  try {
    await Favorite.updateOne(
      { userId, productId },
      { $setOnInsert: { userId, userEmail, productId } },
      { upsert: true },
    );
  } catch (err: any) {
    if (err.code !== 11000) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  const count = await Favorite.countDocuments(getOwnerFilter(session));
  return NextResponse.json({ ok: true, count });
}

// DELETE — quitar de favoritos
// ?productId=<id>
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Inicia sesion' }, { status: 401 });
  await connectDB();

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 });

  await Favorite.deleteOne({
    ...getOwnerFilter(session),
    productId,
  } as any);

  const count = await Favorite.countDocuments(getOwnerFilter(session));
  return NextResponse.json({ ok: true, count });
}
