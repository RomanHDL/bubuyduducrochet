'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ST_EMOJI: Record<string, string> = { pending: '⏳', confirmed: '✅', shipped: '📦', delivered: '🎉', cancelled: '❌' };
const ST_LABEL: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };
const PAY_EMOJI: Record<string, string> = { pending: '💳', paid: '✅', refunded: '↩️' };

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchStats();
    // Real-time: refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [session, status, router]);

  if (status === 'loading' || loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🔧</span></div>;
  if (!session || (session.user as any)?.role !== 'admin') return null;

  const s = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Panel Admin 🔧</h1>
          <p className="text-cocoa-400 mt-1">Bienvenida, {session.user?.name} 👑</p>
        </div>
        <div className="flex gap-2">
          <Link href="/catalogo" className="btn-cute bg-blush-400 text-white text-xs px-4 py-2 hover:bg-blush-500">🧶 Catalogo</Link>
          <Link href="/pedidos" className="btn-cute bg-lavender-400 text-white text-xs px-4 py-2 hover:bg-lavender-500">📋 Pedidos</Link>
          <Link href="/admin/pagos" className="btn-cute bg-green-500 text-white text-xs px-4 py-2 hover:bg-green-600">💰 Pagos</Link>
        </div>
      </div>

      {/* ═══ Main Stats ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard emoji="💰" label="Ventas totales" value={`$${(s.totalSales || 0).toFixed(2)}`} sub="MXN cobrado" color="from-green-50 to-emerald-50 border-green-200" />
        <StatCard emoji="📦" label="Pedidos" value={s.totalOrders || 0} sub={`${s.pendingCount || 0} pendientes`} color="from-sky-50 to-sky-100 border-sky-200" />
        <StatCard emoji="🧸" label="Productos" value={s.totalProducts || 0} sub={`${s.featuredCount || 0} destacados`} color="from-blush-50 to-blush-100 border-blush-200" />
        <StatCard emoji="👥" label="Clientes" value={s.totalUsers || 0} sub={`${s.reviews || 0} reseñas`} color="from-lavender-50 to-lavender-100 border-lavender-200" />
      </div>

      {/* ═══ Secondary Stats ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
        <MiniStat emoji="⏳" label="Pendientes" value={s.pendingCount || 0} color="text-amber-600 bg-amber-50 border-amber-200" />
        <MiniStat emoji="✅" label="Confirmados" value={s.confirmedCount || 0} color="text-sky-600 bg-sky-50 border-sky-200" />
        <MiniStat emoji="📦" label="Enviados" value={s.shippedCount || 0} color="text-indigo-600 bg-indigo-50 border-indigo-200" />
        <MiniStat emoji="🎉" label="Entregados" value={s.deliveredCount || 0} color="text-green-600 bg-green-50 border-green-200" />
        <MiniStat emoji="❌" label="Cancelados" value={s.cancelledCount || 0} color="text-red-500 bg-red-50 border-red-200" />
        <MiniStat emoji="💳" label="Pagados" value={s.paidCount || 0} color="text-green-600 bg-green-50 border-green-200" />
      </div>

      {/* ═══ Alerts ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(s.pendingPayments || 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-cute p-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div><p className="font-bold text-amber-700 text-sm">${(s.pendingPayments || 0).toFixed(2)} pendiente</p><p className="text-xs text-amber-600">{s.pendingCount} pedidos sin pagar</p></div>
          </div>
        )}
        {(s.outOfStock || 0) > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-cute p-4 flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div><p className="font-bold text-red-600 text-sm">{s.outOfStock} agotados</p><p className="text-xs text-red-500">Productos sin stock</p></div>
          </div>
        )}
        {(s.lowStock || 0) > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-cute p-4 flex items-center gap-3">
            <span className="text-2xl">📉</span>
            <div><p className="font-bold text-orange-600 text-sm">{s.lowStock} con poco stock</p><p className="text-xs text-orange-500">3 unidades o menos</p></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* ═══ Sales Chart (last 7 days) ═══ */}
        <div className="lg:col-span-2 bg-white rounded-cute shadow-soft border border-cream-200 p-6">
          <h3 className="font-display font-bold text-lg text-cocoa-700 mb-4">📊 Actividad ultimos 7 dias</h3>
          <div className="flex items-end gap-2 h-40">
            {(s.last7 || []).map((d: any, i: number) => {
              const maxCount = Math.max(...(s.last7 || []).map((x: any) => x.count), 1);
              const h = Math.max((d.count / maxCount) * 100, 8);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-cocoa-500">{d.count}</span>
                  <div className="w-full bg-gradient-to-t from-blush-400 to-blush-300 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
                  <span className="text-[9px] text-cocoa-400 font-medium">{d.day}</span>
                  {d.sales > 0 && <span className="text-[8px] text-green-500 font-bold">${d.sales.toFixed(0)}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ Top Products ═══ */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-6">
          <h3 className="font-display font-bold text-lg text-cocoa-700 mb-4">🏆 Mas vendidos</h3>
          <div className="space-y-3">
            {(s.topProducts || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blush-100 text-blush-500 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cocoa-700 truncate">{p.title}</p>
                  <p className="text-[10px] text-cocoa-400">{p.qty} vendidos · ${p.revenue.toFixed(0)}</p>
                </div>
              </div>
            ))}
            {(!s.topProducts || s.topProducts.length === 0) && <p className="text-sm text-cocoa-400 text-center py-4">Sin ventas aun</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ═══ Recent Orders ═══ */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-cocoa-700">📦 Pedidos recientes</h3>
            <Link href="/pedidos" className="text-xs font-bold text-blush-400 hover:text-blush-500">Ver todos →</Link>
          </div>
          <div className="space-y-2">
            {(s.recentOrders || []).map((o: any) => (
              <div key={o._id} className="flex items-center gap-3 p-2.5 bg-cream-50/50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-cocoa-300">#{o.orderNumber}</span>
                    <span className="text-[10px]">{ST_EMOJI[o.status]} {ST_LABEL[o.status]}</span>
                    <span className="text-[10px]">{PAY_EMOJI[o.paymentStatus]}</span>
                  </div>
                  <p className="text-xs font-semibold text-cocoa-700 truncate">{o.userName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-cocoa-700">${(o.total || 0).toFixed(2)}</p>
                  <p className="text-[9px] text-cocoa-300">{o.itemCount} prod.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Recent Users ═══ */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-cocoa-700">👥 Nuevos clientes</h3>
            <Link href="/admin/usuarios" className="text-xs font-bold text-blush-400 hover:text-blush-500">Ver todos →</Link>
          </div>
          <div className="space-y-2">
            {(s.recentUsers || []).map((u: any) => (
              <div key={u._id} className="flex items-center gap-3 p-2.5 bg-cream-50/50 rounded-xl">
                {u.image ? (
                  <img src={u.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-lavender-100 flex items-center justify-center text-sm font-bold text-lavender-500">{(u.name || '?')[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cocoa-700 truncate">{u.name}</p>
                  <p className="text-[10px] text-cocoa-400 truncate">{u.email}</p>
                </div>
                <span className="text-[10px] text-cocoa-300">{new Date(u.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Quick Actions Grid ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLink href="/catalogo" emoji="🧶" title="Catalogo" desc="Agregar y editar productos" />
        <QuickLink href="/pedidos" emoji="📋" title="Gestion Pedidos" desc="Estado, tickets, pagos" />
        <QuickLink href="/admin/pagos" emoji="💰" title="Control Pagos" desc="Cobros y reembolsos" />
        <QuickLink href="/admin/usuarios" emoji="👥" title="Usuarios" desc="Clientes registrados" />
        <QuickLink href="/admin/productos" emoji="📦" title="Inventario" desc="Stock y productos" />
        <QuickLink href="/preguntas" emoji="❓" title="FAQs" desc="Preguntas frecuentes" />
        <QuickLink href="/contacto" emoji="📝" title="Sobre Nosotros" desc="Pagina de contacto" />
        <QuickLink href="/" emoji="🏠" title="Ver Tienda" desc="Vista del cliente" />
      </div>
    </div>
  );
}

function StatCard({ emoji, label, value, sub, color }: { emoji: string; label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-cute border p-5 hover:shadow-warm hover:-translate-y-1 transition-all`}>
      <span className="text-3xl block mb-2">{emoji}</span>
      <p className="text-xs font-semibold text-cocoa-400">{label}</p>
      <p className="font-display font-bold text-2xl text-cocoa-700">{value}</p>
      <p className="text-[10px] text-cocoa-400 mt-0.5">{sub}</p>
    </div>
  );
}

function MiniStat({ emoji, label, value, color }: { emoji: string; label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-cute border p-3 text-center`}>
      <span className="text-lg">{emoji}</span>
      <p className="font-bold text-lg">{value}</p>
      <p className="text-[10px] font-semibold">{label}</p>
    </div>
  );
}

function QuickLink({ href, emoji, title, desc }: { href: string; emoji: string; title: string; desc: string }) {
  return (
    <Link href={href} className="bg-white rounded-cute shadow-soft border border-cream-200 p-5 hover:shadow-warm hover:-translate-y-1 transition-all group">
      <span className="text-2xl block mb-2">{emoji}</span>
      <h3 className="font-display font-bold text-sm text-cocoa-700 group-hover:text-blush-400 transition-colors">{title}</h3>
      <p className="text-[11px] text-cocoa-400 mt-0.5">{desc}</p>
    </Link>
  );
}
