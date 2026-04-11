'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  {
    category: '🧶 Productos',
    questions: [
      { q: 'Todos los productos son hechos a mano?', a: 'Si! Cada pieza es tejida a mano con crochet. Por eso cada producto es unico y puede tener pequenas variaciones que lo hacen especial.' },
      { q: 'Que materiales usan?', a: 'Usamos hilos de algodon y acrilico de alta calidad, hipoalergenicos y lavables. Todos nuestros rellenos son seguros para bebes y ninos.' },
      { q: 'Puedo pedir un producto personalizado?', a: 'Claro! Nos encanta hacer pedidos personalizados. Escríbenos por WhatsApp o en la seccion de contacto con tu idea y te daremos presupuesto.' },
      { q: 'Los amigurumis son seguros para bebes?', a: 'Si, todos nuestros amigurumis estan hechos con materiales seguros. Los ojos de seguridad estan firmemente sujetos. Sin embargo, recomendamos supervision para ninos menores de 3 anos.' },
    ],
  },
  {
    category: '📦 Envios',
    questions: [
      { q: 'Hacen envios a toda la republica?', a: 'Si! Enviamos a todo Mexico por paqueteria. Los costos de envio se calculan al momento del pedido segun tu ubicacion.' },
      { q: 'Cuanto tarda en llegar mi pedido?', a: 'Los productos en stock se envian en 1-3 dias habiles. Los pedidos personalizados pueden tardar 5-15 dias dependiendo de la complejidad.' },
      { q: 'Como empaquetan los productos?', a: 'Cada producto se empaqueta con mucho cuidado en bolsa de tela o caja decorativa, con papel de seda y una tarjetita hecha a mano.' },
    ],
  },
  {
    category: '💳 Pagos',
    questions: [
      { q: 'Que metodos de pago aceptan?', a: 'Aceptamos transferencia bancaria, deposito en OXXO, y pago por WhatsApp Pay. Pronto agregaremos pago con tarjeta.' },
      { q: 'Puedo pagar en abonos?', a: 'Para pedidos personalizados mayores a $500 MXN, si manejamos un esquema de anticipo del 50% y el resto al entregar.' },
    ],
  },
  {
    category: '🔄 Devoluciones',
    questions: [
      { q: 'Aceptan devoluciones?', a: 'Si tu producto llega danado o con algun defecto, lo reemplazamos sin costo. Contactanos dentro de los primeros 7 dias.' },
      { q: 'Que pasa si el producto no es como esperaba?', a: 'Cada pieza es hecha a mano, por lo que puede haber pequenas variaciones. Si no estas satisfecho, contactanos y buscaremos una solucion.' },
    ],
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-5xl block mb-3">❓</span>
        <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Preguntas Frecuentes</h1>
        <p className="text-cocoa-400">Resolvemos tus dudas sobre nuestras creaciones</p>
      </div>

      {/* FAQ sections */}
      <div className="space-y-8">
        {FAQS.map(section => (
          <div key={section.category}>
            <h2 className="font-display font-bold text-xl text-cocoa-700 mb-4">{section.category}</h2>
            <div className="space-y-2">
              {section.questions.map((faq, i) => {
                const key = section.category + i;
                const isOpen = openIdx === key;
                return (
                  <div key={key} className="bg-white rounded-cute border border-cream-200 overflow-hidden shadow-soft">
                    <button onClick={() => setOpenIdx(isOpen ? null : key)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-cream-50 transition-colors">
                      <span className="font-semibold text-sm text-cocoa-700 pr-4">{faq.q}</span>
                      <span className={`text-cocoa-300 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-cream-100">
                        <p className="text-sm text-cocoa-400 leading-relaxed pt-3">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 text-center bg-gradient-to-r from-blush-100 to-lavender-100 rounded-bubble p-8 border border-blush-200">
        <h3 className="font-display font-bold text-xl text-cocoa-700 mb-2">Tienes otra duda? 🧸</h3>
        <p className="text-cocoa-400 text-sm mb-5">Estamos para ayudarte, escríbenos!</p>
        <Link href="/contacto" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500">
          Contactanos 💌
        </Link>
      </div>
    </div>
  );
}
