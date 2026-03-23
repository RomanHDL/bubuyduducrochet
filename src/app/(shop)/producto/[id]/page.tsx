'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
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

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProduct(data);
      } catch { setProduct(null); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!session) { router.push('/login'); return; }
    if (!product) return;

    setAdding(true);
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          title: product.title,
          price: product.price,
          image: product.images?.[0] || '',
          quantity: qty,
        }),
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch { /* silent */ }
    finally { setAdding(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-4xl animate-bounce">🧶</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl block mb-4">😢</span>
        <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Producto no encontrado</h2>
        <Link href="/catalogo" className="text-blush-400 font-semibold hover:text-blush-500">Volver al catalogo</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-cocoa-400 mb-6">
        <Link href="/" className="hover:text-blush-400">Inicio</Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-blush-400">Catalogo</Link>
        <span>/</span>
        <span className="text-cocoa-600 font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gradient-to-br from-cream-100 to-blush-50 rounded-cute overflow-hidden border border-cream-200">
            {product.images?.[selectedImage] ? (
              <img src={product.images[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl opacity-30">🧸</span>
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-blush-400 shadow-soft' : 'border-cream-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-sm font-semibold text-blush-400 uppercase tracking-wider">{product.category}</span>
          <h1 className="font-display font-bold text-3xl text-cocoa-800 mt-2 mb-3">{product.title}</h1>
          <p className="text-cocoa-400 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display font-bold text-3xl text-cocoa-800">${product.price.toFixed(2)}</span>
            <span className="text-sm text-cocoa-300">MXN</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-mint-300"></span>
                <span className="text-sm font-medium text-cocoa-500">{product.stock} disponibles</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-blush-400"></span>
                <span className="text-sm font-medium text-blush-500">Agotado</span>
              </>
            )}
          </div>

          {/* Quantity + Add to cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-cocoa-600">Cantidad:</span>
                <div className="flex items-center border-2 border-cream-200 rounded-2xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-cocoa-400 hover:bg-cream-50 transition-colors font-bold">-</button>
                  <span className="px-4 py-2 font-bold text-cocoa-700 min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 text-cocoa-400 hover:bg-cream-50 transition-colors font-bold">+</button>
                </div>
              </div>

              <button
                onClick={addToCart}
                disabled={adding}
                className="w-full btn-cute bg-blush-400 text-white text-lg py-3.5 hover:bg-blush-500 disabled:opacity-50 shadow-glow"
              >
                {added ? 'Agregado al carrito! 💕' : adding ? 'Agregando...' : 'Agregar al carrito 🛒'}
              </button>
            </div>
          )}

          {/* Details */}
          <div className="mt-8 pt-6 border-t border-cream-200 space-y-3">
            <div className="flex items-center gap-2 text-sm text-cocoa-400">
              <span>🧶</span> Hecho a mano con materiales premium
            </div>
            <div className="flex items-center gap-2 text-sm text-cocoa-400">
              <span>💝</span> Cada pieza es unica y especial
            </div>
            <div className="flex items-center gap-2 text-sm text-cocoa-400">
              <span>📦</span> Envio cuidadoso y protegido
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
