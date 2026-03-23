'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🔧</span></div>;
  }

  if (!session || (session.user as any)?.role !== 'admin') return null;

  const cards = [
    { label: 'Productos', value: stats?.totalProducts || 0, emoji: '🧸', color: 'from-blush-50 to-blush-100 border-blush-200', href: '/admin/productos' },
    { label: 'Usuarios', value: stats?.totalUsers || 0, emoji: '👥', color: 'from-lavender-50 to-lavender-100 border-lavender-200', href: '/admin/usuarios' },
    { label: 'Pedidos', value: stats?.totalOrders || 0, emoji: '📦', color: 'from-sky-50 to-sky-100 border-sky-200', href: '/admin/pedidos' },
    { label: 'Ventas Totales', value: `$${(stats?.totalSales || 0).toFixed(2)}`, emoji: '💰', color: 'from-mint-50 to-mint-100 border-mint-200', href: '/admin/pedidos' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Panel Admin 🔧</h1>
          <p className="text-cocoa-400 mt-1">Bienvenido, {session.user?.name}</p>
        </div>
        <Link href="/admin/productos" className="btn-cute bg-blush-400 text-white text-sm hover:bg-blush-500">
          Gestionar Productos 🧶
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`bg-gradient-to-br ${c.color} rounded-cute border p-5 hover:shadow-warm hover:-translate-y-1 transition-all`}>
            <span className="text-3xl block mb-2">{c.emoji}</span>
            <p className="text-sm font-semibold text-cocoa-400">{c.label}</p>
            <p className="font-display font-bold text-2xl text-cocoa-700">{c.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/productos" className="bg-white rounded-cute shadow-soft border border-cream-200 p-6 hover:shadow-warm hover:-translate-y-1 transition-all group">
          <span className="text-3xl block mb-2">🧸</span>
          <h3 className="font-display font-bold text-cocoa-700 group-hover:text-blush-400 transition-colors">Productos</h3>
          <p className="text-sm text-cocoa-400 mt-1">Crear, editar y gestionar productos</p>
        </Link>
        <Link href="/admin/pedidos" className="bg-white rounded-cute shadow-soft border border-cream-200 p-6 hover:shadow-warm hover:-translate-y-1 transition-all group">
          <span className="text-3xl block mb-2">📦</span>
          <h3 className="font-display font-bold text-cocoa-700 group-hover:text-blush-400 transition-colors">Pedidos</h3>
          <p className="text-sm text-cocoa-400 mt-1">Ver y gestionar pedidos de clientes</p>
        </Link>
        <Link href="/admin/usuarios" className="bg-white rounded-cute shadow-soft border border-cream-200 p-6 hover:shadow-warm hover:-translate-y-1 transition-all group">
          <span className="text-3xl block mb-2">👥</span>
          <h3 className="font-display font-bold text-cocoa-700 group-hover:text-blush-400 transition-colors">Usuarios</h3>
          <p className="text-sm text-cocoa-400 mt-1">Ver usuarios registrados</p>
        </Link>
      </div>

      {/* Recent orders */}
      {stats?.recentOrders?.length > 0 && (
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-6">
          <h3 className="font-display font-bold text-lg text-cocoa-700 mb-4">Pedidos Recientes</h3>
          <div className="space-y-3">
            {stats.recentOrders.map((order: any) => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0">
                <div>
                  <span className="font-semibold text-sm text-cocoa-600">{order.userName}</span>
                  <span className="text-xs text-cocoa-300 ml-2">{new Date(order.createdAt).toLocaleDateString('es-MX')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-cocoa-400 bg-cream-100 px-2 py-0.5 rounded-full">{order.status}</span>
                  <span className="font-display font-bold text-cocoa-700">${(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
