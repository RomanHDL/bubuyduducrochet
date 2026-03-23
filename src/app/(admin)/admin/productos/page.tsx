'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['amigurumis', 'accesorios', 'decoracion', 'ropa-bebe', 'llaveros', 'otro'];

const emptyProduct = { title: '', description: '', price: 0, images: [''], stock: 0, category: 'amigurumis', isActive: true, featured: false };

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchProducts();
  }, [session, status]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      setProducts(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyProduct });
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, price: p.price, images: p.images?.length ? p.images : [''], stock: p.stock, category: p.category, isActive: p.isActive, featured: p.featured });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/api/products/${editing._id}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setModalOpen(false);
      fetchProducts();
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    fetchProducts();
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
                  <th className="text-center px-4 py-3 font-semibold text-cocoa-500 text-xs uppercase tracking-wider">Stock</th>
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
                    <td className="px-4 py-3 text-center"><span className={`font-semibold ${p.stock > 0 ? 'text-green-600' : 'text-blush-500'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.isActive ? 'bg-mint-100 text-green-700' : 'bg-cream-200 text-cocoa-400'}`}>
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openEdit(p)} className="text-xs font-semibold text-cocoa-400 hover:text-blush-400 mr-3 transition-colors">Editar</button>
                      <button onClick={() => setDeleteConfirm(p._id)} className="text-xs font-semibold text-cocoa-300 hover:text-red-400 transition-colors">Eliminar</button>
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
                  <label className="block text-sm font-semibold text-cocoa-600 mb-1">Stock</label>
                  <input className="input-cute" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
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
    </div>
  );
}
