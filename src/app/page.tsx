import Link from 'next/link';
import Testimonials from '@/components/Testimonials';
import HomeCategories from '@/components/HomeCategories';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductReview from '@/models/ProductReview';

export const revalidate = 30; // ISR: re-renderiza cada 30s con stats frescos

const WA = '528187087288';
const WA_MSG = encodeURIComponent('Hola! Me gustaria pedir algo personalizado tejido a mano 🧶');

const BENEFITS = [
  { emoji: '🧶', title: 'Hecho a mano', desc: 'Cada pieza tejida con amor y dedicación, puntada por puntada.' },
  { emoji: '💝', title: 'Diseño único', desc: 'Piezas exclusivas que no encontrarás en ningún otro lugar.' },
  { emoji: '📦', title: 'Envío seguro', desc: 'Tu pedido llega protegido y bonito a todo México.' },
  { emoji: '✨', title: 'Calidad premium', desc: 'Materiales finos, hipoalergénicos y de larga duración.' },
];

const PROCESS = [
  { num: '01', title: 'Platicamos', desc: 'Cuéntanos qué tienes en mente. Sin compromiso.' },
  { num: '02', title: 'Diseñamos', desc: 'Creamos tu pieza personalizada con tus colores y detalles.' },
  { num: '03', title: 'Tejemos', desc: 'Puntada a puntada, con todo nuestro cariño y experiencia.' },
  { num: '04', title: 'Entregamos', desc: 'Empaquetado bonito y listo para regalar a tu puerta.' },
];

const GIFT_OCCASIONS = [
  { emoji: '🎂', title: 'Cumpleaños', desc: 'Detalles únicos que sorprenden y emocionan en su día especial.', tint: 'from-blush-100 to-blush-50' },
  { emoji: '👶', title: 'Baby Shower', desc: 'Amigurumis suaves y seguros para los más pequeños de la casa.', tint: 'from-mint-100 to-mint-50' },
  { emoji: '💕', title: 'Aniversarios', desc: 'Para guardar el momento con un detalle hecho a mano que dure.', tint: 'from-lavender-100 to-lavender-50' },
  { emoji: '🌸', title: 'Día de las Madres', desc: 'Un regalo memorable para la mujer que lo es todo en tu vida.', tint: 'from-blush-100 to-blush-50' },
  { emoji: '🎄', title: 'Navidad', desc: 'Decoración tejida y regalos especiales para toda la familia.', tint: 'from-mint-100 to-mint-50' },
  { emoji: '🎁', title: 'Personalizado', desc: 'Lo que imagines lo tejemos. Cuéntanos tu idea por WhatsApp.', tint: 'from-cream-100 to-cream-50' },
];

const QUALITY = [
  { emoji: '🧵', title: 'Materiales premium', desc: 'Hilos suaves, hipoalergénicos y de larga duración. Trabajamos solo con lo mejor para que cada pieza sea cómoda al tacto y durable.' },
  { emoji: '🤲', title: '100% Artesanal', desc: 'Cada pieza es tejida puntada por puntada por manos mexicanas con experiencia. Sin máquinas, sin atajos, solo amor por el oficio.' },
  { emoji: '🎀', title: 'Empaque cuidado', desc: 'Llega listo para regalar con presentación bonita y protección extra en el envío. Un detalle que se nota desde que lo recibes.' },
];

const FAQ_ITEMS = [
  { q: '¿Todos los productos son hechos a mano?', a: 'Sí. Cada pieza es tejida 100% a mano con técnica de crochet, eso la hace única y especial. No usamos máquinas.' },
  { q: '¿Hacen pedidos personalizados?', a: 'Claro. Escríbenos por WhatsApp o por nuestro contacto con tu idea y te damos presupuesto sin compromiso.' },
  { q: '¿Hacen envíos a toda la república?', a: 'Sí, enviamos a todo México. Los costos se calculan al momento del pedido según tu ubicación.' },
  { q: '¿Cuánto tarda en llegar mi pedido?', a: 'Si está disponible en stock: 3-5 días hábiles. Pedidos personalizados toman entre 1 y 3 semanas dependiendo de la complejidad.' },
  { q: '¿Puedo elegir colores diferentes?', a: 'Por supuesto. Contáctanos antes de comprar y adaptamos el diseño a tus colores favoritos sin costo extra en la mayoría de casos.' },
  { q: '¿Aceptan devoluciones?', a: 'Sí, dentro de los primeros 7 días si el producto llega con algún defecto. Para piezas personalizadas las cambiamos solo si hay error de nuestra parte.' },
];

async function getHomeStats() {
  try {
    await connectDB();
    const [productCount, approvedTestimonials, approvedProductReviews] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Review.find({ isApproved: true }, { rating: 1 }).lean(),
      ProductReview.find({ isApproved: true }, { rating: 1 }).lean(),
    ]);

    const allRatings = [
      ...(approvedTestimonials as any[]).map(r => r.rating || 5),
      ...(approvedProductReviews as any[]).map(r => r.rating || 5),
    ];
    const reviewCount = allRatings.length;
    const avgRating = reviewCount > 0
      ? (allRatings.reduce((s, r) => s + r, 0) / reviewCount).toFixed(1)
      : '4.9';

    return { productCount, reviewCount, avgRating };
  } catch (err) {
    console.error('[home SSR] fallback:', err);
    return { productCount: 0, reviewCount: 0, avgRating: '4.9' };
  }
}

export default async function HomePage() {
  const { productCount, reviewCount, avgRating } = await getHomeStats();

  const stats = [
    { num: `${productCount > 0 ? productCount + '+' : '100+'}`, label: 'Piezas únicas tejidas', emoji: '🧶' },
    { num: `${reviewCount > 0 ? reviewCount + '+' : '50+'}`, label: 'Clientes felices', emoji: '💕' },
    { num: `${avgRating}⭐`, label: 'Calificación promedio', emoji: '✨' },
    { num: '100%', label: 'Hecho a mano', emoji: '🤲' },
  ];

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════
          1. HERO — Statement principal + CTA dual + trust signal
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blush-50 via-cream-50 to-lavender-50">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blush-200/30 rounded-full blur-[80px] anim-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-lavender-200/25 rounded-full blur-[100px] anim-blob" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-200/20 rounded-full blur-[90px] anim-glow" />

        <div className="absolute top-8 left-[8%] text-6xl opacity-20 anim-float">🧸</div>
        <div className="absolute top-16 right-[12%] text-5xl opacity-15 anim-float-r" style={{ animationDelay: '1s' }}>🧶</div>
        <div className="absolute bottom-20 left-[20%] text-4xl opacity-15 anim-drift" style={{ animationDelay: '2s' }}>💕</div>
        <div className="absolute bottom-28 right-[25%] text-5xl opacity-10 anim-float" style={{ animationDelay: '3s' }}>🌸</div>
        <div className="absolute top-1/3 left-[5%] text-3xl opacity-10 anim-sparkle" style={{ animationDelay: '1.5s' }}>✨</div>
        <div className="absolute top-1/4 right-[8%] text-3xl opacity-10 anim-sparkle" style={{ animationDelay: '2.5s' }}>💖</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-blush-200 rounded-full px-4 py-1.5 mb-6 shadow-soft">
              <span className="text-sm">🧸</span>
              <span className="text-xs font-semibold text-cocoa-500">Creaciones artesanales con amor desde Monterrey</span>
              <span className="text-sm">💕</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-cocoa-800 leading-tight mb-6">
              Ternura tejida<br /><span className="text-blush-400">puntada a puntada</span>
            </h1>
            <p className="text-lg text-cocoa-400 mb-8 leading-relaxed max-w-xl mx-auto">
              Amigurumis, accesorios y creaciones únicas hechas a mano con los materiales más suaves. Cada pieza es exclusiva y se hace pensando en ti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/catalogo" className="btn-cute bg-blush-400 text-white text-lg px-8 py-3.5 hover:bg-blush-500 shadow-glow">Ver Catalogo 🧶</Link>
              <Link href="/contacto" className="btn-cute bg-white text-cocoa-600 text-lg px-8 py-3.5 border-2 border-cream-300 hover:border-blush-300 hover:text-blush-500">Conocenos 💌</Link>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-cocoa-500">
              <span className="text-amber-400">★★★★★</span>
              <span className="font-semibold">{avgRating}/5</span>
              <span className="text-cocoa-300">·</span>
              <span>{reviewCount > 0 ? `${reviewCount}+ clientes felices` : '50+ clientes felices'}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full"><path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="#FFFDF7" /></svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. STATS BAR — Números de confianza desde DB
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-12 bg-gradient-to-r from-blush-50 via-cream-50 to-lavender-50 border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center bg-white/60 backdrop-blur-sm rounded-cute p-5 border border-white/70 shadow-soft hover:shadow-warm transition-all">
                <span className="text-3xl block mb-2">{s.emoji}</span>
                <p className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 leading-none">{s.num}</p>
                <p className="text-xs md:text-sm text-cocoa-400 mt-2 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. CATEGORIES — Caminos de exploración
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="absolute top-10 right-10 text-5xl opacity-10 anim-float" style={{ animationDelay: '0.5s' }}>🎀</div>
        <div className="absolute bottom-10 left-10 text-4xl opacity-10 anim-float-r" style={{ animationDelay: '2s' }}>🧶</div>
        <div className="absolute top-1/2 right-[5%] w-40 h-40 bg-blush-100/40 rounded-full blur-[60px] anim-glow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-3">Explora la colección</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">Nuestras categorías</h2>
            <p className="text-cocoa-400">Encuentra la pieza perfecta navegando por categoría — desde amigurumis hasta accesorios y decoración del hogar.</p>
          </div>
          <HomeCategories />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. VALUE PROPOSITION — Por qué elegirnos (Benefits)
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-24 bg-gradient-to-r from-lavender-50 via-blush-50 to-mint-50">
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-100/40 via-transparent to-blush-100/30 anim-gradient" />
        <div className="absolute top-8 left-[15%] text-3xl opacity-15 anim-sparkle">✨</div>
        <div className="absolute bottom-12 right-[10%] text-3xl opacity-15 anim-sparkle" style={{ animationDelay: '1.5s' }}>💫</div>
        <div className="absolute top-1/3 left-[3%] w-48 h-48 bg-lavender-200/30 rounded-full blur-[70px] anim-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 right-[8%] w-56 h-56 bg-mint-200/25 rounded-full blur-[80px] anim-blob" style={{ animationDelay: '5s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-3">Nuestra promesa</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">Por qué elegirnos 💕</h2>
            <p className="text-cocoa-400">Más que un producto, una experiencia hecha con amor en cada detalle.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="text-center bg-white/50 backdrop-blur-sm rounded-cute p-6 border border-white/60 shadow-soft hover:shadow-warm hover:-translate-y-1 transition-all duration-300">
                <span className="text-5xl block mb-3">{b.emoji}</span>
                <h3 className="font-display font-bold text-cocoa-700 mb-2">{b.title}</h3>
                <p className="text-sm text-cocoa-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. QUALITY — Materiales y artesanía premium
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-24 bg-gradient-to-br from-cream-50 via-cream-50 to-blush-50">
        <div className="absolute top-12 right-[10%] text-4xl opacity-10 anim-float">🧵</div>
        <div className="absolute bottom-12 left-[8%] text-4xl opacity-10 anim-float-r" style={{ animationDelay: '2s' }}>🎀</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-3">Calidad premium</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">La calidad que mereces</h2>
            <p className="text-cocoa-400">Trabajamos con los mejores materiales para crear piezas que duren generaciones y se sientan especiales desde el primer día.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUALITY.map((q) => (
              <div key={q.title} className="bg-white/70 backdrop-blur-sm rounded-cute p-7 border border-white/80 shadow-soft hover:shadow-warm transition-all">
                <span className="text-4xl block mb-4">{q.emoji}</span>
                <h3 className="font-display font-bold text-lg text-cocoa-700 mb-3">{q.title}</h3>
                <p className="text-sm text-cocoa-500 leading-relaxed">{q.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. PROCESS — Cómo trabajamos en 4 pasos
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-24 bg-gradient-to-br from-sky-50 via-cream-50 to-lavender-50">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-sky-200/25 rounded-full blur-[80px] anim-glow" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blush-200/20 rounded-full blur-[90px] anim-glow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-6 right-[15%] text-3xl opacity-10 anim-float" style={{ animationDelay: '1s' }}>💕</div>
        <div className="absolute bottom-10 left-[10%] text-3xl opacity-10 anim-float-r" style={{ animationDelay: '2.5s' }}>🧵</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-3">Cómo trabajamos</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">Tu pieza en 4 pasos 🧶</h2>
            <p className="text-cocoa-400">Un proceso simple y transparente, desde la idea hasta tu puerta.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {PROCESS.map((step) => (
              <div key={step.title} className="relative bg-white/50 backdrop-blur-sm rounded-cute p-6 border border-white/60 shadow-soft hover:shadow-warm hover:-translate-y-1 transition-all duration-300">
                <span className="font-display font-bold text-4xl text-blush-300 leading-none">{step.num}</span>
                <h3 className="font-display font-bold text-lg text-cocoa-700 mt-3 mb-2">{step.title}</h3>
                <p className="text-sm text-cocoa-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          7. USE CASES — Para regalar (ocasiones)
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-24 bg-gradient-to-r from-blush-50 via-cream-50 to-lavender-50">
        <div className="absolute top-10 right-[8%] text-4xl opacity-15 anim-sparkle" style={{ animationDelay: '1s' }}>🎁</div>
        <div className="absolute bottom-10 left-[6%] text-4xl opacity-15 anim-sparkle" style={{ animationDelay: '2.5s' }}>💝</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-3">Casos de uso</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">El regalo perfecto 🎁</h2>
            <p className="text-cocoa-400">Para cada momento especial, una pieza única hecha a mano que se queda en el corazón.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {GIFT_OCCASIONS.map((g) => (
              <div key={g.title} className={`bg-gradient-to-br ${g.tint} rounded-cute p-6 border border-white/80 shadow-soft hover:shadow-warm hover:-translate-y-1 transition-all duration-300`}>
                <span className="text-4xl block mb-3">{g.emoji}</span>
                <h3 className="font-display font-bold text-lg text-cocoa-700 mb-2">{g.title}</h3>
                <p className="text-sm text-cocoa-500 leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/catalogo" className="text-sm font-semibold text-blush-400 hover:text-blush-500 hover:underline inline-flex items-center gap-1">
              Encuentra tu regalo ideal <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          8. SOCIAL PROOF — Testimonios reales
          ═══════════════════════════════════════════════════════ */}
      <Testimonials />

      {/* ═══════════════════════════════════════════════════════
          9. FAQ — Preguntas frecuentes
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-24 bg-gradient-to-br from-mint-50 via-cream-50 to-lavender-50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mint-200/30 rounded-full blur-[80px] anim-blob" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-lavender-200/25 rounded-full blur-[70px] anim-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute top-10 left-[8%] text-3xl opacity-10 anim-float">🍃</div>
        <div className="absolute bottom-8 right-[12%] text-3xl opacity-10 anim-float-r" style={{ animationDelay: '2s' }}>🌿</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-3">Resolvemos tus dudas</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">Preguntas frecuentes ❓</h2>
            <p className="text-cocoa-400">Las respuestas a las dudas que más nos preguntan.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ_ITEMS.map((f, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-cute shadow-soft border border-white/80 p-5 hover:shadow-warm transition-all duration-200">
                <h3 className="font-semibold text-cocoa-700 text-sm mb-2">{f.q}</h3>
                <p className="text-xs text-cocoa-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/preguntas" className="text-sm font-semibold text-blush-400 hover:text-blush-500 hover:underline inline-flex items-center gap-1">
              Ver todas las preguntas <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          10. WHATSAPP CUSTOM ORDERS — Engagement directo
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-16 md:py-20 bg-gradient-to-br from-mint-50 via-cream-50 to-mint-50">
        <div className="absolute inset-0 bg-gradient-to-r from-mint-100/50 via-transparent to-mint-100/50 anim-gradient" />
        <div className="absolute top-8 left-[10%] text-4xl opacity-15 anim-float">💬</div>
        <div className="absolute bottom-8 right-[10%] text-4xl opacity-15 anim-float-r" style={{ animationDelay: '1.5s' }}>📱</div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-bubble p-8 md:p-12 border border-mint-200 shadow-warm text-center">
            <span className="text-5xl block mb-4">💬</span>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-500 mb-3">Pedidos personalizados</span>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-cocoa-700 mb-3">¿Tienes una idea en mente?</h2>
            <p className="text-cocoa-500 mb-6 max-w-lg mx-auto leading-relaxed">
              Escríbenos por WhatsApp y juntos diseñamos algo único. Pedidos personalizados, colores específicos, regalos únicos — lo que imagines, lo tejemos para ti.
            </p>
            <a href={`https://wa.me/${WA}?text=${WA_MSG}`} target="_blank" rel="noopener noreferrer" className="btn-cute bg-green-500 text-white text-lg px-8 py-3.5 hover:bg-green-600 shadow-glow inline-flex items-center gap-2">
              💬 Chatear por WhatsApp
            </a>
            <p className="text-xs text-cocoa-400 mt-4">Respondemos en menos de 1 hora · Lun a Sab 9am-7pm</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          11. FINAL CTA — Cierre con doble opción
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blush-200 via-lavender-200 to-blush-200 rounded-bubble anim-gradient opacity-60 blur-[2px]" />
          <div className="absolute top-4 left-[10%] text-4xl opacity-15 anim-float">🧸</div>
          <div className="absolute bottom-4 right-[10%] text-3xl opacity-15 anim-float-r" style={{ animationDelay: '1.5s' }}>💝</div>

          <div className="relative bg-gradient-to-r from-blush-100/90 to-lavender-100/90 backdrop-blur-sm rounded-bubble p-10 md:p-14 text-center border border-blush-200 shadow-warm">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-cocoa-700 mb-3">¿Listo para tu pieza única? 🧸</h2>
            <p className="text-cocoa-400 mb-8 max-w-md mx-auto">Explora nuestro catálogo o cuéntanos qué tienes en mente. Cada creación es hecha con amor.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/catalogo" className="btn-cute bg-blush-400 text-white px-8 py-3 hover:bg-blush-500 shadow-glow text-lg">Ver Catalogo 🧶</Link>
              <Link href="/contacto" className="btn-cute bg-white text-cocoa-600 px-8 py-3 border-2 border-cream-300 hover:border-blush-300 text-lg">Contactanos 💌</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
