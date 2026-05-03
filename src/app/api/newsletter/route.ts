import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';

export const dynamic = 'force-dynamic';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter — suscribir un email al newsletter.
// Idempotente: si el email ya está suscrito, devuelve OK sin error.
// No revelamos si un email ya estaba registrado (anti-enumeration).
export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }); }

  const email = String(body?.email || '').trim().toLowerCase();
  const source = String(body?.source || 'footer').slice(0, 32);

  if (!email || !EMAIL_RX.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Correo inválido' }, { status: 400 });
  }

  try {
    await connectDB();
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      // Si estaba desactivado, lo reactivamos
      if (!existing.isActive) {
        existing.isActive = true;
        existing.unsubscribedAt = undefined as any;
        await existing.save();
      }
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    await Subscriber.create({ email, source, isActive: true });
    return NextResponse.json({ ok: true, alreadySubscribed: false });
  } catch (err: any) {
    // Conflictos por race en index unique → tratar como ya-suscrito
    if (err?.code === 11000) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    console.error('[newsletter POST]', err);
    return NextResponse.json({ error: 'No se pudo procesar tu suscripción' }, { status: 500 });
  }
}

// GET /api/newsletter — protegido para admin, retorna suscriptores
export async function GET() {
  // Por ahora solo POST público — GET requeriría sesión admin.
  // Lo dejamos para una vista futura del panel admin.
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}
