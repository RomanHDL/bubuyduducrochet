import Link from 'next/link';
import NewsletterSignup from '@/components/NewsletterSignup';

const WA = '528187087288';
const EMAIL = 'veroguadalupita@gmail.com';

export default function Footer() {
  return (
    <footer className="bg-cocoa-700 text-cream-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display font-bold text-xl text-white">Mundo A Crochet</span>
            <p className="text-sm text-cream-300 leading-relaxed mt-2 mb-4">Creaciones artesanales tejidas a mano con amor desde Monterrey, Nuevo Leon.</p>
            <NewsletterSignup />
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-3">Tienda</h4>
            <div className="space-y-2">
              <Link href="/catalogo" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Catalogo</Link>
              <Link href="/catalogo?category=amigurumis" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Amigurumis</Link>
              <Link href="/catalogo?category=accesorios" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Accesorios</Link>
              <Link href="/catalogo?category=decoracion" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Decoracion</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-3">Ayuda</h4>
            <div className="space-y-2">
              <Link href="/preguntas" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Preguntas frecuentes</Link>
              <Link href="/contacto" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Contacto</Link>
              <Link href="/pedidos" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Mis pedidos</Link>
              <Link href="/mi-cuenta" className="block text-sm text-cream-300 hover:text-blush-300 transition-colors">Mi cuenta</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-3">Contacto</h4>
            <div className="space-y-2 text-sm text-cream-300">
              <a href={`mailto:${EMAIL}`} className="block hover:text-blush-300 transition-colors">📧 {EMAIL}</a>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="block hover:text-green-300 transition-colors">📱 818 708 7288</a>
              <p>📍 Monterrey, Nuevo Leon</p>
              <p>🕐 Lun-Sab 9am-7pm</p>
            </div>
          </div>
        </div>
        {/* Legal links — fila propia para cumplir con LFPDPPP visible */}
        <div className="border-t border-cocoa-600 mt-8 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            <Link href="/aviso-privacidad" className="text-cream-300 hover:text-blush-300 transition-colors">Aviso de Privacidad</Link>
            <span className="text-cocoa-500">·</span>
            <Link href="/terminos" className="text-cream-300 hover:text-blush-300 transition-colors">Términos y Condiciones</Link>
            <span className="text-cocoa-500">·</span>
            <Link href="/envios" className="text-cream-300 hover:text-blush-300 transition-colors">Política de Envíos</Link>
            <span className="text-cocoa-500">·</span>
            <Link href="/devoluciones" className="text-cream-300 hover:text-blush-300 transition-colors">Devoluciones</Link>
          </div>
        </div>

        <div className="border-t border-cocoa-600/50 mt-4 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream-400">© {new Date().getFullYear()} Mundo A Crochet. Hecho con 💕 en Monterrey, Nuevo León</p>
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-green-300 hover:text-green-200 transition-colors">💬 WhatsApp</a>
        </div>
      </div>
    </footer>
  );
}
