import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOrderNotificationEmail, ADMIN_NOTIFY_EMAILS } from '@/lib/email';

export const dynamic = 'force-dynamic';

// GET /api/admin/test-email — envía un email de prueba a los admins.
// Solo disponible para usuarios con rol admin logueados.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const ok = await sendOrderNotificationEmail({
    orderNumber: 9999,
    userName: 'Cliente de Prueba',
    userEmail: 'test@example.com',
    total: 450,
    items: [
      { title: 'Osito Amigurumi (TEST)', price: 250, quantity: 1 },
      { title: 'Llavero Corazón (TEST)',  price: 100, quantity: 2 },
    ],
    shippingAddress: 'Calle Ficticia 123, Ciudad, CP',
    notes: 'Email de prueba — no es un pedido real',
    createdAt: new Date(),
  });

  return NextResponse.json({
    ok,
    sentTo: ADMIN_NOTIFY_EMAILS,
    hasApiKey: !!process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM || 'Bubu & Dudu <onboarding@resend.dev>',
    hint: ok
      ? 'Email enviado. Revisa las bandejas (incluyendo SPAM) de ' + ADMIN_NOTIFY_EMAILS.join(' y ')
      : 'No se envió. Revisa que RESEND_API_KEY esté configurada en Vercel.',
  });
}
