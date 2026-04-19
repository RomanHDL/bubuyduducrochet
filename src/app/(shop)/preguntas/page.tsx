// Server component — pre-carga las FAQs aprobadas en el servidor para que el
// HTML inicial venga con las preguntas ya pintadas. Primera visita = instantanea.
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';
import FaqClient from './FaqClient';

export const revalidate = 30; // FAQs cambian raro, 30s de cache es perfecto.

async function getInitialFaqs() {
  try {
    await connectDB();
    // Solo las aprobadas (publicas). Las pendientes se cargan via fetch en
    // el cliente cuando el usuario es admin (mantiene la logica actual).
    const faqs = await FAQ.find({ isActive: true, status: { $ne: 'pending' } })
      .sort({ category: 1, order: 1 }).lean();
    return JSON.parse(JSON.stringify(faqs));
  } catch (err) {
    console.error('[preguntas SSR]', err);
    return [];
  }
}

export default async function PreguntasPage() {
  const initialFaqs = await getInitialFaqs();
  return <FaqClient initialFaqs={initialFaqs} />;
}
