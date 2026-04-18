import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Favorite from '@/models/Favorite';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

// GET — solo el conteo de favoritos válidos (productos que aún existen)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });
  await connectDB();

  const userId = (session.user as any).id;
  const userEmail = (session.user?.email || '').toLowerCase();

  const favs = await Favorite.find({
    $or: [
      ...(userId ? [{ userId }] : []),
      ...(userEmail ? [{ userEmail }] : []),
    ],
  }).lean();

  if (favs.length === 0) return NextResponse.json({ count: 0 });

  const productIds = favs.map(f => f.productId);
  const existingCount = await Product.countDocuments({ _id: { $in: productIds } });

  return NextResponse.json({ count: existingCount });
}
