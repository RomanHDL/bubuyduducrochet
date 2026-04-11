'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const EMOJIS = ['🧸', '🐱', '🌸', '💕', '✨', '🎀', '📦', '🦋'];

export default function Testimonials() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [emoji, setEmoji] = useState('🧸');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ userName: '', text: '', rating: 5, emoji: '🧸', isApproved: true });

  const load = async () => {
    try { const r = await fetch('/api/reviews'); setReviews(await r.json()); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submitReview = async () => {
    if (!text.trim()) return;
    setSending(true);
    await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, rating, emoji }) });
    setSending(false); setSent(true); setText(''); setShowForm(false);
    setTimeout(() => setSent(false), 4000);
  };

  const doEdit = (r: any) => { setEditId(r._id); setEditForm({ userName: r.userName, text: r.text, rating: r.rating, emoji: r.emoji, isApproved: r.isApproved }); setEditModal(true); };
  const doDelete = async (id: string) => { if (!confirm('Eliminar resena?')) return; await fetch(`/api/reviews/${id}`, { method: 'DELETE' }); load(); };
  const doSaveEdit = async () => {
    if (!editId) return;
    await fetch(`/api/reviews/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
    setEditModal(false); load();
  };
  const toggleApprove = async (id: string, current: boolean) => {
    await fetch(`/api/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: !current }) });
    load();
  };

  const approved = reviews.filter((r: any) => r.isApproved);
  const pending = reviews.filter((r: any) => !r.isApproved);

  return (
    <section className="bg-gradient-to-r from-lavender-50 via-cream-50 to-blush-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Lo que dicen nuestras clientas 💕</h2>
          <p className="text-cocoa-400">Historias reales de quienes ya tienen su pieza</p>
          {isAdmin && pending.length > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full mt-3 border border-amber-200">⏳ {pending.length} resena{pending.length !== 1 ? 's' : ''} pendiente{pending.length !== 1 ? 's' : ''} de aprobar</p>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-40 bg-white/50 rounded-cute animate-pulse" />)}</div>
        ) : (
          <>
            {/* Approved reviews */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {approved.map((r: any) => (
                <div key={r._id} className="bg-white rounded-cute shadow-soft border border-cream-200 p-5 relative group">
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => doEdit(r)} className="w-7 h-7 rounded-full bg-cream-100 flex items-center justify-center text-xs hover:bg-lavender-100">✏️</button>
                      <button onClick={() => doDelete(r._id)} className="w-7 h-7 rounded-full bg-cream-100 flex items-center justify-center text-xs hover:bg-blush-100">🗑️</button>
                    </div>
                  )}
                  <div className="flex gap-0.5 mb-3">{Array.from({ length: r.rating }).map((_, j) => <span key={j} className="text-sm">⭐</span>)}</div>
                  <p className="text-sm text-cocoa-500 leading-relaxed mb-4 italic">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center gap-2 pt-3 border-t border-cream-100">
                    <span className="text-lg">{r.emoji}</span>
                    <span className="text-xs font-bold text-cocoa-600">{r.userName}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending (admin only) */}
            {isAdmin && pending.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-amber-600 mb-3">⏳ Pendientes de aprobacion</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pending.map((r: any) => (
                    <div key={r._id} className="bg-amber-50 rounded-cute border border-amber-200 p-5">
                      <div className="flex gap-0.5 mb-2">{Array.from({ length: r.rating }).map((_, j) => <span key={j} className="text-sm">⭐</span>)}</div>
                      <p className="text-sm text-cocoa-500 leading-relaxed mb-3 italic">&ldquo;{r.text}&rdquo;</p>
                      <p className="text-xs text-cocoa-400 mb-3">{r.emoji} {r.userName} · {r.userEmail}</p>
                      <div className="flex gap-2">
                        <button onClick={() => toggleApprove(r._id, r.isApproved)} className="btn-cute bg-green-500 text-white text-xs px-3 py-1.5 hover:bg-green-600">✅ Aprobar</button>
                        <button onClick={() => doDelete(r._id)} className="btn-cute bg-red-50 text-red-500 text-xs px-3 py-1.5 border border-red-200">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* User submit review */}
        <div className="text-center mt-8">
          {sent && <p className="text-sm text-green-600 font-semibold mb-3">✅ Gracias! Tu resena sera revisada y publicada pronto.</p>}
          {session && !showForm && !sent && (
            <button onClick={() => setShowForm(true)} className="btn-cute bg-white text-cocoa-600 px-6 py-2.5 border-2 border-cream-300 hover:border-blush-300 text-sm">
              ✍️ Dejar mi resena
            </button>
          )}
          {showForm && (
            <div className="max-w-md mx-auto bg-white rounded-cute shadow-warm border border-cream-200 p-6 text-left mt-4">
              <h3 className="font-display font-bold text-cocoa-700 mb-4">Tu resena 💕</h3>
              <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(i => <button key={i} onClick={() => setRating(i)} className={`text-xl ${i <= rating ? '' : 'opacity-30'}`}>⭐</button>)}</div>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Cuentanos tu experiencia..." className="input-cute text-sm resize-none mb-3" />
              <div className="flex gap-2 mb-4">{EMOJIS.map(e => <button key={e} onClick={() => setEmoji(e)} className={`text-xl p-1 rounded-lg ${emoji === e ? 'bg-blush-100 ring-2 ring-blush-300' : ''}`}>{e}</button>)}</div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400">Cancelar</button>
                <button onClick={submitReview} disabled={sending || !text.trim()} className="flex-1 btn-cute bg-blush-400 text-white py-2.5 text-sm hover:bg-blush-500 disabled:opacity-50">{sending ? '🧶...' : '✨ Enviar'}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin edit modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-cocoa-800/50 backdrop-blur-sm" onClick={() => setEditModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-bubble shadow-warm border border-cream-200 p-6">
            <h2 className="font-display font-bold text-lg text-cocoa-700 mb-4">✏️ Editar Resena</h2>
            <div className="space-y-3">
              <input value={editForm.userName} onChange={e => setEditForm({...editForm, userName: e.target.value})} className="input-cute text-sm" placeholder="Nombre" />
              <textarea value={editForm.text} onChange={e => setEditForm({...editForm, text: e.target.value})} rows={3} className="input-cute text-sm resize-none" />
              <div className="flex gap-1">{[1,2,3,4,5].map(i => <button key={i} onClick={() => setEditForm({...editForm, rating: i})} className={`text-xl ${i <= editForm.rating ? '' : 'opacity-30'}`}>⭐</button>)}</div>
              <div className="flex gap-2">{EMOJIS.map(e => <button key={e} onClick={() => setEditForm({...editForm, emoji: e})} className={`text-xl p-1 rounded-lg ${editForm.emoji === e ? 'bg-blush-100 ring-2 ring-blush-300' : ''}`}>{e}</button>)}</div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditModal(false)} className="flex-1 py-2.5 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400">Cancelar</button>
                <button onClick={doSaveEdit} className="flex-1 btn-cute bg-blush-400 text-white py-2.5 text-sm hover:bg-blush-500">💾 Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
