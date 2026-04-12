import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ProductReview from '@/models/ProductReview';

// GET reviews for a product
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const all = searchParams.get('all');
  // Admin can fetch ALL product reviews
  if (all === 'true') {
    const session = await getServerSession(authOptions);
    if (session && (session.user as any).role === 'admin') {
      const reviews = await ProductReview.find({}).sort({ createdAt: -1 });
      return NextResponse.json(reviews);
    }
  }
  if (!productId) return NextResponse.json([]);
  const reviews = await ProductReview.find({ productId }).sort({ createdAt: -1 });
  return NextResponse.json(reviews);
}

// POST — authenticated user writes review
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Inicia sesion' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  if (!body.productId || !body.text || !body.rating) return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 });
  const review = await ProductReview.create({
    productId: body.productId,
    userId: (session.user as any).id,
    userName: session.user?.name || 'Cliente',
    rating: Math.min(5, Math.max(1, body.rating)),
    text: body.text,
    images: body.images || [],
  });
  return NextResponse.json(review, { status: 201 });
}
