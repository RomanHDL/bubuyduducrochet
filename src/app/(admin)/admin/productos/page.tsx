'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = ['amigurumis', 'accesorios', 'decoracion', 'ropa-bebe', 'llaveros', 'otro'];

const MATERIAL_TYPES = ['hilo', 'aguja', 'relleno', 'ojos de seguridad', 'alambre', 'fieltro', 'pegamento', 'otro'];
const MEASUREMENT_UNITS = ['cm', 'mm', 'pulgadas'];
const DIFFICULTY_OPTIONS = [
  { value: 'facil', label: 'Facil', emoji: '🟢' },
  { value: 'intermedio', label: 'Intermedio', emoji: '🟡' },
  { value: 'avanzado', label: 'Avanzado', emoji: '🔴' },
];

const emptyProduct = { title: '', description: '', price: 0, images: [''], stock: 1, availability: 'disponible', category: 'amigurumis', isActive: true, featured: false };

const emptyElaboration = {
  materials: [] as { name: string; type: string; quantity: string; notes: string }[],
  measurements: [] as { name: string; value: string; unit: string }[],
  patterns: [] as { name: string; imageUrl: string; description: string }[],
  instructions: '',
  difficulty: 'facil' as 'facil' | 'intermedio' | 'avanzado',
  estimatedTime: '',
};

const emptyMaterial = { name: '', type: 'hilo', quantity: '', notes: '' };
const emptyMeasurement = { name: '', value: '', unit: 'cm' };
const emptyPattern = { name: '', imageUrl: '', description: '' };

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🧸</span></div>}>
      <AdminProductsPageInner />
    </Suspense>
  );
}

function AdminProductsPageInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Elaboration Process state
  const [procesoModalOpen, setProcesoModalOpen] = useState(false);
  const [procesoProduct, setProcesoProduct] = useState<any>(null);
  const [elaboration, setElaboration] = useState<typeof emptyElaboration>({ ...emptyElaboration, materials: [], measurements: [], patterns: [] });
  const [savingProceso, setSavingProceso] = useState(false);
  const [procesoSuccess, setProcesoSuccess] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchProducts();
  }, [session, status]);

  // Abrir modal de edición/proceso automáticamente si llega ?edit= o ?proceso=
  useEffect(() => {
    if (!products.length) return;
    const editIdParam = searchParams?.get('edit');
    const procesoIdParam = searchParams?.get('proceso');
    const targetId = editIdParam || procesoIdParam;
    if (!targetId) return;
    const target = products.find((p) => p._id === targetId);
    if (!target) return;
    if (editIdParam) openEdit(target);
    else if (procesoIdParam) openProceso(target);
    // limpiar la URL para que el modal no se reabra al navegar atrás
    router.replace('/admin/productos');
  }, [products, searchParams]);

  // `silent = true` → no muestra el spinner de "loading" global (evita que la tabla se
  // desmonte y la pagina de un salto). Se usa despues de guardar/cambiar disponibilidad.
  const fetchProducts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { if (!silent) setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyProduct });
    setSaveError('');
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      images: p.images?.length ? p.images : [''],
      stock: p.stock ?? 1,
      availability: p.availability || (p.stock > 0 ? 'disponible' : 'por_pedido'),
      category: p.category,
      isActive: p.isActive,
      featured: p.featured,
    });
    setSaveError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const url = editing ? `/api/products/${editing._id}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';
      const body = { ...form, images: (form.images || []).filter((u: string) => u && u.trim()) };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
      if (!res.ok) {
        let msg = `Error al guardar (HTTP ${res.status})`;
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        setSaveError(msg);
        return;
      }
      setModalOpen(false);
      fetchProducts(true);
    } catch (err: any) {
      setSaveError('Error de conexion. Revisa tu internet e intenta de nuevo.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    fetchProducts(true);
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

  // --- Elaboration Process handlers ---

  const openProceso = (p: any) => {
    setProcesoProduct(p);
    setProcesoSuccess(false);
    if (p.elaboration) {
      setElaboration({
        materials: p.elaboration.materials?.length ? p.elaboration.materials.map((m: any) => ({ ...m })) : [],
        measurements: p.elaboration.measurements?.length ? p.elaboration.measurements.map((m: any) => ({ ...m })) : [],
        patterns: p.elaboration.patterns?.length ? p.elaboration.patterns.map((pt: any) => ({ ...pt })) : [],
        instructions: p.elaboration.instructions || '',
        difficulty: p.elaboration.difficulty || 'facil',
        estimatedTime: p.elaboration.estimatedTime || '',
      });
    } else {
      setElaboration({ ...emptyElaboration, materials: [], measurements: [], patterns: [] });
    }
    setProcesoModalOpen(true);
  };

  const closeProceso = () => {
    setProcesoModalOpen(false);
    setProcesoProduct(null);
    setProcesoSuccess(false);
  };

  const handleSaveProceso = async () => {
    if (!procesoProduct) return;
    setSavingProceso(true);
    setProcesoSuccess(false);
    try {
      await fetch(`/api/products/${procesoProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elaboration }),
      });
      setProcesoSuccess(true);
      fetchProducts(true);
      setTimeout(() => setProcesoSuccess(false), 3000);
    } catch { /* silent */ }
    finally { setSavingProceso(false); }
  };

  // Materials
  const addMaterial = () => setElaboration({ ...elaboration, materials: [...elaboration.materials, { ...emptyMaterial }] });
  const updateMaterial = (idx: number, field: string, value: string) => {
    const mats = elaboration.materials.map((m, i) => i === idx ? { ...m, [field]: value } : m);
    setElaboration({ ...elaboration, materials: mats });
  };
  const removeMaterial = (idx: number) => {
    setElaboration({ ...elaboration, materials: elaboration.materials.filter((_, i) => i !== idx) });
  };

  // Measurements
  const addMeasurement = () => setElaboration({ ...elaboration, measurements: [...elaboration.measurements, { ...emptyMeasurement }] });
  const updateMeasurement = (idx: number, field: string, value: string) => {
    const ms = elaboration.measurements.map((m, i) => i === idx ? { ...m, [field]: value } : m);
    setElaboration({ ...elaboration, measurements: ms });
  };
  const removeMeasurement = (idx: number) => {
    setElaboration({ ...elaboration, measurements: elaboration.measurements.filter((_, i) => i !== idx) });
  };

  // Patterns
  const addPattern = () => setElaboration({ ...elaboration, patterns: [...elaboration.patterns, { ...emptyPattern }] });
  const updatePattern = (idx: number, field: string, value: string) => {
    const ps = elaboration.patterns.map((p, i) => i === idx ? { ...p, [field]: value } : p);
    setElaboration({ ...elaboration, patterns: ps });
  };
  const removePattern = (idx: number) => {
    setElaboration({ ...elaboration, patterns: elaboration.patterns.filter((_, i) => i !== idx) });
  };

  if (status === 'loading' || (status === 'authenticated' && (session?.user as any)?.role !== 'admin')) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Productos 🧸</h1>
          <p className="text-cocoa-400 mt-1">{products.length} productos registrados</p>
        </div>
        <button onClick={openCreate} className="btn-cute bg-blush-400 text-white hover:bg-blush-500">
          + Nuevo Producto
        </button>
      </div>

      {loading ? (
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
                      <AvailabilityToggle product={p} onChanged={(silent) => fetchProducts(silent ?? true)} />
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
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-800/40 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-cute shadow-warm w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-bold text-xl text-cocoa-700 mb-4">
              {editing ? 'Editar Producto' : 'Nuevo Producto'} 🧸
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

              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-cocoa-600 mb-1">Imagenes (URLs)</label>
                {form.images.map((img: string, i: number) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="input-cute flex-1" value={img} onChange={(e) => updateImage(i, e.target.value)} placeholder="https://..." />
                    {form.images.length > 1 && (
                      <button onClick={() => removeImage(i)} className="text-blush-400 hover:text-blush-500 px-2 font-bold">x</button>
                    )}
                  </div>
                ))}
                <button onClick={addImageField} className="text-xs font-semibold text-blush-400 hover:text-blush-500">+ Agregar imagen</button>
              </div>

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
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-cream-200">
              <button onClick={() => setModalOpen(false)} className="btn-cute bg-cream-200 text-cocoa-600 hover:bg-cream-300">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.description} className="btn-cute bg-blush-400 text-white hover:bg-blush-500 disabled:opacity-50">
                {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Producto'} 💕
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

      {/* Elaboration Process Modal */}
      {procesoModalOpen && procesoProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-800/40 backdrop-blur-sm p-4" onClick={closeProceso}>
          <div className="bg-white rounded-cute shadow-warm w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cream-100 overflow-hidden flex-shrink-0">
                {procesoProduct.images?.[0]
                  ? <img src={procesoProduct.images[0]} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">🧸</div>
                }
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-cocoa-700">Proceso de Elaboracion 🧶</h2>
                <p className="text-sm text-cocoa-400">{procesoProduct.title}</p>
              </div>
            </div>

            {/* Success banner */}
            {procesoSuccess && (
              <div className="mb-4 px-4 py-3 bg-mint-100 border border-green-200 rounded-cute text-green-700 text-sm font-semibold flex items-center gap-2">
                <span>✅</span> Proceso de elaboracion guardado exitosamente!
              </div>
            )}

            <div className="space-y-6">

              {/* Difficulty & Estimated Time */}
              <div className="bg-cream-50 rounded-cute p-4 border border-cream-200">
                <h3 className="font-display font-bold text-sm text-cocoa-600 mb-3 uppercase tracking-wider">Informacion General</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-cocoa-600 mb-2">Dificultad</label>
                    <div className="flex gap-2">
                      {DIFFICULTY_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-cute border-2 cursor-pointer transition-all text-sm font-semibold ${
                            elaboration.difficulty === opt.value
                              ? 'border-blush-400 bg-blush-50 text-blush-600'
                              : 'border-cream-200 bg-white text-cocoa-400 hover:border-cream-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="difficulty"
                            value={opt.value}
                            checked={elaboration.difficulty === opt.value}
                            onChange={(e) => setElaboration({ ...elaboration, difficulty: e.target.value as any })}
                            className="sr-only"
                          />
                          <span>{opt.emoji}</span>
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-cocoa-600 mb-2">Tiempo Estimado</label>
                    <input
                      className="input-cute"
                      value={elaboration.estimatedTime}
                      onChange={(e) => setElaboration({ ...elaboration, estimatedTime: e.target.value })}
                      placeholder="Ej: 3 horas, 2 dias"
                    />
                  </div>
                </div>
              </div>

              {/* Materials Section */}
              <div className="bg-cream-50 rounded-cute p-4 border border-cream-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-sm text-cocoa-600 uppercase tracking-wider">🧵 Materiales</h3>
                  <button onClick={addMaterial} className="text-xs font-semibold text-blush-400 hover:text-blush-500 transition-colors">+ Agregar material</button>
                </div>
                {elaboration.materials.length === 0 ? (
                  <p className="text-sm text-cocoa-300 text-center py-3">Sin materiales. Agrega uno para empezar.</p>
                ) : (
                  <div className="space-y-3">
                    {elaboration.materials.map((mat, idx) => (
                      <div key={idx} className="bg-white rounded-cute p-3 border border-cream-200 relative">
                        <button
                          onClick={() => removeMaterial(idx)}
                          className="absolute top-2 right-2 text-cocoa-300 hover:text-red-400 transition-colors text-xs font-bold"
                          title="Eliminar material"
                        >
                          ✕
                        </button>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-cocoa-500 mb-1">Nombre</label>
                            <input
                              className="input-cute text-sm"
                              value={mat.name}
                              onChange={(e) => updateMaterial(idx, 'name', e.target.value)}
                              placeholder="Ej: Hilo rosa"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-cocoa-500 mb-1">Tipo</label>
                            <select
                              className="input-cute text-sm"
                              value={mat.type}
                              onChange={(e) => updateMaterial(idx, 'type', e.target.value)}
                            >
                              {MATERIAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-cocoa-500 mb-1">Cantidad</label>
                            <input
                              className="input-cute text-sm"
                              value={mat.quantity}
                              onChange={(e) => updateMaterial(idx, 'quantity', e.target.value)}
                              placeholder="Ej: 100g"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-cocoa-500 mb-1">Notas</label>
                            <input
                              className="input-cute text-sm"
                              value={mat.notes}
                              onChange={(e) => updateMaterial(idx, 'notes', e.target.value)}
                              placeholder="Opcional"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Measurements Section */}
              <div className="bg-cream-50 rounded-cute p-4 border border-cream-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-sm text-cocoa-600 uppercase tracking-wider">📏 Medidas</h3>
                  <button onClick={addMeasurement} className="text-xs font-semibold text-blush-400 hover:text-blush-500 transition-colors">+ Agregar medida</button>
                </div>
                {elaboration.measurements.length === 0 ? (
                  <p className="text-sm text-cocoa-300 text-center py-3">Sin medidas. Agrega una para empezar.</p>
                ) : (
                  <div className="space-y-3">
                    {elaboration.measurements.map((meas, idx) => (
                      <div key={idx} className="bg-white rounded-cute p-3 border border-cream-200 relative">
                        <button
                          onClick={() => removeMeasurement(idx)}
                          className="absolute top-2 right-2 text-cocoa-300 hover:text-red-400 transition-colors text-xs font-bold"
                          title="Eliminar medida"
                        >
                          ✕
                        </button>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-cocoa-500 mb-1">Nombre</label>
                            <input
                              className="input-cute text-sm"
                              value={meas.name}
                              onChange={(e) => updateMeasurement(idx, 'name', e.target.value)}
                              placeholder="Ej: Alto"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-cocoa-500 mb-1">Valor</label>
                            <input
                              className="input-cute text-sm"
                              value={meas.value}
                              onChange={(e) => updateMeasurement(idx, 'value', e.target.value)}
                              placeholder="Ej: 15"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-cocoa-500 mb-1">Unidad</label>
                            <select
                              className="input-cute text-sm"
                              value={meas.unit}
                              onChange={(e) => updateMeasurement(idx, 'unit', e.target.value)}
                            >
                              {MEASUREMENT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Patterns Section */}
              <div className="bg-cream-50 rounded-cute p-4 border border-cream-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-sm text-cocoa-600 uppercase tracking-wider">🧷 Patrones</h3>
                  <button onClick={addPattern} className="text-xs font-semibold text-blush-400 hover:text-blush-500 transition-colors">+ Agregar patron</button>
                </div>
                {elaboration.patterns.length === 0 ? (
                  <p className="text-sm text-cocoa-300 text-center py-3">Sin patrones. Agrega uno para empezar.</p>
                ) : (
                  <div className="space-y-3">
                    {elaboration.patterns.map((pat, idx) => (
                      <div key={idx} className="bg-white rounded-cute p-3 border border-cream-200 relative">
                        <button
                          onClick={() => removePattern(idx)}
                          className="absolute top-2 right-2 text-cocoa-300 hover:text-red-400 transition-colors text-xs font-bold"
                          title="Eliminar patron"
                        >
                          ✕
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-cocoa-500 mb-1">Nombre</label>
                            <input
                              className="input-cute text-sm"
                              value={pat.name}
                              onChange={(e) => updatePattern(idx, 'name', e.target.value)}
                              placeholder="Ej: Cuerpo principal"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-cocoa-500 mb-1">URL de Imagen</label>
                            <input
                              className="input-cute text-sm"
                              value={pat.imageUrl}
                              onChange={(e) => updatePattern(idx, 'imageUrl', e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-cocoa-500 mb-1">Descripcion</label>
                            <input
                              className="input-cute text-sm"
                              value={pat.description}
                              onChange={(e) => updatePattern(idx, 'description', e.target.value)}
                              placeholder="Detalle del patron"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-cream-50 rounded-cute p-4 border border-cream-200">
                <h3 className="font-display font-bold text-sm text-cocoa-600 mb-3 uppercase tracking-wider">📝 Instrucciones</h3>
                <textarea
                  className="input-cute min-h-[160px] resize-y text-sm"
                  value={elaboration.instructions}
                  onChange={(e) => setElaboration({ ...elaboration, instructions: e.target.value })}
                  placeholder={"Paso 1: Hacer un anillo magico con 6pb\nPaso 2: Aumentar en cada punto (12pb)\nPaso 3: ..."}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-cream-200">
              <button onClick={closeProceso} className="btn-cute bg-cream-200 text-cocoa-600 hover:bg-cream-300">Cancelar</button>
              <button
                onClick={handleSaveProceso}
                disabled={savingProceso}
                className="btn-cute bg-blush-400 text-white hover:bg-blush-500 disabled:opacity-50"
              >
                {savingProceso ? 'Guardando...' : 'Guardar Proceso'} 🧶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Toggle inline de disponibilidad (Disponible / Por pedido).
// - Cambio optimista: se refleja inmediatamente sin esperar al servidor.
// - Si el PUT falla, revierte y muestra un mensaje discreto.
// - No dispara un refetch con loading global (evita que la pagina parpadee/salte).
function AvailabilityToggle({ product, onChanged }: { product: any; onChanged: (silent?: boolean) => void }) {
  const current: 'disponible' | 'por_pedido' = product.availability || (product.stock > 0 ? 'disponible' : 'por_pedido');
  const [value, setValue] = useState<'disponible' | 'por_pedido'>(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Si llega un producto actualizado desde el servidor, sincronizar el valor local
  // (pero solo cuando no estamos a mitad de un guardado del usuario).
  useEffect(() => {
    if (!saving) setValue(current);
  }, [current, saving]);

  const update = async (next: 'disponible' | 'por_pedido') => {
    if (next === value || saving) return;
    const prev = value;
    setValue(next); // optimista
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availability: next,
          stock: next === 'disponible' ? Math.max(product.stock || 1, 1) : 0,
        }),
        cache: 'no-store',
      });
      if (!res.ok) {
        setValue(prev);
        setError('No se pudo guardar');
        setTimeout(() => setError(''), 3000);
        return;
      }
      // Refetch silencioso: la lista se actualiza sin parpadear ni desmontar la tabla.
      onChanged(true);
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
