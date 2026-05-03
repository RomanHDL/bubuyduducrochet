'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Añade una clase page-<ruta> al <html> en cada navegación.
// Permite a globals.css aplicar variaciones por página dentro de cada tema.
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

export default function PageClassMarker() {
  const pathname = usePathname();

  useEffect(() => {
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
  }, [pathname]);

  return null;
}
