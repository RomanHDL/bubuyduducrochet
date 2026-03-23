'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cream-200 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🧸</span>
            <span className="font-display font-bold text-xl text-cocoa-700 group-hover:text-blush-400 transition-colors">
              Bubu & Dudu
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-blush-300 bg-blush-50 px-2 py-0.5 rounded-full">
              crochet
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/catalogo" className="text-sm font-semibold text-cocoa-500 hover:text-blush-400 transition-colors">
              Catalogo
            </Link>
            <Link href="/contacto" className="text-sm font-semibold text-cocoa-500 hover:text-blush-400 transition-colors">
              Nosotros
            </Link>

            {session ? (
              <>
                <Link href="/carrito" className="relative text-cocoa-500 hover:text-blush-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                </Link>

                {isAdmin && (
                  <Link href="/admin" className="text-sm font-semibold text-lavender-400 hover:text-lavender-300 bg-lavender-50 px-3 py-1.5 rounded-full transition-colors">
                    Admin
                  </Link>
                )}

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center text-sm font-bold text-blush-500 overflow-hidden">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      session.user?.name?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-xs font-semibold text-cocoa-400 hover:text-blush-400 transition-colors"
                  >
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="btn-cute bg-blush-400 text-white text-sm px-5 py-2 hover:bg-blush-500">
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-cocoa-500 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-cream-200 mt-2 pt-4 space-y-3">
            <Link href="/catalogo" className="block text-sm font-semibold text-cocoa-500 hover:text-blush-400" onClick={() => setMenuOpen(false)}>
              Catalogo
            </Link>
            <Link href="/contacto" className="block text-sm font-semibold text-cocoa-500 hover:text-blush-400" onClick={() => setMenuOpen(false)}>
              Nosotros
            </Link>
            {session ? (
              <>
                <Link href="/carrito" className="block text-sm font-semibold text-cocoa-500 hover:text-blush-400" onClick={() => setMenuOpen(false)}>
                  Carrito
                </Link>
                <Link href="/pedidos" className="block text-sm font-semibold text-cocoa-500 hover:text-blush-400" onClick={() => setMenuOpen(false)}>
                  Mis Pedidos
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="block text-sm font-semibold text-lavender-400 hover:text-lavender-300" onClick={() => setMenuOpen(false)}>
                    Panel Admin
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm font-semibold text-cocoa-400 hover:text-blush-400">
                  Cerrar sesion
                </button>
              </>
            ) : (
              <Link href="/login" className="block btn-cute bg-blush-400 text-white text-center text-sm" onClick={() => setMenuOpen(false)}>
                Entrar
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
