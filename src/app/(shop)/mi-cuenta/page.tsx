'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedBg from '@/components/AnimatedBg';
import ProfileAvatar, { FRAMES, ProfileFrame } from '@/components/ProfileAvatar';

export default function MiCuentaPage() {
  const { data: session } = useSession();
  const [orderCount, setOrderCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);

  // Personalización (solo admin)
  const [editProfile, setEditProfile] = useState(false);
  const [draftFrame, setDraftFrame] = useState<ProfileFrame>('none');
  const [draftBadge, setDraftBadge] = useState('');
  const [draftBio, setDraftBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch('/api/orders', { cache: 'no-store' }).then(r => r.json()).then(orders => setOrderCount(Array.isArray(orders) ? orders.length : 0)).catch(() => {});

    // Conteo de favoritos desde la DB (validos: productos que aún existen)
    fetch('/api/favorites/count', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setFavCount(Number(d?.count) || 0))
      .catch(() => setFavCount(0));

    // Cargar perfil extendido
    fetch('/api/profile').then(r => r.json()).then(p => {
      setProfile(p);
      setDraftFrame(p?.profile?.frame || 'none');
      setDraftBadge(p?.profile?.badge || '');
      setDraftBio(p?.profile?.bio || '');
    }).catch(() => {});
  }, [session]);

  if (!session) {
    return (
      <AnimatedBg theme="lavender">
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-br from-cream-50 via-blush-50 to-lavender-50">
        <span className="text-6xl mb-4">🧸</span>
        <h1 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Mi Cuenta</h1>
        <p className="text-cocoa-400 mb-6">Inicia sesion para ver tu perfil</p>
        <Link href="/login" className="btn-cute bg-blush-400 text-white px-8 py-3 hover:bg-blush-500">
          Iniciar Sesion 💕
        </Link>
      </div>
      </AnimatedBg>
    );
  }

  const user = session.user;
  const isAdmin = (user as any)?.role === 'admin';
  const frame: ProfileFrame = (profile?.profile?.frame as ProfileFrame) || 'none';
  const badge = profile?.profile?.badge || (isAdmin ? '✨ Admin' : '');

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame: draftFrame, badge: draftBadge, bio: draftBio }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditProfile(false);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const MENU = [
    { emoji: '📦', label: 'Mis Pedidos', desc: `${orderCount} pedido${orderCount !== 1 ? 's' : ''}`, href: '/pedidos' },
    { emoji: '💕', label: 'Favoritos', desc: `${favCount} guardado${favCount !== 1 ? 's' : ''}`, href: '/favoritos' },
    { emoji: '🛒', label: 'Carrito', desc: 'Ver carrito de compras', href: '/carrito' },
    { emoji: '🧶', label: 'Catalogo', desc: 'Explorar productos', href: '/catalogo' },
    { emoji: '💌', label: 'Contacto', desc: 'Envianos un mensaje', href: '/contacto' },
  ];

  return (
    <AnimatedBg theme="lavender">
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-blush-100 via-cream-100 to-lavender-100 rounded-bubble p-8 mb-8 border border-blush-200 text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <ProfileAvatar src={user?.image} name={user?.name} frame={frame} size={88} badge={badge || undefined} />
        </div>
        <h1 className="font-display font-bold text-2xl text-cocoa-700 mt-3">{user?.name || 'Usuario'}</h1>
        <p className="text-cocoa-400 text-sm mt-1">{user?.email}</p>
        {profile?.profile?.bio && (
          <p className="text-xs italic text-cocoa-500 mt-3 max-w-md mx-auto whitespace-pre-wrap">{profile.profile.bio}</p>
        )}
        {isAdmin && (
          <div className="mt-4 flex gap-2 justify-center flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lavender-100 border border-lavender-200 rounded-full text-xs font-bold text-lavender-500">
              ✨ Administrador
            </span>
            <button
              onClick={() => setEditProfile(v => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-cream-300 rounded-full text-xs font-bold text-cocoa-600 hover:bg-cream-50 transition-colors"
            >
              {editProfile ? '✕ Cerrar' : '🎨 Personalizar perfil'}
            </button>
          </div>
        )}
      </div>

      {/* Modal flotante de personalización admin (fondo estático, sólo el modal visible) */}
      {isAdmin && editProfile && (
        <ProfileCustomizeModal
          user={user}
          draftFrame={draftFrame}
          setDraftFrame={setDraftFrame}
          draftBadge={draftBadge}
          setDraftBadge={setDraftBadge}
          draftBio={draftBio}
          setDraftBio={setDraftBio}
          saving={savingProfile}
          onSave={saveProfile}
          onClose={() => setEditProfile(false)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-cute border border-cream-200 p-4 text-center shadow-soft">
          <p className="text-2xl font-bold text-blush-400">{orderCount}</p>
          <p className="text-xs text-cocoa-400 mt-0.5">Pedidos</p>
        </div>
        <div className="bg-white rounded-cute border border-cream-200 p-4 text-center shadow-soft">
          <p className="text-2xl font-bold text-lavender-400">{favCount}</p>
          <p className="text-xs text-cocoa-400 mt-0.5">Favoritos</p>
        </div>
        <div className="bg-white rounded-cute border border-cream-200 p-4 text-center shadow-soft">
          <p className="text-2xl">🧸</p>
          <p className="text-xs text-cocoa-400 mt-0.5">Miembro</p>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2 mb-8">
        {MENU.map(item => (
          <Link key={item.href} href={item.href} prefetch
            className="flex items-center gap-4 p-4 bg-white rounded-cute border border-cream-200 hover:shadow-warm hover:border-blush-200 transition-all group">
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-cocoa-700 group-hover:text-blush-500 transition-colors">{item.label}</p>
              <p className="text-xs text-cocoa-400">{item.desc}</p>
            </div>
            <span className="text-cocoa-300 group-hover:text-blush-400 transition-colors">→</span>
          </Link>
        ))}

        {isAdmin && (
          <Link href="/admin" prefetch
            className="flex items-center gap-4 p-4 bg-lavender-50 rounded-cute border border-lavender-200 hover:shadow-warm hover:border-lavender-300 transition-all group">
            <span className="text-2xl">⚙️</span>
            <div className="flex-1">
              <p className="font-semibold text-lavender-600 group-hover:text-lavender-500 transition-colors">Panel de Administracion</p>
              <p className="text-xs text-lavender-400">Gestionar productos, pedidos y usuarios</p>
            </div>
            <span className="text-lavender-300 group-hover:text-lavender-400 transition-colors">→</span>
          </Link>
        )}
      </div>

      {/* Sign out */}
      <button onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full py-3 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400 hover:border-blush-300 hover:text-blush-500 transition-all">
        Cerrar Sesion
      </button>
    </div>
    </AnimatedBg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Modal flotante de personalización — fondo estático (scroll lock)
// ═══════════════════════════════════════════════════════════════════
function ProfileCustomizeModal({
  user, draftFrame, setDraftFrame, draftBadge, setDraftBadge, draftBio, setDraftBio,
  saving, onSave, onClose,
}: {
  user: any;
  draftFrame: ProfileFrame; setDraftFrame: (f: ProfileFrame) => void;
  draftBadge: string; setDraftBadge: (v: string) => void;
  draftBio: string; setDraftBio: (v: string) => void;
  saving: boolean; onSave: () => void; onClose: () => void;
}) {
  // Body scroll lock con compensación de scrollbar
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-cocoa-900/45 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <div
        className="relative bg-white rounded-cute shadow-warm border border-cream-200 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between p-4 border-b border-cream-100 bg-gradient-to-r from-blush-50 via-cream-50 to-lavender-50">
          <h2 className="font-display font-bold text-base text-cocoa-700">🎨 Personaliza tu perfil</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white hover:bg-cream-100 border border-cream-200 flex items-center justify-center text-cocoa-400 hover:text-cocoa-600 transition-colors">✕</button>
        </div>
        {/* Content scroll interno */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Preview arriba */}
          <div className="flex flex-col items-center mb-5 p-4 rounded-xl bg-cream-50 border border-cream-200">
            <ProfileAvatar src={user?.image} name={user?.name} frame={draftFrame} size={72} badge={draftBadge || undefined} />
            <p className="font-semibold text-sm text-cocoa-700 mt-3">{user?.name}</p>
            {draftBio && <p className="text-[11px] italic text-cocoa-500 mt-2 max-w-xs text-center whitespace-pre-wrap">{draftBio}</p>}
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold text-cocoa-600 mb-2">Marco del avatar</p>
            <div className="grid grid-cols-5 gap-3">
              {FRAMES.map(f => (
                <button
                  key={f.key}
                  onClick={() => setDraftFrame(f.key)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${draftFrame === f.key ? 'border-blush-400 bg-blush-50' : 'border-cream-200 hover:border-blush-200'}`}
                  title={f.label}
                >
                  <ProfileAvatar src={user?.image} name={user?.name} frame={f.key} size={44} />
                  <span className="text-[10px] font-semibold text-cocoa-600">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-cocoa-600 mb-1 block">Badge / Título</label>
            <input
              value={draftBadge}
              onChange={e => setDraftBadge(e.target.value)}
              placeholder="Ej: 🧶 Fundadora · CEO · Diseñadora jefe"
              maxLength={64}
              className="input-cute text-sm"
            />
            <p className="text-[10px] text-cocoa-400 mt-1">Se muestra debajo del avatar. Máx 64 caracteres.</p>
          </div>

          <div className="mb-2">
            <label className="text-xs font-semibold text-cocoa-600 mb-1 block">Bio</label>
            <textarea
              value={draftBio}
              onChange={e => setDraftBio(e.target.value)}
              rows={3}
              maxLength={240}
              placeholder="Cuenta algo sobre ti..."
              className="input-cute text-sm resize-none"
            />
            <p className="text-[10px] text-cocoa-400 mt-1">{draftBio.length}/240</p>
          </div>
        </div>
        {/* Footer fijo */}
        <div className="p-4 border-t border-cream-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400 hover:bg-cream-50">Cancelar</button>
          <button onClick={onSave} disabled={saving} className="flex-1 btn-cute bg-blush-400 text-white py-2.5 text-sm hover:bg-blush-500 disabled:opacity-50">
            {saving ? '🧶...' : '💾 Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
