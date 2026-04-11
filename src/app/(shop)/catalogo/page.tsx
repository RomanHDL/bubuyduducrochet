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
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recientes' },
  { value: 'price-low', label: 'Menor precio' },
  { value: 'price-high', label: 'Mayor precio' },
  { value: 'name', label: 'A-Z' },
];

function CatalogoContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('recent');
  const [favs, setFavs] = useState<string[]>([]);

  // Load favorites
  useEffect(() => {
    setFavs(JSON.parse(localStorage.getItem('bdcrochet_favs') || '[]'));
  }, []);

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    setFavs(next);
    localStorage.setItem('bdcrochet_favs', JSON.stringify(next));
  };

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

  // Sort
  const sorted = [...products].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'name') return a.title.localeCompare(b.title);
    return 0; // recent = default API order
  });

  const featured = sorted.filter(p => p.featured);
  const rest = sorted.filter(p => !p.featured);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blush-50 border border-blush-200 rounded-full px-4 py-1.5 mb-4">
          <span className="text-sm">🧶</span>
          <span className="text-xs font-bold text-cocoa-500">{products.length} creaciones disponibles</span>
        </div>
        <h1 className="font-display font-bold text-4xl text-cocoa-700 mb-2">Nuestro Catalogo</h1>
        <p className="text-cocoa-400 max-w-md mx-auto">Cada pieza es unica, hecha a mano con los mejores materiales y todo nuestro carino</p>
      </div>

      {/* Search + Filters */}
      <div className="mb-10 space-y-5">
        <div className="relative max-w-lg mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar amigurumis, accesorios, decoracion..."
            className="input-cute pl-11 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-300 hover:text-blush-400">✕</button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                category === cat.value
                  ? 'bg-blush-400 text-white shadow-glow scale-105'
                  : 'bg-white text-cocoa-500 border border-cream-200 hover:border-blush-200 hover:text-blush-400'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-cocoa-400">
            {loading ? 'Buscando...' : `${sorted.length} producto${sorted.length !== 1 ? 's' : ''}`}
            {category && ` en ${CATEGORIES.find(c => c.value === category)?.label}`}
            {search && ` para "${search}"`}
          </p>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="text-sm bg-cream-50 border border-cream-200 rounded-2xl px-3 py-2 text-cocoa-500 focus:outline-none focus:border-blush-300">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="rounded-cute overflow-hidden border border-cream-200">
              <div className="aspect-square bg-cream-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-cream-200 rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-cream-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-cream-200 rounded w-full animate-pulse" />
                <div className="h-5 bg-cream-200 rounded w-1/4 animate-pulse mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🧸</span>
          <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">No encontramos productos</h3>
          <p className="text-cocoa-400 mb-6">Prueba con otra busqueda o categoria</p>
          <button onClick={() => { setSearch(''); setCategory('') }}
            className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500">
            Ver todo 🧶
          </button>
        </div>
      ) : (
        <>
          {/* Featured section */}
          {!search && !category && featured.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">⭐</span>
                <h2 className="font-display font-bold text-xl text-cocoa-700">Destacados</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.slice(0, 3).map(p => (
                  <ProductCard key={p._id} product={p} favs={favs} toggleFav={toggleFav} large />
                ))}
              </div>
            </div>
          )}

          {/* All products grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {(search || category ? sorted : rest).map(p => (
              <ProductCard key={p._id} product={p} favs={favs} toggleFav={toggleFav} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProductCard({ product: p, favs, toggleFav, large }: { product: Product; favs: string[]; toggleFav: (id: string, e: React.MouseEvent) => void; large?: boolean }) {
  const isFav = favs.includes(p._id);

  return (
    <Link href={`/producto/${p._id}`} className="card-cute group relative">
      {/* Fav button */}
      <button onClick={(e) => toggleFav(p._id, e)}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-soft ${
          isFav ? 'bg-blush-100 text-blush-400 scale-110' : 'bg-white/80 text-cocoa-300 hover:text-blush-400'
        }`}>
        {isFav ? '❤️' : '🤍'}
      </button>

      <div className={`${large ? 'aspect-[4/5]' : 'aspect-square'} bg-gradient-to-br from-cream-100 to-blush-50 relative overflow-hidden`}>
        {p.images?.[0] ? (
          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-6xl opacity-30">🧸</span></div>
        )}
        {p.featured && (
          <span className="absolute top-3 left-3 bg-blush-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-soft">
            ⭐ Destacado
          </span>
        )}
        {p.stock <= 0 && (
          <div className="absolute inset-0 bg-cocoa-800/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-white/90 text-cocoa-700 font-bold px-4 py-2 rounded-full text-sm">Agotado</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <span className="text-[10px] font-bold text-blush-400 uppercase tracking-wider">{p.category}</span>
        <h3 className="font-display font-bold text-cocoa-700 mt-1 group-hover:text-blush-400 transition-colors line-clamp-1 text-sm">{p.title}</h3>
        {large && <p className="text-xs text-cocoa-400 mt-1 line-clamp-2">{p.description}</p>}
        <div className="flex items-center justify-between mt-2.5">
          <span className="font-display font-bold text-lg text-cocoa-700">${p.price}</span>
          <span className="text-[10px] text-cocoa-300 font-medium">
            {p.stock > 0 ? (p.stock <= 3 ? `Ultimos ${p.stock}!` : 'Disponible') : 'Agotado'}
          </span>
        </div>
      </div>
    </Link>
  );
}
