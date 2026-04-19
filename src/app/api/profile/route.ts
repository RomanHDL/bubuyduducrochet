import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const ALLOWED_FRAMES = [
  'none',
  'terminal',
  'neon',
  'matrix',
  'cyberpunk',
  'hacker',
  'rgb',
  'pixel',
  'hologram',
  'elite',
  // Legacy aún permitidos para no romper datos viejos
  'gold','rose','lavender','mint','glitter','rainbow','crown','hearts','stars',
];

// Encuentra al usuario logueado por email (garantía) y id (optimización opcional)
async function findCurrentUser(session: any) {
  const id = (session.user as any).id;
  const email = (session.user?.email || '').toLowerCase();
  if (id && mongoose.isValidObjectId(id)) {
    const byId = await User.findById(id);
    if (byId) return byId;
  }
  if (email) return User.findOne({ email });
  return null;
}

// GET perfil del usuario logueado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  await connectDB();
  const user = await findCurrentUser(session);
  if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({
    _id: String(user._id),
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    profile: user.profile || { frame: 'none', badge: '', bio: '', accentColor: '' },
  });
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
      return NextResponse.json({ error: 'Marco inválido: ' + body.frame }, { status: 400 });
    }
    update['profile.frame'] = body.frame;
  }
  if (typeof body.accentColor === 'string') update['profile.accentColor'] = body.accentColor.slice(0, 32);
  if (typeof body.badge === 'string') update['profile.badge'] = body.badge.slice(0, 64);
  if (typeof body.bio === 'string') update['profile.bio'] = body.bio.slice(0, 240);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Sin cambios' }, { status: 400 });
  }

  const existing = await findCurrentUser(session);
  if (!existing) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  const user = await User.findByIdAndUpdate(
    existing._id,
    { $set: update },
    { new: true, runValidators: false },
  );

  if (!user) return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 });

  return NextResponse.json({
    _id: String(user._id),
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    profile: user.profile || { frame: 'none', badge: '', bio: '', accentColor: '' },
  });
}
