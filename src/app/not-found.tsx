import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Página no encontrada | Mundo A Crochet',
  description: 'Esta página se nos perdió entre las puntadas. Te ayudamos a regresar al inicio o ir al catálogo.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6 select-none">🧶</div>
        <p className="font-display font-bold text-7xl text-blush-400 mb-3 leading-none">404</p>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-cocoa-700 mb-3">
          Esta página se nos perdió
        </h1>
        <p className="text-cocoa-400 mb-8 leading-relaxed">
          Parece que el hilo se enredó. La página que buscas no existe, fue movida o el enlace está incorrecto.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 shadow-glow"
          >
            Volver al inicio
          </Link>
          <Link
            href="/catalogo"
            className="btn-cute bg-white text-cocoa-600 border-2 border-cream-300 hover:border-blush-300 px-6 py-2.5"
          >
            Ver catálogo 🧶
          </Link>
        </div>
        <p className="mt-8 text-xs text-cocoa-400">
          ¿Buscabas algo específico?{' '}
          <Link href="/contacto" className="text-blush-500 hover:underline font-semibold">
            Escríbenos
          </Link>{' '}
          y te ayudamos.
        </p>
      </div>
    </main>
  );
}
