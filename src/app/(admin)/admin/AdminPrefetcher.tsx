'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Warmup del router de Next.js para el panel admin.
//
// En Next.js app router, <Link> prefetchea en hover (en produccion). Pero
// "en hover" no es suficiente cuando la admin abre el panel y espera que
// clickear cualquier boton sea instantaneo.
//
// Este componente se monta una vez dentro del layout admin y dispara
// router.prefetch() para TODAS las rutas admin ni bien la admin entra al
// panel. Asi Next.js cachea la RSC payload de cada una en background, y
// cuando el admin hace click en "Productos" o "Pedidos", la transicion
// ocurre al instante — sin ir al servidor.
//
// La llamada a prefetch es no-bloqueante y sin costo visible en la UI.
const ADMIN_ROUTES = [
  '/admin',
  '/admin/productos',
  '/admin/pedidos',
  '/admin/pagos',
  '/admin/materiales',
  '/admin/resenas',
  '/admin/usuarios',
  // Paginas publicas que la admin suele visitar desde el panel
  '/catalogo',
  '/pedidos',
];

export default function AdminPrefetcher() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Solo para admins y solo cuando la sesion ya se resolvio.
    if (status !== 'authenticated') return;
    if ((session?.user as any)?.role !== 'admin') return;
    // Disparamos los prefetch de forma escalonada para no saturar la red.
    ADMIN_ROUTES.forEach((route, i) => {
      setTimeout(() => { try { router.prefetch(route); } catch {} }, i * 120);
    });
  }, [status, session, router]);

  return null;
}
