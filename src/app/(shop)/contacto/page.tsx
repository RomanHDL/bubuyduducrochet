export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <span className="text-5xl block mb-3">💌</span>
        <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Sobre Nosotros</h1>
        <p className="text-cocoa-400 max-w-xl mx-auto">
          Somos Bubu & Dudu, un emprendimiento artesanal dedicado a crear piezas
          unicas de crochet con todo el amor y la ternura del mundo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        {/* Contact */}
        <div className="bg-gradient-to-br from-blush-50 to-lavender-50 rounded-cute border border-blush-200 p-8">
          <h2 className="font-display font-bold text-xl text-cocoa-700 mb-4">Contactanos 💕</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <span className="text-sm font-semibold text-cocoa-600">Email</span>
                <p className="text-cocoa-400">hola@bubuydudu.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <span className="text-sm font-semibold text-cocoa-600">WhatsApp</span>
                <p className="text-cocoa-400">+52 123 456 7890</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <span className="text-sm font-semibold text-cocoa-600">Ubicacion</span>
                <p className="text-cocoa-400">Hecho con amor desde Mexico</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <span className="text-sm font-semibold text-cocoa-600">Horario</span>
                <p className="text-cocoa-400">Lunes a Sabado 9am - 6pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
