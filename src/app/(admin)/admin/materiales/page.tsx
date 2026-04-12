'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'hilo', label: 'Hilo / Estambre', emoji: '🧶' },
  { value: 'agujas', label: 'Agujas / Ganchos', emoji: '🪡' },
  { value: 'relleno', label: 'Relleno', emoji: '☁️' },
  { value: 'ojos', label: 'Ojos de seguridad', emoji: '👀' },
  { value: 'marcadores', label: 'Marcadores', emoji: '📍' },
  { value: 'tijeras', label: 'Tijeras / Herramientas', emoji: '✂️' },
  { value: 'botones', label: 'Botones / Decoraciones', emoji: '🔘' },
  { value: 'cintas', label: 'Cintas / Listones', emoji: '🎀' },
  { value: 'fieltro', label: 'Fieltro / Tela', emoji: '🧵' },
  { value: 'pegamento', label: 'Pegamento / Adhesivos', emoji: '🧴' },
  { value: 'empaque', label: 'Empaque / Bolsas', emoji: '📦' },
  { value: 'etiquetas', label: 'Etiquetas', emoji: '🏷️' },
  { value: 'otro', label: 'Otro', emoji: '✨' },
];

const UNITS = ['piezas', 'madejas', 'metros', 'gramos', 'bolsas', 'paquetes', 'rollos', 'cajas'];

const EMPTY = { name: '', category: 'hilo', brand: '', color: '', quantity: 0, unit: 'piezas', minStock: 1, price: 0, notes: '' };

export default function MaterialesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchMaterials();
    const interval = setInterval(fetchMaterials, 3000);
    return () => clearInterval(interval);
  }, [session, status]);

  const fetchMaterials = async () => {
    try { const r = await fetch('/api/materials'); const d = await r.json(); setMaterials(Array.isArray(d) ? d : []); } catch {} finally { setLoading(false); }
  };

  const openNew = () => { setEditId(null); setForm({ ...EMPTY }); setModal(true); };
  const openEdit = (m: any) => { setEditId(m._id); setForm({ name: m.name, category: m.category, brand: m.brand || '', color: m.color || '', quantity: m.quantity, unit: m.unit, minStock: m.minStock, price: m.price || 0, notes: m.notes || '' }); setModal(true); };

  const doSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const url = editId ? `/api/materials/${editId}` : '/api/materials';
    await fetch(url, { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, quantity: Number(form.quantity), minStock: Number(form.minStock), price: Number(form.price) }) });
    setSaving(false); setModal(false); fetchMaterials();
  };

  const doDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar "${name}"?`)) return;
    await fetch(`/api/materials/${id}`, { method: 'DELETE' });
    fetchMaterials();
  };

  const quickUpdate = async (id: string, qty: number) => {
    await fetch(`/api/materials/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: Math.max(0, qty) }) });
    fetchMaterials();
  };

  if (status === 'loading' || loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🧶</span></div>;

  const filtered = materials.filter(m => {
    if (catFilter !== 'all' && m.category !== catFilter) return false;
    if (stockFilter === 'low' && m.quantity > m.minStock) return false;
    if (stockFilter === 'out' && m.quantity > 0) return false;
    if (stockFilter === 'ok' && m.quantity <= m.minStock) return false;
    if (search) { const q = search.toLowerCase(); return m.name.toLowerCase().includes(q) || m.brand?.toLowerCase().includes(q) || m.color?.toLowerCase().includes(q); }
    return true;
  });

  const totalValue = materials.reduce((s, m) => s + (m.price || 0) * m.quantity, 0);
  const lowStock = materials.filter(m => m.quantity > 0 && m.quantity <= m.minStock).length;
  const outOfStock = materials.filter(m => m.quantity <= 0).length;

  const getCat = (val: string) => CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Materiales 🧶</h1>
          <p className="text-cocoa-400 text-sm mt-1">{materials.length} materiales registrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openNew} className="btn-cute bg-blush-400 text-white text-sm px-5 py-2 hover:bg-blush-500">➕ Agregar material</button>
          <Link href="/admin" className="text-sm text-cocoa-400 hover:text-blush-400 self-center">← Panel</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-3 text-center"><p className="text-xl font-bold text-cocoa-700">{materials.length}</p><p className="text-[10px] text-cocoa-400">Total</p></div>
        <div className="bg-green-50 rounded-cute shadow-soft border border-green-200 p-3 text-center"><p className="text-xl font-bold text-green-700">{materials.filter(m => m.quantity > m.minStock).length}</p><p className="text-[10px] text-green-600">✅ En stock</p></div>
        <div className="bg-amber-50 rounded-cute shadow-soft border border-amber-200 p-3 text-center"><p className="text-xl font-bold text-amber-700">{lowStock}</p><p className="text-[10px] text-amber-600">⚠️ Poco stock</p></div>
        <div className="bg-red-50 rounded-cute shadow-soft border border-red-200 p-3 text-center"><p className="text-xl font-bold text-red-500">{outOfStock}</p><p className="text-[10px] text-red-400">❌ Agotados</p></div>
        <div className="bg-blush-50 rounded-cute shadow-soft border border-blush-200 p-3 text-center"><p className="text-xl font-bold text-blush-500">${totalValue.toFixed(0)}</p><p className="text-[10px] text-blush-400">💰 Valor total</p></div>
      </div>

      {/* Alerts */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {outOfStock > 0 && <div className="bg-red-50 border border-red-200 rounded-cute p-3 flex items-center gap-2 flex-1"><span>🚨</span><p className="text-xs font-bold text-red-600">{outOfStock} material{outOfStock !== 1 ? 'es' : ''} agotado{outOfStock !== 1 ? 's' : ''}</p></div>}
          {lowStock > 0 && <div className="bg-amber-50 border border-amber-200 rounded-cute p-3 flex items-center gap-2 flex-1"><span>⚠️</span><p className="text-xs font-bold text-amber-700">{lowStock} con poco stock</p></div>}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[180px]"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar material, marca, color..." className="input-cute pl-9 text-sm py-2" /></div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-cute text-sm py-2 w-auto">
          <option value="all">🏷️ Categoria</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>
        <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="input-cute text-sm py-2 w-auto">
          <option value="all">📊 Stock</option>
          <option value="ok">✅ En stock</option>
          <option value="low">⚠️ Poco stock</option>
          <option value="out">❌ Agotados</option>
        </select>
      </div>

      {/* Materials list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200">
          <span className="text-4xl block mb-3">🧶</span>
          <p className="text-cocoa-400 mb-4">{materials.length === 0 ? 'Aun no tienes materiales registrados' : 'No hay materiales con estos filtros'}</p>
          {materials.length === 0 && <button onClick={openNew} className="btn-cute bg-blush-400 text-white text-sm px-5 py-2 hover:bg-blush-500">➕ Agregar primer material</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => {
            const cat = getCat(m.category);
            const isLow = m.quantity > 0 && m.quantity <= m.minStock;
            const isOut = m.quantity <= 0;
            return (
              <div key={m._id} className={`bg-white rounded-cute shadow-soft border p-4 flex items-center gap-4 transition-all hover:shadow-warm ${isOut ? 'border-red-200 bg-red-50/30' : isLow ? 'border-amber-200 bg-amber-50/20' : 'border-cream-200'}`}>
                {/* Category emoji */}
                <div className="w-11 h-11 rounded-xl bg-cream-100 flex items-center justify-center text-xl flex-shrink-0">{cat.emoji}</div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-cocoa-700">{m.name}</p>
                    {m.brand && <span className="text-[10px] text-cocoa-400 bg-cream-100 px-2 py-0.5 rounded-full">{m.brand}</span>}
                    {m.color && <span className="text-[10px] text-cocoa-400">🎨 {m.color}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-cocoa-400">{cat.label}</span>
                    {m.price > 0 && <span className="text-[10px] text-cocoa-400">${m.price.toFixed(2)}/{m.unit}</span>}
                    {m.notes && <span className="text-[10px] text-cocoa-300 truncate max-w-[200px]">📝 {m.notes}</span>}
                  </div>
                </div>

                {/* Quick quantity controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => quickUpdate(m._id, m.quantity - 1)} className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-cocoa-400 hover:bg-cream-200 font-bold">-</button>
                  <div className={`min-w-[4rem] text-center px-2 py-1.5 rounded-lg font-bold text-sm ${isOut ? 'bg-red-100 text-red-600' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {m.quantity} <span className="text-[9px] font-normal">{m.unit}</span>
                  </div>
                  <button onClick={() => quickUpdate(m._id, m.quantity + 1)} className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-cocoa-400 hover:bg-cream-200 font-bold">+</button>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(m)} className="w-8 h-8 rounded-lg bg-lavender-50 flex items-center justify-center text-sm hover:bg-lavender-100 border border-lavender-200">✏️</button>
                  <button onClick={() => doDelete(m._id, m.name)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-sm hover:bg-red-100 border border-red-200">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Modal ═══ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-20 overflow-y-auto">
          <div className="fixed inset-0 bg-cocoa-800/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-bubble shadow-warm border border-cream-200 p-5 my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-cocoa-700">{editId ? '✏️ Editar Material' : '➕ Nuevo Material'}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-cocoa-400 hover:bg-cream-200">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-cocoa-600 mb-1 block">Nombre *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Estambre Cristal..." className="input-cute text-sm py-2" /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-cocoa-600 mb-1 block">Categoria</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-cute text-sm py-2">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-cocoa-600 mb-1 block">Marca</label><input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Cisne, Lily..." className="input-cute text-sm py-2" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-cocoa-600 mb-1 block">Color</label><input value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="Rosa, Azul..." className="input-cute text-sm py-2" /></div>
                <div><label className="text-xs font-bold text-cocoa-600 mb-1 block">Unidad</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="input-cute text-sm py-2">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-bold text-cocoa-600 mb-1 block">Cantidad</label><input type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} className="input-cute text-sm py-2" /></div>
                <div><label className="text-xs font-bold text-cocoa-600 mb-1 block">Stock min.</label><input type="number" min="0" value={form.minStock} onChange={e => setForm({...form, minStock: Number(e.target.value)})} className="input-cute text-sm py-2" /></div>
                <div><label className="text-xs font-bold text-cocoa-600 mb-1 block">Precio</label><input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="input-cute text-sm py-2" /></div>
              </div>

              <div><label className="text-xs font-bold text-cocoa-600 mb-1 block">Notas</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Notas opcionales..." className="input-cute text-sm py-2 resize-none" /></div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400">Cancelar</button>
                <button onClick={doSave} disabled={saving || !form.name.trim()} className="flex-1 btn-cute bg-blush-400 text-white py-2.5 text-sm hover:bg-blush-500 disabled:opacity-50">{saving ? '🧶...' : editId ? '💾 Guardar' : '✨ Crear'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
