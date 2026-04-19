'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MatrixRain from './MatrixRain';

type Stats = any;
type DetailModalState = { type: string; title: string } | null;

/**
 * Dashboard "de sistemas" — estética terminal / programador con animaciones.
 * Mantiene TODA la funcionalidad del dashboard normal:
 *  - 6 KPIs principales clicables con modal de detalle
 *  - Pipeline de pedidos (6 estados)
 *  - Alertas (pendientes pago, stock, materiales)
 *  - Gráfica área de ingresos 7d + KPIs clave
 *  - Barras pedidos 7d + ingresos 7d
 *  - Overviews de materiales / reseñas / inventario
 *  - Pedidos recientes + usuarios nuevos como logs
 *  - Quick actions como comandos
 * Todo con fondos animados CSS por card y cero emojis.
 */

export default function SystemsAdminDashboard({
  stats,
  session,
  paused,
  onTogglePause,
}: {
  stats: Stats;
  session: any;
  paused: boolean;
  onTogglePause: () => void;
}) {
  const s: any = stats || {};
  const userName = session?.user?.name || 'root';
  const [detailModal, setDetailModal] = useState<DetailModalState>(null);

  return (
    <div className="relative min-h-screen bg-black text-green-300 font-mono overflow-hidden">
      <MatrixRain opacity={0.18} />
      <div className="pointer-events-none fixed inset-0 z-0 sys-grid-bg opacity-40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ═══ Terminal header ═══ */}
        <TerminalWindow title={`~/admin/${userName.toLowerCase().replace(/\s+/g, '-')} — zsh`} live={!paused} bgAnim="grid">
          <div className="space-y-0.5 text-xs">
            <Line prompt="sys@bubuyduducrochet">whoami</Line>
            <Line>
              <span className="text-cyan-300 sys-flicker">{userName}</span>
              <span className="text-green-500"> [role=admin tier=systems uid={(session?.user as any)?.id || '—'}]</span>
            </Line>
            <Line prompt="sys@bubuyduducrochet">uptime --env</Line>
            <Line>
              <span className="text-pink-300">NODE_ENV=production</span>
              <span className="text-pink-300"> REGION=vercel-edge</span>
              <span className="text-pink-300"> DB=mongodb-atlas</span>
              <span className="text-pink-300"> CACHE=cdn-edge</span>
            </Line>
            <Line prompt="sys@bubuyduducrochet">
              <span className="sys-typing">status --live --stats={'{paused:'}{String(paused)}{'}'}</span>
              <span className="sys-cursor text-green-400 ml-0.5">▋</span>
            </Line>
            <Line>
              {paused
                ? <span className="text-amber-300">[PAUSED] refresh interval suspended by operator</span>
                : <span className="text-green-400">[OK] 5s polling · cache hit ratio nominal · {s.totalOrders || 0} orders tracked</span>
              }
              <button
                onClick={onTogglePause}
                className="ml-3 px-2 py-0.5 text-[10px] font-bold border border-green-500/40 text-green-300 hover:bg-green-500/10 rounded sys-glitch"
              >
                [{paused ? 'RESUME' : 'PAUSE'}]
              </button>
            </Line>
          </div>
        </TerminalWindow>

        {/* ═══ Row 1: 6 KPIs clicables ═══ */}
        <SectionLabel cmd="cat metrics.json" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <CodeKpi label="TOTAL_SALES"  value={`$${(s.totalSales || 0).toFixed(0)}`} sub="MXN cobrado"              color="text-green-400"    bgAnim="grid"
            onClick={() => setDetailModal({ type: 'ventas',    title: 'sales.detail' })} />
          <CodeKpi label="ORDERS"       value={s.totalOrders || 0}                   sub={`${s.paidCount || 0} paid`}        color="text-cyan-300"     bgAnim="dots"
            onClick={() => setDetailModal({ type: 'pedidos',   title: 'orders.detail' })} />
          <CodeKpi label="PRODUCTS"     value={s.totalProducts || 0}                 sub={`${s.featuredCount || 0} featured`} color="text-pink-300"     bgAnim="stripes"
            onClick={() => setDetailModal({ type: 'productos', title: 'products.detail' })} />
          <CodeKpi label="USERS"        value={s.totalUsers || 0}                    sub={`${s.reviews || 0} reviews`}       color="text-amber-300"    bgAnim="grid"
            onClick={() => setDetailModal({ type: 'clientes',  title: 'users.detail' })} />
          <CodeKpi label="AVG_ORDER"    value={`$${(s.avgOrder || 0).toFixed(0)}`}   sub="per order"                          color="text-fuchsia-300"  bgAnim="dots"
            onClick={() => setDetailModal({ type: 'ticket',    title: 'avg_order.detail' })} />
          <CodeKpi label="CONV_RATE"    value={`${(s.convRate || 0).toFixed(1)}%`}   sub="paid/total"                         color="text-emerald-300"  bgAnim="stripes"
            onClick={() => setDetailModal({ type: 'conversion',title: 'conversion.detail' })} />
        </div>

        {/* ═══ Alertas ═══ */}
        {((s.pendingPayments || 0) > 0 || (s.outOfStock || 0) > 0 || (s.matOut || 0) > 0) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {(s.pendingPayments || 0) > 0 && (
              <AlertCode level="warn"  text={`UNPAID: $${(s.pendingPayments || 0).toFixed(0)} · ${s.pendingCount} orders`} />
            )}
            {(s.outOfStock || 0) > 0 && (
              <AlertCode level="error" text={`OUT_OF_STOCK: ${s.outOfStock} products`} />
            )}
            {(s.matOut || 0) > 0 && (
              <AlertCode level="error" text={`MATERIAL_DEPLETED: ${s.matOut} items`} />
            )}
          </div>
        )}

        {/* ═══ Row 2: Pipeline como barras ASCII ═══ */}
        <SectionLabel cmd="orders --pipeline --format=bars" />
        <TerminalWindow title="orders.pipeline()" bgAnim="grid">
          <AsciiPipeline
            items={[
              { key: 'pending',    label: 'PENDING',    value: s.pendingCount || 0,    color: '#f59e0b', modal: { type: 'status-pending',   title: 'orders.pending' } },
              { key: 'confirmed',  label: 'CONFIRMED',  value: s.confirmedCount || 0,  color: '#06b6d4', modal: { type: 'status-confirmed', title: 'orders.confirmed' } },
              { key: 'shipped',    label: 'SHIPPED',    value: s.shippedCount || 0,    color: '#818cf8', modal: { type: 'status-shipped',   title: 'orders.shipped' } },
              { key: 'delivered',  label: 'DELIVERED',  value: s.deliveredCount || 0,  color: '#22c55e', modal: { type: 'status-delivered', title: 'orders.delivered' } },
              { key: 'cancelled',  label: 'CANCELLED',  value: s.cancelledCount || 0,  color: '#ef4444', modal: { type: 'status-cancelled', title: 'orders.cancelled' } },
              { key: 'paid',       label: 'PAID',       value: s.paidCount || 0,       color: '#10b981', modal: { type: 'status-paid',      title: 'orders.paid' } },
            ]}
            onClick={(m) => setDetailModal(m)}
          />
        </TerminalWindow>

        {/* ═══ Row 3a: Revenue area + KPIs clave ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <TerminalWindow title="revenue --last 7d --format=area" bgAnim="grid" className="lg:col-span-2">
            <CodeAreaChart data={(s.last7Sales || []).map((d: any) => ({ label: d.day, value: d.revenue || 0 }))} unit="$" />
            <div className="mt-3 text-[10px] text-green-500 font-mono">
              <span className="text-green-300">total=</span>
              <span className="text-pink-300">${((s.last7Sales || []).reduce((a: number, b: any) => a + (b.revenue || 0), 0)).toFixed(0)}</span>
              <span className="text-green-300"> · avg=</span>
              <span className="text-pink-300">${(((s.last7Sales || []).reduce((a: number, b: any) => a + (b.revenue || 0), 0)) / Math.max((s.last7Sales || []).length, 1)).toFixed(0)}</span>
              <span className="text-green-300"> · peak=</span>
              <span className="text-pink-300">${Math.max(...(s.last7Sales || []).map((d: any) => d.revenue || 0), 0).toFixed(0)}</span>
            </div>
          </TerminalWindow>

          <TerminalWindow title="kpi.weekly --trend" bgAnim="dots">
            <div className="space-y-2.5">
              <KpiProgress label="CONV_RATE"        pct={Math.min(s.convRate || 0, 100)}                                                                               value={`${(s.convRate || 0).toFixed(1)}%`} color="#a78bfa" />
              <KpiProgress label="PAID_RATIO"       pct={s.totalOrders ? ((s.paidCount || 0) / s.totalOrders) * 100 : 0}                                                  value={`${s.totalOrders ? Math.round(((s.paidCount || 0) / s.totalOrders) * 100) : 0}%`}           color="#34d399" />
              <KpiProgress label="DELIVERED_RATIO"  pct={s.totalOrders ? ((s.deliveredCount || 0) / s.totalOrders) * 100 : 0}                                             value={`${s.totalOrders ? Math.round(((s.deliveredCount || 0) / s.totalOrders) * 100) : 0}%`}      color="#60a5fa" />
              <KpiProgress label="STOCK_HEALTH"     pct={s.totalProducts ? (((s.totalProducts || 0) - (s.lowStock || 0) - (s.outOfStock || 0)) / s.totalProducts) * 100 : 0}  value={`${s.totalProducts ? Math.round((((s.totalProducts || 0) - (s.lowStock || 0) - (s.outOfStock || 0)) / s.totalProducts) * 100) : 0}%`}           color="#fbbf24" />
            </div>
          </TerminalWindow>
        </div>

        {/* ═══ Row 3b: Barras pedidos + ingresos ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <TerminalWindow title="orders.histogram(7d)" bgAnim="stripes">
            <CodeBarChart data={(s.last7 || []).map((d: any) => ({ label: d.day, value: d.count || 0 }))} color="#22d3ee" />
          </TerminalWindow>
          <TerminalWindow title="revenue.histogram(7d)" bgAnim="grid">
            <CodeBarChart data={(s.last7Sales || []).map((d: any) => ({ label: d.day, value: d.revenue || 0 }))} color="#34d399" prefix="$" />
          </TerminalWindow>
        </div>

        {/* ═══ Row 4: Inventario / Reseñas / Materiales como JSON ═══ */}
        <SectionLabel cmd="cat modules/*.json" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ModuleJsonCard
            title="inventory.json"
            href="/admin/productos"
            bgAnim="grid"
            json={{
              total:     s.totalProducts || 0,
              in_stock:  (s.totalProducts || 0) - (s.lowStock || 0) - (s.outOfStock || 0),
              low_stock: s.lowStock || 0,
              out_stock: s.outOfStock || 0,
              featured:  s.featuredCount || 0,
            }}
          />
          <ModuleJsonCard
            title="reviews.json"
            href="/admin/resenas"
            bgAnim="dots"
            json={{
              testimonials:    s.reviews || 0,
              product_reviews: s.prodReviewCount || 0,
            }}
          />
          <ModuleJsonCard
            title="materials.json"
            href="/admin/materiales"
            bgAnim="stripes"
            json={{
              total: s.matTotal || 0,
              value: `$${(s.matValue || 0).toFixed(0)}`,
              low:   s.matLow || 0,
              out:   s.matOut || 0,
            }}
          />
        </div>

        {/* ═══ Row 5: Logs de pedidos + usuarios ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <TerminalWindow title="tail -f orders.log" live bgAnim="grid">
            <div className="space-y-1 text-[11px] max-h-64 overflow-auto">
              {(s.recentOrders || []).map((o: any) => (
                <div key={o._id} className="flex items-center gap-2 hover:bg-green-500/5 px-1 rounded">
                  <span className="text-green-500">[{new Date(o.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}]</span>
                  <span className="text-cyan-300">#{o.orderNumber}</span>
                  <span className="text-pink-300 tabular-nums">${(o.total || 0).toFixed(0)}</span>
                  <span className={`text-[10px] px-1.5 rounded ${ORDER_STATUS_COLOR[o.status] || 'bg-green-900/40 text-green-300'}`}>{(o.status || '').toUpperCase()}</span>
                  <span className={`text-[10px] ${o.paymentStatus === 'paid' ? 'text-green-400' : 'text-amber-300'}`}>{(o.paymentStatus || '').toUpperCase()}</span>
                  <span className="text-green-300 truncate">{o.userName}</span>
                </div>
              ))}
              {(s.recentOrders || []).length === 0 && <span className="text-green-500">// no recent orders</span>}
            </div>
            <Link href="/admin/pedidos" className="block mt-3 text-[10px] text-green-400 hover:underline">&gt; tail --follow /admin/pedidos</Link>
          </TerminalWindow>

          <TerminalWindow title="tail -f users.log" live bgAnim="dots">
            <div className="space-y-1 text-[11px] max-h-64 overflow-auto">
              {(s.recentUsers || []).map((u: any) => (
                <div key={u._id} className="flex items-center gap-2 hover:bg-green-500/5 px-1 rounded">
                  <span className="text-green-500">[{new Date(u.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}]</span>
                  <span className="text-cyan-300 truncate max-w-[10rem]">{u.name}</span>
                  <span className="text-fuchsia-300 truncate">{u.email}</span>
                </div>
              ))}
              {(s.recentUsers || []).length === 0 && <span className="text-green-500">// no new users</span>}
            </div>
            <Link href="/admin/usuarios" className="block mt-3 text-[10px] text-green-400 hover:underline">&gt; tail --follow /admin/usuarios</Link>
          </TerminalWindow>
        </div>

        {/* ═══ Navigation commands ═══ */}
        <SectionLabel cmd="ls modules/" />
        <TerminalWindow title="shell.nav()" bgAnim="grid">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <CmdLink href="/catalogo"         cmd="cd catalog/" />
            <CmdLink href="/admin/productos"  cmd="cd inventory/" />
            <CmdLink href="/admin/pedidos"    cmd="cd orders/" />
            <CmdLink href="/admin/pagos"      cmd="cd payments/" />
            <CmdLink href="/admin/materiales" cmd="cd materials/" />
            <CmdLink href="/admin/usuarios"   cmd="cd users/" />
            <CmdLink href="/admin/resenas"    cmd="cd reviews/" />
            <CmdLink href="/preguntas"        cmd="cd faqs/" />
            <CmdLink href="/"                 cmd="cd ../shop/" />
            <CmdLink href="/contacto"         cmd="cd about/" />
            <CmdLink href="/mi-cuenta"        cmd="cd ~/profile/" />
            <CmdLink href="/favoritos"        cmd="cd bookmarks/" />
          </div>
        </TerminalWindow>

        {/* Footer firma */}
        <div className="mt-8 text-[10px] text-green-500 border-t border-green-500/20 pt-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="opacity-60">// systems dashboard · build </span>
            <span className="text-cyan-300">{new Date().toISOString()}</span>
            <span className="opacity-60"> · </span>
            <span className="text-pink-300">role:admin</span>
            <span className="opacity-60"> · </span>
            <span className="text-amber-300">tier:systems</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 sys-blink" />
            <span className="text-green-400">SESSION_ACTIVE</span>
          </div>
        </div>

        {/* ═══ Detail Modal (code style) ═══ */}
        {detailModal && (
          <CodeDetailModal modal={detailModal} stats={s} onClose={() => setDetailModal(null)} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Subcomponentes
// ═══════════════════════════════════════════════════════════════

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending:   'bg-amber-950/50 text-amber-300 border border-amber-700/50',
  confirmed: 'bg-sky-950/50 text-sky-300 border border-sky-700/50',
  shipped:   'bg-indigo-950/50 text-indigo-300 border border-indigo-700/50',
  delivered: 'bg-green-950/50 text-green-300 border border-green-700/50',
  cancelled: 'bg-red-950/50 text-red-300 border border-red-700/50',
};

function SectionLabel({ cmd }: { cmd: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono text-green-500 mb-2 mt-6">
      <span className="text-pink-300">$</span>
      <span className="sys-flicker">{cmd}</span>
    </div>
  );
}

function TerminalWindow({
  title,
  children,
  className = '',
  live,
  bgAnim,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  live?: boolean;
  bgAnim?: 'grid' | 'dots' | 'stripes';
}) {
  const bgCls =
    bgAnim === 'grid' ? 'sys-grid-bg' :
    bgAnim === 'dots' ? 'sys-dots-bg' :
    bgAnim === 'stripes' ? 'sys-stripes-bg' : '';

  return (
    <div className={`relative rounded-lg border border-green-500/30 bg-black/75 backdrop-blur-sm shadow-[0_0_40px_rgba(0,255,65,0.08)] overflow-hidden sys-scanline ${className}`}>
      {bgCls && <div className={`pointer-events-none absolute inset-0 ${bgCls} opacity-30`} />}
      <div className="relative flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-green-900/40 to-black border-b border-green-500/20">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-[11px] font-mono text-green-300 truncate max-w-[70%]">{title}</span>
        {live !== undefined ? (
          <span className={`text-[10px] font-mono flex items-center gap-1 ${live ? 'text-green-400' : 'text-amber-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-400 sys-blink' : 'bg-amber-400'}`} />
            {live ? 'LIVE' : 'PAUSED'}
          </span>
        ) : <span className="w-12" />}
      </div>
      <div className="relative p-3">{children}</div>
    </div>
  );
}

function Line({ prompt, children }: { prompt?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 font-mono">
      {prompt && <span className="text-pink-300 select-none">{prompt}:~$</span>}
      <span className="flex-1 break-all">{children}</span>
    </div>
  );
}

function CodeKpi({
  label, value, sub, color, onClick, bgAnim,
}: {
  label: string; value: string | number; sub: string; color: string;
  onClick?: () => void; bgAnim?: 'grid' | 'dots' | 'stripes';
}) {
  const bgCls =
    bgAnim === 'grid' ? 'sys-grid-bg' :
    bgAnim === 'dots' ? 'sys-dots-bg' :
    bgAnim === 'stripes' ? 'sys-stripes-bg' : '';
  return (
    <button
      onClick={onClick}
      className="relative group rounded-md border border-green-500/25 bg-black/60 backdrop-blur-sm p-3 text-left hover:border-green-400/60 sys-pulse-glow sys-glitch transition-colors overflow-hidden"
    >
      {bgCls && <div className={`pointer-events-none absolute inset-0 ${bgCls} opacity-30 group-hover:opacity-60 transition-opacity`} />}
      <div className="pointer-events-none absolute inset-0 sys-scanline opacity-40" />
      <div className="relative">
        <p className="text-[10px] text-green-500 uppercase tracking-wider font-mono">{'>_'} {label}</p>
        <p className={`font-mono font-bold text-xl ${color} tabular-nums mt-1 group-hover:sys-flicker`}>{value}</p>
        <p className="text-[10px] text-green-700 font-mono mt-0.5">// {sub}</p>
      </div>
    </button>
  );
}

function AlertCode({ level, text }: { level: 'warn' | 'error'; text: string }) {
  const cls = level === 'error'
    ? 'border-red-500/40 bg-red-950/40 text-red-300'
    : 'border-amber-500/40 bg-amber-950/40 text-amber-300';
  const tag = level === 'error' ? 'ERROR' : 'WARN';
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded border ${cls} font-mono text-xs sys-pulse-glow`}>
      <span className="font-bold">[{tag}]</span>
      <span>{text}</span>
    </div>
  );
}

function AsciiPipeline({
  items, onClick,
}: {
  items: { key: string; label: string; value: number; color: string; modal: { type: string; title: string } }[];
  onClick: (m: { type: string; title: string }) => void;
}) {
  const max = Math.max(...items.map(i => i.value), 1);
  const width = 30;
  const total = items.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="text-[10px] text-green-500 mb-2">
        <span className="text-pink-300">const</span> pipeline = [<span className="text-cyan-300">{items.length}</span>] <span className="text-green-400">// total: {total}</span>
      </div>
      {items.map(it => {
        const filled = Math.round((it.value / max) * width);
        const bar = '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled));
        return (
          <button
            key={it.key}
            onClick={() => onClick(it.modal)}
            className="w-full flex items-center gap-3 hover:bg-green-500/5 px-2 py-0.5 rounded group transition-colors"
            title={`Ver detalle de ${it.label}`}
          >
            <span className="text-green-500 w-24 truncate text-left">[{it.label}]</span>
            <span style={{ color: it.color }} className="font-mono sys-bar-grow">{bar}</span>
            <span className="text-green-300 tabular-nums ml-auto">{it.value.toString().padStart(3, ' ')}</span>
            <span className="text-green-700 text-[10px] group-hover:text-green-400">//{Math.round((it.value / Math.max(total, 1)) * 100)}%</span>
          </button>
        );
      })}
    </div>
  );
}

function KpiProgress({ label, pct, value, color }: { label: string; pct: number; value: string; color: string }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono mb-1">
        <span className="text-green-500">{'>'} {label}</span>
        <span className="text-green-300 font-bold">{value}</span>
      </div>
      <div className="h-2 bg-green-950/60 rounded-sm overflow-hidden border border-green-500/20">
        <div
          className="h-full sys-bar-grow transition-all duration-700"
          style={{ width: `${p}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}88` }}
        />
      </div>
    </div>
  );
}

function CodeAreaChart({ data, unit = '' }: { data: { label: string; value: number }[]; unit?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!data.length) return <span className="text-green-500 text-xs font-mono">// no data</span>;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 640, H = 140, pad = { t: 10, r: 10, b: 20, l: 30 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const step = data.length > 1 ? cw / (data.length - 1) : 0;
  const pts = data.map((d, i) => ({ x: pad.l + step * i, y: pad.t + ch - (d.value / max) * ch, v: d.value, l: d.label }));
  const linePath = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${pad.t + ch} L ${pts[0].x} ${pad.t + ch} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id="sysArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#22c55e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g, i) => {
        const y = pad.t + ch * (1 - g);
        const val = Math.round(max * g);
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#14532d" strokeDasharray="3 3" opacity={0.6} />
            <text x={pad.l - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#16a34a" className="font-mono">{unit}{val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}</text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#sysArea)" />
      <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2" />
      {pts.map((p, i) => (
        <g key={i} onMouseEnter={() => setHover(i)}>
          <rect x={p.x - step / 2} y={pad.t} width={step} height={ch} fill="transparent" />
          <circle cx={p.x} cy={p.y} r={hover === i ? 4 : 2.5} fill="#22c55e" stroke="#000" strokeWidth="1" />
          {hover === i && (
            <text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill="#d1fae5" className="font-mono">{unit}{p.v}</text>
          )}
          <text x={p.x} y={H - 6} textAnchor="middle" fontSize="9" fill="#16a34a" className="font-mono">{p.l}</text>
        </g>
      ))}
    </svg>
  );
}

function CodeBarChart({ data, color, prefix = '' }: { data: { label: string; value: number }[]; color: string; prefix?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!data.length) return <span className="text-green-500 text-xs font-mono">// no data</span>;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 320, H = 140, pad = { t: 10, r: 6, b: 20, l: 28 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const bw = cw / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" onMouseLeave={() => setHover(null)}>
      {[0, 0.5, 1].map((g, i) => {
        const y = pad.t + ch * (1 - g);
        const val = Math.round(max * g);
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#14532d" strokeDasharray="3 3" opacity={0.6} />
            <text x={pad.l - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#16a34a" className="font-mono">{prefix}{val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * ch;
        const x = pad.l + bw * i + bw * 0.15;
        const y = pad.t + ch - h;
        const w = bw * 0.7;
        const isH = hover === i;
        return (
          <g key={i} onMouseEnter={() => setHover(i)}>
            <rect x={pad.l + bw * i} y={pad.t} width={bw} height={ch} fill="transparent" />
            <rect x={x} y={y} width={w} height={Math.max(h, 1)} fill={color} opacity={isH ? 1 : 0.85} style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
            {isH && <text x={x + w / 2} y={y - 3} textAnchor="middle" fontSize="9" fontWeight="700" fill="#d1fae5" className="font-mono">{prefix}{d.value}</text>}
            <text x={pad.l + bw * i + bw / 2} y={H - 6} textAnchor="middle" fontSize="8" fill="#16a34a" className="font-mono">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ModuleJsonCard({ title, href, json, bgAnim }: {
  title: string; href: string; json: Record<string, any>; bgAnim?: 'grid' | 'dots' | 'stripes';
}) {
  const bgCls =
    bgAnim === 'grid' ? 'sys-grid-bg' :
    bgAnim === 'dots' ? 'sys-dots-bg' :
    bgAnim === 'stripes' ? 'sys-stripes-bg' : '';

  return (
    <Link
      href={href}
      className="relative block rounded-lg border border-green-500/30 bg-black/75 backdrop-blur-sm shadow-[0_0_40px_rgba(0,255,65,0.08)] overflow-hidden hover:border-green-400 sys-glitch group"
    >
      {bgCls && <div className={`pointer-events-none absolute inset-0 ${bgCls} opacity-30 group-hover:opacity-60 transition-opacity`} />}
      <div className="pointer-events-none absolute inset-0 sys-scanline opacity-30" />
      <div className="relative flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-green-900/40 to-black border-b border-green-500/20">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-[11px] font-mono text-green-300 truncate">{title}</span>
        <span className="text-[10px] text-green-500 group-hover:text-green-300">open→</span>
      </div>
      <div className="relative p-3">
        <pre className="text-xs text-green-300 leading-relaxed font-mono">
{'{\n'}
{Object.entries(json).map(([k, v], i, arr) => (
  <div key={k}>
    <span className="text-green-500">{'  '}</span>
    <span className="text-pink-300">&quot;{k}&quot;</span>
    <span className="text-green-500">: </span>
    <span className={typeof v === 'string' ? 'text-amber-300' : 'text-cyan-300'}>{typeof v === 'string' ? `"${v}"` : String(v)}</span>
    {i < arr.length - 1 && <span className="text-green-500">,</span>}
  </div>
))}
{'}'}
        </pre>
      </div>
    </Link>
  );
}

function CmdLink({ href, cmd }: { href: string; cmd: string }) {
  return (
    <Link
      href={href}
      className="relative block border border-green-500/30 bg-black/60 rounded px-3 py-2 text-green-300 font-mono hover:bg-green-500/10 hover:border-green-400 transition-colors overflow-hidden sys-glitch"
    >
      <div className="pointer-events-none absolute inset-0 sys-scanline opacity-20" />
      <span className="relative">
        <span className="text-pink-300">$</span> {cmd}
      </span>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
// Modal de detalle (code style) — reemplaza el DetailModal del dashboard normal
// ═══════════════════════════════════════════════════════════════

function CodeDetailModal({
  modal, stats, onClose,
}: {
  modal: { type: string; title: string }; stats: any; onClose: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const s = stats;
  const rows = buildRows(modal.type, s);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-lg border border-green-500/40 bg-black/95 shadow-[0_0_60px_rgba(0,255,65,0.18)] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col sys-scanline"
           onClick={(e) => e.stopPropagation()}>
        <div className="pointer-events-none absolute inset-0 sys-grid-bg opacity-30" />
        <div className="relative flex items-center justify-between px-3 py-2 border-b border-green-500/30 bg-gradient-to-r from-green-900/40 to-black">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="font-mono text-sm text-green-300">{modal.title}</span>
          <button onClick={onClose} className="text-green-400 hover:text-green-200 font-mono text-sm">[ESC]</button>
        </div>
        <div className="relative p-4 overflow-y-auto flex-1 font-mono text-sm">
          {rows.length === 0 ? (
            <div className="text-green-500">// no data available</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded border border-green-500/20 bg-green-950/20 hover:bg-green-500/5">
                  <span className="text-green-500">{r.label}</span>
                  <span className={`tabular-nums font-bold ${r.color || 'text-cyan-300'}`}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildRows(type: string, s: any): { label: string; value: string | number; color?: string }[] {
  switch (type) {
    case 'ventas': return [
      { label: 'total_paid',       value: `$${(s.totalSales || 0).toFixed(2)}`,      color: 'text-green-400' },
      { label: 'pending_payments', value: `$${(s.pendingPayments || 0).toFixed(2)}`, color: 'text-amber-300' },
      { label: 'grand_total',      value: `$${((s.totalSales || 0) + (s.pendingPayments || 0)).toFixed(2)}`, color: 'text-cyan-300' },
      { label: 'avg_order',        value: `$${(s.avgOrder || 0).toFixed(2)}`,        color: 'text-fuchsia-300' },
    ];
    case 'pedidos': return [
      { label: 'total_orders', value: s.totalOrders || 0,  color: 'text-cyan-300' },
      { label: 'pending',      value: s.pendingCount || 0,  color: 'text-amber-300' },
      { label: 'confirmed',    value: s.confirmedCount || 0 },
      { label: 'shipped',      value: s.shippedCount || 0 },
      { label: 'delivered',    value: s.deliveredCount || 0, color: 'text-green-400' },
      { label: 'cancelled',    value: s.cancelledCount || 0, color: 'text-red-400' },
      { label: 'paid',         value: s.paidCount || 0,      color: 'text-green-400' },
    ];
    case 'productos': return [
      { label: 'total',     value: s.totalProducts || 0,  color: 'text-cyan-300' },
      { label: 'featured',  value: s.featuredCount || 0,   color: 'text-amber-300' },
      { label: 'low_stock', value: s.lowStock || 0 },
      { label: 'out_stock', value: s.outOfStock || 0,       color: 'text-red-400' },
    ];
    case 'clientes': return [
      { label: 'total_users',   value: s.totalUsers || 0,       color: 'text-cyan-300' },
      { label: 'testimonials',  value: s.reviews || 0 },
      { label: 'prod_reviews',  value: s.prodReviewCount || 0 },
    ];
    case 'ticket': return [
      { label: 'avg_order_value', value: `$${(s.avgOrder || 0).toFixed(2)}`, color: 'text-green-400' },
      { label: 'total_orders',    value: s.totalOrders || 0 },
      { label: 'total_sales',     value: `$${(s.totalSales || 0).toFixed(2)}` },
    ];
    case 'conversion': return [
      { label: 'conversion_rate', value: `${(s.convRate || 0).toFixed(2)}%`, color: 'text-emerald-300' },
      { label: 'paid_orders',     value: s.paidCount || 0,  color: 'text-green-400' },
      { label: 'total_orders',    value: s.totalOrders || 0 },
    ];
    case 'status-pending':
    case 'status-confirmed':
    case 'status-shipped':
    case 'status-delivered':
    case 'status-cancelled':
    case 'status-paid': {
      const key = type.replace('status-', '');
      const mapCount: any = {
        pending:   s.pendingCount,
        confirmed: s.confirmedCount,
        shipped:   s.shippedCount,
        delivered: s.deliveredCount,
        cancelled: s.cancelledCount,
        paid:      s.paidCount,
      };
      const recent = (s.recentOrders || []).filter((o: any) => key === 'paid' ? o.paymentStatus === 'paid' : o.status === key);
      const rows: { label: string; value: string | number; color?: string }[] = [
        { label: `count_${key}`, value: mapCount[key] || 0, color: 'text-cyan-300' },
      ];
      recent.slice(0, 10).forEach((o: any) => {
        rows.push({ label: `#${o.orderNumber} · ${o.userName}`, value: `$${(o.total || 0).toFixed(2)}` });
      });
      return rows;
    }
    default: return [];
  }
}
