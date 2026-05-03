'use client';

import { useEffect, useRef, useState } from 'react';
import { THEMES, type ThemeId } from '@/lib/themes';

type ApiResponse = {
  themeId: ThemeId;
  themeMode: 'manual' | 'auto';
  effectiveThemeId: ThemeId;
};

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<ApiResponse>({
    themeId: 'none',
    themeMode: 'manual',
    effectiveThemeId: 'none',
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Carga el estado actual al abrir
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch('/api/site-theme', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ApiResponse | null) => {
        if (cancelled || !data) return;
        setState(data);
      })
      .catch(() => { /* silent */ });
    return () => { cancelled = true; };
  }, [open]);

  // Cierra al hacer click fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  async function applyTheme(themeId: ThemeId, mode: 'manual' | 'auto' = 'manual') {
    setLoading(true);
    try {
      const res = await fetch('/api/site-theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, themeMode: mode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'No se pudo cambiar el tema');
        return;
      }
      const data: ApiResponse = await res.json();
      setState(data);
      // Aplicamos al <html> de inmediato sin esperar recarga
      applyHtmlClass(data.effectiveThemeId);
    } finally {
      setLoading(false);
    }
  }

  const activeId = state.themeMode === 'auto' ? state.effectiveThemeId : state.themeId;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Cambiar tema festivo"
        aria-label="Cambiar tema festivo"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white shadow-sm border border-cocoa-200/40 text-lg hover:scale-105 transition-transform"
      >
        🎨
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-warm border border-cream-200 p-3 z-[60] max-h-[70vh] overflow-y-auto">
          <div className="text-xs font-bold text-cocoa-600 px-1 mb-2">Tema festivo del sitio</div>

          {/* Modo automático por fecha */}
          <button
            type="button"
            disabled={loading}
            onClick={() => applyTheme('none', 'auto')}
            className={`w-full text-left px-3 py-2 rounded-xl mb-2 text-sm font-semibold transition-colors ${
              state.themeMode === 'auto'
                ? 'bg-blush-100 text-cocoa-700 ring-2 ring-blush-300'
                : 'bg-cream-50 hover:bg-cream-100 text-cocoa-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🗓️</span>
              <div className="flex-1">
                <div>Automático por fecha</div>
                <div className="text-[10px] font-normal opacity-70">
                  Usa la festividad cercana al día actual
                </div>
              </div>
            </div>
          </button>

          <div className="h-px bg-cream-200 my-2" />

          {/* Lista de temas */}
          <div className="space-y-1">
            {THEMES.map((t) => {
              const selected = state.themeMode === 'manual' && state.themeId === t.id;
              const isCurrentAuto = state.themeMode === 'auto' && state.effectiveThemeId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={loading}
                  onClick={() => applyTheme(t.id, 'manual')}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    selected
                      ? 'bg-blush-100 ring-2 ring-blush-300 text-cocoa-700 font-semibold'
                      : 'hover:bg-cream-50 text-cocoa-600'
                  }`}
                  title={t.description}
                >
                  <span
                    className="inline-block w-5 h-5 rounded-full border border-cocoa-200/50 shrink-0"
                    style={{ backgroundColor: t.swatch }}
                  />
                  <span className="text-base shrink-0">{t.emoji}</span>
                  <span className="flex-1 truncate">{t.label}</span>
                  {selected && <span className="text-[10px] text-blush-500">✓</span>}
                  {isCurrentAuto && (
                    <span
                      className="text-[9px] uppercase tracking-wide bg-blush-200/60 text-cocoa-700 px-1.5 py-0.5 rounded"
                      title="Activo por modo automático"
                    >
                      AUTO
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-cream-200 text-[10px] text-cocoa-500 px-1">
            Activo: <strong className="text-cocoa-700">{labelOf(activeId)}</strong>
            {state.themeMode === 'auto' && <span className="ml-1">(modo automático)</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function labelOf(id: ThemeId): string {
  return THEMES.find((t) => t.id === id)?.label || 'Sin tema';
}

// Aplica/quita las clases .theme-* en <html> para reflejar el cambio sin recargar.
function applyHtmlClass(themeId: ThemeId) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  // limpiar cualquier clase theme-*
  Array.from(html.classList)
    .filter((c) => c.startsWith('theme-'))
    .forEach((c) => html.classList.remove(c));
  if (themeId && themeId !== 'none') {
    html.classList.add(`theme-${themeId}`);
  }
}
