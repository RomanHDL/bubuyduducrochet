'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Tab = 'testimonials' | 'products';

const FILTERS_KEY = 'admin:resenas:filters';
function readStoredFilters() {
  if (typeof window === 'undefined') return null;
  try { const v = localStorage.getItem(FILTERS_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const initialFilters = typeof window !== 'undefined' ? readStoredFilters() : null;
  const [tab, setTab] = useState<Tab>(initialFilters?.tab || 'testimonials');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>(initialFilters?.filter || 'all');

  // Persistir filtros
  useEffect(() => {
    try { localStorage.setItem(FILTERS_KEY, JSON.stringify({ tab, filter })); } catch {}
  }, [tab, filter]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [session, status]);

  const fetchAll = async () => {
    try {
      const [t, p, prods] = await Promise.all([
        fetch('/api/reviews').then(r => r.json()),
        fetch('/api/product-reviews?all=true').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
      ]);
      setTestimonials(Array.isArray(t) ? t : []);
      setProductReviews(Array.isArray(p) ? p : []);
      // Build product lookup by ID
      const map: Record<string, any> = {};
      (Array.isArray(prods) ? prods : []).forEach((prod: any) => { map[prod._id] = prod; });
      setProducts(map);
    } catch {} finally { setLoading(false); }
  };

  // Testimonial actions
  const approveTestimonial = async (id: string) => {
    await fetch(`/api/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: true }) });
    fetchAll();
  };
  const rejectTestimonial = async (id: string) => {
    await fetch(`/api/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: false }) });
    fetchAll();
  };
  const deleteTestimonial = async (id: string) => {
    if (!confirm('Eliminar esta reseña permanentemente?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  // Product review actions
  const deleteProductReview = async (id: string) => {
    if (!confirm('Eliminar esta reseña de producto permanentemente?')) return;
    await fetch(`/api/product-reviews/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  if (status === 'loading' || loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">⭐</span></div>;

  const pendingT = testimonials.filter(r => !r.isApproved);
  const approvedT = testimonials.filter(r => r.isApproved);
  const filteredT = filter === 'all' ? testimonials : filter === 'pending' ? pendingT : approvedT;
  const avgT = approvedT.length > 0 ? (approvedT.reduce((s: number, r: any) => s + (r.rating || 5), 0) / approvedT.length).toFixed(1) : '—';
  const avgP = productReviews.length > 0 ? (productReviews.reduce((s: number, r: any) => s + (r.rating || 5), 0) / productReviews.length).toFixed(1) : '—';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Reseñas ⭐</h1>
          <p className="text-cocoa-400 text-sm mt-1">{testimonials.length} testimonios · {productReviews.length} reseñas de productos</p>
        </div>
        <Link href="/admin" className="text-sm text-cocoa-400 hover:text-blush-400">← Panel admin</Link>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-3 text-center"><p className="text-xl font-bold text-cocoa-700">{testimonials.length + productReviews.length}</p><p className="text-[10px] text-cocoa-400">Total global</p></div>
        <div className="bg-green-50 rounded-cute shadow-soft border border-green-200 p-3 text-center"><p className="text-xl font-bold text-green-700">{approvedT.length}</p><p className="text-[10px] text-green-600">✅ Testimonios</p></div>
        <div className="bg-amber-50 rounded-cute shadow-soft border border-amber-200 p-3 text-center"><p className="text-xl font-bold text-amber-700">{pendingT.length}</p><p className="text-[10px] text-amber-600">⏳ Pendientes</p></div>
        <div className="bg-lavender-50 rounded-cute shadow-soft border border-lavender-200 p-3 text-center"><p className="text-xl font-bold text-lavender-500">{productReviews.length}</p><p className="text-[10px] text-lavender-400">📦 Productos</p></div>
        <div className="bg-blush-50 rounded-cute shadow-soft border border-blush-200 p-3 text-center"><p className="text-xl font-bold text-blush-500">{avgT}⭐</p><p className="text-[10px] text-blush-400">Promedio</p></div>
      </div>

      {/* Pending alert */}
      {pendingT.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-cute p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div><p className="font-bold text-amber-700 text-sm">{pendingT.length} testimonio{pendingT.length !== 1 ? 's' : ''} esperando aprobacion</p></div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('testimonials')} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'testimonials' ? 'bg-blush-400 text-white shadow-md' : 'bg-white text-cocoa-500 border border-cream-200 hover:border-blush-200'}`}>
          💬 Testimonios ({testimonials.length})
        </button>
        <button onClick={() => setTab('products')} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'products' ? 'bg-lavender-400 text-white shadow-md' : 'bg-white text-cocoa-500 border border-cream-200 hover:border-lavender-200'}`}>
          📦 Productos ({productReviews.length})
        </button>
      </div>

      {/* ═══ TESTIMONIALS TAB ═══ */}
      {tab === 'testimonials' && (
        <>
          <div className="flex gap-2 mb-4">
            {[
              { id: 'all' as const, label: `Todas (${testimonials.length})` },
              { id: 'pending' as const, label: `⏳ Pendientes (${pendingT.length})` },
              { id: 'approved' as const, label: `✅ Aprobadas (${approvedT.length})` },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f.id ? 'bg-blush-400 text-white' : 'bg-white text-cocoa-500 border border-cream-200'}`}>{f.label}</button>
            ))}
          </div>

          {filteredT.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-cute shadow-soft border border-cream-200"><span className="text-4xl block mb-3">💬</span><p className="text-cocoa-400">Sin testimonios con este filtro</p></div>
          ) : (
            <div className="space-y-3">
              {filteredT.map(r => (
                <div key={r._id} className={`bg-white rounded-cute shadow-soft border p-5 ${r.isApproved ? 'border-cream-200' : 'border-amber-200 bg-amber-50/20'}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-lavender-100 flex items-center justify-center text-xl flex-shrink-0">{r.emoji || '🧸'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-cocoa-700">{r.userName}</span>
                        <span className="text-xs text-cocoa-300">{r.userEmail}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.isApproved ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{r.isApproved ? '✅ Visible' : '⏳ Pendiente'}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= (r.rating || 5) ? '' : 'opacity-20'}`}>⭐</span>)}</div>
                      {r.text && r.text.trim().length > 0 ? (
                        <p className="text-sm text-cocoa-500 italic">"{r.text}"</p>
                      ) : (
                        <p className="text-xs italic text-cocoa-300">Calificación sin comentario</p>
                      )}
                      <p className="text-[10px] text-cocoa-300 mt-2">{new Date(r.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {!r.isApproved && <button onClick={() => approveTestimonial(r._id)} className="btn-cute bg-green-100 text-green-700 text-[11px] px-3 py-1.5 border border-green-200">✅ Aprobar</button>}
                      {r.isApproved && <button onClick={() => rejectTestimonial(r._id)} className="btn-cute bg-amber-50 text-amber-600 text-[11px] px-3 py-1.5 border border-amber-200">⏳ Ocultar</button>}
                      <button onClick={() => deleteTestimonial(r._id)} className="btn-cute bg-red-50 text-red-500 text-[11px] px-3 py-1.5 border border-red-200">🗑️ Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ PRODUCT REVIEWS TAB ═══ */}
      {tab === 'products' && (
        <>
          {productReviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-cute shadow-soft border border-cream-200"><span className="text-4xl block mb-3">📦</span><p className="text-cocoa-400">Sin reseñas de productos aun</p></div>
          ) : (
            <div className="space-y-3">
              {productReviews.map(r => {
                const prod = products[r.productId];
                return (
                <div key={r._id} className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
                  {/* Product info bar */}
                  <Link href={`/producto/${r.productId}`} className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-lavender-50 to-blush-50 rounded-xl border border-lavender-200 hover:shadow-soft transition-all group">
                    {prod?.images?.[0] ? (
                      <img src={prod.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover border border-cream-200 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-cream-100 flex items-center justify-center flex-shrink-0"><span>🧸</span></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-cocoa-700 group-hover:text-blush-400 transition-colors truncate">{prod?.title || 'Producto eliminado'}</p>
                      <p className="text-[10px] text-cocoa-400">{prod?.category || '—'} · ${prod?.price?.toFixed(2) || '0.00'} MXN</p>
                    </div>
                    <span className="text-xs text-lavender-400 font-bold group-hover:text-blush-400">Ver producto →</span>
                  </Link>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-blush-100 flex items-center justify-center text-sm font-bold text-blush-500 flex-shrink-0">{(r.userName || '?')[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-cocoa-700">{r.userName}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= r.rating ? '' : 'opacity-20'}`}>⭐</span>)}</div>
                      {r.text && r.text.trim().length > 0 ? (
                        <p className="text-sm text-cocoa-500 italic">"{r.text}"</p>
                      ) : (
                        <p className="text-xs italic text-cocoa-300">Calificación sin comentario</p>
                      )}
                      {r.images?.length > 0 && (
                        <div className="flex gap-2 mt-3">{r.images.map((img: string, i: number) => <img key={i} src={img} alt="" className="w-20 h-20 rounded-lg object-cover border border-cream-200" />)}</div>
                      )}
                      <p className="text-[10px] text-cocoa-300 mt-2">{new Date(r.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => deleteProductReview(r._id)} className="btn-cute bg-red-50 text-red-500 text-[11px] px-3 py-1.5 border border-red-200 flex-shrink-0">🗑️ Eliminar</button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
