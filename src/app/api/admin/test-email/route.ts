import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOrderNotificationEmail, ADMIN_NOTIFY_EMAILS } from '@/lib/email';

export const dynamic = 'force-dynamic';

// GET /api/admin/test-email — envía un email de prueba a los admins
// y devuelve el detalle completo del intento (incluyendo el error exacto de Resend si falló).
// Solo disponible para usuarios con rol admin logueados.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const hasApiKey = !!process.env.RESEND_API_KEY;
  const apiKeyPreview = process.env.RESEND_API_KEY
    ? process.env.RESEND_API_KEY.substring(0, 6) + '...' + process.env.RESEND_API_KEY.slice(-4)
    : null;

  if (!hasApiKey) {
    return NextResponse.json({
      ok: false,
      error: 'Variable RESEND_API_KEY no está en el entorno.',
      fix: 'Ve a Vercel → Settings → Environment Variables, añade RESEND_API_KEY con tu key (re_...) para Production/Preview/Development y redeploya.',
      hasApiKey,
      sentTo: ADMIN_NOTIFY_EMAILS,
    }, { status: 500 });
  }

  const result = await sendOrderNotificationEmail({
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

  // Adivinar causas comunes según el error
  let hint = '';
  if (!result.ok && result.error) {
    const e = result.error.toLowerCase();
    if (e.includes('testing emails') || e.includes('you can only send') || e.includes('verify a domain')) {
      hint = 'RESTRICCIÓN DE RESEND SANDBOX: sin dominio verificado, SOLO puedes enviar al correo con el que creaste la cuenta de Resend. Para enviar a ambos admins: verifica un dominio propio en Resend (resend.com/domains), o usa el plan gratuito enviando primero al correo del dueño de la cuenta.';
    } else if (e.includes('invalid') && e.includes('api')) {
      hint = 'API key inválida. Genera una nueva en resend.com/api-keys.';
    } else if (e.includes('domain') || e.includes('not verified')) {
      hint = 'El remitente (from) no está verificado. Usa onboarding@resend.dev o verifica tu dominio en Resend.';
    } else if (e.includes('rate limit')) {
      hint = 'Límite de envíos alcanzado en Resend (plan gratis: 100/día).';
    }
  }

  return NextResponse.json({
    ok: result.ok,
    error: result.error,
    hint,
    hasApiKey,
    apiKeyPreview,
    from: result.from,
    sentTo: result.to,
    resendResponse: result.data,
  }, { status: result.ok ? 200 : 500 });
}
