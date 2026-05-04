'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SystemsAdminDashboard from '@/components/SystemsAdminDashboard';
import { isSystemsAdmin } from '@/lib/systemsAdmin';
import { getCached, setCached, dedupedFetchJson } from '@/lib/fetchCache';

const ST_EMOJI: Record<string, string> = { pending: '⏳', confirmed: '✅', shipped: '📦', delivered: '🎉', cancelled: '❌' };
const ST_LABEL: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };
const PAY_EMOJI: Record<string, string> = { pending: '💳', paid: '✅', refunded: '↩️' };

export default function AdminDashboard({ initialStats }: { initialStats?: any } = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  // El dashboard Matrix sigue disponible vía /admin?vista=sistemas — opt-in.
  // Por defecto el admin de sistemas ve el dashboard regular para que respete
  // el diseño base y los temas festivos del sitio.
  const wantsSystemsView = searchParams?.get('vista') === 'sistemas';
  // SSR prop → cache local → nada. La UI pinta al instante con initialStats.
  const cachedStats = getCached<any>('/api/admin/stats');
  const seed = initialStats || cachedStats || null;
  if (initialStats && !cachedStats) setCached('/api/admin/stats', initialStats);
  const [stats, setStats] = useState<any>(seed);
  const [loading, setLoading] = useState(!seed);
  const [detailModal, setDetailModal] = useState<{ type: string; title: string } | null>(null);
  const [paused, setPaused] = useState(false);
  // Refs used to skip refetch when user is interacting (modal open, hovering cards, scrolling)
  const pausedRef = useRef(false);
  const modalOpenRef = useRef(false);
  pausedRef.current = paused;
  modalOpenRef.current = detailModal !== null;

  const fetchStats = () => {
    // Skip update while the admin is reading a detail modal or has paused live refresh
    if (pausedRef.current || modalOpenRef.current) return;
    dedupedFetchJson<any>('/api/admin/stats')
      .then((d) => { setStats(d); setCached('/api/admin/stats', d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    // Primer load: ignora pause, y si ya hay cache no bloqueamos la UI.
    dedupedFetchJson<any>('/api/admin/stats')
      .then((d) => { setStats(d); setCached('/api/admin/stats', d); setLoading(false); })
      .catch(() => setLoading(false));
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [session, status, router]);

  if (status === 'loading' || loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🔧</span></div>;
  if (!session || (session.user as any)?.role !== 'admin') return null;

  const s = stats || {};

  // Vista "de sistemas" — terminal/Matrix theme. Solo se activa con
  // ?vista=sistemas en la URL para el admin tecnico (opt-in). Por defecto
  // ve el dashboard regular para mantener el diseño base y los temas
  // festivos consistentes con el resto del sitio.
  if (isSystemsAdmin(session.user?.email) && wantsSystemsView) {
    return (
      <SystemsAdminDashboard
        stats={s}
        session={session}
        paused={paused}
        onTogglePause={() => setPaused(p => !p)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Panel Admin 🔧</h1>
          <p className="text-cocoa-400 mt-1">Bienvenida, {session.user?.name} 👑</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${paused ? 'bg-amber-400' : 'bg-green-400 animate-pulse'}`} />
              <span className={`text-[10px] font-bold ${paused ? 'text-amber-600' : 'text-green-600'}`}>
                {paused ? 'Pausado · Datos congelados' : 'En vivo · Actualiza cada 5s'}
              </span>
            </div>
            <button
              onClick={() => setPaused(p => !p)}
              title={paused ? 'Reanudar la actualización automática' : 'Congelar los datos para revisarlos sin interrupciones'}
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${paused ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}
            >
              {paused ? '▶ Reanudar' : '⏸ Pausar'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/catalogo" className="btn-cute bg-blush-400 text-white text-xs px-4 py-2 hover:bg-blush-500">🧶 Catalogo</Link>
          <Link href="/admin/productos" className="btn-cute bg-orange-400 text-white text-xs px-4 py-2 hover:bg-orange-500">📋 Proceso</Link>
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

      {/* ═══ Row 2: Pipeline de pedidos (gráfica combinada reemplaza 6 cards) ═══ */}
      <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm text-cocoa-700">📊 Pipeline de pedidos</h3>
          <span className="text-[10px] text-cocoa-300">Toca una barra para ver el detalle</span>
        </div>
        <PipelineChart
          items={[
            { key: 'pending', label: 'Pendientes', emoji: '⏳', value: s.pendingCount || 0, color: '#f59e0b', modal: { type: 'status-pending', title: '⏳ Pedidos Pendientes' } },
            { key: 'confirmed', label: 'Confirmados', emoji: '✅', value: s.confirmedCount || 0, color: '#0ea5e9', modal: { type: 'status-confirmed', title: '✅ Pedidos Confirmados' } },
            { key: 'shipped', label: 'Enviados', emoji: '📦', value: s.shippedCount || 0, color: '#6366f1', modal: { type: 'status-shipped', title: '📦 Pedidos Enviados' } },
            { key: 'delivered', label: 'Entregados', emoji: '🎉', value: s.deliveredCount || 0, color: '#16a34a', modal: { type: 'status-delivered', title: '🎉 Pedidos Entregados' } },
            { key: 'cancelled', label: 'Cancelados', emoji: '❌', value: s.cancelledCount || 0, color: '#dc2626', modal: { type: 'status-cancelled', title: '❌ Pedidos Cancelados' } },
            { key: 'paid', label: 'Pagados', emoji: '💳', value: s.paidCount || 0, color: '#10b981', modal: { type: 'status-paid', title: '💳 Pedidos Pagados' } },
          ]}
          onBarClick={(m) => setDetailModal(m)}
        />
      </div>

      {/* ═══ Alerts ═══ */}
      {((s.pendingPayments || 0) > 0 || (s.outOfStock || 0) > 0 || (s.matOut || 0) > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {(s.pendingPayments || 0) > 0 && <Alert emoji="⚠️" text={`$${(s.pendingPayments || 0).toFixed(0)} pendiente de cobro`} sub={`${s.pendingCount} pedidos`} color="bg-amber-50 border-amber-200 text-amber-700" />}
          {(s.outOfStock || 0) > 0 && <Alert emoji="🚨" text={`${s.outOfStock} productos agotados`} sub="Sin stock" color="bg-red-50 border-red-200 text-red-600" />}
          {(s.matOut || 0) > 0 && <Alert emoji="🧶" text={`${s.matOut} materiales agotados`} sub="Revisar inventario" color="bg-red-50 border-red-200 text-red-600" />}
        </div>
      )}

      {/* ═══ Row 3a: Executive trend — Area chart ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display font-bold text-sm text-cocoa-700">📈 Tendencia de ingresos — 7 días</h3>
              <p className="text-[10px] text-cocoa-400">Total: <span className="font-bold text-green-600">${((s.last7Sales || []).reduce((a: number, b: any) => a + (b.revenue || 0), 0)).toFixed(0)}</span> · Promedio diario: <span className="font-bold text-cocoa-600">${(((s.last7Sales || []).reduce((a: number, b: any) => a + (b.revenue || 0), 0)) / Math.max((s.last7Sales || []).length, 1)).toFixed(0)}</span></p>
            </div>
            <span className="text-[10px] text-cocoa-300">Últimos 7 días</span>
          </div>
          <AreaChart data={(s.last7Sales || []).map((d: any) => ({ label: d.day, value: d.revenue }))} color="#10b981" prefix="$" />
        </div>
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-cocoa-700">🎯 KPIs clave</h3>
            <span className="text-[10px] text-cocoa-300">Semanal</span>
          </div>
          <div className="space-y-2.5">
            <KpiRow label="Tasa conversión" value={`${(s.convRate || 0).toFixed(1)}%`} pct={Math.min(s.convRate || 0, 100)} color="#b39ddb" />
            <KpiRow label="% Pagados" value={`${s.totalOrders ? Math.round(((s.paidCount || 0) / s.totalOrders) * 100) : 0}%`} pct={s.totalOrders ? ((s.paidCount || 0) / s.totalOrders) * 100 : 0} color="#34d399" />
            <KpiRow label="% Entregados" value={`${s.totalOrders ? Math.round(((s.deliveredCount || 0) / s.totalOrders) * 100) : 0}%`} pct={s.totalOrders ? ((s.deliveredCount || 0) / s.totalOrders) * 100 : 0} color="#60a5fa" />
            <KpiRow label="% Stock saludable" value={`${s.totalProducts ? Math.round((((s.totalProducts || 0) - (s.lowStock || 0) - (s.outOfStock || 0)) / s.totalProducts) * 100) : 0}%`} pct={s.totalProducts ? (((s.totalProducts || 0) - (s.lowStock || 0) - (s.outOfStock || 0)) / s.totalProducts) * 100 : 0} color="#fbbf24" />
          </div>
        </div>
      </div>

      {/* ═══ Row 3b: Charts — Orders + Revenue ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Orders chart */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <h3 className="font-display font-bold text-sm text-cocoa-700 mb-3">📊 Pedidos — 7 días</h3>
          <BarChart data={(s.last7 || []).map((d: any) => ({ label: d.day, value: d.count }))} color="from-blush-400 to-blush-300" />
        </div>
        {/* Revenue chart */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
          <h3 className="font-display font-bold text-sm text-cocoa-700 mb-3">💰 Ingresos — 7 días</h3>
          <BarChart data={(s.last7Sales || []).map((d: any) => ({ label: d.day, value: d.revenue }))} color="from-green-500 to-emerald-400" prefix="$" />
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
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5 min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-cocoa-700">📦 Pedidos recientes</h3>
            <Link href="/admin/pedidos" className="text-[10px] font-bold text-blush-400 hover:text-blush-500">Ver todos →</Link>
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

        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5 min-h-[280px]">
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
        <QLink href="/admin/materiales" emoji="🧵" title="Materiales" />
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
    <div className={`bg-gradient-to-br ${color} rounded-cute border p-4 cursor-pointer hover:shadow-warm transition-shadow`} onClick={onClick}>
      <div className="flex items-center gap-2 mb-1"><span className="text-xl">{emoji}</span><span className="text-[10px] font-bold text-cocoa-400">{label}</span></div>
      <p className="font-display font-bold text-xl text-cocoa-700 tabular-nums">{value}</p>
      <p className="text-[9px] text-cocoa-400">{sub}</p>
    </div>
  );
}

function Mini({ emoji, label, value, color, onClick }: { emoji: string; label: string; value: number; color: string; onClick?: () => void }) {
  return <div className={`${color} rounded-cute border p-2.5 text-center cursor-pointer hover:shadow-warm transition-shadow`} onClick={onClick}><span className="text-base">{emoji}</span><p className="font-bold text-base tabular-nums">{value}</p><p className="text-[9px] font-semibold">{label}</p></div>;
}

function Alert({ emoji, text, sub, color }: { emoji: string; text: string; sub: string; color: string }) {
  return <div className={`${color} rounded-cute border p-3 flex items-center gap-2 flex-1`}><span className="text-xl">{emoji}</span><div><p className="font-bold text-xs">{text}</p><p className="text-[10px] opacity-75">{sub}</p></div></div>;
}

function QLink({ href, emoji, title }: { href: string; emoji: string; title: string }) {
  return <Link href={href} className="bg-white rounded-cute shadow-soft border border-cream-200 p-3 text-center hover:shadow-warm hover:-translate-y-0.5 transition-all"><span className="text-xl block">{emoji}</span><p className="text-[11px] font-bold text-cocoa-700 mt-1">{title}</p></Link>;
}

// Gráfica única que reemplaza las 6 mini-cards del pipeline
function PipelineChart({ items, onBarClick }: {
  items: { key: string; label: string; emoji: string; value: number; color: string; modal: { type: string; title: string } }[];
  onBarClick: (modal: { type: string; title: string }) => void;
}) {
  const max = Math.max(...items.map(i => i.value), 1);
  const total = items.reduce((a, b) => a + b.value, 0);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] text-cocoa-400 mb-1">
        <span className="font-semibold">Total pedidos en pipeline:</span>
        <span className="font-bold text-cocoa-700 tabular-nums">{total}</span>
      </div>
      {items.map(it => {
        const pct = (it.value / max) * 100;
        return (
          <button
            key={it.key}
            onClick={() => onBarClick(it.modal)}
            className="w-full flex items-center gap-3 text-left group"
            title={`Ver detalle de ${it.label}`}
          >
            <div className="w-28 md:w-32 flex-shrink-0 flex items-center gap-1.5">
              <span className="text-sm">{it.emoji}</span>
              <span className="text-xs font-semibold text-cocoa-600 group-hover:text-cocoa-800 truncate">{it.label}</span>
            </div>
            <div className="flex-1 h-6 bg-cream-100 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-700 group-hover:brightness-110"
                style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: it.color }}
              />
            </div>
            <span className="w-12 text-right text-sm font-bold text-cocoa-700 tabular-nums">{it.value}</span>
          </button>
        );
      })}
    </div>
  );
}

function KpiRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-cocoa-500 font-medium">{label}</span>
        <span className="text-cocoa-700 font-bold">{value}</span>
      </div>
      <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(Math.min(pct, 100), 0)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function fmtNum(n: number, prefix = '') {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${prefix}${(n / 1000).toFixed(1)}k`;
  return `${prefix}${n}`;
}

// Enterprise bar chart — SVG with gridlines, axis, hover tooltip
function BarChart({ data, color, prefix = '' }: { data: { label: string; value: number }[]; color: string; prefix?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!data.length) return <p className="text-xs text-cocoa-400 text-center py-6">Sin datos</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  const niceMax = Math.ceil(max * 1.1);
  // gradient colors from tailwind class (map popular classes → hex)
  const GRAD: Record<string, [string, string]> = {
    'from-blush-400 to-blush-300': ['#f3a6bf', '#fbd0db'],
    'from-green-500 to-emerald-400': ['#10b981', '#34d399'],
    'from-lavender-400 to-blush-400': ['#b39ddb', '#f3a6bf'],
  };
  const [c1, c2] = GRAD[color] || ['#94a3b8', '#cbd5e1'];
  const W = 320, H = 140, pad = { t: 10, r: 6, b: 20, l: 28 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const bw = cw / data.length;
  const gid = `bar-${c1.replace('#', '')}`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={c1} stopOpacity="0.95" />
            <stop offset="100%" stopColor={c2} stopOpacity="0.75" />
          </linearGradient>
        </defs>
        {/* gridlines + Y labels */}
        {gridLines.map((g, i) => {
          const y = pad.t + ch * (1 - g);
          const val = Math.round(niceMax * g);
          return (
            <g key={i}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#f1e9e0" strokeDasharray="3 3" />
              <text x={pad.l - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#a8998a">{fmtNum(val, prefix)}</text>
            </g>
          );
        })}
        {/* bars */}
        {data.map((d, i) => {
          const h = (d.value / niceMax) * ch;
          const x = pad.l + bw * i + bw * 0.15;
          const y = pad.t + ch - h;
          const w = bw * 0.7;
          const isHover = hover === i;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <rect x={pad.l + bw * i} y={pad.t} width={bw} height={ch} fill="transparent" />
              <rect x={x} y={y} width={w} height={Math.max(h, 1)} rx="3" fill={`url(#${gid})`} opacity={isHover ? 1 : 0.9} />
              {isHover && (
                <text x={x + w / 2} y={y - 3} textAnchor="middle" fontSize="9" fontWeight="700" fill="#6b5a4a">
                  {prefix}{d.value}
                </text>
              )}
              <text x={pad.l + bw * i + bw / 2} y={H - 6} textAnchor="middle" fontSize="8" fill="#a8998a">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Enterprise area/line chart for trends — smooth curve + area fill
function AreaChart({ data, color = '#10b981', prefix = '' }: { data: { label: string; value: number }[]; color?: string; prefix?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!data.length) return <p className="text-xs text-cocoa-400 text-center py-6">Sin datos</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  const niceMax = Math.ceil(max * 1.15) || 1;
  const W = 320, H = 140, pad = { t: 10, r: 10, b: 20, l: 28 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const step = data.length > 1 ? cw / (data.length - 1) : 0;
  const points = data.map((d, i) => ({ x: pad.l + step * i, y: pad.t + ch - (d.value / niceMax) * ch, v: d.value, l: d.label }));
  // smooth path
  const linePath = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `Q ${cx} ${prev.y}, ${cx} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`;
  }).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${pad.t + ch} L ${points[0].x} ${pad.t + ch} Z`;
  const gid = `area-${color.replace('#', '')}`;
  const gridLines = [0, 0.5, 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridLines.map((g, i) => {
        const y = pad.t + ch * (1 - g);
        const val = Math.round(niceMax * g);
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#f1e9e0" strokeDasharray="3 3" />
            <text x={pad.l - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#a8998a">{fmtNum(val, prefix)}</text>
          </g>
        );
      })}
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i} onMouseEnter={() => setHover(i)}>
          <circle cx={p.x} cy={p.y} r={hover === i ? 5 : 3} fill="white" stroke={color} strokeWidth="2" />
          <rect x={p.x - step / 2} y={pad.t} width={step} height={ch} fill="transparent" />
          {hover === i && (
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="#6b5a4a">{prefix}{p.v}</text>
          )}
          <text x={p.x} y={H - 6} textAnchor="middle" fontSize="8" fill="#a8998a">{p.l}</text>
        </g>
      ))}
    </svg>
  );
}

// Enterprise donut — SVG with hover segments + legend
function DonutChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  const [hover, setHover] = useState<number | null>(null);
  if (data.length === 0 || total === 0) return <p className="text-xs text-cocoa-400 text-center py-6">Sin datos</p>;
  const cx = 50, cy = 50, r = 40, ir = 28;
  let acc = 0;
  const arcs = data.map((d, i) => {
    const pct = total > 0 ? d.value / total : 0;
    const start = acc;
    acc += pct;
    const end = acc;
    const a1 = start * 2 * Math.PI - Math.PI / 2;
    const a2 = end * 2 * Math.PI - Math.PI / 2;
    const large = end - start > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const x3 = cx + ir * Math.cos(a2), y3 = cy + ir * Math.sin(a2);
    const x4 = cx + ir * Math.cos(a1), y4 = cy + ir * Math.sin(a1);
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${large} 0 ${x4} ${y4} Z`;
    return { ...d, path, pct };
  });
  const hv = hover !== null ? arcs[hover] : null;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0" onMouseLeave={() => setHover(null)}>
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill={a.color} opacity={hover === null || hover === i ? 1 : 0.35}
            onMouseEnter={() => setHover(i)}
            style={{ transition: 'opacity 0.2s' }} />
        ))}
        <text x="50" y={hv ? 47 : 52} textAnchor="middle" fontSize={hv ? '10' : '14'} fontWeight="800" fill="#6b5a4a">
          {hv ? `${Math.round(hv.pct * 100)}%` : total}
        </text>
        {hv && <text x="50" y="60" textAnchor="middle" fontSize="6" fill="#a8998a">{hv.label}</text>}
      </svg>
      <div className="flex-1 space-y-1">
        {arcs.map((s, i) => (
          <div key={i} className={`flex items-center gap-2 px-1 rounded transition-colors ${hover === i ? 'bg-cream-50' : ''}`}
               onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] text-cocoa-600 flex-1">{s.label}</span>
            <span className="text-[10px] font-bold text-cocoa-700">{s.value}</span>
            <span className="text-[9px] text-cocoa-400 w-8 text-right">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tiny sparkline for KPI cards
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const W = 80, H = 22;
  const step = data.length > 1 ? W / (data.length - 1) : 0;
  const pts = data.map((v, i) => `${i * step},${H - (v / max) * H}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-20 h-5 mt-1">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
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

  // Bloquear scroll del body mientras el modal está abierto (el fondo no se mueve)
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    // Compensar el scrollbar que se oculta
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, []);

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
