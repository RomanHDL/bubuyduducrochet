import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

// Default FAQs — sólo se siembran si la colección está completamente vacía.
const DEFAULTS = [
  { category: '🧶 Productos', question: 'Todos los productos son hechos a mano?', answer: 'Si! Cada pieza es tejida a mano con crochet. Por eso cada producto es unico y puede tener pequenas variaciones que lo hacen especial.', order: 1 },
  { category: '🧶 Productos', question: 'Que materiales usan?', answer: 'Usamos hilos de algodon y acrilico de alta calidad, hipoalergenicos y lavables. Todos nuestros rellenos son seguros para bebes y ninos.', order: 2 },
  { category: '🧶 Productos', question: 'Puedo pedir un producto personalizado?', answer: 'Claro! Nos encanta hacer pedidos personalizados. Escribenos por WhatsApp o en la seccion de contacto con tu idea y te daremos presupuesto.', order: 3 },
  { category: '📦 Envios', question: 'Hacen envios a toda la republica?', answer: 'Si! Enviamos a todo Mexico por paqueteria. Los costos de envio se calculan al momento del pedido segun tu ubicacion.', order: 4 },
  { category: '📦 Envios', question: 'Cuanto tarda en llegar mi pedido?', answer: 'Los productos en stock se envian en 1-3 dias habiles. Los pedidos personalizados pueden tardar 5-15 dias dependiendo de la complejidad.', order: 5 },
  { category: '💳 Pagos', question: 'Que metodos de pago aceptan?', answer: 'Aceptamos transferencia bancaria BBVA, deposito en OXXO, y pago por WhatsApp. Pronto agregaremos pago con tarjeta.', order: 6 },
  { category: '🔄 Devoluciones', question: 'Aceptan devoluciones?', answer: 'Si tu producto llega danado o con algun defecto, lo reemplazamos sin costo. Contactanos dentro de los primeros 7 dias.', order: 7 },
];

// Backfill idempotente: a las FAQs antiguas sin `status`, les asigna 'approved'.
let backfilled = false;
async function ensureStatusBackfill() {
  if (backfilled) return;
  try {
    await FAQ.updateMany(
      { $or: [{ status: { $exists: false } }, { status: null }] },
      { $set: { status: 'approved' } },
    );
    backfilled = true;
  } catch { /* silent */ }
}

// GET público: aprobadas (incluye documentos legacy sin campo status).
// Admin: ?status=pending o ?all=true
export async function GET(req: NextRequest) {
  await connectDB();
  await ensureStatusBackfill();

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status');
  const all = searchParams.get('all');

  const session = await getServerSession(authOptions);
  const isAdmin = session && (session.user as any).role === 'admin';

  // Seed inicial sólo si no hay NADA en la colección.
  const total = await FAQ.countDocuments();
  if (total === 0) {
    await FAQ.insertMany(DEFAULTS.map(f => ({ ...f, isActive: true, status: 'approved' })));
  }

  // Por default: aprobadas (status 'approved' O sin campo status = legacy).
  let filter: any = { isActive: true, status: { $ne: 'pending' } };
  if (isAdmin && statusParam === 'pending') {
    filter = { isActive: true, status: 'pending' };
  } else if (isAdmin && all === 'true') {
    filter = { isActive: true };
  }

  const faqs = await FAQ.find(filter).sort({ category: 1, order: 1 });
  const res = NextResponse.json(faqs);
  // FAQs cambian muy raro. Cache corto en el navegador para que la pagina
  // de preguntas se abra al instante en visitas repetidas.
  res.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=300');
  return res;
}

// POST:
//   - admin crea directamente (status 'approved' por default)
//   - usuario autenticado envía propuesta (status 'pending')
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Inicia sesion' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const isAdmin = (session.user as any).role === 'admin';

  if (!body.question || !body.question.trim()) {
    return NextResponse.json({ error: 'La pregunta es obligatoria' }, { status: 400 });
  }

  const doc: any = {
    category: body.category || '📱 General',
    question: body.question.trim(),
    answer: isAdmin ? (body.answer || '') : '',
    order: body.order ?? 0,
    isActive: true,
    status: isAdmin ? (body.status === 'pending' ? 'pending' : 'approved') : 'pending',
    submittedBy: (session.user as any).id,
    submittedByName: session.user?.name || 'Cliente',
  };
  const faq = await FAQ.create(doc);
  return NextResponse.json(faq, { status: 201 });
}
