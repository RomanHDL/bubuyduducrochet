'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedBg from '@/components/AnimatedBg';

interface Product {
  _id: string; title: string; description: string; price: number; images: string[]; stock: number; category: string; featured: boolean;
}

// Same frame system as catalog
const FRAMES = [
  { outer: '#D4A574', inner: '#C09460', accent: '#E8C9A0', deco: '🌸' },
  { outer: '#B8860B', inner: '#DAA520', accent: '#FFD700', deco: '🦋' },
  { outer: '#C9A0DC', inner: '#B088C9', accent: '#DCC0EE', deco: '💜' },
  { outer: '#E8A0A0', inner: '#D48B8B', accent: '#F5C4C4', deco: '🌹' },
  { outer: '#8FBC8F', inner: '#7AA87A', accent: '#B0D4B0', deco: '🌿' },
  { outer: '#CD853F', inner: '#B8732E', accent: '#DEB887', deco: '🧸' },
  { outer: '#BC8F8F', inner: '#A67B7B', accent: '#D4A8A8', deco: '🎀' },
  { outer: '#87CEEB', inner: '#6BB5D6', accent: '#ADD8E6', deco: '✨' },
  { outer: '#DDA0DD', inner: '#CC8FCC', accent: '#EEB8EE', deco: '🪻' },
  { outer: '#F0C080', inner: '#E0A860', accent: '#FFD8A0', deco: '🌻' },
];
function hashId(id: string) { let h = 0; for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h); return Math.abs(h); }

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
      try { const res = await fetch(`/api/products/${id}`); if (!res.ok) throw new Error(); setProduct(await res.json()); }
      catch { setProduct(null); } finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!session) { router.push('/login'); return; }
    if (!product) return;
    setAdding(true);
    try {
      await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product._id, title: product.title, price: product.price, image: product.images?.[0] || '', quantity: qty }) });
      setAdded(true);
      setTimeout(() => router.push('/carrito'), 800);
    } catch {} finally { setAdding(false); }
  };

  if (loading) return <AnimatedBg theme="warm"><div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🧶</span></div></AnimatedBg>;

  if (!product) return (
    <AnimatedBg theme="warm">
      <div className="text-center py-20">
        <span className="text-5xl block mb-4">😢</span>
        <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Producto no encontrado</h2>
        <Link href="/catalogo" className="text-blush-400 font-semibold hover:text-blush-500">Volver al catalogo</Link>
      </div>
    </AnimatedBg>
  );

  const f = FRAMES[hashId(product._id) % FRAMES.length];

  return (
    <AnimatedBg theme="gold">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ═══ Breadcrumb — decorative ═══ */}
        <nav className="flex items-center gap-0 mb-8">
          <Link href="/" className="flex items-center gap-1.5 px-4 py-2 bg-white/70 backdrop-blur-sm border border-cream-200 rounded-l-full text-sm font-semibold text-cocoa-500 hover:text-blush-400 hover:bg-blush-50 transition-all shadow-soft">
            <span className="text-base">🏠</span> Inicio
          </Link>
          <Link href="/catalogo" className="flex items-center gap-1.5 px-4 py-2 bg-white/60 backdrop-blur-sm border-y border-cream-200 text-sm font-semibold text-cocoa-500 hover:text-blush-400 hover:bg-blush-50 transition-all shadow-soft">
            <span className="text-base">🧶</span> Catalogo
          </Link>
          <div className="flex items-center gap-1.5 px-4 py-2 bg-blush-50/80 backdrop-blur-sm border border-blush-200 rounded-r-full text-sm font-bold text-blush-500 shadow-soft">
            <span className="text-base">{f.deco}</span>
            <span className="truncate max-w-[200px]">{product.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

          {/* ═══ Image with museum frame ═══ */}
          <div>
            <div className="relative" style={{ padding: '14px' }}>
              {/* Frame layers */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: f.outer, boxShadow: `10px 10px 30px ${f.outer}50, -3px -3px 10px rgba(255,255,255,0.4), inset 0 0 0 4px ${f.accent}, inset 0 0 0 8px ${f.inner}, inset 0 0 0 10px ${f.accent}` }} />

              {/* Corner emojis */}
              <span className="absolute -top-3 -right-3 z-20 text-3xl drop-shadow-lg pointer-events-none">{f.deco}</span>
              <span className="absolute -bottom-3 -left-3 z-20 text-2xl drop-shadow-md opacity-60 pointer-events-none">{f.deco}</span>

              {/* Inner mat + image */}
              <div className="relative z-10 m-[5px] bg-cream-50 rounded-xl overflow-hidden" style={{ boxShadow: 'inset 0 3px 12px rgba(0,0,0,0.06)' }}>
                <div className="aspect-square">
                  {product.images?.[selectedImage] ? (
                    <img src={product.images[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream-100 to-blush-50"><span className="text-8xl opacity-20">🧸</span></div>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-5 px-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-3 transition-all shadow-soft ${selectedImage === i ? 'border-blush-400 shadow-warm scale-105' : 'border-cream-200 hover:border-blush-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ═══ Product info ═══ */}
          <div className="bg-white/70 backdrop-blur-sm rounded-cute border border-cream-200 shadow-warm p-6 md:p-8 self-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blush-50 border border-blush-200 rounded-full mb-4">
              <span className="text-sm">{f.deco}</span>
              <span className="text-xs font-bold text-blush-400 uppercase tracking-wider">{product.category}</span>
            </div>

            <h1 className="font-display font-bold text-3xl text-cocoa-800 mb-3">{product.title}</h1>
            <p className="text-cocoa-400 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-baseline gap-3 mb-6 p-4 bg-gradient-to-r from-cream-50 to-blush-50/50 rounded-2xl border border-cream-200">
              <span className="font-display font-bold text-4xl text-cocoa-800">${product.price.toFixed(2)}</span>
              <span className="text-sm text-cocoa-300 font-medium">MXN</span>
              {product.featured && <span className="ml-auto text-xs font-bold text-blush-400 bg-blush-50 px-2.5 py-1 rounded-full border border-blush-200">⭐ Destacado</span>}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <><span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span><span className="text-sm font-medium text-cocoa-500">{product.stock} disponibles</span></>
              ) : (
                <><span className="w-2.5 h-2.5 rounded-full bg-blush-400"></span><span className="text-sm font-medium text-blush-500">Agotado</span></>
              )}
            </div>

            {/* Quantity + Add to cart */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-cocoa-600">Cantidad:</span>
                  <div className="flex items-center border-2 border-cream-200 rounded-2xl overflow-hidden bg-white">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 text-cocoa-400 hover:bg-cream-50 transition-colors font-bold text-lg">-</button>
                    <span className="px-5 py-2.5 font-bold text-cocoa-700 min-w-[3.5rem] text-center text-lg">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-2.5 text-cocoa-400 hover:bg-cream-50 transition-colors font-bold text-lg">+</button>
                  </div>
                </div>

                <button onClick={addToCart} disabled={adding}
                  className="w-full btn-cute bg-blush-400 text-white text-lg py-4 hover:bg-blush-500 disabled:opacity-50 shadow-glow">
                  {added ? 'Agregado al carrito! 💕' : adding ? '🧶 Agregando...' : 'Agregar al carrito 🛒'}
                </button>

                <Link href="/carrito" className="block text-center text-sm text-cocoa-400 font-semibold hover:text-blush-400 transition-colors">
                  Ir al carrito →
                </Link>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-8 pt-6 border-t border-cream-200 space-y-3">
              {[
                { emoji: '🧶', text: 'Hecho a mano con materiales premium' },
                { emoji: '💝', text: 'Cada pieza es unica y especial' },
                { emoji: '📦', text: 'Envio cuidadoso y protegido' },
                { emoji: '🔄', text: 'Garantia de satisfaccion' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-cocoa-400 p-2 rounded-xl hover:bg-cream-50 transition-colors">
                  <span className="text-lg">{b.emoji}</span> {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Reviews section ═══ */}
        <ReviewSection productId={product._id} />
      </div>
    </AnimatedBg>
  );
}

// ─── Reviews Component ───
function ReviewSection({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [imgPreviews, setImgPreviews] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/product-reviews?productId=${productId}`).then(r => r.json()).then(setReviews).catch(() => {});
  }, [productId]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 3).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setImgPreviews(prev => [...prev, ev.target!.result as string].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImg = (idx: number) => setImgPreviews(prev => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    await fetch('/api/product-reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, text, rating, images: imgPreviews }) });
    setSending(false); setText(''); setImgPreviews([]); setShowForm(false);
    const r = await fetch(`/api/product-reviews?productId=${productId}`); setReviews(await r.json());
  };

  const avg = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-cute border border-cream-200 shadow-warm p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-cocoa-700">Resenas del producto ⭐</h2>
          <p className="text-sm text-cocoa-400 mt-1">{reviews.length} resena{reviews.length !== 1 ? 's' : ''} · Promedio {avg}/5</p>
        </div>
        {session && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-cute bg-blush-400 text-white text-sm px-5 py-2 hover:bg-blush-500">✍️ Escribir resena</button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="bg-cream-50 rounded-cute border border-cream-200 p-5 mb-6">
          <h3 className="font-semibold text-cocoa-700 mb-3">Tu resena</h3>
          <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(i => <button key={i} onClick={() => setRating(i)} className={`text-2xl ${i <= rating ? '' : 'opacity-25'}`}>⭐</button>)}</div>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Cuenta tu experiencia con este producto..." className="input-cute text-sm mb-3 resize-none" />

          {/* Image upload */}
          <div className="mb-3">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-dashed border-cream-300 rounded-2xl cursor-pointer hover:border-blush-300 transition-colors">
              <span className="text-lg">📷</span>
              <span className="text-xs font-semibold text-cocoa-400">Subir fotos (max 3)</span>
              <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
            </label>
            {imgPreviews.length > 0 && (
              <div className="flex gap-2 mt-2">
                {imgPreviews.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-cream-200" />
                    <button onClick={() => removeImg(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blush-400 text-white text-[10px] flex items-center justify-center shadow-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400">Cancelar</button>
            <button onClick={submit} disabled={sending || !text.trim()} className="flex-1 btn-cute bg-blush-400 text-white py-2.5 text-sm hover:bg-blush-500 disabled:opacity-50">{sending ? '🧶...' : '✨ Publicar'}</button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 && !showForm ? (
        <div className="text-center py-10">
          <span className="text-4xl block mb-3">💬</span>
          <p className="text-cocoa-400 text-sm">Aun no hay resenas. Se el primero en opinar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <div key={r._id} className="bg-white rounded-cute border border-cream-200 p-5 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center text-sm font-bold text-blush-500">{r.userName?.charAt(0)}</div>
                  <span className="font-semibold text-sm text-cocoa-700">{r.userName}</span>
                </div>
                <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <span key={j} className="text-xs">⭐</span>)}</div>
              </div>
              <p className="text-sm text-cocoa-500 leading-relaxed">{r.text}</p>
              {r.images?.length > 0 && (
                <div className="flex gap-2 mt-3">{r.images.map((img: string, i: number) => <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-cream-200" />)}</div>
              )}
              <p className="text-[10px] text-cocoa-300 mt-2">{new Date(r.createdAt).toLocaleDateString('es-MX')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
