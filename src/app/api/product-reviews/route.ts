import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ProductReview from '@/models/ProductReview';

// GET reviews for a product. Publico: solo aprobadas. Admin (?all=true): todas.
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const all = searchParams.get('all');
  const session = await getServerSession(authOptions);
  const isAdmin = !!session && (session.user as any).role === 'admin';

  // Admin con ?all=true puede ver TODAS (aprobadas + pendientes) para moderar
  if (all === 'true' && isAdmin) {
    const reviews = await ProductReview.find({}).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  }

  if (!productId) return NextResponse.json([]);

  // Publico: solo reseñas aprobadas. Admin viendo el producto: ve todas
  // (asi puede ver lo que ya aprobo + lo pendiente sin entrar a admin)
  const filter: any = { productId };
  if (!isAdmin) filter.isApproved = true;
  const reviews = await ProductReview.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(reviews);
}

// POST — usuario autenticado deja reseña. Por defecto NO aprobada — requiere
// que un admin la apruebe antes de ser visible al publico.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Inicia sesion' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  if (!body.productId || !body.rating) return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 });
  const review = await ProductReview.create({
    productId: body.productId,
    userId: (session.user as any).id,
    userName: session.user?.name || 'Cliente',
    rating: Math.min(5, Math.max(1, body.rating)),
    text: typeof body.text === 'string' ? body.text.trim() : '',
    images: body.images || [],
    isApproved: false,
  });
  return NextResponse.json(review, { status: 201 });
}
