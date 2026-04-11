import AnimatedBg from '@/components/AnimatedBg';
import Link from 'next/link';

const WA_NUMBER = '528187087288';
const WA_MSG = encodeURIComponent('Hola! Me interesa saber mas sobre sus creaciones de crochet 🧸');
const EMAIL = 'veroguadalupita@gmail.com';

export default function ContactPage() {
  return (
    <AnimatedBg theme="mint"><div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <span className="text-5xl block mb-3">💌</span>
        <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Sobre Nosotros</h1>
        <p className="text-cocoa-400 max-w-xl mx-auto">
          Somos Bubu & Dudu, un emprendimiento artesanal dedicado a crear piezas
          unicas de crochet con todo el amor y la ternura del mundo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Story */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-8">
          <h2 className="font-display font-bold text-xl text-cocoa-700 mb-4">Nuestra Historia 🧸</h2>
          <p className="text-cocoa-400 leading-relaxed mb-4">
            Todo comenzo con un par de agujas de crochet y un ovillo de estambre.
            Lo que empezo como un hobby se convirtio en una pasion por crear
            personajes adorables y accesorios unicos que llevan alegria a cada hogar.
          </p>
          <p className="text-cocoa-400 leading-relaxed">
            Cada pieza esta hecha a mano con los materiales mas suaves y seguros,
            pensando siempre en la calidad y el detalle. Porque creemos que las
            cosas hechas con amor se sienten diferentes.
          </p>
        </div>

        {/* Contact info */}
        <div className="bg-gradient-to-br from-blush-50 to-lavender-50 rounded-cute border border-blush-200 p-8">
          <h2 className="font-display font-bold text-xl text-cocoa-700 mb-4">Contactanos 💕</h2>
          <div className="space-y-5">
            <a href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white/60 rounded-2xl hover:bg-white/80 transition-colors group">
              <span className="text-2xl">📱</span>
              <div>
                <span className="text-sm font-semibold text-cocoa-600 group-hover:text-green-600 transition-colors">WhatsApp</span>
                <p className="text-cocoa-400 text-sm">818 708 7288</p>
              </div>
              <span className="ml-auto text-xs font-bold text-green-500 bg-green-50 px-2.5 py-1 rounded-full">Enviar mensaje</span>
            </a>

            <a href={`mailto:${EMAIL}`}
              className="flex items-center gap-3 p-3 bg-white/60 rounded-2xl hover:bg-white/80 transition-colors group">
              <span className="text-2xl">📧</span>
              <div>
                <span className="text-sm font-semibold text-cocoa-600 group-hover:text-blush-400 transition-colors">Email</span>
                <p className="text-cocoa-400 text-sm">{EMAIL}</p>
              </div>
              <span className="ml-auto text-xs font-bold text-blush-400 bg-blush-50 px-2.5 py-1 rounded-full">Escribir</span>
            </a>

            <div className="flex items-center gap-3 p-3">
              <span className="text-2xl">📍</span>
              <div>
                <span className="text-sm font-semibold text-cocoa-600">Ubicacion</span>
                <p className="text-cocoa-400 text-sm">Monterrey, Nuevo Leon, Mexico</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3">
              <span className="text-2xl">⏰</span>
              <div>
                <span className="text-sm font-semibold text-cocoa-600">Horario</span>
                <p className="text-cocoa-400 text-sm">Lunes a Sabado 9:00 AM - 7:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-bubble p-8 text-center border border-green-200">
        <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-3">Escribenos por WhatsApp 📱</h2>
        <p className="text-cocoa-400 mb-6 max-w-md mx-auto">
          La forma mas rapida de contactarnos. Respondemos en menos de 2 horas durante horario de atencion.
        </p>
        <a href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`} target="_blank" rel="noopener noreferrer"
          className="btn-cute bg-green-500 text-white text-lg px-8 py-3 hover:bg-green-600 shadow-lg shadow-green-200 inline-flex items-center gap-2">
          💬 Abrir WhatsApp
        </a>
      </div>

      {/* Custom order CTA */}
      <div className="mt-8 bg-gradient-to-r from-blush-100 to-lavender-100 rounded-bubble p-8 text-center border border-blush-200">
        <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-3">Pedidos Personalizados 🧸</h2>
        <p className="text-cocoa-400 mb-6 max-w-md mx-auto">
          Quieres algo unico y especial? Cuentanos tu idea y la tejemos con amor para ti. Amigurumis, accesorios, decoracion — lo que imagines!
        </p>
        <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola! Quiero hacer un pedido personalizado de crochet 🧸')}`} target="_blank" rel="noopener noreferrer"
          className="btn-cute bg-blush-400 text-white px-8 py-3 hover:bg-blush-500 shadow-glow">
          Pedir algo especial 💕
        </a>
      </div>
    </div>
    </AnimatedBg>
  );
}
