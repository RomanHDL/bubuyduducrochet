// Server component — pre-carga las FAQs aprobadas en el servidor para que el
// HTML inicial venga con las preguntas ya pintadas. Primera visita = instantanea.
import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';
import FaqClient from './FaqClient';
import { faqJsonLd, jsonLdScriptProps } from '@/lib/jsonld';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const revalidate = 30; // FAQs cambian raro, 30s de cache es perfecto.

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: 'Resolvemos tus dudas sobre nuestros productos de crochet artesanal: envíos, pedidos personalizados, materiales, devoluciones y más.',
  alternates: { canonical: `${SITE_URL}/preguntas` },
  openGraph: {
    title: `Preguntas Frecuentes | ${SITE_NAME}`,
    description: 'Todas las respuestas sobre crochet artesanal, envíos, pedidos personalizados y devoluciones.',
    url: `${SITE_URL}/preguntas`,
  },
};

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

  // FAQPage JSON-LD desde la DB. Cada pregunta aprobada se inyecta como rich
  // snippet que aparece directamente en SERP de Google con su respuesta.
  const faqItems = (initialFaqs as Array<{ question: string; answer: string }>)
    .filter((f) => f.question && f.answer)
    .map((f) => ({ question: f.question, answer: f.answer }));
  const ld = faqItems.length > 0 ? faqJsonLd(faqItems) : null;

  return (
    <>
      {ld && <script {...jsonLdScriptProps(ld)} />}
      <FaqClient initialFaqs={initialFaqs} />
    </>
  );
}
