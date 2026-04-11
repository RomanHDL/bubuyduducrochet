import Link from 'next/link';

const CATEGORIES = [
  { name: 'Amigurumis', emoji: '🧸', desc: 'Munequitos adorables tejidos a mano', color: 'bg-blush-50 border-blush-200', href: '/catalogo?category=amigurumis' },
  { name: 'Accesorios', emoji: '🎀', desc: 'Monas, diademas, llaveros y mas', color: 'bg-lavender-50 border-lavender-200', href: '/catalogo?category=accesorios' },
  { name: 'Decoracion', emoji: '🌸', desc: 'Detalles lindos para tu hogar', color: 'bg-mint-50 border-mint-200', href: '/catalogo?category=decoracion' },
  { name: 'Ropa Bebe', emoji: '👶', desc: 'Ropita tejida con mucho carino', color: 'bg-sky-50 border-sky-200', href: '/catalogo?category=ropa-bebe' },
];

const BENEFITS = [
  { emoji: '🧶', title: 'Hecho a mano', desc: 'Cada pieza tejida con amor y dedicacion' },
  { emoji: '💝', title: 'Con amor', desc: 'Ponemos corazon en cada puntada' },
  { emoji: '📦', title: 'Envio seguro', desc: 'Tu pedido llega protegido y bonito' },
  { emoji: '✨', title: 'Unico', desc: 'Piezas exclusivas que no encontraras en otro lugar' },
];

const TESTIMONIALS = [
  { name: 'Maria G.', text: 'El amigurumi de gatito que pedi es hermosisimo! Se nota el amor en cada puntada. Mi hija no lo suelta.', emoji: '🐱', rating: 5 },
  { name: 'Sofia R.', text: 'Pedi un oso personalizado para baby shower y quedo perfecto. Todas las invitadas preguntaron donde lo compre!', emoji: '🧸', rating: 5 },
  { name: 'Laura M.', text: 'La calidad es increible, los colores son exactos a las fotos. Ya es mi tercera compra y siempre quedo encantada.', emoji: '🌸', rating: 5 },
  { name: 'Ana P.', text: 'El envio fue super rapido y el empaquetado precioso. Se ve que cuidan cada detalle. 100% recomendado!', emoji: '📦', rating: 5 },
];

const PROCESS = [
  { emoji: '💬', title: 'Platicamos', desc: 'Cuentanos que tienes en mente' },
  { emoji: '✏️', title: 'Disenamos', desc: 'Creamos tu pieza personalizada' },
  { emoji: '🧶', title: 'Tejemos', desc: 'Puntada a puntada con amor' },
  { emoji: '🎁', title: 'Entregamos', desc: 'Empaquetado bonito hasta tu puerta' },
];

export default function HomePage() {
  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blush-50 via-cream-50 to-lavender-50">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>🧸</div>
        <div className="absolute top-20 right-20 text-5xl opacity-15 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🧶</div>
        <div className="absolute bottom-10 left-1/4 text-4xl opacity-15 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>💕</div>
        <div className="absolute bottom-20 right-1/3 text-5xl opacity-10 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '2s' }}>🌸</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-blush-200 rounded-full px-4 py-1.5 mb-6">
              <span className="text-sm">🧸</span>
              <span className="text-xs font-semibold text-cocoa-500">Creaciones artesanales con amor</span>
              <span className="text-sm">💕</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-cocoa-800 leading-tight mb-6">
              Ternura tejida<br /><span className="text-blush-400">puntada a puntada</span>
            </h1>
            <p className="text-lg text-cocoa-400 mb-8 leading-relaxed max-w-xl mx-auto">
              Descubre nuestra coleccion de amigurumis, accesorios y creaciones unicas hechas a mano con los materiales mas suaves y todo nuestro carino.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalogo" className="btn-cute bg-blush-400 text-white text-lg px-8 py-3 hover:bg-blush-500 shadow-glow">Ver Catalogo 🧶</Link>
              <Link href="/contacto" className="btn-cute bg-white text-cocoa-600 text-lg px-8 py-3 border-2 border-cream-300 hover:border-blush-300 hover:text-blush-500">Conocenos 💌</Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full"><path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="#FFFDF7" /></svg>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Nuestras Categorias</h2>
          <p className="text-cocoa-400">Encuentra el regalo perfecto hecho a mano</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} href={cat.href} className={`${cat.color} border-2 rounded-cute p-6 text-center hover:shadow-warm hover:-translate-y-1 transition-all duration-200 group`}>
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <h3 className="font-display font-bold text-cocoa-700 mb-1">{cat.name}</h3>
              <p className="text-xs text-cocoa-400">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="bg-gradient-to-r from-cream-100 via-blush-50 to-lavender-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Por que elegirnos</h2>
            <p className="text-cocoa-400">Cada creacion es unica y especial</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="text-center">
                <span className="text-4xl block mb-3">{b.emoji}</span>
                <h3 className="font-display font-bold text-cocoa-700 mb-1">{b.title}</h3>
                <p className="text-sm text-cocoa-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Como funciona</h2>
          <p className="text-cocoa-400">4 pasos para tu creacion perfecta</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PROCESS.map((step, i) => (
            <div key={step.title} className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-blush-100 border-2 border-blush-200 mx-auto mb-3 flex items-center justify-center text-2xl">{step.emoji}</div>
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[10px] font-bold text-blush-300 bg-white px-2 py-0.5 rounded-full border border-blush-100">{i + 1}</span>
              <h3 className="font-display font-bold text-cocoa-700 mb-1">{step.title}</h3>
              <p className="text-xs text-cocoa-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="bg-gradient-to-r from-lavender-50 via-cream-50 to-blush-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Lo que dicen nuestras clientas 💕</h2>
            <p className="text-cocoa-400">Historias reales de quienes ya tienen su pieza</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
                <div className="flex gap-0.5 mb-3">{Array.from({ length: t.rating }).map((_, j) => <span key={j} className="text-sm">⭐</span>)}</div>
                <p className="text-sm text-cocoa-500 leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2 pt-3 border-t border-cream-100">
                  <span className="text-lg">{t.emoji}</span>
                  <span className="text-xs font-bold text-cocoa-600">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ PREVIEW ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Preguntas frecuentes</h2>
          <p className="text-cocoa-400">Las dudas mas comunes</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {[
            { q: 'Todos los productos son hechos a mano?', a: 'Si! Cada pieza es tejida a mano con crochet, eso la hace unica y especial.' },
            { q: 'Hacen pedidos personalizados?', a: 'Claro! Escribenos por WhatsApp o contacto con tu idea y te damos presupuesto.' },
            { q: 'Hacen envios a toda la republica?', a: 'Si, enviamos a todo Mexico. Los costos se calculan al momento del pedido.' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
              <h3 className="font-semibold text-cocoa-700 text-sm mb-1">{f.q}</h3>
              <p className="text-xs text-cocoa-400">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/preguntas" className="text-sm font-semibold text-blush-400 hover:text-blush-500 hover:underline">Ver todas las preguntas →</Link>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="bg-gradient-to-r from-blush-100 to-lavender-100 rounded-bubble p-8 md:p-12 text-center border border-blush-200">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-cocoa-700 mb-3">Quieres algo especial? 🧸</h2>
          <p className="text-cocoa-400 mb-6 max-w-md mx-auto">Hacemos pedidos personalizados. Cuentanos que tienes en mente y lo tejemos con mucho amor para ti.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contacto" className="btn-cute bg-blush-400 text-white px-8 py-3 hover:bg-blush-500 shadow-glow">Contactanos 💌</Link>
            <Link href="/catalogo" className="btn-cute bg-white text-cocoa-600 px-8 py-3 border-2 border-cream-300 hover:border-blush-300">Ver Catalogo 🧶</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
