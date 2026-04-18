import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const ALLOWED_FRAMES = ['none','gold','rose','lavender','mint','glitter','rainbow','crown','hearts','stars'];

// GET perfil del usuario logueado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  await connectDB();
  const user = await User.findById((session.user as any).id).select('name email image role profile').lean();
  if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(user);
}

// PATCH perfil — solo admin puede personalizar marcos/badge
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if ((session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden personalizar el perfil' }, { status: 403 });
  }
  await connectDB();
  const body = await req.json().catch(() => ({}));
  const update: any = {};

  if (typeof body.frame === 'string') {
    if (!ALLOWED_FRAMES.includes(body.frame)) {
      return NextResponse.json({ error: 'Marco inválido' }, { status: 400 });
    }
    update['profile.frame'] = body.frame;
  }
  if (typeof body.accentColor === 'string') update['profile.accentColor'] = body.accentColor.slice(0, 32);
  if (typeof body.badge === 'string') update['profile.badge'] = body.badge.slice(0, 64);
  if (typeof body.bio === 'string') update['profile.bio'] = body.bio.slice(0, 240);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Sin cambios' }, { status: 400 });
  }

  const user = await User.findByIdAndUpdate(
    (session.user as any).id,
    { $set: update },
    { new: true },
  ).select('name email image role profile').lean();

  return NextResponse.json(user);
}
