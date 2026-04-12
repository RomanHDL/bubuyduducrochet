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

  const fetchStats = () => { fetch('/api/admin/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false)); };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [session, status, router]);

  if (status === 'loading' || loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🔧</span></div>;
  if (!session || (session.user as any)?.role !== 'admin') return null;

  const s = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Panel Admin 🔧</h1>
          <p className="text-cocoa-400 mt-1">Bienvenida, {session.user?.name} 👑</p>
          <div className="flex items-center gap-2 mt-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-[10px] text-green-600 font-bold">En vivo · Actualiza cada 3s</span></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/catalogo" className="btn-cute bg-blush-400 text-white text-xs px-4 py-2 hover:bg-blush-500">🧶 Catalogo</Link>
          <Link href="/pedidos" className="btn-cute bg-lavender-400 text-white text-xs px-4 py-2 hover:bg-lavender-500">📋 Pedidos</Link>
          <Link href="/admin/pagos" className="btn-cute bg-green-500 text-white text-xs px-4 py-2 hover:bg-green-600">💰 Pagos</Link>
          <Link href="/admin/materiales" className="btn-cute bg-amber-500 text-white text-xs px-4 py-2 hover:bg-amber-600">🧶 Materiales</Link>
        </div>
      </div>

      {/* ═══ Row 1: Main KPIs ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <KPI emoji="💰" label="Ventas" value={`$${(s.totalSales || 0).toFixed(0)}`} sub="MXN cobrado" color="from-green-50 to-emerald-50 border-green-200" />
        <KPI emoji="📦" label="Pedidos" value={s.totalOrders || 0} sub={`${s.paidCount || 0} pagados`} color="from-sky-50 to-sky-100 border-sky-200" />
        <KPI emoji="🧸" label="Productos" value={s.totalProducts || 0} sub={`${s.featuredCount || 0} destacados`} color="from-blush-50 to-blush-100 border-blush-200" />
        <KPI emoji="👥" label="Clientes" value={s.totalUsers || 0} sub={`${s.reviews || 0} testimonios`} color="from-lavender-50 to-lavender-100 border-lavender-200" />
        <KPI emoji="💵" label="Ticket prom." value={`$${(s.avgOrder || 0).toFixed(0)}`} sub="por pedido" color="from-mint-50 to-mint-100 border-mint-200" />
        <KPI emoji="📈" label="Conversion" value={`${(s.convRate || 0).toFixed(0)}%`} sub="pagados/total" color="from-amber-50 to-amber-100 border-amber-200" />
      </div>

      {/* ═══ Row 2: Status pipeline ═══ */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        <Mini emoji="⏳" label="Pendientes" value={s.pendingCount || 0} color="text-amber-600 bg-amber-50 border-amber-200" />
        <Mini emoji="✅" label="Confirmados" value={s.confirmedCount || 0} color="text-sky-600 bg-sky-50 border-sky-200" />
        <Mini emoji="📦" label="Enviados" value={s.shippedCount || 0} color="text-indigo-600 bg-indigo-50 border-indigo-200" />
        <Mini emoji="🎉" label="Entregados" value={s.deliveredCount || 0} color="text-green-600 bg-green-50 border-green-200" />
        <Mini emoji="❌" label="Cancelados" value={s.cancelledCount || 0} color="text-red-500 bg-red-50 border-red-200" />
        <Mini emoji="💳" label="Pagados" value={s.paidCount || 0} color="text-green-600 bg-green-50 border-green-200" />
      </div>

      {/* ═══ Alerts ═══ */}
      {((s.pendingPayments || 0) > 0 || (s.outOfStock || 0) > 0 || (s.lowStock || 0) > 0 || (s.matOut || 0) > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {(s.pendingPayments || 0) > 0 && <Alert emoji="⚠️" text={`$${(s.pendingPayments || 0).toFixed(0)} pendiente de cobro`} sub={`${s.pendingCount} pedidos`} color="bg-amber-50 border-amber-200 text-amber-700" />}
          {(s.outOfStock || 0) > 0 && <Alert emoji="🚨" text={`${s.outOfStock} productos agotados`} sub="Sin stock" color="bg-red-50 border-red-200 text-red-600" />}
          {(s.lowStock || 0) > 0 && <Alert emoji="📉" text={`${s.lowStock} productos poco stock`} sub="≤3 unidades" color="bg-orange-50 border-orange-200 text-orange-600" />}
          {(s.matOut || 0) > 0 && <Alert emoji="🧶" text={`${s.matOut} materiales agotados`} sub="Revisar inventario" color="bg-red-50 border-red-200 text-red-600" />}
        </div>
      )}

      {/* ═══ Row 3: Charts — Orders + Revenue ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Orders chart */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <h3 className="font-display font-bold text-sm text-cocoa-700 mb-3">📊 Pedidos — 7 dias</h3>
          <BarChart data={(s.last7 || []).map((d: any) => ({ label: d.day, value: d.count }))} color="from-blush-400 to-blush-300" />
        </div>
        {/* Revenue chart */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <h3 className="font-display font-bold text-sm text-cocoa-700 mb-3">💰 Ingresos — 7 dias</h3>
          <BarChart data={(s.last7Sales || []).map((d: any) => ({ label: d.day, value: d.revenue }))} color="from-green-500 to-emerald-400" prefix="$" />
        </div>
      </div>

      {/* ═══ Row 4: Donut charts + Top products ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Status donut */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <h3 className="font-display font-bold text-sm text-cocoa-700 mb-3">📋 Estado de pedidos</h3>
          <DonutChart data={s.statusDist || []} total={s.totalOrders || 0} />
        </div>
        {/* Payment donut */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <h3 className="font-display font-bold text-sm text-cocoa-700 mb-3">💳 Estado de pagos</h3>
          <DonutChart data={s.payDist || []} total={s.totalOrders || 0} />
        </div>
        {/* Categories chart */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <h3 className="font-display font-bold text-sm text-cocoa-700 mb-3">🏷️ Productos por categoria</h3>
          <div className="space-y-2 mt-2">
            {(s.catDist || []).map((c: any, i: number) => {
              const max = Math.max(...(s.catDist || []).map((x: any) => x.count), 1);
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-0.5"><span className="text-cocoa-600 font-medium">{c.cat}</span><span className="text-cocoa-400">{c.count}</span></div>
                  <div className="h-2 bg-cream-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-lavender-400 to-blush-400 rounded-full transition-all" style={{ width: `${(c.count / max) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Top products */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <h3 className="font-display font-bold text-sm text-cocoa-700 mb-3">🏆 Mas vendidos</h3>
          <div className="space-y-2.5">
            {(s.topProducts || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blush-100 text-blush-500 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-cocoa-700 truncate">{p.title}</p><p className="text-[9px] text-cocoa-400">{p.qty} uds · ${p.revenue.toFixed(0)}</p></div>
              </div>
            ))}
            {(!s.topProducts || s.topProducts.length === 0) && <p className="text-xs text-cocoa-400 text-center py-3">Sin ventas aun</p>}
          </div>
        </div>
      </div>

      {/* ═══ Row 5: Materials + Reviews summary ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Materials overview */}
        <Link href="/admin/materiales" className="bg-white rounded-cute shadow-soft border border-cream-200 p-5 hover:shadow-warm transition-all group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-cocoa-700">🧶 Materiales</h3>
            <span className="text-[10px] text-blush-400 font-bold group-hover:text-blush-500">Ver todo →</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-cream-50 rounded-lg p-2 text-center"><p className="font-bold text-lg text-cocoa-700">{s.matTotal || 0}</p><p className="text-[9px] text-cocoa-400">Total</p></div>
            <div className="bg-green-50 rounded-lg p-2 text-center"><p className="font-bold text-lg text-green-700">${(s.matValue || 0).toFixed(0)}</p><p className="text-[9px] text-green-600">Valor</p></div>
            <div className="bg-amber-50 rounded-lg p-2 text-center"><p className="font-bold text-lg text-amber-700">{s.matLow || 0}</p><p className="text-[9px] text-amber-600">⚠️ Poco</p></div>
            <div className="bg-red-50 rounded-lg p-2 text-center"><p className="font-bold text-lg text-red-500">{s.matOut || 0}</p><p className="text-[9px] text-red-400">❌ Agotado</p></div>
          </div>
        </Link>

        {/* Reviews overview */}
        <Link href="/admin/resenas" className="bg-white rounded-cute shadow-soft border border-cream-200 p-5 hover:shadow-warm transition-all group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-cocoa-700">⭐ Reseñas</h3>
            <span className="text-[10px] text-blush-400 font-bold group-hover:text-blush-500">Gestionar →</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blush-50 rounded-lg p-2 text-center"><p className="font-bold text-lg text-blush-500">{s.reviews || 0}</p><p className="text-[9px] text-blush-400">Testimonios</p></div>
            <div className="bg-lavender-50 rounded-lg p-2 text-center"><p className="font-bold text-lg text-lavender-500">{s.prodReviewCount || 0}</p><p className="text-[9px] text-lavender-400">De productos</p></div>
          </div>
        </Link>

        {/* Stock overview */}
        <Link href="/admin/productos" className="bg-white rounded-cute shadow-soft border border-cream-200 p-5 hover:shadow-warm transition-all group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-cocoa-700">📦 Inventario</h3>
            <span className="text-[10px] text-blush-400 font-bold group-hover:text-blush-500">Gestionar →</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded-lg p-2 text-center"><p className="font-bold text-lg text-green-700">{(s.totalProducts || 0) - (s.lowStock || 0) - (s.outOfStock || 0)}</p><p className="text-[9px] text-green-600">✅ OK</p></div>
            <div className="bg-amber-50 rounded-lg p-2 text-center"><p className="font-bold text-lg text-amber-700">{s.lowStock || 0}</p><p className="text-[9px] text-amber-600">⚠️ Poco</p></div>
            <div className="bg-red-50 rounded-lg p-2 text-center"><p className="font-bold text-lg text-red-500">{s.outOfStock || 0}</p><p className="text-[9px] text-red-400">❌ Sin</p></div>
          </div>
        </Link>
      </div>

      {/* ═══ Row 6: Recent orders + Recent users ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-cocoa-700">📦 Pedidos recientes</h3>
            <Link href="/pedidos" className="text-[10px] font-bold text-blush-400 hover:text-blush-500">Ver todos →</Link>
          </div>
          <div className="space-y-1.5">
            {(s.recentOrders || []).map((o: any) => (
              <div key={o._id} className="flex items-center gap-2 p-2 bg-cream-50/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5"><span className="font-mono text-[9px] text-cocoa-300">#{o.orderNumber}</span><span className="text-[9px]">{ST_EMOJI[o.status]}</span><span className="text-[9px]">{PAY_EMOJI[o.paymentStatus]}</span></div>
                  <p className="text-[11px] font-semibold text-cocoa-700 truncate">{o.userName}</p>
                </div>
                <p className="font-bold text-xs text-cocoa-700">${(o.total || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-cocoa-700">👥 Nuevos clientes</h3>
            <Link href="/admin/usuarios" className="text-[10px] font-bold text-blush-400 hover:text-blush-500">Ver todos →</Link>
          </div>
          <div className="space-y-1.5">
            {(s.recentUsers || []).map((u: any) => (
              <div key={u._id} className="flex items-center gap-2 p-2 bg-cream-50/50 rounded-lg">
                {u.image ? <img src={u.image} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center text-xs font-bold text-lavender-500">{(u.name || '?')[0]}</div>}
                <div className="flex-1 min-w-0"><p className="text-[11px] font-semibold text-cocoa-700 truncate">{u.name}</p><p className="text-[9px] text-cocoa-400 truncate">{u.email}</p></div>
                <span className="text-[9px] text-cocoa-300">{new Date(u.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Quick Actions ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <QLink href="/catalogo" emoji="🧶" title="Catalogo" />
        <QLink href="/pedidos" emoji="📋" title="Pedidos" />
        <QLink href="/admin/pagos" emoji="💰" title="Pagos" />
        <QLink href="/admin/materiales" emoji="🧵" title="Materiales" />
        <QLink href="/admin/usuarios" emoji="👥" title="Usuarios" />
        <QLink href="/admin/resenas" emoji="⭐" title="Reseñas" />
        <QLink href="/admin/productos" emoji="📦" title="Inventario" />
        <QLink href="/preguntas" emoji="❓" title="FAQs" />
        <QLink href="/" emoji="🏠" title="Tienda" />
        <QLink href="/contacto" emoji="📝" title="Nosotros" />
      </div>
    </div>
  );
}

// ─── Components ───

function KPI({ emoji, label, value, sub, color }: { emoji: string; label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-cute border p-4`}>
      <div className="flex items-center gap-2 mb-1"><span className="text-xl">{emoji}</span><span className="text-[10px] font-bold text-cocoa-400">{label}</span></div>
      <p className="font-display font-bold text-xl text-cocoa-700">{value}</p>
      <p className="text-[9px] text-cocoa-400">{sub}</p>
    </div>
  );
}

function Mini({ emoji, label, value, color }: { emoji: string; label: string; value: number; color: string }) {
  return <div className={`${color} rounded-cute border p-2.5 text-center`}><span className="text-base">{emoji}</span><p className="font-bold text-base">{value}</p><p className="text-[9px] font-semibold">{label}</p></div>;
}

function Alert({ emoji, text, sub, color }: { emoji: string; text: string; sub: string; color: string }) {
  return <div className={`${color} rounded-cute border p-3 flex items-center gap-2 flex-1`}><span className="text-xl">{emoji}</span><div><p className="font-bold text-xs">{text}</p><p className="text-[10px] opacity-75">{sub}</p></div></div>;
}

function QLink({ href, emoji, title }: { href: string; emoji: string; title: string }) {
  return <Link href={href} className="bg-white rounded-cute shadow-soft border border-cream-200 p-3 text-center hover:shadow-warm hover:-translate-y-0.5 transition-all"><span className="text-xl block">{emoji}</span><p className="text-[11px] font-bold text-cocoa-700 mt-1">{title}</p></Link>;
}

function BarChart({ data, color, prefix = '' }: { data: { label: string; value: number }[]; color: string; prefix?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * 100, 6);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold text-cocoa-500">{prefix}{d.value > 0 ? (d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value) : ''}</span>
            <div className={`w-full bg-gradient-to-t ${color} rounded-t-md transition-all duration-500`} style={{ height: `${h}%` }} />
            <span className="text-[8px] text-cocoa-400 font-medium truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  if (data.length === 0) return <p className="text-xs text-cocoa-400 text-center py-6">Sin datos</p>;
  // CSS conic-gradient donut
  let cumulative = 0;
  const segments = data.map(d => {
    const start = cumulative;
    const pct = total > 0 ? (d.value / total) * 100 : 0;
    cumulative += pct;
    return { ...d, start, pct };
  });
  const gradient = segments.map(s => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(', ');

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-full flex-shrink-0 relative" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
          <span className="font-bold text-sm text-cocoa-700">{total}</span>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] text-cocoa-600 flex-1">{s.label}</span>
            <span className="text-[10px] font-bold text-cocoa-700">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
