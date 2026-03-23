'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
  featured: boolean;
}

// Wrapper to satisfy Next.js Suspense requirement for useSearchParams
export default function CatalogoPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🧶</span></div>}>
      <CatalogoContent />
    </Suspense>
  );
}

const CATEGORIES = [
  { value: '', label: 'Todos', emoji: '✨' },
  { value: 'amigurumis', label: 'Amigurumis', emoji: '🧸' },
  { value: 'accesorios', label: 'Accesorios', emoji: '🎀' },
  { value: 'decoracion', label: 'Decoracion', emoji: '🌸' },
  { value: 'ropa-bebe', label: 'Ropa Bebe', emoji: '👶' },
  { value: 'llaveros', label: 'Llaveros', emoji: '🔑' },
];

function CatalogoContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);

      try {
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch { setProducts([]); }
      finally { setLoading(false); }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Nuestro Catalogo 🧶</h1>
        <p className="text-cocoa-400">Descubre todas nuestras creaciones hechas a mano</p>
      </div>

      {/* Search + Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cocoa-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="input-cute pl-12"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                category === cat.value
                  ? 'bg-blush-400 text-white shadow-soft'
                  : 'bg-cream-100 text-cocoa-500 hover:bg-cream-200'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <span className="text-4xl animate-bounce block mb-3">🧶</span>
            <p className="text-cocoa-400 font-medium">Cargando productos...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🧸</span>
          <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">No encontramos productos</h3>
          <p className="text-cocoa-400">Pronto agregaremos mas creaciones. Vuelve pronto!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link key={p._id} href={`/producto/${p._id}`} className="card-cute group">
              <div className="aspect-square bg-gradient-to-br from-cream-100 to-blush-50 relative overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl opacity-30">🧸</span>
                  </div>
                )}
                {p.featured && (
                  <span className="absolute top-3 left-3 bg-blush-400 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    Destacado ✨
                  </span>
                )}
                {p.stock <= 0 && (
                  <div className="absolute inset-0 bg-cocoa-800/40 flex items-center justify-center">
                    <span className="bg-white/90 text-cocoa-700 font-bold px-4 py-2 rounded-full text-sm">Agotado</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="text-xs font-semibold text-blush-400 uppercase tracking-wider">{p.category}</span>
                <h3 className="font-display font-bold text-cocoa-700 mt-1 group-hover:text-blush-400 transition-colors line-clamp-1">{p.title}</h3>
                <p className="text-sm text-cocoa-400 mt-1 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-display font-bold text-lg text-cocoa-700">${p.price.toFixed(2)}</span>
                  <span className="text-xs text-cocoa-300">{p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
