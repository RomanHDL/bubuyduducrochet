'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MiCuentaPage() {
  const { data: session } = useSession();
  const [orderCount, setOrderCount] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetch('/api/orders').then(r => r.json()).then(orders => setOrderCount(orders.length)).catch(() => {});
      const favs = JSON.parse(localStorage.getItem('bdcrochet_favs') || '[]');
      setFavCount(favs.length);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-br from-cream-50 via-blush-50 to-lavender-50">
        <span className="text-6xl mb-4">🧸</span>
        <h1 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Mi Cuenta</h1>
        <p className="text-cocoa-400 mb-6">Inicia sesion para ver tu perfil</p>
        <Link href="/login" className="btn-cute bg-blush-400 text-white px-8 py-3 hover:bg-blush-500">
          Iniciar Sesion 💕
        </Link>
      </div>
    );
  }

  const user = session.user;
  const isAdmin = (user as any)?.role === 'admin';

  const MENU = [
    { emoji: '📦', label: 'Mis Pedidos', desc: `${orderCount} pedido${orderCount !== 1 ? 's' : ''}`, href: '/pedidos' },
    { emoji: '💕', label: 'Favoritos', desc: `${favCount} guardado${favCount !== 1 ? 's' : ''}`, href: '/favoritos' },
    { emoji: '🛒', label: 'Carrito', desc: 'Ver carrito de compras', href: '/carrito' },
    { emoji: '🧶', label: 'Catalogo', desc: 'Explorar productos', href: '/catalogo' },
    { emoji: '💌', label: 'Contacto', desc: 'Envianos un mensaje', href: '/contacto' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-blush-100 via-cream-100 to-lavender-100 rounded-bubble p-8 mb-8 border border-blush-200 text-center">
        <div className="w-20 h-20 rounded-full bg-white border-4 border-blush-200 mx-auto mb-4 overflow-hidden shadow-warm flex items-center justify-center">
          {user?.image ? (
            <img src={user.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-blush-400">{user?.name?.charAt(0).toUpperCase() || '?'}</span>
          )}
        </div>
        <h1 className="font-display font-bold text-2xl text-cocoa-700">{user?.name || 'Usuario'}</h1>
        <p className="text-cocoa-400 text-sm mt-1">{user?.email}</p>
        {isAdmin && (
          <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-lavender-100 border border-lavender-200 rounded-full text-xs font-bold text-lavender-500">
            ✨ Administrador
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-cute border border-cream-200 p-4 text-center shadow-soft">
          <p className="text-2xl font-bold text-blush-400">{orderCount}</p>
          <p className="text-xs text-cocoa-400 mt-0.5">Pedidos</p>
        </div>
        <div className="bg-white rounded-cute border border-cream-200 p-4 text-center shadow-soft">
          <p className="text-2xl font-bold text-lavender-400">{favCount}</p>
          <p className="text-xs text-cocoa-400 mt-0.5">Favoritos</p>
        </div>
        <div className="bg-white rounded-cute border border-cream-200 p-4 text-center shadow-soft">
          <p className="text-2xl">🧸</p>
          <p className="text-xs text-cocoa-400 mt-0.5">Miembro</p>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2 mb-8">
        {MENU.map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-4 p-4 bg-white rounded-cute border border-cream-200 hover:shadow-warm hover:border-blush-200 transition-all group">
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-cocoa-700 group-hover:text-blush-500 transition-colors">{item.label}</p>
              <p className="text-xs text-cocoa-400">{item.desc}</p>
            </div>
            <span className="text-cocoa-300 group-hover:text-blush-400 transition-colors">→</span>
          </Link>
        ))}

        {isAdmin && (
          <Link href="/admin"
            className="flex items-center gap-4 p-4 bg-lavender-50 rounded-cute border border-lavender-200 hover:shadow-warm hover:border-lavender-300 transition-all group">
            <span className="text-2xl">⚙️</span>
            <div className="flex-1">
              <p className="font-semibold text-lavender-600 group-hover:text-lavender-500 transition-colors">Panel de Administracion</p>
              <p className="text-xs text-lavender-400">Gestionar productos, pedidos y usuarios</p>
            </div>
            <span className="text-lavender-300 group-hover:text-lavender-400 transition-colors">→</span>
          </Link>
        )}
      </div>

      {/* Sign out */}
      <button onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full py-3 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400 hover:border-blush-300 hover:text-blush-500 transition-all">
        Cerrar Sesion
      </button>
    </div>
  );
}
