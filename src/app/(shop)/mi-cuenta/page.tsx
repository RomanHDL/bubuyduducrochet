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
    fetch('/api/orders').then(r => r.json()).then(orders => setOrderCount(Array.isArray(orders) ? orders.length : 0)).catch(() => {});

    // Contar favoritos SOLO con productos que aún existen
    const saved: string[] = JSON.parse(localStorage.getItem('bdcrochet_favs') || '[]');
    if (saved.length === 0) setFavCount(0);
    else {
      fetch('/api/products')
        .then(r => r.json())
        .then((products: any[]) => {
          const ids = new Set(products.map(p => p._id));
          const pruned = saved.filter(id => ids.has(id));
          if (pruned.length !== saved.length) localStorage.setItem('bdcrochet_favs', JSON.stringify(pruned));
          setFavCount(pruned.length);
        })
        .catch(() => setFavCount(saved.length));
    }

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

      {/* Personalización admin */}
      {isAdmin && editProfile && (
        <div className="bg-white rounded-cute border border-cream-200 shadow-soft p-5 mb-8">
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-4">🎨 Personaliza tu perfil</h2>

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

          <div className="mb-4">
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

          <div className="flex gap-3">
            <button onClick={() => setEditProfile(false)} className="flex-1 py-2.5 rounded-bubble border-2 border-cream-300 text-sm font-semibold text-cocoa-400">Cancelar</button>
            <button onClick={saveProfile} disabled={savingProfile} className="flex-1 btn-cute bg-blush-400 text-white py-2.5 text-sm hover:bg-blush-500 disabled:opacity-50">
              {savingProfile ? '🧶...' : '💾 Guardar'}
            </button>
          </div>
        </div>
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
