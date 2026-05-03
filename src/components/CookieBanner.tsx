'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mac:cookies:accepted:v1';

// Banner discreto que cumple con la LFPDPPP — informa el uso de cookies
// estrictamente necesarias y enlaza al Aviso de Privacidad. Se oculta al
// aceptar y se recuerda en localStorage.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (!accepted) setVisible(true);
    } catch {
      // localStorage bloqueado (modo incognito estricto, etc.) — no mostramos
      // el banner para no molestar; el aviso ya cubre el uso de cookies.
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de uso de cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[100] bg-white rounded-cute shadow-warm border-2 border-cocoa-700 p-4"
      style={{ boxShadow: '4px 4px 0 0 #1A1A1A' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0" aria-hidden="true">🍪</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-cocoa-700 mb-1">Usamos cookies esenciales</p>
          <p className="text-xs text-cocoa-500 leading-relaxed">
            Solo utilizamos cookies necesarias para mantener tu sesión iniciada y recordar tu carrito. No usamos cookies de
            seguimiento de terceros.{' '}
            <Link href="/aviso-privacidad" className="text-blush-500 font-semibold hover:underline">Más información</Link>.
          </p>
          <button
            type="button"
            onClick={accept}
            className="mt-3 btn-cute bg-blush-400 text-white text-xs px-4 py-1.5 hover:bg-blush-500"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
