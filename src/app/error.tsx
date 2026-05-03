'use client';

import Link from 'next/link';
import { useEffect } from 'react';

// Error boundary global. Captura errores en server components, route handlers
// y client components que escapen al try/catch local. Reemplaza la página
// rota por una pantalla amigable con opcion de reintentar.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Solo en consola — el digest viene del server, util para debug remoto
    console.error('[App error]', error.message, error.digest);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6 select-none">😿</div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-cocoa-700 mb-3">
          Algo salió mal
        </h1>
        <p className="text-cocoa-400 mb-8 leading-relaxed">
          Tuvimos un pequeño tropiezo cargando esta página. Inténtalo de nuevo, y si el problema persiste, escríbenos por WhatsApp y lo revisamos al instante.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 shadow-glow"
          >
            🔄 Reintentar
          </button>
          <Link
            href="/"
            className="btn-cute bg-white text-cocoa-600 border-2 border-cream-300 hover:border-blush-300 px-6 py-2.5"
          >
            Ir al inicio
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-[10px] text-cocoa-300 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
