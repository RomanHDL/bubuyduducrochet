'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCached, setCached, invalidatePrefix, dedupedFetchJson } from '@/lib/fetchCache';
import ProductProcesoModal from '@/components/ProductProcesoModal';

const CATEGORIES = ['amigurumis', 'accesorios', 'decoracion', 'ropa-bebe', 'llaveros', 'otro'];

// Atajos de % de avance para las obras en proceso.
const PROGRESS_STEPS = [10, 30, 50, 75, 100];

const emptyProduct = { title: '', description: '', price: 0, images: [''], stock: 1, availability: 'disponible', category: 'amigurumis', isActive: true, featured: false, status: 'publicado', progress: 100 };

type InitialProps = { initialProducts?: any[] };

export default function AdminProductsPage(props: InitialProps = {}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🧸</span></div>}>
      <AdminProductsPageInner {...props} />
    </Suspense>
  );
}

function AdminProductsPageInner({ initialProducts }: InitialProps = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Prioridad: 1) initialProducts (SSR) 2) cache del cliente 3) vacio.
  // El SSR trae TODO (publicados + obras en proceso); separamos por `status`.
  const cachedInit = getCached<any[]>('/api/products');
  const seedAll = (initialProducts && initialProducts.length ? initialProducts : cachedInit) || [];
  const seedPublished = seedAll.filter((p) => p.status !== 'en_proceso');
  const seedWip = seedAll.filter((p) => p.status === 'en_proceso');
  if (initialProducts && initialProducts.length && !cachedInit) setCached('/api/products', seedPublished);
  const [products, setProducts] = useState<any[]>(seedPublished);
  const [wipProducts, setWipProducts] = useState<any[]>(seedWip);
  const [tab, setTab] = useState<'catalogo' | 'wip'>('catalogo');
  const [loading, setLoading] = useState(seedPublished.length === 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Modal del proceso de ELABORACION (materiales/medidas/patron) — componente
  // compartido `ProductProcesoModal`. OJO: esto es distinto de las "obras en
  // proceso" (pestaña wip). Aqui solo rastreamos que producto esta abierto.
  const [procesoModalOpen, setProcesoModalOpen] = useState(false);
  const [procesoProduct, setProcesoProduct] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchProducts();
    fetchWip();
  }, [session, status]);

  // Abrir modal de edición/proceso automáticamente si llega ?edit= o ?proceso=
  useEffect(() => {
    const all = [...products, ...wipProducts];
    if (!all.length) return;
    const editIdParam = searchParams?.get('edit');
    const procesoIdParam = searchParams?.get('proceso');
    const targetId = editIdParam || procesoIdParam;
    if (!targetId) return;
    const target = all.find((p) => p._id === targetId);
    if (!target) return;
    if (editIdParam) openEdit(target);
    else if (procesoIdParam) openProceso(target);
    // limpiar la URL para que el modal no se reabra al navegar atrás
    router.replace('/admin/productos');
  }, [products, wipProducts, searchParams]);

  // `silent = true` → no muestra el spinner de "loading" global (evita que la tabla se
  // desmonte y la pagina de un salto). Se usa despues de guardar/cambiar disponibilidad.
  const fetchProducts = async (silent = false) => {
    // Si hay cache, ya lo pintamos en useState — no queremos volver a loading.
    if (!silent && !getCached('/api/products')) setLoading(true);
    try {
      const data = await dedupedFetchJson<any[]>('/api/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  // Las obras en proceso viven con isActive:false, asi que el listado publico
  // (/api/products) NO las trae — vienen del scope admin dedicado.
  const fetchWip = async () => {
    try {
      const data = await dedupedFetchJson<any[]>('/api/products?scope=proceso');
      setWipProducts(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyProduct });
    setSaveError('');
    setModalOpen(true);
  };

  // Crear una "obra en proceso": nace oculta (isActive:false) con avance inicial.
  const openCreateWip = () => {
    setEditing(null);
    setForm({ ...emptyProduct, status: 'en_proceso', isActive: false, availability: 'por_pedido', stock: 0, progress: 10 });
    setSaveError('');
    setModalOpen(true);
  };

  const openEdit = async (p: any) => {
    // El listado trae solo la PRIMERA imagen (optimizacion de payload).
    // Para editar necesitamos TODAS las imagenes → traemos el producto completo.
    let full = p;
    try {
      const r = await fetch(`/api/products/${p._id}`, { cache: 'no-store' });
      if (r.ok) full = await r.json();
    } catch { /* usa lo que ya tenemos */ }
    setEditing(full);
    setForm({
      title: full.title,
      description: full.description,
      price: full.price,
      images: full.images?.length ? full.images : [''],
      stock: full.stock ?? 1,
      availability: full.availability || (full.stock > 0 ? 'disponible' : 'por_pedido'),
      category: full.category,
      isActive: full.isActive,
      featured: full.featured,
      status: full.status || 'publicado',
      progress: typeof full.progress === 'number' ? full.progress : 100,
    });
    setSaveError('');
    setModalOpen(true);
  };

  // Inserta/actualiza el producto guardado en la lista correcta (catalogo o wip)
  // segun su `status`, manteniendo el listado liviano (solo 1ª imagen).
  const upsertSaved = (saved: any, wasEditing: boolean) => {
    const listVersion = { ...saved, images: Array.isArray(saved.images) ? saved.images.slice(0, 1) : [] };
    const isWip = listVersion.status === 'en_proceso';
    const setter = isWip ? setWipProducts : setProducts;
    setter((prev: any[]) => {
      const exists = prev.some((x) => x._id === listVersion._id);
      const next = exists
        ? prev.map((x) => x._id === listVersion._id ? { ...x, ...listVersion } : x)
        : [listVersion, ...prev];
      if (!isWip) setCached('/api/products', next);
      return next;
    });
    // Si al editar el producto cambió de lista (no deberia pasar desde este
    // modal, pero por seguridad) lo quitamos de la otra.
    if (wasEditing) {
      const other = isWip ? setProducts : setWipProducts;
      other((prev: any[]) => prev.filter((x) => x._id !== listVersion._id));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const url = editing ? `/api/products/${editing._id}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';
      const body = {
        ...form,
        images: (form.images || []).filter((u: string) => u && u.trim()),
        // Una obra en proceso siempre queda oculta del catalogo.
        isActive: form.status === 'en_proceso' ? false : form.isActive,
      };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
      if (!res.ok) {
        let msg = `Error al guardar (HTTP ${res.status})`;
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        setSaveError(msg);
        return;
      }
      const saved = await res.json();
      // Actualizacion optimista: el admin ve el cambio INSTANTANEO sin refetch.
      upsertSaved(saved, !!editing);
      // Las variantes filtradas/por-query quedan stale → limpias para que al
      // abrir el catalogo publico vea el nuevo producto fresco.
      invalidatePrefix('/api/products');
      setModalOpen(false);
    } catch (err: any) {
      setSaveError('Error de conexion. Revisa tu internet e intenta de nuevo.');
    } finally { setSaving(false); }
  };

  // Subir al catalogo una obra en proceso (solo cuando esta al 100%).
  const publishToCatalog = async (p: any) => {
    if ((p.progress ?? 0) < 100 || publishingId) return;
    setPublishingId(p._id);
    try {
      const res = await fetch(`/api/products/${p._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'publicado', isActive: true, progress: 100 }),
        cache: 'no-store',
      });
      if (!res.ok) return;
      const saved = await res.json();
      const listVersion = { ...saved, images: Array.isArray(saved.images) ? saved.images.slice(0, 1) : [] };
      // Mueve de obras-en-proceso → catalogo.
      setWipProducts((prev) => prev.filter((x) => x._id !== p._id));
      setProducts((prev) => {
        const next = [listVersion, ...prev.filter((x) => x._id !== p._id)];
        setCached('/api/products', next);
        return next;
      });
      invalidatePrefix('/api/products');
      setTab('catalogo');
    } catch { /* noop — el boton se reactiva */ }
    finally { setPublishingId(null); }
  };

  const handleDelete = async (id: string) => {
    // Optimista: quita el producto ya de ambas listas; si falla, recargamos.
    const prevPub = products;
    const prevWip = wipProducts;
    setProducts((p) => p.filter((x) => x._id !== id));
    setWipProducts((p) => p.filter((x) => x._id !== id));
    setCached('/api/products', prevPub.filter((x) => x._id !== id));
    invalidatePrefix('/api/products');
    setDeleteConfirm(null);
    try {
      const r = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!r.ok) { setProducts(prevPub); setWipProducts(prevWip); setCached('/api/products', prevPub); }
    } catch { setProducts(prevPub); setWipProducts(prevWip); setCached('/api/products', prevPub); }
  };

  const addImageField = () => setForm({ ...form, images: [...form.images, ''] });
  const updateImage = (idx: number, val: string) => {
    const imgs = [...form.images];
    imgs[idx] = val;
    setForm({ ...form, images: imgs });
  };
  const removeImage = (idx: number) => {
    const imgs = form.images.filter((_: any, i: number) => i !== idx);
    setForm({ ...form, images: imgs.length ? imgs : [''] });
  };

  // Sube una foto: comprime en cliente (max 1280px, JPEG 85%) y la guarda como
  // data-URI via POST /api/upload — el mismo flujo de ProductEditModal.
  const uploadFile = async (idx: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) { setSaveError('Imagen muy grande (max 10MB)'); return; }
    setSaveError('');
    setUploadingIdx(idx);
    try {
      const compressed = await (async () => {
        if (file.size < 400 * 1024) return file;
        try {
          const bitmap = await createImageBitmap(file);
          const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
          const w = Math.round(bitmap.width * scale);
          const h = Math.round(bitmap.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return file;
          ctx.drawImage(bitmap, 0, 0, w, h);
          const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
          if (!blob) return file;
          return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
        } catch { return file; }
      })();
      const fd = new FormData();
      fd.append('file', compressed);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) updateImage(idx, data.url);
      else setSaveError(data.error || 'Error al subir');
    } catch (e: any) { setSaveError(e?.message || 'Error al subir imagen'); }
    finally { setUploadingIdx(null); }
  };

  // --- Elaboration Process handlers ---

  const openProceso = (p: any) => {
    setProcesoProduct(p);
    setProcesoModalOpen(true);
  };

  const closeProceso = () => {
    setProcesoModalOpen(false);
    setProcesoProduct(null);
  };

  const isWipForm = form.status === 'en_proceso';

  if (status === 'loading' || (status === 'authenticated' && (session?.user as any)?.role !== 'admin')) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Productos 🧸</h1>
          <p className="text-cocoa-400 mt-1">{products.length} en catálogo · {wipProducts.length} en proceso</p>
        </div>
        {tab === 'catalogo' ? (
          <button onClick={openCreate} className="btn-cute bg-blush-400 text-white hover:bg-blush-500">
            + Nuevo Producto
          </button>
        ) : (
          <button onClick={openCreateWip} className="btn-cute bg-lavender-400 text-white hover:bg-lavender-500">
            + Nueva obra en proceso
          </button>
        )}
      </div>

      {/* Tabs: Catálogo | En proceso */}
      <div className="inline-flex rounded-full bg-cream-100 p-1 mb-6">
        <button
          onClick={() => setTab('catalogo')}
          className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${tab === 'catalogo' ? 'bg-blush-400 text-white shadow-sm' : 'text-cocoa-500 hover:bg-cream-200'}`}
        >
          🛍️ Catálogo ({products.length})
        </button>
        <button
          onClick={() => setTab('wip')}
          className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${tab === 'wip' ? 'bg-lavender-400 text-white shadow-sm' : 'text-cocoa-500 hover:bg-cream-200'}`}
        >
          🧶 En proceso ({wipProducts.length})
        </button>
      </div>

      {tab === 'catalogo' ? (
        loading ? (
          <div className="text-center py-20"><span className="text-4xl animate-bounce">🧸</span></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200">
            <span className="text-5xl block mb-4">🧶</span>
            <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">Sin productos</h3>
            <p className="text-cocoa-400 mb-6">Crea tu primer producto para empezar a vender!</p>
            <button onClick={openCreate} className="btn-cute bg-blush-400 text-white hover:bg-blush-500">Crear Producto</button>
          </div>
        ) : (
          <div className="bg-white rounded-cute shadow-soft border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200">
                    <th className="text-left px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Producto</th>
                    <th className="text-left px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Categoria</th>
                    <th className="text-right px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Precio</th>
                    <th className="text-center px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Disponibilidad</th>
                    <th className="text-center px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Estado</th>
                    <th className="text-center px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b border-cream-100 hover:bg-cream-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cream-100 overflow-hidden flex-shrink-0">
                            {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🧸</div>}
                          </div>
                          <div>
                            <span className="font-semibold text-cocoa-700">{p.title}</span>
                            {p.featured && <span className="ml-2 text-xs bg-cream-200 text-cocoa-500 px-1.5 py-0.5 rounded-full">Destacado</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-cocoa-400">{p.category}</td>
                      <td className="px-4 py-3 text-right font-semibold text-cocoa-700">${p.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <AvailabilityToggle
                          product={p}
                          onPatch={(patch) => setProducts((prev) => prev.map((x) => x._id === p._id ? { ...x, ...patch } : x))}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.isActive ? 'bg-mint-100 text-green-700' : 'bg-cream-200 text-cocoa-400'}`}>
                          {p.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openEdit(p)}
                            title="Editar producto"
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-full bg-cream-100 text-cocoa-500 hover:bg-cream-200 transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => openProceso(p)}
                            title={p.elaboration ? 'Ya tiene proceso de elaboración (click para ver/editar)' : 'Este producto aún no tiene proceso (click para agregar)'}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-full border transition-colors ${p.elaboration ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}`}
                          >
                            📋 Proceso
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(p._id)}
                            title="Eliminar producto"
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* ===== Pestaña: Obras en proceso ===== */
        wipProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200">
            <span className="text-5xl block mb-4">🧶</span>
            <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">Sin obras en proceso</h3>
            <p className="text-cocoa-400 mb-6">Registra una pieza que estés tejiendo, súbele fotos del avance y publícala cuando llegue al 100%.</p>
            <button onClick={openCreateWip} className="btn-cute bg-lavender-400 text-white hover:bg-lavender-500">Nueva obra en proceso</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wipProducts.map((p) => {
              const prog = typeof p.progress === 'number' ? p.progress : 0;
              const done = prog >= 100;
              return (
                <div key={p._id} className="bg-white rounded-cute shadow-soft border border-cream-200 overflow-hidden flex flex-col">
                  <div className="h-40 bg-cream-100 overflow-hidden relative">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🧶</div>}
                    <span className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full bg-white/90 text-lavender-600 shadow-sm">{prog}%</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-cocoa-700 truncate">{p.title}</h3>
                    <p className="text-xs text-cocoa-400 mb-3">{p.category} · ${p.price?.toFixed(2)}</p>
                    {/* Barra de avance */}
                    <div className="mb-4">
                      <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${done ? 'bg-green-400' : 'bg-lavender-400'}`} style={{ width: `${prog}%` }} />
                      </div>
                    </div>
                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        onClick={() => publishToCatalog(p)}
                        disabled={!done || publishingId === p._id}
                        title={done ? 'Publicar en la tienda' : 'Llega al 100% para publicar'}
                        className={`btn-cute text-sm w-full ${done ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-cream-200 text-cocoa-400 cursor-not-allowed'} disabled:opacity-60`}
                      >
                        {publishingId === p._id ? 'Subiendo...' : '⬆️ Subir a catálogo'}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="flex-1 text-xs font-semibold px-2.5 py-2 rounded-full bg-cream-100 text-cocoa-500 hover:bg-cream-200 transition-colors">✏️ Editar</button>
                        <button onClick={() => setDeleteConfirm(p._id)} className="flex-1 text-xs font-semibold px-2.5 py-2 rounded-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors">🗑️ Eliminar</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-800/40 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-cute shadow-warm w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-bold text-xl text-cocoa-700 mb-4">
              {editing ? (isWipForm ? 'Editar obra en proceso' : 'Editar Producto') : (isWipForm ? 'Nueva obra en proceso' : 'Nuevo Producto')} {isWipForm ? '🧶' : '🧸'}
            </h2>

            {saveError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-cute text-red-600 text-sm font-semibold flex items-start gap-2">
                <span>⚠️</span>
                <span>{saveError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-cocoa-600 mb-1">Titulo *</label>
                <input className="input-cute" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nombre del producto" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cocoa-600 mb-1">Descripcion *</label>
                <textarea className="input-cute min-h-[80px] resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe tu creacion..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-cocoa-600 mb-1">Precio *</label>
                  <input className="input-cute" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-cocoa-600 mb-1">Disponibilidad</label>
                  <select
                    className="input-cute"
                    value={form.availability}
                    onChange={(e) => {
                      const availability = e.target.value as 'disponible' | 'por_pedido';
                      setForm({ ...form, availability, stock: availability === 'disponible' ? 1 : 0 });
                    }}
                  >
                    <option value="disponible">✅ Disponible</option>
                    <option value="por_pedido">📝 Por pedido</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-cocoa-600 mb-1">Categoria</label>
                <select className="input-cute" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* % de avance — solo para obras en proceso */}
              {isWipForm && (
                <div className="bg-lavender-50 border border-lavender-200 rounded-cute p-4">
                  <label className="block text-sm font-semibold text-cocoa-600 mb-2">🧶 Avance del tejido: <span className="text-lavender-600 font-bold">{form.progress}%</span></label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PROGRESS_STEPS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, progress: s })}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${form.progress === s ? 'bg-lavender-400 text-white shadow-sm' : 'bg-white text-cocoa-500 border border-lavender-200 hover:bg-lavender-100'}`}
                      >
                        {s}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="range" min={0} max={100} step={5}
                    value={form.progress}
                    onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                    className="w-full accent-lavender-400"
                  />
                  <div className="h-2 rounded-full bg-cream-200 overflow-hidden mt-2">
                    <div className={`h-full rounded-full transition-all ${form.progress >= 100 ? 'bg-green-400' : 'bg-lavender-400'}`} style={{ width: `${form.progress}%` }} />
                  </div>
                </div>
              )}

              {/* Images — URL, archivo o cámara */}
              <div>
                <label className="block text-sm font-semibold text-cocoa-600 mb-1">Fotos</label>
                {form.images.map((img: string, i: number) => (
                  <div key={i} className="mb-3">
                    <div className="flex gap-2 items-center">
                      <input className="input-cute flex-1 text-xs" value={img} onChange={(e) => updateImage(i, e.target.value)} placeholder="Pega una URL o usa 📷 / 📁" />
                      <label className="flex-shrink-0 cursor-pointer btn-cute bg-mint-100 text-green-700 px-2.5 py-2 text-xs font-bold hover:bg-mint-200 border border-green-200" title="Tomar foto con la cámara">
                        📷
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => { const input = e.currentTarget; const f = input.files?.[0]; if (f) await uploadFile(i, f); input.value = ''; }} />
                      </label>
                      <label className="flex-shrink-0 cursor-pointer btn-cute bg-lavender-100 text-lavender-600 px-2.5 py-2 text-xs font-bold hover:bg-lavender-200 border border-lavender-200" title="Subir desde el dispositivo">
                        📁
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const input = e.currentTarget; const f = input.files?.[0]; if (f) await uploadFile(i, f); input.value = ''; }} />
                      </label>
                      {form.images.length > 1 && (
                        <button onClick={() => removeImage(i)} className="text-blush-400 hover:text-blush-500 px-2 font-bold">x</button>
                      )}
                    </div>
                    {uploadingIdx === i && <p className="text-[11px] text-lavender-500 font-semibold mt-1">🧶 Subiendo foto...</p>}
                    {img && (img.startsWith('http') || img.startsWith('data:')) && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-cream-200 h-28 bg-cream-50">
                        <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={addImageField} className="text-xs font-semibold text-blush-400 hover:text-blush-500">+ Agregar otra foto</button>
              </div>

              {/* Activo/Destacado — solo para productos del catalogo (las obras en
                  proceso siempre quedan ocultas hasta publicarse). */}
              {!isWipForm && (
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-blush-400 w-4 h-4" />
                    <span className="text-sm font-medium text-cocoa-600">Activo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-blush-400 w-4 h-4" />
                    <span className="text-sm font-medium text-cocoa-600">Destacado</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-cream-200">
              <button onClick={() => setModalOpen(false)} className="btn-cute bg-cream-200 text-cocoa-600 hover:bg-cream-300">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.description} className="btn-cute bg-blush-400 text-white hover:bg-blush-500 disabled:opacity-50">
                {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : (isWipForm ? 'Guardar obra' : 'Crear Producto')} 💕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-800/40 backdrop-blur-sm p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-cute shadow-warm w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <span className="text-4xl block mb-3">😢</span>
            <h3 className="font-display font-bold text-lg text-cocoa-700 mb-2">Eliminar producto?</h3>
            <p className="text-sm text-cocoa-400 mb-6">Esta accion no se puede deshacer.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-cute bg-cream-200 text-cocoa-600 hover:bg-cream-300">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-cute bg-red-400 text-white hover:bg-red-500">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Elaboration Process Modal — componente compartido en src/components.
          Tambien se usa en /catalogo (CatalogClient) y /producto/[id] para
          que el modal se vea identico en los 3 lados. Cualquier cambio de
          UI/UX del proceso va alli, no aqui. */}
      {procesoModalOpen && procesoProduct && (
        <ProductProcesoModal
          product={procesoProduct}
          onClose={closeProceso}
          onSaved={(updated) => {
            // Patch local del producto en la lista correspondiente, sin refetch.
            const patch = (prev: any[]) => prev.map((x) => x._id === updated._id ? { ...x, ...updated } : x);
            setProducts(patch);
            setWipProducts(patch);
            setProcesoProduct((curr: any) => curr ? { ...curr, ...updated } : curr);
          }}
        />
      )}
    </div>
  );
}

// Toggle inline de disponibilidad (Disponible / Por pedido).
// - Cambio optimista inmediato; si falla el PUT, revierte y avisa.
// - NO refetchea la lista entera (antes eso causaba un "revert visual" de hasta
//   varios segundos cuando el refetch tardaba en regresar). En su lugar, hace
//   un patch local del producto en el estado del padre via onPatch().
// - Se sincroniza con el padre SOLO cuando el valor real del producto cambia
//   desde afuera (effect depende solo de `current`, no de `saving` — asi las
//   transiciones de saving no pisan el valor optimista del usuario).
function AvailabilityToggle({ product, onPatch }: { product: any; onPatch: (patch: { availability: 'disponible' | 'por_pedido'; stock: number }) => void }) {
  const current: 'disponible' | 'por_pedido' = product.availability || (product.stock > 0 ? 'disponible' : 'por_pedido');
  const [value, setValue] = useState<'disponible' | 'por_pedido'>(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Solo adopta el valor del padre si el valor REAL cambio (no en cada render,
  // ni cuando `saving` cambia). Esto elimina el flicker donde el toggle volvia
  // al valor anterior mientras el servidor respondia.
  useEffect(() => {
    setValue(current);
  }, [current]);

  const update = async (next: 'disponible' | 'por_pedido') => {
    if (next === value || saving) return;
    const prev = value;
    setValue(next); // optimista — se ve inmediatamente
    setSaving(true);
    setError('');
    const stock = next === 'disponible' ? Math.max(product.stock || 1, 1) : 0;
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: next, stock }),
        cache: 'no-store',
      });
      if (!res.ok) {
        setValue(prev);
        setError('No se pudo guardar');
        setTimeout(() => setError(''), 3000);
        return;
      }
      // Patch local en el padre: evita un refetch que podria traer datos
      // cacheados/viejos y "revertir" visualmente el cambio del usuario.
      onPatch({ availability: next, stock });
    } catch {
      setValue(prev);
      setError('Sin conexion');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="inline-flex rounded-full bg-cream-100 p-0.5" title="Cambiar disponibilidad">
        <button
          onClick={() => update('disponible')}
          disabled={saving}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${value === 'disponible' ? 'bg-green-500 text-white shadow-sm' : 'text-cocoa-500 hover:bg-cream-200'}`}
        >
          ✅ Disponible
        </button>
        <button
          onClick={() => update('por_pedido')}
          disabled={saving}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${value === 'por_pedido' ? 'bg-amber-500 text-white shadow-sm' : 'text-cocoa-500 hover:bg-cream-200'}`}
        >
          📝 Por pedido
        </button>
      </div>
      {error && <span className="text-[9px] text-red-500 font-semibold">⚠️ {error}</span>}
    </div>
  );
}
