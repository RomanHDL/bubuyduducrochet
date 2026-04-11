'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const LOGO = 'https://i.pinimg.com/originals/f7/97/e0/f797e0d435f74e1b41a49ba08f908d25.png';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <nav className="sticky top-0 z-50 bg-[#B8DFF5] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo — natural colors, no frame */}
          <Link href="/" className="flex items-center group">
            <img
              src={LOGO}
              alt="Bubu & Dudu Crochet"
              className="h-14 sm:h-16 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link href="/catalogo" className="text-sm font-semibold text-cocoa-600 hover:text-cocoa-800 transition-colors">Catalogo</Link>
            <Link href="/preguntas" className="text-sm font-semibold text-cocoa-600 hover:text-cocoa-800 transition-colors">FAQ</Link>
            <Link href="/contacto" className="text-sm font-semibold text-cocoa-600 hover:text-cocoa-800 transition-colors">Nosotros</Link>

            {session ? (
              <>
                <Link href="/favoritos" className="text-cocoa-600 hover:text-cocoa-800 transition-colors text-lg" title="Favoritos">💕</Link>
                <Link href="/carrito" className="relative text-cocoa-600 hover:text-cocoa-800 transition-colors" title="Carrito">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                </Link>
                {isAdmin && <Link href="/admin" className="text-sm font-semibold text-cocoa-700 bg-cocoa-700/10 px-3 py-1.5 rounded-full hover:bg-cocoa-700/20 transition-colors">Admin</Link>}
                <Link href="/mi-cuenta" className="w-8 h-8 rounded-full bg-cocoa-100 flex items-center justify-center text-sm font-bold text-cocoa-600 overflow-hidden border-2 border-cocoa-200 hover:border-blush-300 transition-colors">
                  {session.user?.image ? <img src={session.user.image} alt="" className="w-full h-full object-cover" /> : (session.user?.name?.charAt(0).toUpperCase() || '?')}
                </Link>
              </>
            ) : (
              <Link href="/login" className="bg-blush-400 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-blush-500 transition-colors shadow-md">Entrar 💕</Link>
            )}
          </div>

          {/* Mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-cocoa-600 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}</svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-cocoa-200/40 mt-2 pt-4 space-y-3">
            <Link href="/catalogo" className="block text-sm font-semibold text-cocoa-600 hover:text-cocoa-800 py-1" onClick={() => setMenuOpen(false)}>🧶 Catalogo</Link>
            <Link href="/preguntas" className="block text-sm font-semibold text-cocoa-600 hover:text-cocoa-800 py-1" onClick={() => setMenuOpen(false)}>❓ FAQ</Link>
            <Link href="/contacto" className="block text-sm font-semibold text-cocoa-600 hover:text-cocoa-800 py-1" onClick={() => setMenuOpen(false)}>💌 Nosotros</Link>
            {session ? (
              <>
                <Link href="/favoritos" className="block text-sm font-semibold text-cocoa-600 hover:text-cocoa-800 py-1" onClick={() => setMenuOpen(false)}>💕 Favoritos</Link>
                <Link href="/carrito" className="block text-sm font-semibold text-cocoa-600 hover:text-cocoa-800 py-1" onClick={() => setMenuOpen(false)}>🛒 Carrito</Link>
                <Link href="/pedidos" className="block text-sm font-semibold text-cocoa-600 hover:text-cocoa-800 py-1" onClick={() => setMenuOpen(false)}>📦 Mis Pedidos</Link>
                <Link href="/mi-cuenta" className="block text-sm font-semibold text-cocoa-600 hover:text-cocoa-800 py-1" onClick={() => setMenuOpen(false)}>👤 Mi Cuenta</Link>
                {isAdmin && <Link href="/admin" className="block text-sm font-semibold text-cocoa-600 py-1" onClick={() => setMenuOpen(false)}>⚙️ Admin</Link>}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm font-semibold text-cocoa-400 hover:text-cocoa-700 py-1">Cerrar sesion</button>
              </>
            ) : (
              <Link href="/login" className="block bg-blush-400 text-white text-center text-sm font-bold py-2.5 rounded-full" onClick={() => setMenuOpen(false)}>Entrar 💕</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
