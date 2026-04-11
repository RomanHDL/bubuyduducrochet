'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AnimatedBg from '@/components/AnimatedBg';

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
  const [featPage, setFeatPage] = useState(0);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ slug: '', name: '', emoji: '🧸', color: 'bg-blush-50 border-blush-200' });

  // Load categories from DB
  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(setDbCategories).catch(() => {}); }, []);

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

  // Price range filter
  const priceFiltered = products.filter(p => {
    if (priceMin && p.price < Number(priceMin)) return false;
    if (priceMax && p.price > Number(priceMax)) return false;
    return true;
  });
  const sorted = [...priceFiltered].sort((a, b) => { if (sort === 'price-low') return a.price - b.price; if (sort === 'price-high') return b.price - a.price; if (sort === 'name') return a.title.localeCompare(b.title); if (sort === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); return 0; });
  const allFeat = sorted.filter(p => p.featured);
  const featStart = (featPage * 5) % Math.max(allFeat.length, 1);
  const feat = allFeat.length > 5 ? [...allFeat, ...allFeat].slice(featStart, featStart + 5) : allFeat;

  // Auto-rotate featured every 6 seconds
  useEffect(() => {
    if (allFeat.length <= 5) return;
    const timer = setInterval(() => setFeatPage(p => p + 1), 6000);
    return () => clearInterval(timer);
  }, [allFeat.length]);

  return (
    <AnimatedBg theme="peach">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
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
      <div className="mb-12 space-y-5">
        {/* Categories — dynamic from DB */}
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => setCat('')} className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${cat === '' ? 'bg-blush-400 text-white shadow-glow scale-105' : 'bg-white text-cocoa-500 border border-cream-200 hover:border-blush-200 hover:text-blush-400'}`}>✨ Todos</button>
          {dbCategories.map(c => (
            <button key={c.slug} onClick={() => setCat(c.slug)} className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${cat === c.slug ? 'bg-blush-400 text-white shadow-glow scale-105' : 'bg-white text-cocoa-500 border border-cream-200 hover:border-blush-200 hover:text-blush-400'}`}>
              {c.emoji} {c.name}
            </button>
          ))}
          {isAdmin && (
            <button onClick={() => setShowCatModal(true)} className="px-3 py-2.5 rounded-full text-sm font-semibold bg-lavender-50 text-lavender-400 border border-lavender-200 hover:bg-lavender-100 transition-all">➕</button>
          )}
        </div>

        {/* Search + Sort row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search — centered */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar amigurumis, accesorios..." className="input-cute pl-11 text-sm" />
            {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-300 hover:text-blush-400">✕</button>}
          </div>

          {/* Sort & Filter button */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setShowFilters(!showFilters)} className="btn-cute bg-white text-cocoa-600 border-2 border-cream-200 text-sm px-5 py-2.5 hover:border-blush-200 flex items-center gap-2">
              🔽 Ordenar y filtrar
              {(sort !== 'recent' || priceMin || priceMax) && <span className="w-2 h-2 rounded-full bg-blush-400" />}
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-cute shadow-warm border border-cream-200 p-4 z-30">
                <h4 className="text-xs font-bold text-cocoa-600 mb-3">Ordenar por</h4>
                <div className="space-y-1 mb-4">
                  {[
                    { value: 'recent', label: 'Mas recientes', icon: '🕐' },
                    { value: 'price-low', label: 'Menor precio', icon: '💰' },
                    { value: 'price-high', label: 'Mayor precio', icon: '💎' },
                    { value: 'name', label: 'Nombre A-Z', icon: '🔤' },
                    { value: 'featured', label: 'Destacados primero', icon: '⭐' },
                  ].map(o => (
                    <button key={o.value} onClick={() => setSort(o.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${sort === o.value ? 'bg-blush-50 text-blush-500 font-bold border border-blush-200' : 'text-cocoa-500 hover:bg-cream-50'}`}>
                      <span>{o.icon}</span> {o.label} {sort === o.value && <span className="ml-auto">✓</span>}
                    </button>
                  ))}
                </div>

                <h4 className="text-xs font-bold text-cocoa-600 mb-2">Rango de precio</h4>
                <div className="flex items-center gap-2 mb-4">
                  <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="$ Min" className="flex-1 px-2.5 py-2 rounded-lg border border-cream-200 bg-cream-50 text-xs text-cocoa-700 focus:outline-none focus:border-blush-300" />
                  <span className="text-cocoa-300 text-xs">—</span>
                  <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="$ Max" className="flex-1 px-2.5 py-2 rounded-lg border border-cream-200 bg-cream-50 text-xs text-cocoa-700 focus:outline-none focus:border-blush-300" />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setPriceMin(''); setPriceMax(''); setSort('recent'); setShowFilters(false); }} className="flex-1 py-2 rounded-xl border border-cream-200 text-xs font-semibold text-cocoa-400">Limpiar</button>
                  <button onClick={() => setShowFilters(false)} className="flex-1 py-2 rounded-xl bg-blush-400 text-white text-xs font-bold">Aplicar</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-cocoa-400 text-center">{loading ? '🔍 Buscando...' : `${sorted.length} producto${sorted.length !== 1 ? 's' : ''} encontrado${sorted.length !== 1 ? 's' : ''}`}</p>
      </div>

      {/* Admin: Category management modal — FULL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-20 overflow-y-auto">
          <div className="fixed inset-0 bg-cocoa-800/50 backdrop-blur-sm" onClick={() => setShowCatModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-bubble shadow-warm border border-cream-200 p-5 my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-cocoa-700">🏷️ Gestionar Categorias</h2>
              <button onClick={() => setShowCatModal(false)} className="w-7 h-7 rounded-full bg-cream-100 flex items-center justify-center text-cocoa-400 text-xs hover:bg-cream-200">✕</button>
            </div>

            {/* Existing categories — editable */}
            <div className="space-y-2 mb-5 max-h-48 overflow-y-auto">
              {dbCategories.map(c => (
                <div key={c._id} className="flex items-center gap-2 p-2.5 bg-cream-50 rounded-xl border border-cream-200 group">
                  <span className="text-xl">{c.emoji}</span>
                  <span className="flex-1 text-sm font-semibold text-cocoa-700">{c.name}</span>
                  <span className="text-[10px] text-cocoa-300 font-mono">{c.slug}</span>
                  <button onClick={async () => { if (!confirm(`Eliminar "${c.name}"?`)) return; await fetch(`/api/categories/${c._id}`, { method: 'DELETE' }); const r = await fetch('/api/categories'); setDbCategories(await r.json()); }}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm">✕</button>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-200 pt-4">
              <h3 className="text-xs font-bold text-cocoa-600 mb-3">➕ Agregar nueva</h3>
              <div className="space-y-2">
                <input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} placeholder="Nombre (ej: Bolsas)" className="input-cute text-sm py-2" />
                <input value={catForm.slug} onChange={e => setCatForm({...catForm, slug: e.target.value})} placeholder="Slug automatico" className="input-cute text-sm py-2 text-cocoa-300" readOnly />

                {/* Emoji picker */}
                <div>
                  <p className="text-xs font-semibold text-cocoa-600 mb-1.5">Emoji: <span className="text-xl ml-1">{catForm.emoji}</span></p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-cream-50 rounded-xl border border-cream-200">
                    {['🧸','🎀','🌸','👶','🧶','💕','🦋','✨','💝','🎁','👜','🧵','🪡','🧤','🧣','🎒','👗','👒','🧢','🪆','🎎','🐱','🐰','🦊','🐻','🐼','🦁','🐸','🐙','🐝','🐋','🦄','🌻','🌹','🌺','🌷','🍃','🌿','☁️','⭐','🌈','💜','💙','💚','💛','🧡','❤️','🤎','🖤','🤍','🔮','🎨','🎭','🎪','🎠','🏠','🏡','📱','💻','🎵','🎮','⚽','🏀','🎾','🎯','🧩','♟️','🎲','🃏','🪄','🔑','💍','👑','🎩','🕶️','🧳','🛍️','📦','📷','🔔','💡','📚','✏️','🖍️','🎈','🎊','🎉','🧁','🍰','🍭','🍬','🍩','🧇'].map(e => (
                      <button key={e} onClick={() => setCatForm({...catForm, emoji: e})} className={`text-xl p-1 rounded-lg hover:bg-blush-50 transition-colors ${catForm.emoji === e ? 'bg-blush-100 ring-2 ring-blush-300' : ''}`}>{e}</button>
                    ))}
                  </div>
                </div>

                <button onClick={async () => {
                  if (!catForm.name || !catForm.slug) return;
                  await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) });
                  setCatForm({ slug: '', name: '', emoji: '🧸', color: 'bg-blush-50 border-blush-200' });
                  const r = await fetch('/api/categories'); setDbCategories(await r.json());
                }} className="w-full btn-cute bg-blush-400 text-white py-2.5 text-sm hover:bg-blush-500">✨ Crear categoria</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2"><span className="text-lg">⭐</span><h2 className="font-display font-bold text-xl text-cocoa-700">Destacados</h2></div>
                {allFeat.length > 5 && (
                  <div className="flex gap-1.5">
                    {Array.from({ length: Math.ceil(allFeat.length / 5) }).map((_, i) => (
                      <button key={i} onClick={() => setFeatPage(i)} className={`w-2 h-2 rounded-full transition-all ${featPage % Math.ceil(allFeat.length / 5) === i ? 'bg-blush-400 w-5' : 'bg-cream-300'}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" key={featPage}>
                {feat.map((p, i) => <Card key={p._id + featPage} p={p} idx={i} favs={favs} toggleFav={toggleFav} isAdmin={isAdmin} onEdit={openEdit} onDel={doDelete} />)}
              </div>
            </div>
          )}
          {!search && !cat && <div className="flex items-center gap-2 mb-6"><span className="text-lg">🧶</span><h2 className="font-display font-bold text-xl text-cocoa-700">Todos los productos</h2></div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {sorted.map((p, i) => <Card key={p._id} p={p} idx={i} favs={favs} toggleFav={toggleFav} isAdmin={isAdmin} onEdit={openEdit} onDel={doDelete} />)}
          </div>
        </>
      )}

      {/* ═══ Modal ═══ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-20 overflow-y-auto">
          <div className="fixed inset-0 bg-cocoa-800/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-bubble shadow-warm border border-cream-200 p-5 my-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-cocoa-700">{editId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-cocoa-400 hover:bg-cream-200">✕</button>
            </div>
            {err && <div className="bg-blush-50 border border-blush-200 rounded-2xl px-4 py-3 text-sm text-blush-500 font-medium mb-4">⚠️ {err}</div>}
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-cocoa-600 mb-1">Titulo *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Osito Amigurumi..." className="input-cute text-sm py-2" /></div>
              <div><label className="block text-xs font-semibold text-cocoa-600 mb-1">Descripcion *</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Adorable osito tejido a mano..." rows={2} className="input-cute text-sm py-2 resize-none" /></div>
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
    </AnimatedBg>
  );
}

// ═══ Museum painting frames — 20 unique ornate styles ═══
const FRAMES = [
  { outer: '#D4A574', inner: '#C09460', accent: '#E8C9A0', deco: '🌸', shadow: 'rgba(212,165,116,0.4)' },
  { outer: '#B8860B', inner: '#DAA520', accent: '#FFD700', deco: '🦋', shadow: 'rgba(184,134,11,0.35)' },
  { outer: '#C9A0DC', inner: '#B088C9', accent: '#DCC0EE', deco: '💜', shadow: 'rgba(201,160,220,0.35)' },
  { outer: '#E8A0A0', inner: '#D48B8B', accent: '#F5C4C4', deco: '🌹', shadow: 'rgba(232,160,160,0.35)' },
  { outer: '#8FBC8F', inner: '#7AA87A', accent: '#B0D4B0', deco: '🌿', shadow: 'rgba(143,188,143,0.35)' },
  { outer: '#CD853F', inner: '#B8732E', accent: '#DEB887', deco: '🧸', shadow: 'rgba(205,133,63,0.4)' },
  { outer: '#BC8F8F', inner: '#A67B7B', accent: '#D4A8A8', deco: '🎀', shadow: 'rgba(188,143,143,0.35)' },
  { outer: '#87CEEB', inner: '#6BB5D6', accent: '#ADD8E6', deco: '✨', shadow: 'rgba(135,206,235,0.35)' },
  { outer: '#DDA0DD', inner: '#CC8FCC', accent: '#EEB8EE', deco: '🪻', shadow: 'rgba(221,160,221,0.35)' },
  { outer: '#F0C080', inner: '#E0A860', accent: '#FFD8A0', deco: '🌻', shadow: 'rgba(240,192,128,0.4)' },
  { outer: '#C0A0C0', inner: '#B090B0', accent: '#D8B8D8', deco: '💕', shadow: 'rgba(192,160,192,0.35)' },
  { outer: '#A0C8A0', inner: '#88B088', accent: '#B8D8B8', deco: '🍃', shadow: 'rgba(160,200,160,0.35)' },
  { outer: '#D4B896', inner: '#C0A47E', accent: '#E8D0B0', deco: '🐚', shadow: 'rgba(212,184,150,0.4)' },
  { outer: '#C8A2C8', inner: '#B890B8', accent: '#DDB8DD', deco: '🔮', shadow: 'rgba(200,162,200,0.35)' },
  { outer: '#E8B4B8', inner: '#D4A0A4', accent: '#F5CCD0', deco: '💖', shadow: 'rgba(232,180,184,0.35)' },
  { outer: '#A0B8D0', inner: '#88A0B8', accent: '#B8D0E8', deco: '🐋', shadow: 'rgba(160,184,208,0.35)' },
  { outer: '#D0A870', inner: '#BC9458', accent: '#E4C090', deco: '⭐', shadow: 'rgba(208,168,112,0.4)' },
  { outer: '#B0A0C8', inner: '#9888B0', accent: '#C8B8E0', deco: '🦄', shadow: 'rgba(176,160,200,0.35)' },
  { outer: '#C8B080', inner: '#B49868', accent: '#DCC898', deco: '🧶', shadow: 'rgba(200,176,128,0.4)' },
  { outer: '#E0A0B8', inner: '#CC88A0', accent: '#F0B8D0', deco: '🌈', shadow: 'rgba(224,160,184,0.35)' },
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

function Card({ p, idx = 0, favs, toggleFav, isAdmin, onEdit, onDel, big }: { p: Product; idx?: number; favs: string[]; toggleFav: (id: string, e: React.MouseEvent) => void; isAdmin: boolean; onEdit: (p: Product, e: React.MouseEvent) => void; onDel: (id: string, t: string, e: React.MouseEvent) => void; big?: boolean }) {
  const f = FRAMES[(hashId(p._id) + idx) % FRAMES.length];

  return (
    <div className="relative group" style={{ padding: '12px' }}>
      {/* Museum frame — multi-layered border like a real painting */}
      <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: f.outer, boxShadow: `8px 8px 24px ${f.shadow}, -2px -2px 8px rgba(255,255,255,0.3), inset 0 0 0 3px ${f.accent}, inset 0 0 0 7px ${f.inner}, inset 0 0 0 9px ${f.accent}` }} />

      {/* Corner ornaments — BIG emojis */}
      <span className="absolute -top-3 -right-3 z-20 text-3xl drop-shadow-lg group-hover:scale-[1.4] group-hover:rotate-12 transition-all duration-500 pointer-events-none">{f.deco}</span>
      <span className="absolute -bottom-3 -left-3 z-20 text-2xl drop-shadow-md opacity-60 group-hover:opacity-100 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 pointer-events-none">{f.deco}</span>

      {/* Inner mat — entire card is clickable */}
      <Link href={`/producto/${p._id}`} className="relative z-10 block m-[4px] bg-cream-50 rounded-lg overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 cursor-pointer" style={{ boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.06)' }}>

        {/* Fav */}
        <button onClick={e => toggleFav(p._id, e)} className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-soft ${favs.includes(p._id) ? 'bg-blush-100 scale-110' : 'bg-white/90 text-cocoa-300 hover:text-blush-400'}`}>{favs.includes(p._id) ? '❤️' : '🤍'}</button>

        {/* Admin */}
        {isAdmin && (
          <div className="absolute top-3 left-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={e => onEdit(p, e)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-sm shadow-soft hover:bg-lavender-100">✏️</button>
            <button onClick={e => onDel(p._id, p.title, e)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-sm shadow-soft hover:bg-blush-100">🗑️</button>
          </div>
        )}

        {/* Image — the "painting" */}
        <div className={`${big ? 'aspect-[4/5]' : 'aspect-square'} relative overflow-hidden`}>
          {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" /> : <div className="w-full h-full bg-gradient-to-br from-cream-100 to-blush-50 flex items-center justify-center"><span className="text-5xl opacity-20">🧸</span></div>}
          {p.featured && <span className="absolute bottom-2 left-2 bg-blush-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-soft animate-pulse">⭐ Destacado</span>}
          {p.stock <= 0 && <div className="absolute inset-0 bg-cocoa-800/40 flex items-center justify-center backdrop-blur-[2px]"><span className="bg-white/90 text-cocoa-700 font-bold px-4 py-2 rounded-full text-sm">Agotado</span></div>}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700 -translate-x-full" />
        </div>

        {/* Nameplate (like museum labels) */}
        <div className="p-3.5 bg-white border-t" style={{ borderColor: f.accent }}>
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: f.inner }}>{p.category}</span>
          <h3 className="font-display font-bold text-cocoa-700 mt-0.5 group-hover:text-blush-400 transition-colors line-clamp-1 text-sm">{p.title}</h3>
          {big && <p className="text-xs text-cocoa-400 mt-1 line-clamp-2">{p.description}</p>}
          <div className="flex items-center justify-between mt-2">
            <span className="font-display font-bold text-lg text-cocoa-700">${p.price}</span>
            <span className="text-[10px] text-cocoa-300 font-medium">{p.stock > 0 ? (p.stock <= 3 ? `Ultimos ${p.stock}!` : 'Disponible') : 'Agotado'}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
