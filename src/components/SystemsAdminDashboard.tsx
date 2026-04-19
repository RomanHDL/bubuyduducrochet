'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import MatrixRain from './MatrixRain';

/**
 * Dashboard "de sistemas" — vista estilo terminal / código puro.
 * Se muestra ÚNICAMENTE cuando el admin es el de sistemas.
 * Fondo Matrix animado + paneles terminal monospace.
 */

type Stats = any;

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

  return (
    <div className="relative min-h-screen bg-black text-green-300 font-mono overflow-hidden">
      <MatrixRain opacity={0.22} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ═══ Terminal header ═══ */}
        <TerminalWindow
          title={`~/admin/${userName.toLowerCase().replace(/\s+/g, '-')} — zsh`}
          live={!paused}
        >
          <div className="space-y-0.5 text-xs">
            <Line prompt="user@bubuyduducrochet">whoami</Line>
            <Line>
              <span className="text-cyan-300">{userName}</span>
              <span className="text-green-500"> [role=admin tier=systems]</span>
            </Line>
            <Line prompt="user@bubuyduducrochet">echo $ENV</Line>
            <Line>
              <span className="text-pink-300">NODE_ENV=production</span>
              <span className="text-pink-300"> REGION=vercel-edge</span>
              <span className="text-pink-300"> DB=mongodb-atlas</span>
            </Line>
            <Line prompt="user@bubuyduducrochet">status --live</Line>
            <Line>
              {paused
                ? <span className="text-amber-300">[PAUSED] refresh interval suspended by operator</span>
                : <span className="text-green-400">[OK] 5s polling, cache hit rate nominal</span>
              }
              <button
                onClick={onTogglePause}
                className="ml-3 px-2 py-0.5 text-[10px] font-bold border border-green-500/40 text-green-300 hover:bg-green-500/10 rounded"
              >
                [{paused ? 'RESUME' : 'PAUSE'}]
              </button>
            </Line>
          </div>
        </TerminalWindow>

        {/* ═══ Métricas principales (cards estilo código) ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 mt-6">
          <CodeKpi label="TOTAL_SALES"  value={`$${(s.totalSales || 0).toFixed(0)}`} sub="MXN"                  color="text-green-400"  />
          <CodeKpi label="ORDERS"       value={s.totalOrders || 0}                   sub={`${s.paidCount || 0} paid`}    color="text-cyan-300" />
          <CodeKpi label="PRODUCTS"     value={s.totalProducts || 0}                 sub={`${s.featuredCount || 0} featured`} color="text-pink-300" />
          <CodeKpi label="USERS"        value={s.totalUsers || 0}                    sub={`${s.reviews || 0} reviews`}   color="text-amber-300" />
          <CodeKpi label="AVG_ORDER"    value={`$${(s.avgOrder || 0).toFixed(0)}`}   sub="per order"                     color="text-fuchsia-300" />
          <CodeKpi label="CONV_RATE"    value={`${(s.convRate || 0).toFixed(1)}%`}   sub="paid/total"                    color="text-emerald-300" />
        </div>

        {/* ═══ Pipeline pedidos como barras ASCII ═══ */}
        <TerminalWindow title="orders --pipeline">
          <AsciiPipeline
            items={[
              { key: 'pending',    label: 'PENDING',    value: s.pendingCount || 0,    color: '#f59e0b' },
              { key: 'confirmed',  label: 'CONFIRMED',  value: s.confirmedCount || 0,  color: '#06b6d4' },
              { key: 'shipped',    label: 'SHIPPED',    value: s.shippedCount || 0,    color: '#818cf8' },
              { key: 'delivered',  label: 'DELIVERED',  value: s.deliveredCount || 0,  color: '#22c55e' },
              { key: 'cancelled',  label: 'CANCELLED',  value: s.cancelledCount || 0,  color: '#ef4444' },
              { key: 'paid',       label: 'PAID',       value: s.paidCount || 0,       color: '#10b981' },
            ]}
          />
        </TerminalWindow>

        {/* ═══ Ingresos 7 días — sparkline SVG ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <TerminalWindow title="revenue --last 7d --format=sparkline">
            <CodeSparkline data={(s.last7Sales || []).map((d: any) => ({ label: d.day, value: d.revenue || 0 }))} unit="$" />
            <div className="mt-3 text-[10px] text-green-500">
              <span className="text-green-300">total=</span>
              <span className="text-pink-300">${((s.last7Sales || []).reduce((a: number, b: any) => a + (b.revenue || 0), 0)).toFixed(0)}</span>
              <span className="text-green-300"> · avg=</span>
              <span className="text-pink-300">${(((s.last7Sales || []).reduce((a: number, b: any) => a + (b.revenue || 0), 0)) / Math.max((s.last7Sales || []).length, 1)).toFixed(0)}</span>
            </div>
          </TerminalWindow>

          <TerminalWindow title="orders --last 7d --format=sparkline">
            <CodeSparkline data={(s.last7 || []).map((d: any) => ({ label: d.day, value: d.count || 0 }))} unit="" />
            <div className="mt-3 text-[10px] text-green-500">
              <span className="text-green-300">max=</span>
              <span className="text-pink-300">{Math.max(...(s.last7 || []).map((d: any) => d.count || 0), 0)}</span>
              <span className="text-green-300"> · total=</span>
              <span className="text-pink-300">{(s.last7 || []).reduce((a: number, b: any) => a + (b.count || 0), 0)}</span>
            </div>
          </TerminalWindow>
        </div>

        {/* ═══ Inventario + Reseñas + Materiales como JSON ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <TerminalWindow title="inventory --json">
            <pre className="text-xs text-green-300 leading-relaxed">
{`{
  "total":     ${s.totalProducts || 0},
  "in_stock":  ${(s.totalProducts || 0) - (s.lowStock || 0) - (s.outOfStock || 0)},
  "low_stock": ${s.lowStock || 0},
  "out_stock": ${s.outOfStock || 0},
  "featured":  ${s.featuredCount || 0}
}`}
            </pre>
          </TerminalWindow>

          <TerminalWindow title="reviews --json">
            <pre className="text-xs text-green-300 leading-relaxed">
{`{
  "testimonials": ${s.reviews || 0},
  "product_reviews": ${s.prodReviewCount || 0}
}`}
            </pre>
          </TerminalWindow>

          <TerminalWindow title="materials --json">
            <pre className="text-xs text-green-300 leading-relaxed">
{`{
  "total":  ${s.matTotal || 0},
  "value":  "$${(s.matValue || 0).toFixed(0)}",
  "low":    ${s.matLow || 0},
  "out":    ${s.matOut || 0}
}`}
            </pre>
          </TerminalWindow>
        </div>

        {/* ═══ Pedidos recientes + Clientes nuevos como log ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <TerminalWindow title="tail -f orders.log">
            <div className="space-y-1 text-[11px] max-h-64 overflow-auto">
              {(s.recentOrders || []).map((o: any) => (
                <div key={o._id} className="flex items-center gap-2">
                  <span className="text-green-500">[{new Date(o.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}]</span>
                  <span className="text-cyan-300">#{o.orderNumber}</span>
                  <span className="text-pink-300">${(o.total || 0).toFixed(0)}</span>
                  <span className="text-amber-300">{(o.status || '').toUpperCase()}</span>
                  <span className="text-green-300 truncate">{o.userName}</span>
                </div>
              ))}
              {(s.recentOrders || []).length === 0 && <span className="text-green-500">// no recent orders</span>}
            </div>
          </TerminalWindow>

          <TerminalWindow title="tail -f users.log">
            <div className="space-y-1 text-[11px] max-h-64 overflow-auto">
              {(s.recentUsers || []).map((u: any) => (
                <div key={u._id} className="flex items-center gap-2">
                  <span className="text-green-500">[{new Date(u.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}]</span>
                  <span className="text-cyan-300 truncate max-w-[10rem]">{u.name}</span>
                  <span className="text-fuchsia-300 truncate">{u.email}</span>
                </div>
              ))}
              {(s.recentUsers || []).length === 0 && <span className="text-green-500">// no new users</span>}
            </div>
          </TerminalWindow>
        </div>

        {/* ═══ Nav commands ═══ */}
        <TerminalWindow title="navigate --to" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <CmdLink href="/admin/materiales" cmd="cd materials/" />
            <CmdLink href="/admin/productos"  cmd="cd inventory/" />
            <CmdLink href="/preguntas"        cmd="cd faqs/" />
            <CmdLink href="/"                 cmd="cd ../shop/" />
            <CmdLink href="/contacto"         cmd="cd about/" />
          </div>
        </TerminalWindow>

        {/* Footer firma */}
        <div className="mt-8 text-[10px] text-green-500 border-t border-green-500/20 pt-3">
          <span className="opacity-60">// systems dashboard · build {new Date().toISOString()} · </span>
          <span className="text-cyan-300">session:active</span>
          <span className="opacity-60"> · </span>
          <span className="text-pink-300">role:admin</span>
          <span className="opacity-60"> · </span>
          <span className="text-amber-300">tier:systems</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Subcomponentes estilo terminal
// ═══════════════════════════════════════════════════════════════

function TerminalWindow({
  title,
  children,
  className = '',
  live,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  live?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-green-500/30 bg-black/75 backdrop-blur-sm shadow-[0_0_40px_rgba(0,255,65,0.08)] overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-green-900/30 to-black border-b border-green-500/20">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-[11px] font-mono text-green-300 truncate max-w-[70%]">{title}</span>
        {live !== undefined ? (
          <span className={`text-[10px] font-mono ${live ? 'text-green-400' : 'text-amber-400'}`}>
            ● {live ? 'LIVE' : 'PAUSED'}
          </span>
        ) : <span className="w-12" />}
      </div>
      <div className="p-3">{children}</div>
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

function CodeKpi({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="rounded-md border border-green-500/25 bg-black/60 backdrop-blur-sm p-3">
      <p className="text-[10px] text-green-500 uppercase tracking-wider font-mono">{label}</p>
      <p className={`font-mono font-bold text-xl ${color} tabular-nums mt-1`}>{value}</p>
      <p className="text-[10px] text-green-700 font-mono mt-0.5">{'// ' + sub}</p>
    </div>
  );
}

function AsciiPipeline({ items }: { items: { key: string; label: string; value: number; color: string }[] }) {
  const max = Math.max(...items.map(i => i.value), 1);
  const width = 30;

  return (
    <div className="space-y-1 font-mono text-xs">
      {items.map(it => {
        const filled = Math.round((it.value / max) * width);
        const bar = '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled));
        return (
          <div key={it.key} className="flex items-center gap-3">
            <span className="text-green-500 w-20 truncate">[{it.label}]</span>
            <span style={{ color: it.color }} className="font-mono">{bar}</span>
            <span className="text-green-300 tabular-nums ml-auto">{it.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function CodeSparkline({ data, unit = '' }: { data: { label: string; value: number }[]; unit?: string }) {
  if (!data.length) return <span className="text-green-500 text-xs font-mono">// no data</span>;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 320;
  const H = 80;
  const step = data.length > 1 ? W / (data.length - 1) : 0;
  const points = data.map((d, i) => ({ x: step * i, y: H - (d.value / max) * H, v: d.value, l: d.label }));
  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const area = `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
      <defs>
        <linearGradient id="sgrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sgrad)" />
      <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.5" fill="#22c55e" />
          <text x={p.x} y={H - 2} textAnchor="middle" fontSize="8" fill="#16a34a" className="font-mono">{p.l}</text>
        </g>
      ))}
    </svg>
  );
}

function CmdLink({ href, cmd }: { href: string; cmd: string }) {
  return (
    <Link
      href={href}
      className="block border border-green-500/30 bg-black/60 rounded px-3 py-2 text-green-300 font-mono hover:bg-green-500/10 hover:border-green-400 transition-colors"
    >
      <span className="text-pink-300">$</span> {cmd}
    </Link>
  );
}
