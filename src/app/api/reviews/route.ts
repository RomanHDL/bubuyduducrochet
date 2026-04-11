import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

const DEFAULTS = [
  { userName: 'Maria G.', userEmail: 'demo@demo.com', text: 'El amigurumi de gatito que pedi es hermosisimo! Se nota el amor en cada puntada. Mi hija no lo suelta.', rating: 5, emoji: '🐱', isApproved: true },
  { userName: 'Sofia R.', userEmail: 'demo2@demo.com', text: 'Pedi un oso personalizado para baby shower y quedo perfecto. Todas las invitadas preguntaron donde lo compre!', rating: 5, emoji: '🧸', isApproved: true },
  { userName: 'Laura M.', userEmail: 'demo3@demo.com', text: 'La calidad es increible, los colores son exactos a las fotos. Ya es mi tercera compra y siempre quedo encantada.', rating: 5, emoji: '🌸', isApproved: true },
  { userName: 'Ana P.', userEmail: 'demo4@demo.com', text: 'El envio fue super rapido y el empaquetado precioso. Se ve que cuidan cada detalle. 100% recomendado!', rating: 5, emoji: '📦', isApproved: true },
];

// GET — public: approved only; admin: all
export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === 'admin';

  let reviews = isAdmin
    ? await Review.find().sort({ createdAt: -1 })
    : await Review.find({ isApproved: true }).sort({ createdAt: -1 });

  if (reviews.length === 0 && !isAdmin) {
    await Review.insertMany(DEFAULTS);
    reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
  }
  return NextResponse.json(reviews);
}

// POST — authenticated users submit reviews
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Inicia sesion para dejar tu resena' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const review = await Review.create({
    userName: session.user?.name || 'Cliente',
    userEmail: session.user?.email || '',
    text: body.text,
    rating: Math.min(5, Math.max(1, body.rating || 5)),
    emoji: body.emoji || '🧸',
    isApproved: false, // needs admin approval
  });
  return NextResponse.json(review, { status: 201 });
}
