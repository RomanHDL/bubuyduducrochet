'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import UserInlineLabel from '@/components/UserInlineLabel';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  refunded: 'bg-red-50 text-red-500 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pendiente',
  paid: '✅ Pagado',
  refunded: '↩️ Reembolsado',
};

const ORDER_STATUS: Record<string, string> = {
  pending: '⏳ Pendiente',
  confirmed: '✅ Confirmado',
  shipped: '📦 Enviado',
  delivered: '🎉 Entregado',
  cancelled: '❌ Cancelado',
};

export default function PagosAdmin() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAll = () => { fetch('/api/orders').then(r => r.json()).then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const updatePayment = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentStatus: status }) });
    const r = await fetch('/api/orders'); setOrders(await r.json());
  };

  if (!isAdmin) return <div className="text-center py-20"><p className="text-cocoa-400">No autorizado</p></div>;
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">💰</span></div>;

  const filtered = filter === 'all' ? orders : orders.filter(o => o.paymentStatus === filter);
  const totalPaid = orders.filter(o => o.paymentStatus === 'paid').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const totalPending = orders.filter(o => o.paymentStatus === 'pending').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const paidCount = orders.filter(o => o.paymentStatus === 'paid').length;
  const pendingCount = orders.filter(o => o.paymentStatus === 'pending').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Control de Pagos 💰</h1>
          <p className="text-cocoa-400 text-sm mt-1">{orders.length} pedidos totales</p>
        </div>
        <Link href="/admin" className="text-sm text-cocoa-400 hover:text-blush-400">← Volver al panel</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-4"><p className="text-2xl font-bold text-cocoa-700">{orders.length}</p><p className="text-xs text-cocoa-400">Total</p></div>
        <div className="bg-green-50 rounded-cute shadow-soft border border-green-200 p-4"><p className="text-2xl font-bold text-green-700">{paidCount}</p><p className="text-xs text-green-600">✅ Pagados</p></div>
        <div className="bg-amber-50 rounded-cute shadow-soft border border-amber-200 p-4"><p className="text-2xl font-bold text-amber-700">{pendingCount}</p><p className="text-xs text-amber-600">⏳ Pendientes</p></div>
        <div className="bg-red-50 rounded-cute shadow-soft border border-red-200 p-4"><p className="text-2xl font-bold text-red-500">{cancelledCount}</p><p className="text-xs text-red-400">❌ Cancelados</p></div>
        <div className="bg-blush-50 rounded-cute shadow-soft border border-blush-200 p-4"><p className="text-2xl font-bold text-blush-500">${totalPaid.toFixed(0)}</p><p className="text-xs text-blush-400">💰 Cobrado</p></div>
      </div>

      {/* Pending amount alert */}
      {totalPending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-cute p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div><p className="font-bold text-amber-700 text-sm">${totalPending.toFixed(2)} MXN pendientes de cobro</p><p className="text-xs text-amber-600">{pendingCount} pedido{pendingCount !== 1 ? 's' : ''} esperando pago</p></div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: `Todos (${orders.length})` },
          { id: 'paid', label: `✅ Pagados (${paidCount})` },
          { id: 'pending', label: `⏳ Pendientes (${pendingCount})` },
          { id: 'refunded', label: `↩️ Reembolsos` },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === f.id ? 'bg-blush-400 text-white' : 'bg-white text-cocoa-500 border border-cream-200 hover:border-blush-200'}`}>{f.label}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-cute shadow-soft border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-cocoa-600">#</th>
                <th className="text-left px-4 py-3 font-bold text-cocoa-600">Cliente</th>
                <th className="text-left px-4 py-3 font-bold text-cocoa-600">Productos</th>
                <th className="text-right px-4 py-3 font-bold text-cocoa-600">Total</th>
                <th className="text-center px-4 py-3 font-bold text-cocoa-600">Pedido</th>
                <th className="text-center px-4 py-3 font-bold text-cocoa-600">Pago</th>
                <th className="text-left px-4 py-3 font-bold text-cocoa-600">Fecha</th>
                <th className="text-center px-4 py-3 font-bold text-cocoa-600">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filtered.map(order => (
                <tr key={order._id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-cocoa-500">#{order.orderNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-cocoa-700">{order.userName}<UserInlineLabel email={order.userEmail} size="xs" /></p>
                    <p className="text-xs text-cocoa-400">{order.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-cocoa-500">{order.items?.length || 0} prod.</td>
                  <td className="px-4 py-3 text-right font-bold text-cocoa-700">${order.total?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center"><span className="text-xs">{ORDER_STATUS[order.status] || order.status}</span></td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.paymentStatus] || ''}`}>
                      {STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-cocoa-400">{new Date(order.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-center">
                    <select value={order.paymentStatus} onChange={e => updatePayment(order._id, e.target.value)}
                      className="text-xs bg-cream-50 border border-cream-200 rounded-xl px-2 py-1 text-cocoa-600 focus:outline-none focus:border-blush-300">
                      <option value="pending">⏳ Pendiente</option>
                      <option value="paid">✅ Pagado</option>
                      <option value="refunded">↩️ Reembolso</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-10 text-cocoa-400 text-sm">No hay pedidos con este filtro</div>}
      </div>
    </div>
  );
}
