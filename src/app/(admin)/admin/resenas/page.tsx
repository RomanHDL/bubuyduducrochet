'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchReviews();
    const interval = setInterval(fetchReviews, 10000);
    return () => clearInterval(interval);
  }, [session, status]);

  const fetchReviews = async () => {
    try { const r = await fetch('/api/reviews'); const d = await r.json(); setReviews(Array.isArray(d) ? d : []); } catch {} finally { setLoading(false); }
  };

  const approve = async (id: string) => {
    await fetch(`/api/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: true }) });
    fetchReviews();
  };

  const reject = async (id: string) => {
    await fetch(`/api/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: false }) });
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Eliminar esta reseña permanentemente?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    fetchReviews();
  };

  if (status === 'loading' || loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">⭐</span></div>;

  const pending = reviews.filter(r => !r.isApproved);
  const approved = reviews.filter(r => r.isApproved);
  const filtered = filter === 'all' ? reviews : filter === 'pending' ? pending : approved;

  const avgRating = approved.length > 0 ? (approved.reduce((s: number, r: any) => s + (r.rating || 5), 0) / approved.length).toFixed(1) : '—';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Reseñas ⭐</h1>
          <p className="text-cocoa-400 text-sm mt-1">{reviews.length} reseñas totales · Promedio: {avgRating}⭐</p>
        </div>
        <Link href="/admin" className="text-sm text-cocoa-400 hover:text-blush-400">← Panel admin</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-4 text-center">
          <p className="text-2xl font-bold text-cocoa-700">{reviews.length}</p>
          <p className="text-xs text-cocoa-400">Total</p>
        </div>
        <div className="bg-green-50 rounded-cute shadow-soft border border-green-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{approved.length}</p>
          <p className="text-xs text-green-600">✅ Aprobadas</p>
        </div>
        <div className="bg-amber-50 rounded-cute shadow-soft border border-amber-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pending.length}</p>
          <p className="text-xs text-amber-600">⏳ Pendientes</p>
        </div>
        <div className="bg-blush-50 rounded-cute shadow-soft border border-blush-200 p-4 text-center">
          <p className="text-2xl font-bold text-blush-500">{avgRating}⭐</p>
          <p className="text-xs text-blush-400">Promedio</p>
        </div>
      </div>

      {/* Alert for pending */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-cute p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div><p className="font-bold text-amber-700 text-sm">{pending.length} reseña{pending.length !== 1 ? 's' : ''} esperando aprobacion</p><p className="text-xs text-amber-600">Revisa y aprueba o rechaza las reseñas pendientes</p></div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all' as const, label: `Todas (${reviews.length})` },
          { id: 'pending' as const, label: `⏳ Pendientes (${pending.length})` },
          { id: 'approved' as const, label: `✅ Aprobadas (${approved.length})` },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === f.id ? 'bg-blush-400 text-white' : 'bg-white text-cocoa-500 border border-cream-200 hover:border-blush-200'}`}>{f.label}</button>
        ))}
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200">
          <span className="text-4xl block mb-3">⭐</span>
          <p className="text-cocoa-400">No hay reseñas con este filtro</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => (
            <div key={review._id} className={`bg-white rounded-cute shadow-soft border p-5 transition-all ${review.isApproved ? 'border-cream-200' : 'border-amber-200 bg-amber-50/30'}`}>
              <div className="flex items-start gap-4">
                {/* Avatar / emoji */}
                <div className="w-12 h-12 rounded-full bg-lavender-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {review.emoji || '🧸'}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm text-cocoa-700">{review.userName}</span>
                    <span className="text-xs text-cocoa-300">{review.userEmail}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${review.isApproved ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                      {review.isApproved ? '✅ Aprobada' : '⏳ Pendiente'}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className={`text-sm ${s <= (review.rating || 5) ? 'text-amber-400' : 'text-cream-300'}`}>⭐</span>
                    ))}
                    <span className="text-xs text-cocoa-400 ml-1">{review.rating || 5}/5</span>
                  </div>

                  {/* Text */}
                  <p className="text-sm text-cocoa-500 leading-relaxed italic">"{review.text}"</p>

                  {/* Date */}
                  <p className="text-[10px] text-cocoa-300 mt-2">{new Date(review.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {!review.isApproved && (
                    <button onClick={() => approve(review._id)} className="btn-cute bg-green-100 text-green-700 text-[11px] px-3 py-1.5 border border-green-200 hover:bg-green-200">✅ Aprobar</button>
                  )}
                  {review.isApproved && (
                    <button onClick={() => reject(review._id)} className="btn-cute bg-amber-50 text-amber-600 text-[11px] px-3 py-1.5 border border-amber-200 hover:bg-amber-100">⏳ Quitar</button>
                  )}
                  <button onClick={() => deleteReview(review._id)} className="btn-cute bg-red-50 text-red-500 text-[11px] px-3 py-1.5 border border-red-200 hover:bg-red-100">🗑️ Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
