'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

// useLayoutEffect aplica el cambio al DOM ANTES de que el navegador pinte,
// eliminando el flash al navegar entre rutas. En SSR no hay window, asi
// que caemos a useEffect normal (no hace nada en server).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Mapea cada ruta a una clase page-<ruta> para CSS específico por página.
const ROUTE_CLASS_MAP: Array<[RegExp | string, string]> = [
  ['/', 'page-home'],
  ['/catalogo', 'page-catalogo'],
  ['/preguntas', 'page-faq'],
  ['/contacto', 'page-nosotros'],
  ['/carrito', 'page-carrito'],
  ['/favoritos', 'page-favoritos'],
  ['/mi-cuenta', 'page-cuenta'],
  ['/pedidos', 'page-pedidos'],
  ['/login', 'page-login'],
  ['/registro', 'page-login'],
  [/^\/producto\//, 'page-producto'],
  [/^\/admin/, 'page-admin'],
];

// Aplica al <html>:
// 1) clase page-X según la ruta actual
// 2) clase theme-X sincronizada con el servidor (corrige caché stale del SSR
//    cuando el admin cambia el tema y el visitante navega entre rutas)
export default function PageClassMarker() {
  const pathname = usePathname();

  // Page class — useLayoutEffect aplica antes del paint (sin flash).
  // Tambien: en rutas /admin se remueven todas las clases theme-* para que
  // el panel admin siempre use el diseño base original.
  useIsoLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;

    Array.from(html.classList)
      .filter((c) => c.startsWith('page-'))
      .forEach((c) => html.classList.remove(c));

    let matched = 'page-other';
    for (const [pattern, cls] of ROUTE_CLASS_MAP) {
      if (typeof pattern === 'string') {
        if (pathname === pattern) { matched = cls; break; }
      } else if (pattern.test(pathname)) {
        matched = cls;
        break;
      }
    }
    html.classList.add(matched);

    if (matched === 'page-admin') {
      Array.from(html.classList)
        .filter((c) => c.startsWith('theme-'))
        .forEach((c) => html.classList.remove(c));
    }
  }, [pathname]);

  // Sync theme con el servidor en cada navegación (corrige cache stale).
  // En /admin no aplicamos tema — el panel siempre usa diseño base.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (pathname?.startsWith('/admin')) return;
    let cancelled = false;
    fetch('/api/site-theme', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const html = document.documentElement;
        const themeId = data.effectiveThemeId || 'none';
        const expected = themeId !== 'none' ? `theme-${themeId}` : null;
        const current = Array.from(html.classList).find((c) => c.startsWith('theme-'));
        if (current === expected) return;
        if (current) html.classList.remove(current);
        if (expected) html.classList.add(expected);
      })
      .catch(() => { /* silent — el SSR ya aplico una clase, no urge */ });
    return () => { cancelled = true; };
  }, [pathname]);

  return null;
}
