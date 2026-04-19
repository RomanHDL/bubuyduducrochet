'use client';

import { useEffect, useState } from 'react';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  availability?: 'disponible' | 'por_pedido';
  category: string;
  featured: boolean;
}

export default function ProductEditModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product;
  categories?: { slug: string; name: string; emoji?: string }[];
  onClose: () => void;
  onSaved: (updated: any) => void;
}) {
  const [form, setForm] = useState({
    title: product.title,
    description: product.description,
    price: product.price,
    images: product.images?.length ? [...product.images] : [''],
    stock: product.stock ?? 1,
    availability: (product.availability || (product.stock > 0 ? 'disponible' : 'por_pedido')) as 'disponible' | 'por_pedido',
    category: product.category,
    featured: !!product.featured,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [cats, setCats] = useState(categories || []);

  // Cargar categorías si no llegaron por props
  useEffect(() => {
    if (cats.length === 0) {
      fetch('/api/categories').then(r => r.json()).then(d => {
        if (Array.isArray(d) && d.length > 0) setCats(d);
      }).catch(() => {});
    }
  }, []);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => { document.body.style.overflow = prev; document.body.style.paddingRight = prevPad; };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const doSave = async () => {
    if (!form.title.trim() || !form.description.trim()) { setErr('Título y descripción son obligatorios'); return; }
    setSaving(true); setErr('');
    try {
      const body = { ...form, images: form.images.filter(u => u.trim()), price: Number(form.price), stock: Number(form.stock) };
      const r = await fetch(`/api/products/${product._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Error al guardar'); }
      const updated = await r.json();
      onSaved(updated);
    } catch (e: any) {
      setErr(e.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const uploadFile = async (i: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) { setErr('Imagen muy grande (max 10MB)'); return; }
    setErr('');
    try {
      // Compacta en el cliente (max 1280px, JPEG 85%) — evita exceder el limite
      // de 16MB por documento de MongoDB cuando se guarda la imagen en base64.
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
      if (data.url) {
        const imgs = [...form.images];
        imgs[i] = data.url;
        setForm(prev => ({ ...prev, images: imgs }));
      } else {
        setErr(data.error || 'Error al subir');
      }
    } catch (e: any) { setErr(e?.message || 'Error al subir imagen'); }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cocoa-900/45 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-cute shadow-warm border border-cream-200 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-cream-100 bg-gradient-to-r from-blush-50 via-cream-50 to-lavender-50">
          <h2 className="font-display font-bold text-base text-cocoa-700">✏️ Editar producto</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white hover:bg-cream-100 border border-cream-200 flex items-center justify-center text-cocoa-400 hover:text-cocoa-600">✕</button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {err && <div className="bg-blush-50 border border-blush-200 rounded-2xl px-4 py-3 text-sm text-blush-500 font-medium mb-4">⚠️ {err}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-cocoa-600 mb-1">Título *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-cute text-sm py-2" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cocoa-600 mb-1">Descripción *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-cute text-sm py-2 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-cocoa-600 mb-1">Precio (MXN) *</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="input-cute" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cocoa-600 mb-1">Disponibilidad</label>
                <select
                  value={form.availability}
                  onChange={e => { const v = e.target.value as 'disponible' | 'por_pedido'; setForm({ ...form, availability: v, stock: v === 'disponible' ? Math.max(form.stock, 1) : 0 }); }}
                  className="input-cute"
                >
                  <option value="disponible">✅ Disponible</option>
                  <option value="por_pedido">📝 Por pedido</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-cocoa-600 mb-1">Categoría</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-cute">
                {cats.length > 0
                  ? cats.map(c => <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>)
                  : ['amigurumis','accesorios','decoracion','ropa-bebe','llaveros','otro'].map(s => <option key={s} value={s}>{s}</option>)
                }
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-cocoa-600 mb-2">Imágenes</label>
              {form.images.map((url, i) => (
                <div key={i} className="mb-3">
                  <div className="flex gap-2 items-center">
                    <input value={url} onChange={e => { const imgs = [...form.images]; imgs[i] = e.target.value; setForm({ ...form, images: imgs }); }} placeholder="URL o sube un archivo..." className="input-cute text-xs flex-1 py-2" />
                    <label className="flex-shrink-0 cursor-pointer btn-cute bg-lavender-100 text-lavender-600 px-3 py-2 text-xs font-bold hover:bg-lavender-200 border border-lavender-200">
                      📁 Archivo
                      <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) await uploadFile(i, f); }} />
                    </label>
                    {form.images.length > 1 && (
                      <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="text-blush-400 px-1 text-lg hover:scale-110 transition-transform">✕</button>
                    )}
                  </div>
                  {url && (url.startsWith('http') || url.startsWith('data:')) && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-cream-200 h-28 bg-cream-50">
                      <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => setForm({ ...form, images: [...form.images, ''] })} className="text-xs text-lavender-400 font-semibold hover:text-lavender-600">+ Agregar otra imagen</button>
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-cream-50 rounded-2xl border border-cream-200">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded text-blush-400 border-cream-300" />
              <div>
                <span className="text-sm font-semibold text-cocoa-600">⭐ Producto destacado</span>
                <p className="text-[11px] text-cocoa-400">Aparece en la sección de destacados</p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-4 border-t border-cream-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400 hover:bg-cream-50">Cancelar</button>
          <button onClick={doSave} disabled={saving} className="flex-1 btn-cute bg-blush-400 text-white py-2.5 text-sm hover:bg-blush-500 disabled:opacity-50">
            {saving ? '🧶 Guardando...' : '💾 Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
