'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const CATEGORY_OPTIONS = ['🧶 Productos', '📦 Envios', '💳 Pagos', '🔄 Devoluciones', '📱 General'];

export default function FAQPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ category: '🧶 Productos', question: '', answer: '', order: 0 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const r = await fetch('/api/faqs'); setFaqs(await r.json()); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditId(null); setForm({ category: '🧶 Productos', question: '', answer: '', order: 0 }); setModal(true); };
  const openEdit = (f: any) => { setEditId(f._id); setForm({ category: f.category, question: f.question, answer: f.answer, order: f.order || 0 }); setModal(true); };
  const doDelete = async (id: string) => { if (!confirm('Eliminar esta pregunta?')) return; await fetch(`/api/faqs/${id}`, { method: 'DELETE' }); load(); };
  const doSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    const url = editId ? `/api/faqs/${editId}` : '/api/faqs';
    await fetch(url, { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, isActive: true }) });
    setSaving(false); setModal(false); load();
  };

  // Group by category
  const grouped = faqs.reduce((acc: any, f: any) => { (acc[f.category] = acc[f.category] || []).push(f); return acc; }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-12">
        <span className="text-5xl block mb-3">❓</span>
        <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Preguntas Frecuentes</h1>
        <p className="text-cocoa-400">Resolvemos tus dudas sobre nuestras creaciones</p>
        {isAdmin && <button onClick={openNew} className="mt-4 btn-cute bg-lavender-400 text-white px-5 py-2 hover:bg-lavender-500 text-sm">➕ Agregar pregunta</button>}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-cream-100 rounded-cute animate-pulse" />)}</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]: [string, any]) => (
            <div key={cat}>
              <h2 className="font-display font-bold text-xl text-cocoa-700 mb-4">{cat}</h2>
              <div className="space-y-2">
                {items.map((faq: any) => {
                  const isOpen = openIdx === faq._id;
                  return (
                    <div key={faq._id} className="bg-white rounded-cute border border-cream-200 overflow-hidden shadow-soft">
                      <button onClick={() => setOpenIdx(isOpen ? null : faq._id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-cream-50 transition-colors">
                        <span className="font-semibold text-sm text-cocoa-700 pr-4 flex-1">{faq.question}</span>
                        <span className={`text-cocoa-300 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-cream-100">
                          <p className="text-sm text-cocoa-400 leading-relaxed pt-3">{faq.answer}</p>
                          {isAdmin && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-cream-100">
                              <button onClick={() => openEdit(faq)} className="text-xs font-semibold text-lavender-400 hover:text-lavender-500">✏️ Editar</button>
                              <button onClick={() => doDelete(faq._id)} className="text-xs font-semibold text-blush-400 hover:text-blush-500">🗑️ Eliminar</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center bg-gradient-to-r from-blush-100 to-lavender-100 rounded-bubble p-8 border border-blush-200">
        <h3 className="font-display font-bold text-xl text-cocoa-700 mb-2">Tienes otra duda? 🧸</h3>
        <p className="text-cocoa-400 text-sm mb-5">Estamos para ayudarte!</p>
        <Link href="/contacto" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500">Contactanos 💌</Link>
      </div>

      {/* Admin modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-cocoa-800/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-bubble shadow-warm border border-cream-200 p-6">
            <h2 className="font-display font-bold text-lg text-cocoa-700 mb-4">{editId ? '✏️ Editar' : '➕ Nueva'} Pregunta</h2>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-cocoa-600 mb-1 block">Categoria</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-cute text-sm">{CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-cocoa-600 mb-1 block">Pregunta</label><input value={form.question} onChange={e => setForm({...form, question: e.target.value})} className="input-cute text-sm" placeholder="Como puedo...?" /></div>
              <div><label className="text-xs font-semibold text-cocoa-600 mb-1 block">Respuesta</label><textarea value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} rows={3} className="input-cute text-sm resize-none" placeholder="La respuesta..." /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400">Cancelar</button>
                <button onClick={doSave} disabled={saving} className="flex-1 btn-cute bg-blush-400 text-white py-2.5 text-sm hover:bg-blush-500 disabled:opacity-50">{saving ? '🧶...' : editId ? '💾 Guardar' : '✨ Crear'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
