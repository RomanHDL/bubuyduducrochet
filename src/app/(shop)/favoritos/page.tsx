'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedBg from '@/components/AnimatedBg';

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
}

export default function FavoritosPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await fetch('/api/favorites', { cache: 'no-store' });
      const data = await r.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { setLoading(false); return; }
    // Migración automática: si el usuario tiene favoritos en localStorage (flujo viejo),
    // los sube a la DB la primera vez y luego limpia localStorage.
    (async () => {
      try {
        const saved: string[] = JSON.parse(localStorage.getItem('bdcrochet_favs') || '[]');
        if (saved.length > 0) {
          await Promise.all(saved.map(productId =>
            fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) }).catch(() => null)
          ));
          localStorage.removeItem('bdcrochet_favs');
        }
      } catch { /* ignore */ }
      await load();
    })();
  }, [session, status]);

  const removeFav = async (id: string) => {
    await fetch(`/api/favorites?productId=${id}`, { method: 'DELETE' });
    setFavorites(prev => prev.filter(p => p._id !== id));
  };

  if (status !== 'loading' && !session) {
    return (
      <AnimatedBg theme="pink">
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-br from-cream-50 via-blush-50 to-lavender-50">
        <span className="text-6xl mb-4">💕</span>
        <h1 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Mis Favoritos</h1>
        <p className="text-cocoa-400 mb-6 text-center">Inicia sesion para guardar tus productos favoritos</p>
        <Link href="/login" className="btn-cute bg-blush-400 text-white px-8 py-3 hover:bg-blush-500">
          Iniciar Sesion 🧸
        </Link>
      </div>
      </AnimatedBg>
    );
  }

  return (
    <AnimatedBg theme="pink">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">💕</span>
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Mis Favoritos</h1>
          <p className="text-cocoa-400 text-sm">{favorites.length} producto{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-cream-100 rounded-cute h-64 animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🧶</span>
          <h2 className="font-display font-bold text-xl text-cocoa-600 mb-2">Aun no tienes favoritos</h2>
          <p className="text-cocoa-400 mb-6">Explora nuestro catalogo y guarda lo que mas te guste</p>
          <Link href="/catalogo" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500">
            Ver Catalogo 🧸
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map(product => (
            <div key={product._id} className="card-cute group relative">
              <button onClick={() => removeFav(product._id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-blush-400 hover:bg-blush-50 hover:text-blush-500 transition-all shadow-soft"
                title="Quitar de favoritos">
                ❤️
              </button>
              <Link href={`/producto/${product._id}`}>
                <div className="aspect-square bg-cream-100 overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🧸</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-blush-400 font-semibold uppercase tracking-wide mb-1">{product.category}</p>
                  <h3 className="font-display font-bold text-cocoa-700 mb-1 truncate">{product.title}</h3>
                  <p className="font-bold text-blush-500">${product.price} MXN</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
    </AnimatedBg>
  );
}
