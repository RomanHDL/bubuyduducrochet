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

export default function HomePage() {
  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blush-50 via-cream-50 to-lavender-50">
        {/* Decorative elements */}
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
              Ternura tejida
              <br />
              <span className="text-blush-400">puntada a puntada</span>
            </h1>

            <p className="text-lg text-cocoa-400 mb-8 leading-relaxed max-w-xl mx-auto">
              Descubre nuestra coleccion de amigurumis, accesorios y creaciones
              unicas hechas a mano con los materiales mas suaves y todo nuestro carino.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalogo" className="btn-cute bg-blush-400 text-white text-lg px-8 py-3 hover:bg-blush-500 shadow-glow">
                Ver Catalogo 🧶
              </Link>
              <Link href="/contacto" className="btn-cute bg-white text-cocoa-600 text-lg px-8 py-3 border-2 border-cream-300 hover:border-blush-300 hover:text-blush-500">
                Conocenos 💌
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="#FFFDF7" />
          </svg>
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
            <Link key={cat.name} href={cat.href}
              className={`${cat.color} border-2 rounded-cute p-6 text-center hover:shadow-warm hover:-translate-y-1 transition-all duration-200 group`}
            >
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

      {/* ═══ CTA ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-r from-blush-100 to-lavender-100 rounded-bubble p-8 md:p-12 text-center border border-blush-200">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-cocoa-700 mb-3">
            Quieres algo especial? 🧸
          </h2>
          <p className="text-cocoa-400 mb-6 max-w-md mx-auto">
            Hacemos pedidos personalizados. Cuentanos que tienes en mente y
            lo tejemos con mucho amor para ti.
          </p>
          <Link href="/contacto" className="btn-cute bg-blush-400 text-white px-8 py-3 hover:bg-blush-500 shadow-glow">
            Contactanos 💌
          </Link>
        </div>
      </section>
    </div>
  );
}
