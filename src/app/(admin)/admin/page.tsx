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
  const [detailModal, setDetailModal] = useState<{ type: string; title: string } | null>(null);

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
        <KPI emoji="💰" label="Ventas" value={`$${(s.totalSales || 0).toFixed(0)}`} sub="MXN cobrado" color="from-green-50 to-emerald-50 border-green-200" onClick={() => setDetailModal({ type: 'ventas', title: '💰 Ventas — Detalle' })} />
        <KPI emoji="📦" label="Pedidos" value={s.totalOrders || 0} sub={`${s.paidCount || 0} pagados`} color="from-sky-50 to-sky-100 border-sky-200" onClick={() => setDetailModal({ type: 'pedidos', title: '📦 Pedidos — Detalle' })} />
        <KPI emoji="🧸" label="Productos" value={s.totalProducts || 0} sub={`${s.featuredCount || 0} destacados`} color="from-blush-50 to-blush-100 border-blush-200" onClick={() => setDetailModal({ type: 'productos', title: '🧸 Productos — Detalle' })} />
        <KPI emoji="👥" label="Clientes" value={s.totalUsers || 0} sub={`${s.reviews || 0} testimonios`} color="from-lavender-50 to-lavender-100 border-lavender-200" onClick={() => setDetailModal({ type: 'clientes', title: '👥 Clientes — Detalle' })} />
        <KPI emoji="💵" label="Ticket prom." value={`$${(s.avgOrder || 0).toFixed(0)}`} sub="por pedido" color="from-mint-50 to-mint-100 border-mint-200" onClick={() => setDetailModal({ type: 'ticket', title: '💵 Ticket Promedio — Detalle' })} />
        <KPI emoji="📈" label="Conversion" value={`${(s.convRate || 0).toFixed(0)}%`} sub="pagados/total" color="from-amber-50 to-amber-100 border-amber-200" onClick={() => setDetailModal({ type: 'conversion', title: '📈 Conversion — Detalle' })} />
      </div>

      {/* ═══ Row 2: Status pipeline ═══ */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        <Mini emoji="⏳" label="Pendientes" value={s.pendingCount || 0} color="text-amber-600 bg-amber-50 border-amber-200" onClick={() => setDetailModal({ type: 'status-pending', title: '⏳ Pedidos Pendientes' })} />
        <Mini emoji="✅" label="Confirmados" value={s.confirmedCount || 0} color="text-sky-600 bg-sky-50 border-sky-200" onClick={() => setDetailModal({ type: 'status-confirmed', title: '✅ Pedidos Confirmados' })} />
        <Mini emoji="📦" label="Enviados" value={s.shippedCount || 0} color="text-indigo-600 bg-indigo-50 border-indigo-200" onClick={() => setDetailModal({ type: 'status-shipped', title: '📦 Pedidos Enviados' })} />
        <Mini emoji="🎉" label="Entregados" value={s.deliveredCount || 0} color="text-green-600 bg-green-50 border-green-200" onClick={() => setDetailModal({ type: 'status-delivered', title: '🎉 Pedidos Entregados' })} />
        <Mini emoji="❌" label="Cancelados" value={s.cancelledCount || 0} color="text-red-500 bg-red-50 border-red-200" onClick={() => setDetailModal({ type: 'status-cancelled', title: '❌ Pedidos Cancelados' })} />
        <Mini emoji="💳" label="Pagados" value={s.paidCount || 0} color="text-green-600 bg-green-50 border-green-200" onClick={() => setDetailModal({ type: 'status-paid', title: '💳 Pedidos Pagados' })} />
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

      {/* ═══ Detail Modal ═══ */}
      {detailModal && <DetailModal modal={detailModal} stats={s} onClose={() => setDetailModal(null)} />}
    </div>
  );
}

// ─── Components ───

function KPI({ emoji, label, value, sub, color, onClick }: { emoji: string; label: string; value: string | number; sub: string; color: string; onClick?: () => void }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-cute border p-4 cursor-pointer hover:shadow-warm hover:-translate-y-0.5 transition-all`} onClick={onClick}>
      <div className="flex items-center gap-2 mb-1"><span className="text-xl">{emoji}</span><span className="text-[10px] font-bold text-cocoa-400">{label}</span></div>
      <p className="font-display font-bold text-xl text-cocoa-700">{value}</p>
      <p className="text-[9px] text-cocoa-400">{sub}</p>
    </div>
  );
}

function Mini({ emoji, label, value, color, onClick }: { emoji: string; label: string; value: number; color: string; onClick?: () => void }) {
  return <div className={`${color} rounded-cute border p-2.5 text-center cursor-pointer hover:shadow-warm hover:-translate-y-0.5 transition-all`} onClick={onClick}><span className="text-base">{emoji}</span><p className="font-bold text-base">{value}</p><p className="text-[9px] font-semibold">{label}</p></div>;
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

// ─── Detail Modal ───

function DetailModal({ modal, stats, onClose }: { modal: { type: string; title: string }; stats: any; onClose: () => void }) {
  const s = stats;

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const renderContent = () => {
    switch (modal.type) {
      // ── KPI: Ventas ──
      case 'ventas': {
        const paidSales = s.totalSales || 0;
        const pendingSales = s.pendingPayments || 0;
        const totalAll = paidSales + pendingSales;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Total cobrado" value={`$${paidSales.toFixed(2)}`} color="bg-green-50 text-green-700" />
              <StatBox label="Pendiente de cobro" value={`$${pendingSales.toFixed(2)}`} color="bg-amber-50 text-amber-700" />
              <StatBox label="Total general" value={`$${totalAll.toFixed(2)}`} color="bg-sky-50 text-sky-700" />
              <StatBox label="Promedio por pedido" value={`$${(s.avgOrder || 0).toFixed(2)}`} color="bg-lavender-50 text-lavender-700" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">Desglose por estado de pago</h4>
              <div className="space-y-1.5">
                {(s.payDist || []).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-cream-50 rounded-lg">
                    <span className="text-xs text-cocoa-600">{p.label}</span>
                    <span className="text-xs font-bold text-cocoa-700">{p.value} pedidos</span>
                  </div>
                ))}
              </div>
            </div>
            {(s.last7Sales || []).length > 0 && (
              <div>
                <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">Ingresos ultimos 7 dias</h4>
                <div className="space-y-1">
                  {(s.last7Sales || []).map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-cream-50 rounded-lg">
                      <span className="text-xs text-cocoa-600">{d.day}</span>
                      <span className="text-xs font-bold text-green-700">${(d.revenue || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // ── KPI: Pedidos ──
      case 'pedidos': {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Total pedidos" value={s.totalOrders || 0} color="bg-sky-50 text-sky-700" />
              <StatBox label="Pagados" value={s.paidCount || 0} color="bg-green-50 text-green-700" />
              <StatBox label="Promedio" value={`$${(s.avgOrder || 0).toFixed(0)}`} color="bg-lavender-50 text-lavender-700" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">Por estado de pedido</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <StatBox label="⏳ Pendientes" value={s.pendingCount || 0} color="bg-amber-50 text-amber-700" />
                <StatBox label="✅ Confirmados" value={s.confirmedCount || 0} color="bg-sky-50 text-sky-700" />
                <StatBox label="📦 Enviados" value={s.shippedCount || 0} color="bg-indigo-50 text-indigo-700" />
                <StatBox label="🎉 Entregados" value={s.deliveredCount || 0} color="bg-green-50 text-green-700" />
                <StatBox label="❌ Cancelados" value={s.cancelledCount || 0} color="bg-red-50 text-red-600" />
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">Por estado de pago</h4>
              <div className="space-y-1.5">
                {(s.payDist || []).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-cream-50 rounded-lg">
                    <span className="text-xs text-cocoa-600">{p.label}</span>
                    <span className="text-xs font-bold text-cocoa-700">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
            {(s.last7 || []).length > 0 && (
              <div>
                <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">Pedidos ultimos 7 dias</h4>
                <div className="space-y-1">
                  {(s.last7 || []).map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-cream-50 rounded-lg">
                      <span className="text-xs text-cocoa-600">{d.day}</span>
                      <span className="text-xs font-bold text-cocoa-700">{d.count} pedidos</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // ── KPI: Productos ──
      case 'productos': {
        const activeCount = (s.totalProducts || 0) - (s.outOfStock || 0);
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Total productos" value={s.totalProducts || 0} color="bg-blush-50 text-blush-600" />
              <StatBox label="Activos (con stock)" value={activeCount} color="bg-green-50 text-green-700" />
              <StatBox label="Agotados" value={s.outOfStock || 0} color="bg-red-50 text-red-600" />
              <StatBox label="Destacados" value={s.featuredCount || 0} color="bg-amber-50 text-amber-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Poco stock" value={s.lowStock || 0} color="bg-orange-50 text-orange-700" />
              <StatBox label="Stock OK" value={(s.totalProducts || 0) - (s.lowStock || 0) - (s.outOfStock || 0)} color="bg-green-50 text-green-700" />
            </div>
            {(s.catDist || []).length > 0 && (
              <div>
                <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">Por categoria</h4>
                <div className="space-y-1.5">
                  {(s.catDist || []).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-cream-50 rounded-lg">
                      <span className="text-xs text-cocoa-600">{c.cat}</span>
                      <span className="text-xs font-bold text-cocoa-700">{c.count} productos</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(s.outOfStockList || []).length > 0 && (
              <div>
                <h4 className="font-display font-bold text-xs text-red-600 mb-2">Productos agotados</h4>
                <div className="space-y-1.5">
                  {(s.outOfStockList || []).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                      <span className="text-lg">🚨</span>
                      <span className="text-xs font-semibold text-red-700">{p.title || p.name || `Producto ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(s.topProducts || []).length > 0 && (
              <div>
                <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">Mas vendidos</h4>
                <div className="space-y-1.5">
                  {(s.topProducts || []).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-cream-50 rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-blush-100 text-blush-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <span className="text-xs text-cocoa-700 font-semibold flex-1 truncate">{p.title}</span>
                      <span className="text-xs text-cocoa-400">{p.qty} uds</span>
                      <span className="text-xs font-bold text-green-700">${p.revenue.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // ── KPI: Clientes ──
      case 'clientes': {
        const adminCount = (s.recentUsers || []).filter((u: any) => u.role === 'admin').length;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatBox label="Total usuarios" value={s.totalUsers || 0} color="bg-lavender-50 text-lavender-700" />
              <StatBox label="Admins" value={s.adminCount ?? adminCount} color="bg-blush-50 text-blush-600" />
              <StatBox label="Testimonios" value={s.reviews || 0} color="bg-amber-50 text-amber-700" />
            </div>
            {(s.recentUsers || []).length > 0 && (
              <div>
                <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">Registros recientes</h4>
                <div className="space-y-1.5">
                  {(s.recentUsers || []).map((u: any, i: number) => (
                    <div key={u._id || i} className="flex items-center gap-2 p-2 bg-cream-50 rounded-lg">
                      {u.image ? (
                        <img src={u.image} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center text-xs font-bold text-lavender-500 flex-shrink-0">{(u.name || '?')[0]}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-cocoa-700 truncate">{u.name}</p>
                        <p className="text-[10px] text-cocoa-400 truncate">{u.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {u.role === 'admin' && <span className="text-[9px] bg-blush-100 text-blush-600 font-bold px-1.5 py-0.5 rounded-full">Admin</span>}
                        <p className="text-[9px] text-cocoa-300 mt-0.5">{new Date(u.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // ── KPI: Ticket Promedio ──
      case 'ticket': {
        const orders = s.recentOrders || [];
        const totals = orders.map((o: any) => o.total || 0);
        const minOrder = totals.length > 0 ? Math.min(...totals) : 0;
        const maxOrder = totals.length > 0 ? Math.max(...totals) : 0;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Ticket promedio" value={`$${(s.avgOrder || 0).toFixed(2)}`} color="bg-mint-50 text-mint-700" />
              <StatBox label="Pedido minimo" value={`$${minOrder.toFixed(2)}`} color="bg-sky-50 text-sky-700" />
              <StatBox label="Pedido maximo" value={`$${maxOrder.toFixed(2)}`} color="bg-green-50 text-green-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Total pedidos" value={s.totalOrders || 0} color="bg-lavender-50 text-lavender-700" />
              <StatBox label="Total ventas" value={`$${(s.totalSales || 0).toFixed(2)}`} color="bg-blush-50 text-blush-600" />
            </div>
            {orders.length > 0 && (
              <div>
                <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">Pedidos recientes (por monto)</h4>
                <div className="space-y-1">
                  {[...orders].sort((a: any, b: any) => (b.total || 0) - (a.total || 0)).map((o: any, i: number) => (
                    <div key={o._id || i} className="flex items-center justify-between p-2 bg-cream-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-mono text-[9px] text-cocoa-300">#{o.orderNumber}</span>
                        <span className="text-xs text-cocoa-600 truncate">{o.userName}</span>
                      </div>
                      <span className="text-xs font-bold text-cocoa-700 flex-shrink-0">${(o.total || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // ── KPI: Conversion ──
      case 'conversion': {
        const total = s.totalOrders || 0;
        const paid = s.paidCount || 0;
        const pending = s.pendingCount || 0;
        const cancelled = s.cancelledCount || 0;
        const confirmed = s.confirmedCount || 0;
        const shipped = s.shippedCount || 0;
        const delivered = s.deliveredCount || 0;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Tasa de conversion" value={`${(s.convRate || 0).toFixed(1)}%`} color="bg-amber-50 text-amber-700" />
              <StatBox label="Pedidos pagados" value={`${paid} de ${total}`} color="bg-green-50 text-green-700" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">Desglose completo</h4>
              <div className="space-y-2">
                <ConversionBar label="Pagados" value={paid} total={total} color="bg-green-400" />
                <ConversionBar label="Pendientes" value={pending} total={total} color="bg-amber-400" />
                <ConversionBar label="Confirmados" value={confirmed} total={total} color="bg-sky-400" />
                <ConversionBar label="Enviados" value={shipped} total={total} color="bg-indigo-400" />
                <ConversionBar label="Entregados" value={delivered} total={total} color="bg-emerald-400" />
                <ConversionBar label="Cancelados" value={cancelled} total={total} color="bg-red-400" />
              </div>
            </div>
          </div>
        );
      }

      // ── Status pipeline modals ──
      case 'status-pending':
      case 'status-confirmed':
      case 'status-shipped':
      case 'status-delivered':
      case 'status-cancelled':
      case 'status-paid': {
        const statusKey = modal.type.replace('status-', '');
        const isPaid = statusKey === 'paid';
        const orders: any[] = s.recentOrders || [];
        const filtered = isPaid
          ? orders.filter((o: any) => o.paymentStatus === 'paid')
          : orders.filter((o: any) => o.status === statusKey);

        const countMap: Record<string, number> = {
          pending: s.pendingCount || 0,
          confirmed: s.confirmedCount || 0,
          shipped: s.shippedCount || 0,
          delivered: s.deliveredCount || 0,
          cancelled: s.cancelledCount || 0,
          paid: s.paidCount || 0,
        };
        const totalInStatus = countMap[statusKey] || 0;

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Total en este estado" value={totalInStatus} color="bg-cream-50 text-cocoa-700" />
              <StatBox label="Del total de pedidos" value={`${s.totalOrders ? ((totalInStatus / s.totalOrders) * 100).toFixed(1) : 0}%`} color="bg-lavender-50 text-lavender-700" />
            </div>
            {filtered.length > 0 ? (
              <div>
                <h4 className="font-display font-bold text-xs text-cocoa-600 mb-2">
                  Pedidos {isPaid ? 'pagados' : (ST_LABEL[statusKey] || statusKey).toLowerCase() + 's'} (mostrando de recientes)
                </h4>
                <div className="space-y-1.5">
                  {filtered.map((o: any, i: number) => (
                    <div key={o._id || i} className="flex items-center gap-2 p-2.5 bg-cream-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[10px] text-cocoa-400 font-bold">#{o.orderNumber}</span>
                          <span className="text-[9px]">{ST_EMOJI[o.status]}</span>
                          <span className="text-[9px]">{PAY_EMOJI[o.paymentStatus]}</span>
                        </div>
                        <p className="text-xs font-semibold text-cocoa-700">{o.userName}</p>
                        {o.createdAt && <p className="text-[9px] text-cocoa-400">{new Date(o.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                      </div>
                      <p className="font-bold text-sm text-cocoa-700 flex-shrink-0">${(o.total || 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                {totalInStatus > filtered.length && (
                  <p className="text-[10px] text-cocoa-400 text-center mt-2">Mostrando {filtered.length} de {totalInStatus} pedidos. Ve a Pedidos para ver todos.</p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-cocoa-400">No hay pedidos recientes en este estado</p>
                <p className="text-[10px] text-cocoa-300 mt-1">{totalInStatus > 0 ? `Hay ${totalInStatus} en total, pero no aparecen en los mas recientes.` : 'No hay pedidos con este estado.'}</p>
              </div>
            )}
          </div>
        );
      }

      default:
        return <p className="text-sm text-cocoa-400 text-center py-6">Sin datos disponibles</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-cocoa-900/40 backdrop-blur-sm" />
      {/* Modal */}
      <div
        className="relative bg-white rounded-cute shadow-warm border border-cream-200 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cream-100">
          <h2 className="font-display font-bold text-base text-cocoa-700">{modal.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-cocoa-400 hover:text-cocoa-600 transition-colors"
          >
            ✕
          </button>
        </div>
        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ─── Modal sub-components ───

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`${color} rounded-lg p-3 text-center`}>
      <p className="font-display font-bold text-lg">{value}</p>
      <p className="text-[10px] font-semibold opacity-75">{label}</p>
    </div>
  );
}

function ConversionBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs text-cocoa-600">{label}</span>
        <span className="text-xs font-bold text-cocoa-700">{value} ({pct.toFixed(1)}%)</span>
      </div>
      <div className="h-2.5 bg-cream-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
