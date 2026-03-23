export default function Footer() {
  return (
    <footer className="bg-cocoa-700 text-cream-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧸</span>
              <span className="font-display font-bold text-xl text-cream-100">Bubu & Dudu</span>
            </div>
            <p className="text-sm text-cream-200 leading-relaxed">
              Creaciones hechas a mano con amor, cada pieza tejida con cuidado
              y dedicacion para llenar tu vida de ternura.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-cream-300 mb-3">Tienda</h4>
            <ul className="space-y-2 text-sm text-cream-200">
              <li><a href="/catalogo" className="hover:text-blush-300 transition-colors">Catalogo</a></li>
              <li><a href="/catalogo?category=amigurumis" className="hover:text-blush-300 transition-colors">Amigurumis</a></li>
              <li><a href="/catalogo?category=accesorios" className="hover:text-blush-300 transition-colors">Accesorios</a></li>
              <li><a href="/contacto" className="hover:text-blush-300 transition-colors">Sobre Nosotros</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-cream-300 mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm text-cream-200">
              <li className="flex items-center gap-2">
                <span>💌</span> hola@bubuydudu.com
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> Hecho con amor desde Mexico
              </li>
              <li className="flex items-center gap-2">
                <span>🧶</span> 100% handmade
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cocoa-600 mt-8 pt-6 text-center">
          <p className="text-xs text-cream-300">
            &copy; {new Date().getFullYear()} Bubu & Dudu Crochet. Todos los derechos reservados. Hecho con 💕
          </p>
        </div>
      </div>
    </footer>
  );
}
