import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-cocoa-700 text-cream-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧸</span>
              <span className="font-display font-bold text-xl text-white">Bubu & Dudu</span>
            </div>
            <p className="text-sm text-cream-300 leading-relaxed">
              Creaciones artesanales tejidas a mano con los materiales mas suaves y todo nuestro carino.
            </p>
          </div>

          {/* Tienda */}
          <div>
            <h4 className="font-display font-bold text-white mb-3">Tienda</h4>
            <div className="space-y-2">
              <Link href="/catalogo" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Catalogo</Link>
              <Link href="/catalogo?category=amigurumis" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Amigurumis</Link>
              <Link href="/catalogo?category=accesorios" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Accesorios</Link>
              <Link href="/catalogo?category=decoracion" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Decoracion</Link>
            </div>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="font-display font-bold text-white mb-3">Ayuda</h4>
            <div className="space-y-2">
              <Link href="/preguntas" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Preguntas frecuentes</Link>
              <Link href="/contacto" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Contacto</Link>
              <Link href="/pedidos" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Mis pedidos</Link>
              <Link href="/mi-cuenta" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Mi cuenta</Link>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-display font-bold text-white mb-3">Contacto</h4>
            <div className="space-y-2 text-sm text-cream-300">
              <p>📧 bubuydudu@crochet.com</p>
              <p>📱 WhatsApp disponible</p>
              <p>📍 Chihuahua, Mexico</p>
              <p>🕐 Lun-Sab 9am-7pm</p>
            </div>
          </div>
        </div>

        <div className="border-t border-cocoa-600 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream-400">© {new Date().getFullYear()} Bubu & Dudu Crochet. Hecho con 💕</p>
          <div className="flex gap-4 text-xs text-cream-400">
            <span>Envios a todo Mexico 📦</span>
            <span>Pedidos personalizados 🧸</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
