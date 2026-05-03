'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type PromoConfig = {
  active: boolean;
  text: string;
  link?: string;
  linkLabel?: string;
};

// Barra promo en lo alto del sitio, encima del navbar. Configurable desde
// /api/site-theme (campo promoBar en SiteSettings). Cliente puede cerrar
// y se persiste en localStorage por sesión.
const STORAGE_KEY = 'mac:promo:dismissed:v1';

export default function PromoBar() {
  const pathname = usePathname();
  const [config, setConfig] = useState<PromoConfig | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === '1') setDismissed(true);
    } catch {}

    let cancelled = false;
    fetch('/api/site-theme', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.promoBar) return;
        if (data.promoBar.active && data.promoBar.text) {
          setConfig(data.promoBar);
        }
      })
      .catch(() => { /* silent */ });
    return () => { cancelled = true; };
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setDismissed(true);
  };

  // Ocultar en /admin (no aplica al panel interno)
  if (pathname?.startsWith('/admin')) return null;
  if (!config || !config.active || !config.text || dismissed) return null;

  return (
    <div className="bg-cocoa-700 text-cream-100 text-center py-2 px-3 sm:px-6 text-xs sm:text-sm relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 pr-6">
        <span className="font-semibold">{config.text}</span>
        {config.link && (
          <a
            href={config.link}
            className="underline hover:text-blush-300 transition-colors font-bold"
            target={config.link.startsWith('http') ? '_blank' : undefined}
            rel={config.link.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {config.linkLabel || 'Ver más →'}
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar promoción"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-cocoa-600 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M2 2 L10 10 M10 2 L2 10" />
        </svg>
      </button>
    </div>
  );
}
