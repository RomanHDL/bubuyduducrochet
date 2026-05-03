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
        title="Cambiar tema festivo del sitio"
        aria-label="Cambiar tema festivo del sitio"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-sm border border-cocoa-200/40 text-cocoa-600 hover:scale-105 hover:shadow-md transition-all"
      >
        <PaletteIcon />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-warm border border-cream-200 p-3 z-[60] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between px-1 mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-cocoa-700">
              Tema del sitio
            </div>
            <span className="text-[9px] uppercase tracking-wide text-cocoa-400">
              Solo admin
            </span>
          </div>

          {/* Modo automático por fecha */}
          <button
            type="button"
            disabled={loading}
            onClick={() => applyTheme('none', 'auto')}
            className={`w-full text-left px-3 py-2.5 rounded-xl mb-2 text-sm transition-all ${
              state.themeMode === 'auto'
                ? 'bg-cocoa-700 text-white shadow-md'
                : 'bg-cream-50 hover:bg-cream-100 text-cocoa-700 border border-cream-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <CalendarIcon className={state.themeMode === 'auto' ? 'text-white' : 'text-cocoa-500'} />
              <div className="flex-1">
                <div className="font-semibold">Automático por fecha</div>
                <div className={`text-[10px] mt-0.5 ${state.themeMode === 'auto' ? 'text-white/80' : 'text-cocoa-500'}`}>
                  Detecta la festividad cercana al día actual
                </div>
              </div>
              {state.themeMode === 'auto' && <CheckIcon className="text-white" />}
            </div>
          </button>

          <div className="h-px bg-cream-200 my-3" />

          <div className="space-y-1">
            {THEMES.map((t) => {
              const selected = state.themeMode === 'manual' && state.themeId === t.id;
              const isCurrentAuto = state.themeMode === 'auto' && state.effectiveThemeId === t.id;
              const swatchStyle = t.swatchAccent
                ? { background: `linear-gradient(135deg, ${t.swatch} 0%, ${t.swatchAccent} 100%)` }
                : { background: t.swatch };
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={loading}
                  onClick={() => applyTheme(t.id, 'manual')}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                    selected
                      ? 'bg-cream-100 ring-1 ring-cocoa-700 text-cocoa-800 font-semibold'
                      : 'hover:bg-cream-50 text-cocoa-700'
                  }`}
                  title={t.description}
                >
                  <span
                    className="inline-block w-6 h-6 rounded-full border border-cocoa-200/60 shrink-0 shadow-inner"
                    style={swatchStyle}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{t.label}</div>
                    {t.date && (
                      <div className="text-[10px] text-cocoa-400 truncate">{t.date}</div>
                    )}
                  </div>
                  {selected && <CheckIcon className="text-cocoa-700" />}
                  {isCurrentAuto && (
                    <span
                      className="text-[9px] uppercase tracking-wide bg-cocoa-700/10 text-cocoa-700 px-1.5 py-0.5 rounded font-bold"
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
            {state.themeMode === 'auto' && <span className="ml-1">· modo automático</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function labelOf(id: ThemeId): string {
  return THEMES.find((t) => t.id === id)?.label || 'Sin tema';
}

function applyHtmlClass(themeId: ThemeId) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  Array.from(html.classList)
    .filter((c) => c.startsWith('theme-'))
    .forEach((c) => html.classList.remove(c));
  if (themeId && themeId !== 'none') {
    html.classList.add(`theme-${themeId}`);
  }
}

/* ─── Iconos SVG inline (sin emojis) ─── */

function PaletteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="13.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M12 22a10 10 0 110-20 8 8 0 018 8 4 4 0 01-4 4h-2a2 2 0 00-2 2v2a2 2 0 01-2 2 2 2 0 01-2 2z" />
    </svg>
  );
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
