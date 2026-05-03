'use client';

import { useEffect, useState } from 'react';
import { THEMES, type ThemeId } from '@/lib/themes';

// Banner pequeño que aparece junto al logo cuando hay un tema festivo activo.
// Muestra la fecha y un mensaje corto. Se actualiza solo si el admin cambia el
// tema (escucha mutaciones a la clase del <html>).
export default function FestiveBanner() {
  const [themeId, setThemeId] = useState<ThemeId>('none');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const read = () => {
      const cls = Array.from(html.classList).find((c) => c.startsWith('theme-'));
      const id = cls ? (cls.replace('theme-', '') as ThemeId) : 'none';
      setThemeId(id);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (themeId === 'none') return null;
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme || !theme.date) return null;

  return (
    <div
      className="festive-banner hidden lg:flex items-center gap-3 px-5 py-2 mx-2 rounded-full max-w-md"
      role="status"
      aria-label={`${theme.date}. ${theme.message}`}
    >
      <span className="festive-banner__date">{theme.date}</span>
      <span className="festive-banner__divider" aria-hidden="true" />
      <span className="festive-banner__message">{theme.message}</span>
    </div>
  );
}
