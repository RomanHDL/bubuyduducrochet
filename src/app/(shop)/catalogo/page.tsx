'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Product {
  _id: string; title: string; description: string; price: number; images: string[]; stock: number; category: string; featured: boolean;
}

const EMPTY: Omit<Product, '_id'> = { title: '', description: '', price: 0, images: [''], stock: 1, category: 'amigurumis', featured: false };

export default function Wrapper() {
  return <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🧶</span></div>}><Content /></Suspense>;
}

const CATS = [
  { value: '', label: 'Todos', emoji: '✨' }, { value: 'amigurumis', label: 'Amigurumis', emoji: '🧸' },
  { value: 'accesorios', label: 'Accesorios', emoji: '🎀' }, { value: 'decoracion', label: 'Decoracion', emoji: '🌸' },
  { value: 'ropa-bebe', label: 'Ropa Bebe', emoji: '👶' },
];

const SORTS = [
  { value: 'recent', label: 'Recientes' }, { value: 'price-low', label: 'Menor precio' },
  { value: 'price-high', label: 'Mayor precio' }, { value: 'name', label: 'A-Z' },
];

function Content() {
  const sp = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState(sp.get('category') || '');
  const [sort, setSort] = useState('recent');
  const [favs, setFavs] = useState<string[]>([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { setFavs(JSON.parse(localStorage.getItem('bdcrochet_favs') || '[]')); }, []);

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    setFavs(next); localStorage.setItem('bdcrochet_favs', JSON.stringify(next));
  };

  const load = async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (cat) p.set('category', cat);
    if (search) p.set('search', search);
    try { const r = await fetch(`/api/products?${p}`); const d = await r.json(); setProducts(Array.isArray(d) ? d : []); }
    catch { setProducts([]); } finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [cat, search]);

  // Admin actions
  const openNew = () => { if (!session) { router.push('/login'); return; } setEditId(null); setForm({ ...EMPTY }); setErr(''); setModal(true); };
  const openEdit = (p: Product, e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setEditId(p._id); setForm({ title: p.title, description: p.description, price: p.price, images: p.images.length ? p.images : [''], stock: p.stock, category: p.category, featured: p.featured }); setErr(''); setModal(true); };
  const doDelete = async (id: string, t: string, e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (!confirm(`Eliminar "${t}"?`)) return; await fetch(`/api/products/${id}`, { method: 'DELETE' }); load(); };

  const doSave = async () => {
    if (!form.title.trim()) { setErr('Titulo requerido'); return; }
    if (form.price <= 0) { setErr('Precio debe ser mayor a 0'); return; }
    setSaving(true); setErr('');
    const body = { ...form, images: form.images.filter(u => u.trim()), price: Number(form.price), stock: Number(form.stock) };
    try {
      const url = editId ? `/api/products/${editId}` : '/api/products';
      const res = await fetch(url, { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const e = await res.json(); setErr(e.error || 'Error'); setSaving(false); return; }
      setModal(false); load();
    } catch { setErr('Error de conexion'); }
    setSaving(false);
  };

  const sorted = [...products].sort((a, b) => { if (sort === 'price-low') return a.price - b.price; if (sort === 'price-high') return b.price - a.price; if (sort === 'name') return a.title.localeCompare(b.title); return 0; });
  const feat = sorted.filter(p => p.featured).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blush-50 border border-blush-200 rounded-full px-4 py-1.5 mb-4">
          <span className="text-sm">🧶</span><span className="text-xs font-bold text-cocoa-500">{products.length} creaciones disponibles</span>
        </div>
        <h1 className="font-display font-bold text-4xl text-cocoa-700 mb-2">Nuestro Catalogo</h1>
        <p className="text-cocoa-400 max-w-md mx-auto">Cada pieza es unica, hecha a mano con los mejores materiales y todo nuestro carino</p>
        {isAdmin && (
          <button onClick={openNew} className="mt-5 btn-cute bg-lavender-400 text-white px-6 py-2.5 hover:bg-lavender-500 shadow-soft inline-flex items-center gap-2">➕ Agregar Producto</button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-10 space-y-5">
        <div className="relative max-w-lg mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar amigurumis, accesorios..." className="input-cute pl-11 text-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-300 hover:text-blush-400">✕</button>}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {CATS.map(c => <button key={c.value} onClick={() => setCat(c.value)} className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${cat === c.value ? 'bg-blush-400 text-white shadow-glow scale-105' : 'bg-white text-cocoa-500 border border-cream-200 hover:border-blush-200 hover:text-blush-400'}`}>{c.emoji} {c.label}</button>)}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-cocoa-400">{loading ? 'Buscando...' : `${sorted.length} producto${sorted.length !== 1 ? 's' : ''}`}</p>
          <select value={sort} onChange={e => setSort(e.target.value)} className="text-sm bg-cream-50 border border-cream-200 rounded-2xl px-3 py-2 text-cocoa-500 focus:outline-none focus:border-blush-300">
            {SORTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="rounded-cute overflow-hidden border border-cream-200"><div className="aspect-square bg-cream-100 animate-pulse" /><div className="p-4 space-y-2"><div className="h-3 bg-cream-200 rounded w-1/3 animate-pulse" /><div className="h-4 bg-cream-200 rounded w-3/4 animate-pulse" /><div className="h-5 bg-cream-200 rounded w-1/4 animate-pulse mt-2" /></div></div>)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🧸</span>
          <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">No encontramos productos</h3>
          <p className="text-cocoa-400 mb-6">Prueba con otra busqueda o categoria</p>
          <button onClick={() => { setSearch(''); setCat('') }} className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500">Ver todo 🧶</button>
        </div>
      ) : (
        <>
          {!search && !cat && feat.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-5"><span className="text-lg">⭐</span><h2 className="font-display font-bold text-xl text-cocoa-700">Destacados</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {feat.slice(0, 3).map(p => <Card key={p._id} p={p} favs={favs} toggleFav={toggleFav} isAdmin={isAdmin} onEdit={openEdit} onDel={doDelete} big />)}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {sorted.map(p => <Card key={p._id} p={p} favs={favs} toggleFav={toggleFav} isAdmin={isAdmin} onEdit={openEdit} onDel={doDelete} />)}
          </div>
        </>
      )}

      {/* ═══ Modal ═══ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-cocoa-800/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-bubble shadow-warm border border-cream-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-cocoa-700">{editId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-cocoa-400 hover:bg-cream-200">✕</button>
            </div>
            {err && <div className="bg-blush-50 border border-blush-200 rounded-2xl px-4 py-3 text-sm text-blush-500 font-medium mb-4">⚠️ {err}</div>}
            <div className="space-y-4">
              <div><label className="block text-sm font-semibold text-cocoa-600 mb-1">Titulo *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Osito Amigurumi..." className="input-cute" /></div>
              <div><label className="block text-sm font-semibold text-cocoa-600 mb-1">Descripcion *</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Adorable osito tejido a mano..." rows={3} className="input-cute resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-semibold text-cocoa-600 mb-1">Precio (MXN) *</label><input type="number" min="0" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="input-cute" /></div>
                <div><label className="block text-sm font-semibold text-cocoa-600 mb-1">Stock</label><input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} className="input-cute" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-cocoa-600 mb-1">Categoria</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-cute">{CATS.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}</select></div>
              <div>
                <label className="block text-sm font-semibold text-cocoa-600 mb-1">Imagenes (URLs)</label>
                {form.images.map((url, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={url} onChange={e => { const imgs = [...form.images]; imgs[i] = e.target.value; setForm({...form, images: imgs}); }} placeholder="https://i.pinimg.com/originals/..." className="input-cute text-xs flex-1" />
                    {form.images.length > 1 && <button onClick={() => setForm({...form, images: form.images.filter((_,j) => j !== i)})} className="text-blush-400 px-2">✕</button>}
                  </div>
                ))}
                <button onClick={() => setForm({...form, images: [...form.images, '']})} className="text-xs text-lavender-400 font-semibold">+ Agregar imagen</button>
              </div>
              {form.images[0]?.startsWith('http') && (
                <div className="rounded-cute overflow-hidden border border-cream-200 h-40"><img src={form.images[0]} alt="Preview" className="w-full h-full object-cover" onError={e => (e.target as HTMLImageElement).style.display = 'none'} /></div>
              )}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-cream-50 rounded-2xl border border-cream-200">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 rounded text-blush-400 border-cream-300 focus:ring-blush-200" />
                <div><span className="text-sm font-semibold text-cocoa-600">⭐ Producto destacado</span><p className="text-[11px] text-cocoa-400">Aparece en la seccion de destacados</p></div>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(false)} className="flex-1 py-3 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400 hover:border-blush-300 hover:text-blush-500 transition-all">Cancelar</button>
                <button onClick={doSave} disabled={saving} className="flex-1 btn-cute bg-blush-400 text-white py-3 hover:bg-blush-500 disabled:opacity-50">{saving ? '🧶 Guardando...' : editId ? '💾 Guardar' : '✨ Crear'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ p, favs, toggleFav, isAdmin, onEdit, onDel, big }: { p: Product; favs: string[]; toggleFav: (id: string, e: React.MouseEvent) => void; isAdmin: boolean; onEdit: (p: Product, e: React.MouseEvent) => void; onDel: (id: string, t: string, e: React.MouseEvent) => void; big?: boolean }) {
  return (
    <Link href={`/producto/${p._id}`} className="card-cute group relative">
      <button onClick={e => toggleFav(p._id, e)} className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-soft ${favs.includes(p._id) ? 'bg-blush-100 scale-110' : 'bg-white/80 text-cocoa-300 hover:text-blush-400'}`}>{favs.includes(p._id) ? '❤️' : '🤍'}</button>
      {isAdmin && (
        <div className="absolute top-3 left-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => onEdit(p, e)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-sm shadow-soft hover:bg-lavender-100" title="Editar">✏️</button>
          <button onClick={e => onDel(p._id, p.title, e)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-sm shadow-soft hover:bg-blush-100" title="Eliminar">🗑️</button>
        </div>
      )}
      <div className={`${big ? 'aspect-[4/5]' : 'aspect-square'} bg-gradient-to-br from-cream-100 to-blush-50 relative overflow-hidden`}>
        {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-6xl opacity-30">🧸</span></div>}
        {p.featured && <span className="absolute bottom-3 left-3 bg-blush-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-soft">⭐ Destacado</span>}
        {p.stock <= 0 && <div className="absolute inset-0 bg-cocoa-800/40 flex items-center justify-center backdrop-blur-[2px]"><span className="bg-white/90 text-cocoa-700 font-bold px-4 py-2 rounded-full text-sm">Agotado</span></div>}
      </div>
      <div className="p-4">
        <span className="text-[10px] font-bold text-blush-400 uppercase tracking-wider">{p.category}</span>
        <h3 className="font-display font-bold text-cocoa-700 mt-1 group-hover:text-blush-400 transition-colors line-clamp-1 text-sm">{p.title}</h3>
        {big && <p className="text-xs text-cocoa-400 mt-1 line-clamp-2">{p.description}</p>}
        <div className="flex items-center justify-between mt-2.5">
          <span className="font-display font-bold text-lg text-cocoa-700">${p.price}</span>
          <span className="text-[10px] text-cocoa-300 font-medium">{p.stock > 0 ? (p.stock <= 3 ? `Ultimos ${p.stock}!` : 'Disponible') : 'Agotado'}</span>
        </div>
      </div>
    </Link>
  );
}
