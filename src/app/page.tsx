import Link from 'next/link';
import Testimonials from '@/components/Testimonials';
import HomeCategories from '@/components/HomeCategories';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductReview from '@/models/ProductReview';

export const revalidate = 30; // ISR: re-renderiza cada 30s con productos/stats frescos

const WA = '528187087288';
const WA_MSG = encodeURIComponent('Hola! Me gustaria pedir algo personalizado tejido a mano 🧶');

const BENEFITS = [
  { emoji: '🧶', title: 'Hecho a mano', desc: 'Cada pieza tejida con amor y dedicacion' },
  { emoji: '💝', title: 'Con amor', desc: 'Ponemos corazon en cada puntada' },
  { emoji: '📦', title: 'Envio seguro', desc: 'Tu pedido llega protegido y bonito' },
  { emoji: '✨', title: 'Unico', desc: 'Piezas exclusivas que no encontraras en otro lugar' },
];

const PROCESS = [
  { emoji: '💬', title: 'Platicamos', desc: 'Cuentanos que tienes en mente' },
  { emoji: '✏️', title: 'Disenamos', desc: 'Creamos tu pieza personalizada' },
  { emoji: '🧶', title: 'Tejemos', desc: 'Puntada a puntada con amor' },
  { emoji: '🎁', title: 'Entregamos', desc: 'Empaquetado bonito hasta tu puerta' },
];

const GIFT_OCCASIONS = [
  { emoji: '🎂', title: 'Cumpleaños', desc: 'Detalles unicos que sorprenden y emocionan', tint: 'from-blush-100 to-blush-50' },
  { emoji: '👶', title: 'Baby Shower', desc: 'Amigurumis suaves y seguros para los mas pequeños', tint: 'from-mint-100 to-mint-50' },
  { emoji: '💕', title: 'Aniversarios', desc: 'Para guardar el momento con un detalle hecho a mano', tint: 'from-lavender-100 to-lavender-50' },
  { emoji: '🌸', title: 'Día de las Madres', desc: 'Un regalo memorable para la mujer que lo es todo', tint: 'from-blush-100 to-blush-50' },
  { emoji: '🎄', title: 'Navidad', desc: 'Decoración tejida y regalos especiales', tint: 'from-mint-100 to-mint-50' },
  { emoji: '🎁', title: 'Personalizado', desc: 'Lo que imagines, lo tejemos para ti', tint: 'from-cream-100 to-cream-50' },
];

const QUALITY = [
  { emoji: '🧵', title: 'Materiales premium', desc: 'Hilos suaves, hipoalergenicos y de larga duracion. Solo lo mejor.' },
  { emoji: '🤲', title: '100% Artesanal', desc: 'Cada pieza tejida puntada por puntada por manos mexicanas con experiencia.' },
  { emoji: '🎀', title: 'Empaque cuidado', desc: 'Llega listo para regalar con presentacion bonita y proteccion en el envio.' },
];

const FEATURED_PROJECTION: any = {
  title: 1, price: 1, category: 1, availability: 1,
  images: { $slice: 1 },
};

async function getHomeData() {
  try {
    await connectDB();
    const [featured, productCount, approvedTestimonials, approvedProductReviews] = await Promise.all([
      Product.find({ isActive: true, featured: true }, FEATURED_PROJECTION).sort({ createdAt: -1 }).limit(8).lean(),
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

    return {
      featured: JSON.parse(JSON.stringify(featured)) as any[],
      productCount,
      reviewCount,
      avgRating,
    };
  } catch (err) {
    console.error('[home SSR] fallback:', err);
    return { featured: [], productCount: 0, reviewCount: 0, avgRating: '4.9' };
  }
}

export default async function HomePage() {
  const { featured, productCount, reviewCount, avgRating } = await getHomeData();

  const stats = [
    { num: `${productCount > 0 ? productCount + '+' : '100+'}`, label: 'Piezas únicas tejidas', emoji: '🧶' },
    { num: `${reviewCount > 0 ? reviewCount + '+' : '50+'}`, label: 'Clientes felices', emoji: '💕' },
    { num: `${avgRating}⭐`, label: 'Calificación promedio', emoji: '✨' },
    { num: '100%', label: 'Hecho a mano', emoji: '🤲' },
  ];

  return (
    <div>
      {/* ═══ HERO ═══ */}
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
              <span className="text-xs font-semibold text-cocoa-500">Creaciones artesanales con amor</span>
              <span className="text-sm">💕</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-cocoa-800 leading-tight mb-6">
              Ternura tejida<br /><span className="text-blush-400">puntada a puntada</span>
            </h1>
            <p className="text-lg text-cocoa-400 mb-8 leading-relaxed max-w-xl mx-auto">
              Descubre nuestra coleccion de amigurumis, accesorios y creaciones unicas hechas a mano con los materiales mas suaves y todo nuestro carino.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/catalogo" className="btn-cute bg-blush-400 text-white text-lg px-8 py-3.5 hover:bg-blush-500 shadow-glow">Ver Catalogo 🧶</Link>
              <Link href="/contacto" className="btn-cute bg-white text-cocoa-600 text-lg px-8 py-3.5 border-2 border-cream-300 hover:border-blush-300 hover:text-blush-500">Conocenos 💌</Link>
            </div>
            {/* Trust indicator below CTAs */}
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

      {/* ═══ STATS COUNTER ═══ */}
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

      {/* ═══ CATEGORIES ═══ */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute top-10 right-10 text-5xl opacity-10 anim-float" style={{ animationDelay: '0.5s' }}>🎀</div>
        <div className="absolute bottom-10 left-10 text-4xl opacity-10 anim-float-r" style={{ animationDelay: '2s' }}>🧶</div>
        <div className="absolute top-1/2 right-[5%] w-40 h-40 bg-blush-100/40 rounded-full blur-[60px] anim-glow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-2">Explora</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-2">Nuestras Categorias</h2>
            <p className="text-cocoa-400">Encuentra el regalo perfecto hecho a mano</p>
          </div>
          <HomeCategories />
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      {featured.length > 0 && (
        <section className="relative overflow-hidden py-20 bg-gradient-to-br from-cream-50 via-blush-50 to-cream-50">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-blush-100/40 rounded-full blur-[80px] anim-blob" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-cream-200/40 rounded-full blur-[70px] anim-blob" style={{ animationDelay: '3s' }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-2">Lo más amado</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-2">Productos Destacados ✨</h2>
              <p className="text-cocoa-400">Las creaciones favoritas de nuestros clientes</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 8).map((prod) => (
                <Link key={prod._id} href={`/producto/${prod._id}`} className="card-cute group block">
                  <div className="aspect-square bg-cream-50 overflow-hidden relative">
                    {prod.images?.[0] ? (
                      <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🧸</div>
                    )}
                    {prod.availability === 'por_pedido' && (
                      <span className="absolute top-2 right-2 bg-lavender-100 text-lavender-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-lavender-200">Por pedido</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-display font-bold text-sm text-cocoa-700 truncate group-hover:text-blush-400 transition-colors">{prod.title}</h3>
                    <p className="text-[10px] text-cocoa-400 capitalize mb-1">{prod.category}</p>
                    <p className="font-bold text-blush-500">${(prod.price || 0).toFixed(2)} <span className="text-[10px] text-cocoa-400 font-normal">MXN</span></p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/catalogo" className="btn-cute bg-blush-400 text-white px-8 py-3 hover:bg-blush-500 shadow-glow inline-flex items-center gap-2">
                Ver todo el catálogo <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ BENEFITS ═══ */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-lavender-50 via-blush-50 to-mint-50">
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-100/40 via-transparent to-blush-100/30 anim-gradient" />
        <div className="absolute top-8 left-[15%] text-3xl opacity-15 anim-sparkle">✨</div>
        <div className="absolute bottom-12 right-[10%] text-3xl opacity-15 anim-sparkle" style={{ animationDelay: '1.5s' }}>💫</div>
        <div className="absolute top-1/3 left-[3%] w-48 h-48 bg-lavender-200/30 rounded-full blur-[70px] anim-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 right-[8%] w-56 h-56 bg-mint-200/25 rounded-full blur-[80px] anim-blob" style={{ animationDelay: '5s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-2">Promesa</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-2">Por que elegirnos 💕</h2>
            <p className="text-cocoa-400">Cada creacion es unica y especial</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="text-center bg-white/50 backdrop-blur-sm rounded-cute p-6 border border-white/60 shadow-soft hover:shadow-warm hover:-translate-y-1 transition-all duration-300">
                <span className="text-5xl block mb-3">{b.emoji}</span>
                <h3 className="font-display font-bold text-cocoa-700 mb-1">{b.title}</h3>
                <p className="text-sm text-cocoa-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ QUALITY / MATERIALS ═══ */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-cream-50 via-cream-50 to-blush-50">
        <div className="absolute top-12 right-[10%] text-4xl opacity-10 anim-float">🧵</div>
        <div className="absolute bottom-12 left-[8%] text-4xl opacity-10 anim-float-r" style={{ animationDelay: '2s' }}>🎀</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-2">Calidad</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-2">La calidad que mereces</h2>
            <p className="text-cocoa-400 max-w-xl mx-auto">Trabajamos con los mejores materiales para crear piezas que duren generaciones</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUALITY.map((q) => (
              <div key={q.title} className="bg-white/70 backdrop-blur-sm rounded-cute p-7 border border-white/80 shadow-soft hover:shadow-warm transition-all">
                <span className="text-4xl block mb-3">{q.emoji}</span>
                <h3 className="font-display font-bold text-lg text-cocoa-700 mb-2">{q.title}</h3>
                <p className="text-sm text-cocoa-400 leading-relaxed">{q.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-sky-50 via-cream-50 to-lavender-50">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-sky-200/25 rounded-full blur-[80px] anim-glow" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blush-200/20 rounded-full blur-[90px] anim-glow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-6 right-[15%] text-3xl opacity-10 anim-float" style={{ animationDelay: '1s' }}>💕</div>
        <div className="absolute bottom-10 left-[10%] text-3xl opacity-10 anim-float-r" style={{ animationDelay: '2.5s' }}>🧵</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-2">Proceso</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-2">Como funciona 🧶</h2>
            <p className="text-cocoa-400">4 pasos para tu creacion perfecta</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PROCESS.map((step, i) => (
              <div key={step.title} className="text-center relative bg-white/50 backdrop-blur-sm rounded-cute p-6 border border-white/60 shadow-soft hover:shadow-warm hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blush-100 to-lavender-100 border-2 border-blush-200 mx-auto mb-3 flex items-center justify-center text-2xl shadow-soft">{step.emoji}</div>
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blush-300 bg-white px-2.5 py-0.5 rounded-full border border-blush-100 shadow-sm">{i + 1}</span>
                <h3 className="font-display font-bold text-cocoa-700 mb-1">{step.title}</h3>
                <p className="text-xs text-cocoa-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GIFT OCCASIONS ═══ */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-blush-50 via-cream-50 to-lavender-50">
        <div className="absolute top-10 right-[8%] text-4xl opacity-15 anim-sparkle" style={{ animationDelay: '1s' }}>🎁</div>
        <div className="absolute bottom-10 left-[6%] text-4xl opacity-15 anim-sparkle" style={{ animationDelay: '2.5s' }}>💝</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-2">Ocasiones</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-2">El regalo perfecto 🎁</h2>
            <p className="text-cocoa-400 max-w-xl mx-auto">Para cada momento especial, una pieza única hecha a mano</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {GIFT_OCCASIONS.map((g) => (
              <div key={g.title} className={`bg-gradient-to-br ${g.tint} rounded-cute p-6 border border-white/80 shadow-soft hover:shadow-warm hover:-translate-y-1 transition-all duration-300`}>
                <span className="text-4xl block mb-3">{g.emoji}</span>
                <h3 className="font-display font-bold text-lg text-cocoa-700 mb-1">{g.title}</h3>
                <p className="text-sm text-cocoa-500">{g.desc}</p>
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

      {/* ═══ TESTIMONIALS ═══ */}
      <Testimonials />

      {/* ═══ FAQ ═══ */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-mint-50 via-cream-50 to-lavender-50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mint-200/30 rounded-full blur-[80px] anim-blob" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-lavender-200/25 rounded-full blur-[70px] anim-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute top-10 left-[8%] text-3xl opacity-10 anim-float">🍃</div>
        <div className="absolute bottom-8 right-[12%] text-3xl opacity-10 anim-float-r" style={{ animationDelay: '2s' }}>🌿</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-2">Dudas</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-2">Preguntas frecuentes ❓</h2>
            <p className="text-cocoa-400">Las dudas mas comunes</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {[
              { q: 'Todos los productos son hechos a mano?', a: 'Si! Cada pieza es tejida a mano con crochet, eso la hace unica y especial.' },
              { q: 'Hacen pedidos personalizados?', a: 'Claro! Escribenos por WhatsApp o contacto con tu idea y te damos presupuesto.' },
              { q: 'Hacen envios a toda la republica?', a: 'Si, enviamos a todo Mexico. Los costos se calculan al momento del pedido.' },
              { q: 'Cuanto tarda en llegar mi pedido?', a: 'Si esta disponible en stock, 3-5 dias habiles. Pedidos personalizados toman 1-3 semanas dependiendo de la complejidad.' },
              { q: 'Puedo elegir colores diferentes?', a: 'Por supuesto! Contactanos y adaptamos el diseño a tus colores favoritos.' },
            ].map((f, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-cute shadow-soft border border-white/80 p-5 hover:shadow-warm transition-all duration-200">
                <h3 className="font-semibold text-cocoa-700 text-sm mb-1">{f.q}</h3>
                <p className="text-xs text-cocoa-400">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/preguntas" className="text-sm font-semibold text-blush-400 hover:text-blush-500 hover:underline">Ver todas las preguntas →</Link>
          </div>
        </div>
      </section>

      {/* ═══ WHATSAPP CUSTOM ORDERS BANNER ═══ */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-br from-mint-50 via-cream-50 to-mint-50">
        <div className="absolute inset-0 bg-gradient-to-r from-mint-100/50 via-transparent to-mint-100/50 anim-gradient" />
        <div className="absolute top-8 left-[10%] text-4xl opacity-15 anim-float">💬</div>
        <div className="absolute bottom-8 right-[10%] text-4xl opacity-15 anim-float-r" style={{ animationDelay: '1.5s' }}>📱</div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-bubble p-8 md:p-12 border border-mint-200 shadow-warm text-center">
            <span className="text-5xl block mb-4">💬</span>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-cocoa-700 mb-3">Tienes una idea en mente?</h2>
            <p className="text-cocoa-500 mb-6 max-w-lg mx-auto leading-relaxed">
              Escríbenos por WhatsApp y juntos diseñamos algo único. Pedidos personalizados, colores específicos, lo que imagines.
            </p>
            <a href={`https://wa.me/${WA}?text=${WA_MSG}`} target="_blank" rel="noopener noreferrer" className="btn-cute bg-green-500 text-white text-lg px-8 py-3.5 hover:bg-green-600 shadow-glow inline-flex items-center gap-2">
              💬 Chatear por WhatsApp
            </a>
            <p className="text-xs text-cocoa-400 mt-4">Respondemos en menos de 1 hora · Lun a Sab 9am-7pm</p>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blush-200 via-lavender-200 to-blush-200 rounded-bubble anim-gradient opacity-60 blur-[2px]" />
          <div className="absolute top-4 left-[10%] text-4xl opacity-15 anim-float">🧸</div>
          <div className="absolute bottom-4 right-[10%] text-3xl opacity-15 anim-float-r" style={{ animationDelay: '1.5s' }}>💝</div>

          <div className="relative bg-gradient-to-r from-blush-100/90 to-lavender-100/90 backdrop-blur-sm rounded-bubble p-10 md:p-14 text-center border border-blush-200 shadow-warm">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-cocoa-700 mb-3">Listo para tu pieza única? 🧸</h2>
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
