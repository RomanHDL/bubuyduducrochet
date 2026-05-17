'use client';

import { useEffect, useState } from 'react';

const MATERIAL_TYPES = ['hilo', 'aguja', 'relleno', 'ojos de seguridad', 'alambre', 'fieltro', 'pegamento', 'otro'];
const MEASUREMENT_UNITS = ['cm', 'mm', 'pulgadas'];
const DIFFICULTY_OPTIONS = [
  { value: 'facil', label: 'Fácil', emoji: '🟢' },
  { value: 'intermedio', label: 'Intermedio', emoji: '🟡' },
  { value: 'avanzado', label: 'Avanzado', emoji: '🔴' },
];

interface Product {
  _id: string;
  title: string;
  images?: string[];
  elaboration?: any;
}

// Componente unico del modal de "Proceso de Elaboracion". Usado por:
//   · /admin/productos      (tabla admin de productos)
//   · /catalogo             (cards del catalogo admin)
//   · /producto/[id]        (pagina publica del producto, solo admin lo ve)
//
// Tiene dos modos:
//   · 'view' — ficha resumen no-editable, sin scroll forzado. Es lo que ve
//     el admin cuando ya hay un proceso guardado o justo despues de guardar.
//   · 'edit' — formulario completo para capturar/actualizar. Se entra desde
//     el boton "Editar" en el footer del modo view, o automaticamente cuando
//     el producto aun no tiene elaboracion.
export default function ProductProcesoModal({
  product, onClose, onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: (updated: any) => void;
}) {
  const el = product.elaboration || {};
  const hasContent = !!(
    el.materials?.length ||
    el.measurements?.length ||
    el.patterns?.length ||
    el.instructions
  );
  const [elaboration, setElaboration] = useState<any>({
    materials: el.materials?.length ? el.materials.map((m: any) => ({ ...m })) : [],
    measurements: el.measurements?.length ? el.measurements.map((m: any) => ({ ...m })) : [],
    patterns: el.patterns?.length ? el.patterns.map((m: any) => ({ ...m })) : [],
    instructions: el.instructions || '',
    difficulty: el.difficulty || 'facil',
    estimatedTime: el.estimatedTime || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>(hasContent ? 'view' : 'edit');

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

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/products/${product._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elaboration }),
      });
      if (!r.ok) throw new Error('Error');
      const updated = await r.json();
      setSuccess(true);
      onSaved(updated);
      // Al guardar pasa a vista resumen — "hoja completa" sin scroll que
      // pidio el usuario. Si necesita ajustar algo mas, pulsa Editar.
      setMode('view');
      setTimeout(() => setSuccess(false), 2500);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const diffOpt = DIFFICULTY_OPTIONS.find((d) => d.value === elaboration.difficulty);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cocoa-900/45 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-cute shadow-warm border border-cream-200 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cream-100 bg-gradient-to-r from-amber-50 via-cream-50 to-lavender-50">
          <div className="flex items-center gap-3">
            {product.images?.[0] && <img src={product.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover" />}
            <div>
              <h2 className="font-display font-bold text-base text-cocoa-700">📋 Proceso de Elaboración</h2>
              <p className="text-xs text-cocoa-400">{product.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white hover:bg-cream-100 border border-cream-200 flex items-center justify-center text-cocoa-400 hover:text-cocoa-600">✕</button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {success && <div className="mb-4 p-3 bg-mint-100 border border-green-200 rounded-xl text-sm text-green-700 font-semibold">✅ Proceso guardado correctamente</div>}

          {/* ─── Modo VIEW: ficha resumen ─── */}
          {mode === 'view' && (
            <div className="space-y-4">
              {/* Cabecera: dificultad + tiempo estimado */}
              <div className="flex flex-wrap items-center gap-3 bg-cream-50 rounded-cute p-3 border border-cream-200">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-blush-200 text-sm font-bold text-blush-600">
                  <span>{diffOpt?.emoji}</span>
                  <span>Dificultad: {diffOpt?.label || 'Fácil'}</span>
                </span>
                {elaboration.estimatedTime && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-cream-200 text-sm font-semibold text-cocoa-600">
                    <span>⏱️</span>
                    <span>{elaboration.estimatedTime}</span>
                  </span>
                )}
              </div>

              {/* Materiales */}
              <div className="bg-cream-50 rounded-cute p-4 border border-cream-200">
                <h3 className="font-display font-bold text-sm text-cocoa-600 mb-2 uppercase tracking-wider">🧶 Materiales</h3>
                {elaboration.materials.length === 0 ? (
                  <p className="text-sm text-cocoa-300">— sin materiales —</p>
                ) : (
                  <ul className="space-y-1 text-sm text-cocoa-700">
                    {elaboration.materials.map((m: any, i: number) => (
                      <li key={i} className="flex flex-wrap gap-1.5">
                        <span className="font-semibold">{m.name || '(sin nombre)'}</span>
                        <span className="text-cocoa-400">·</span>
                        <span className="text-cocoa-500">{m.type}</span>
                        {m.quantity && (
                          <>
                            <span className="text-cocoa-400">·</span>
                            <span className="text-cocoa-500">{m.quantity}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Medidas */}
              <div className="bg-cream-50 rounded-cute p-4 border border-cream-200">
                <h3 className="font-display font-bold text-sm text-cocoa-600 mb-2 uppercase tracking-wider">📏 Medidas</h3>
                {elaboration.measurements.length === 0 ? (
                  <p className="text-sm text-cocoa-300">— sin medidas —</p>
                ) : (
                  <ul className="space-y-1 text-sm text-cocoa-700">
                    {elaboration.measurements.map((m: any, i: number) => (
                      <li key={i}>
                        <span className="font-semibold">{m.name || '(sin nombre)'}:</span>{' '}
                        <span>{m.value} {m.unit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Patrones */}
              <div className="bg-cream-50 rounded-cute p-4 border border-cream-200">
                <h3 className="font-display font-bold text-sm text-cocoa-600 mb-2 uppercase tracking-wider">🎨 Patrones</h3>
                {elaboration.patterns.length === 0 ? (
                  <p className="text-sm text-cocoa-300">— sin patrones —</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {elaboration.patterns.map((p: any, i: number) => (
                      <div key={i} className="bg-white rounded-cute p-2 border border-cream-200 flex gap-2">
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt={p.name} className="w-14 h-14 rounded-md object-cover flex-shrink-0 border border-cream-200" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-cocoa-700 truncate">{p.name || '(sin nombre)'}</p>
                          {p.description && (
                            <p className="text-xs text-cocoa-500 line-clamp-2">{p.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instrucciones */}
              <div className="bg-cream-50 rounded-cute p-4 border border-cream-200">
                <h3 className="font-display font-bold text-sm text-cocoa-600 mb-2 uppercase tracking-wider">📝 Instrucciones</h3>
                {elaboration.instructions ? (
                  <p className="text-sm text-cocoa-700 whitespace-pre-line leading-relaxed">{elaboration.instructions}</p>
                ) : (
                  <p className="text-sm text-cocoa-300">— sin instrucciones —</p>
                )}
              </div>
            </div>
          )}

          {/* ─── Modo EDIT: formulario completo ─── */}
          {mode === 'edit' && (
          <div className="space-y-5">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-cocoa-600 mb-2">Dificultad</label>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map(d => (
                  <button key={d.value} onClick={() => setElaboration({ ...elaboration, difficulty: d.value })}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${elaboration.difficulty === d.value ? 'border-blush-400 bg-blush-50 text-cocoa-700' : 'border-cream-200 text-cocoa-400 hover:border-cream-300'}`}>
                    {d.emoji} {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cocoa-600 mb-1">Tiempo estimado</label>
              <input className="input-cute" value={elaboration.estimatedTime} onChange={e => setElaboration({ ...elaboration, estimatedTime: e.target.value })} placeholder="Ej: 3 horas, 2 días..." />
            </div>

            {/* Materials — 3 columnas: Nombre / Tipo / Cantidad. La columna
                "Notas" se quito (era la "N" truncada en movil) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-cocoa-600">🧶 Materiales</label>
                <button onClick={() => setElaboration({ ...elaboration, materials: [...elaboration.materials, { name: '', type: 'hilo', quantity: '' }] })} className="text-xs font-semibold text-blush-400 hover:text-blush-500">+ Agregar</button>
              </div>
              {elaboration.materials.map((m: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 mb-2 items-center">
                  <input className="input-cute text-xs" placeholder="Nombre" value={m.name} onChange={e => { const arr = [...elaboration.materials]; arr[i] = { ...arr[i], name: e.target.value }; setElaboration({ ...elaboration, materials: arr }); }} />
                  <select className="input-cute text-xs" value={m.type} onChange={e => { const arr = [...elaboration.materials]; arr[i] = { ...arr[i], type: e.target.value }; setElaboration({ ...elaboration, materials: arr }); }}>
                    {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input className="input-cute text-xs" placeholder="Cantidad" value={m.quantity} onChange={e => { const arr = [...elaboration.materials]; arr[i] = { ...arr[i], quantity: e.target.value }; setElaboration({ ...elaboration, materials: arr }); }} />
                  <button onClick={() => { const arr = elaboration.materials.filter((_: any, j: number) => j !== i); setElaboration({ ...elaboration, materials: arr }); }} className="text-blush-400 hover:text-blush-500 text-sm">✕</button>
                </div>
              ))}
            </div>

            {/* Measurements */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-cocoa-600">📏 Medidas</label>
                <button onClick={() => setElaboration({ ...elaboration, measurements: [...elaboration.measurements, { name: '', value: '', unit: 'cm' }] })} className="text-xs font-semibold text-blush-400 hover:text-blush-500">+ Agregar</button>
              </div>
              {elaboration.measurements.map((m: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-2 items-center">
                  <input className="input-cute text-xs" placeholder="Nombre (ej: Alto)" value={m.name} onChange={e => { const arr = [...elaboration.measurements]; arr[i] = { ...arr[i], name: e.target.value }; setElaboration({ ...elaboration, measurements: arr }); }} />
                  <input className="input-cute text-xs" placeholder="Valor" value={m.value} onChange={e => { const arr = [...elaboration.measurements]; arr[i] = { ...arr[i], value: e.target.value }; setElaboration({ ...elaboration, measurements: arr }); }} />
                  <select className="input-cute text-xs" value={m.unit} onChange={e => { const arr = [...elaboration.measurements]; arr[i] = { ...arr[i], unit: e.target.value }; setElaboration({ ...elaboration, measurements: arr }); }}>
                    {MEASUREMENT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button onClick={() => { const arr = elaboration.measurements.filter((_: any, j: number) => j !== i); setElaboration({ ...elaboration, measurements: arr }); }} className="text-blush-400 hover:text-blush-500 text-sm">✕</button>
                </div>
              ))}
            </div>

            {/* Patterns */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-cocoa-600">🎨 Patrones</label>
                <button onClick={() => setElaboration({ ...elaboration, patterns: [...elaboration.patterns, { name: '', imageUrl: '', description: '' }] })} className="text-xs font-semibold text-blush-400 hover:text-blush-500">+ Agregar</button>
              </div>
              {elaboration.patterns.map((m: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-2 items-center">
                  <input className="input-cute text-xs" placeholder="Nombre" value={m.name} onChange={e => { const arr = [...elaboration.patterns]; arr[i] = { ...arr[i], name: e.target.value }; setElaboration({ ...elaboration, patterns: arr }); }} />
                  <input className="input-cute text-xs" placeholder="URL imagen" value={m.imageUrl} onChange={e => { const arr = [...elaboration.patterns]; arr[i] = { ...arr[i], imageUrl: e.target.value }; setElaboration({ ...elaboration, patterns: arr }); }} />
                  <input className="input-cute text-xs" placeholder="Descripción" value={m.description} onChange={e => { const arr = [...elaboration.patterns]; arr[i] = { ...arr[i], description: e.target.value }; setElaboration({ ...elaboration, patterns: arr }); }} />
                  <button onClick={() => { const arr = elaboration.patterns.filter((_: any, j: number) => j !== i); setElaboration({ ...elaboration, patterns: arr }); }} className="text-blush-400 hover:text-blush-500 text-sm">✕</button>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-semibold text-cocoa-600 mb-1">📝 Instrucciones</label>
              <textarea className="input-cute min-h-[120px] resize-y text-xs" value={elaboration.instructions} onChange={e => setElaboration({ ...elaboration, instructions: e.target.value })} placeholder="Paso 1: ...&#10;Paso 2: ...&#10;Paso 3: ..." />
            </div>
          </div>
          )}
        </div>

        {/* Footer · botones cambian segun el modo */}
        {mode === 'view' ? (
          <div className="p-4 border-t border-cream-100 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400 hover:bg-cream-50">Cerrar</button>
            <button onClick={() => { setMode('edit'); setSuccess(false); }} className="flex-1 btn-cute bg-blush-400 text-white py-2.5 text-sm hover:bg-blush-500">
              ✏️ Editar
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-cream-100 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400 hover:bg-cream-50">Cancelar</button>
            <button onClick={save} disabled={saving} className="flex-1 btn-cute bg-amber-500 text-white py-2.5 text-sm hover:bg-amber-600 disabled:opacity-50">
              {saving ? '💾 Guardando...' : '💾 Guardar proceso'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
