import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

// Default FAQs to seed if empty
const DEFAULTS = [
  { category: '🧶 Productos', question: 'Todos los productos son hechos a mano?', answer: 'Si! Cada pieza es tejida a mano con crochet. Por eso cada producto es unico y puede tener pequenas variaciones que lo hacen especial.', order: 1 },
  { category: '🧶 Productos', question: 'Que materiales usan?', answer: 'Usamos hilos de algodon y acrilico de alta calidad, hipoalergenicos y lavables. Todos nuestros rellenos son seguros para bebes y ninos.', order: 2 },
  { category: '🧶 Productos', question: 'Puedo pedir un producto personalizado?', answer: 'Claro! Nos encanta hacer pedidos personalizados. Escribenos por WhatsApp o en la seccion de contacto con tu idea y te daremos presupuesto.', order: 3 },
  { category: '📦 Envios', question: 'Hacen envios a toda la republica?', answer: 'Si! Enviamos a todo Mexico por paqueteria. Los costos de envio se calculan al momento del pedido segun tu ubicacion.', order: 4 },
  { category: '📦 Envios', question: 'Cuanto tarda en llegar mi pedido?', answer: 'Los productos en stock se envian en 1-3 dias habiles. Los pedidos personalizados pueden tardar 5-15 dias dependiendo de la complejidad.', order: 5 },
  { category: '💳 Pagos', question: 'Que metodos de pago aceptan?', answer: 'Aceptamos transferencia bancaria BBVA, deposito en OXXO, y pago por WhatsApp. Pronto agregaremos pago con tarjeta.', order: 6 },
  { category: '🔄 Devoluciones', question: 'Aceptan devoluciones?', answer: 'Si tu producto llega danado o con algun defecto, lo reemplazamos sin costo. Contactanos dentro de los primeros 7 dias.', order: 7 },
];

export async function GET() {
  await connectDB();
  let faqs = await FAQ.find({ isActive: true }).sort({ category: 1, order: 1 });
  if (faqs.length === 0) {
    await FAQ.insertMany(DEFAULTS.map(f => ({ ...f, isActive: true })));
    faqs = await FAQ.find({ isActive: true }).sort({ category: 1, order: 1 });
  }
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const faq = await FAQ.create(body);
  return NextResponse.json(faq, { status: 201 });
}
