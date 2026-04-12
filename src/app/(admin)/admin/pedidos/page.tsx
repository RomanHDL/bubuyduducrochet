'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateTicket } from '@/lib/ticket';

const WA = '528187087288';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS: Record<string, string> = { pending: '⏳ Pendiente', confirmed: '✅ Confirmado', shipped: '📦 Enviado', delivered: '🎉 Entregado', cancelled: '❌ Cancelado' };
const STATUS_COLORS: Record<string, string> = { pending: 'bg-amber-50 text-amber-700 border-amber-200', confirmed: 'bg-sky-50 text-sky-700 border-sky-200', shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200', delivered: 'bg-green-50 text-green-700 border-green-200', cancelled: 'bg-red-50 text-red-500 border-red-200' };
const PAY_LABELS: Record<string, string> = { pending: '💳 Pendiente', paid: '✅ Pagado', refunded: '↩️ Reembolsado' };
const PAY_COLORS: Record<string, string> = { pending: 'text-amber-600', paid: 'text-green-600', refunded: 'text-red-500' };

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatingTicket, setGeneratingTicket] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchOrders();
    // Real-time: refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [session, status]);

  const fetchOrders = async () => {
    try { const r = await fetch('/api/orders'); setOrders(await r.json()); } catch {} finally { setLoading(false); }
  };

  const updateOrder = async (id: string, updates: any) => {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    fetchOrders();
  };

  const deleteOrder = async (id: string, num: string) => {
    if (!confirm(`Eliminar permanentemente pedido #${num}?`)) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    fetchOrders();
  };

  const handleSendTicket = async (order: any) => {
    setGeneratingTicket(order._id);
    try {
      const payMethod = order.notes?.includes('OXXO') ? 'oxxo' : 'transfer';
      const ticketImg = await generateTicket(order.orderNumber || 0, order.items || [], order.total || 0, payMethod, order.userName || 'Cliente');

      // Auto-download
      const link = document.createElement('a');
      link.href = ticketImg;
      link.download = `ticket-${order.orderNumber || order._id.slice(-6)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Open WhatsApp
      const msg = encodeURIComponent(`🧾 *TICKET DE COMPRA #${order.orderNumber}*\n\nHola ${order.userName}! Tu pago ha sido confirmado ✅\nAdjunto tu ticket de compra.\n\nTotal: $${order.total?.toFixed(2)} MXN\nGracias por tu compra! 🧶💕\n— Mundo A Crochet`);
      setTimeout(() => { window.open(`https://wa.me/${WA}?text=${msg}`, '_blank'); }, 800);
    } catch {} finally { setGeneratingTicket(null); }
  };

  if (status === 'loading' || loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">📦</span></div>;

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (payFilter !== 'all' && o.paymentStatus !== payFilter) return false;
    if (search) { const q = search.toLowerCase(); return o.userName?.toLowerCase().includes(q) || o.userEmail?.toLowerCase().includes(q) || String(o.orderNumber).includes(q); }
    return true;
  });

  const totalSales = orders.filter(o => o.paymentStatus === 'paid').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const pendingAmount = orders.filter(o => o.paymentStatus === 'pending' && o.status !== 'cancelled').reduce((s: number, o: any) => s + (o.total || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Pedidos 📦</h1>
          <p className="text-cocoa-400 text-sm mt-1">{orders.length} pedidos · ${totalSales.toFixed(2)} cobrados</p>
        </div>
        <Link href="/admin" className="text-sm text-cocoa-400 hover:text-blush-400">← Panel admin</Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-3 text-center"><p className="text-xl font-bold text-cocoa-700">{orders.length}</p><p className="text-[10px] text-cocoa-400">Total</p></div>
        <div className="bg-amber-50 rounded-cute shadow-soft border border-amber-200 p-3 text-center"><p className="text-xl font-bold text-amber-700">{orders.filter(o => o.status === 'pending').length}</p><p className="text-[10px] text-amber-600">⏳ Pendientes</p></div>
        <div className="bg-green-50 rounded-cute shadow-soft border border-green-200 p-3 text-center"><p className="text-xl font-bold text-green-700">{orders.filter(o => o.paymentStatus === 'paid').length}</p><p className="text-[10px] text-green-600">✅ Pagados</p></div>
        <div className="bg-blush-50 rounded-cute shadow-soft border border-blush-200 p-3 text-center"><p className="text-xl font-bold text-blush-500">${totalSales.toFixed(0)}</p><p className="text-[10px] text-blush-400">💰 Cobrado</p></div>
        {pendingAmount > 0 && <div className="bg-amber-50 rounded-cute shadow-soft border border-amber-200 p-3 text-center"><p className="text-xl font-bold text-amber-700">${pendingAmount.toFixed(0)}</p><p className="text-[10px] text-amber-600">⚠️ Por cobrar</p></div>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[180px]"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente, email, #..." className="input-cute pl-9 text-sm py-2" /></div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-cute text-sm py-2 w-auto">
          <option value="all">📋 Todos</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={payFilter} onChange={e => setPayFilter(e.target.value)} className="input-cute text-sm py-2 w-auto">
          <option value="all">💳 Pago</option>
          <option value="pending">💳 Pendiente</option>
          <option value="paid">✅ Pagado</option>
          <option value="refunded">↩️ Reembolsado</option>
        </select>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200"><span className="text-4xl block mb-3">📭</span><p className="text-cocoa-400">No hay pedidos con estos filtros</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const exp = expandedId === order._id;
            return (
              <div key={order._id} className={`bg-white rounded-cute shadow-soft border transition-all ${exp ? 'border-blush-300 shadow-warm' : 'border-cream-200'}`}>
                <button onClick={() => setExpandedId(exp ? null : order._id)} className="w-full p-4 flex items-center gap-4 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-cocoa-300">#{order.orderNumber || order._id?.slice(-8)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                      <span className={`text-[10px] font-bold ${PAY_COLORS[order.paymentStatus]}`}>{PAY_LABELS[order.paymentStatus]}</span>
                    </div>
                    <p className="font-semibold text-cocoa-700 mt-1">{order.userName}</p>
                    <p className="text-xs text-cocoa-400">{order.userEmail} · {new Date(order.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-lg text-cocoa-700">${order.total?.toFixed(2)}</p>
                    <p className="text-[10px] text-cocoa-300">{order.items?.length} prod.</p>
                  </div>
                  <span className={`text-cocoa-300 transition-transform ${exp ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {exp && (
                  <div className="px-4 pb-4 border-t border-cream-200">
                    {/* Products */}
                    <div className="mt-4 mb-4">
                      <h4 className="text-xs font-bold text-cocoa-400 uppercase tracking-wider mb-2">Productos</h4>
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 bg-cream-50 rounded-xl mb-1.5">
                          <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-cream-200">
                            {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full">🧸</span>}
                          </div>
                          <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-cocoa-700 truncate">{item.title}</p><p className="text-xs text-cocoa-400">${item.price} x {item.quantity}</p></div>
                          <span className="font-bold text-cocoa-700 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && <div className="mb-4 p-3 bg-lavender-50 rounded-xl border border-lavender-200"><p className="text-xs text-cocoa-400"><strong>Nota:</strong> {order.notes}</p></div>}

                    {/* Status controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-xs font-bold text-cocoa-500 mb-1 block">Estado pedido</label>
                        <select value={order.status} onChange={e => updateOrder(order._id, { status: e.target.value })} className="input-cute text-sm py-2">
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-cocoa-500 mb-1 block">Estado pago</label>
                        <select value={order.paymentStatus} onChange={e => updateOrder(order._id, { paymentStatus: e.target.value })} className="input-cute text-sm py-2">
                          <option value="pending">💳 Pendiente</option>
                          <option value="paid">✅ Pagado</option>
                          <option value="refunded">↩️ Reembolsado</option>
                        </select>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleSendTicket(order)} disabled={generatingTicket === order._id}
                        className="btn-cute bg-gradient-to-r from-blush-400 to-lavender-400 text-white text-xs px-5 py-2 hover:from-blush-500 hover:to-lavender-500 shadow-md disabled:opacity-50">
                        {generatingTicket === order._id ? '🧶 Generando...' : '🧾 Enviar Ticket'}
                      </button>
                      <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola ${order.userName}! Tu pedido #${order.orderNumber} de Mundo A Crochet esta ${(STATUS_LABELS[order.status] || '').replace(/[^\w\s]/g, '')}. Total: $${order.total?.toFixed(2)}`)}`}
                        target="_blank" rel="noopener noreferrer" className="btn-cute bg-green-500 text-white text-xs px-4 py-2 hover:bg-green-600">💬 WhatsApp</a>
                      {order.status === 'pending' && <button onClick={() => updateOrder(order._id, { status: 'confirmed', paymentStatus: 'paid' })} className="btn-cute bg-green-100 text-green-700 text-xs px-4 py-2 border border-green-200">✅ Confirmar pago</button>}
                      {order.status === 'confirmed' && <button onClick={() => updateOrder(order._id, { status: 'shipped' })} className="btn-cute bg-indigo-100 text-indigo-700 text-xs px-4 py-2 border border-indigo-200">📦 Marcar enviado</button>}
                      {order.status === 'shipped' && <button onClick={() => updateOrder(order._id, { status: 'delivered' })} className="btn-cute bg-green-100 text-green-700 text-xs px-4 py-2 border border-green-200">🎉 Entregado</button>}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button onClick={() => updateOrder(order._id, { status: 'cancelled' })} className="btn-cute bg-red-50 text-red-500 text-xs px-4 py-2 border border-red-200">❌ Cancelar</button>
                      )}
                      <button onClick={() => deleteOrder(order._id, order.orderNumber || order._id.slice(-8))}
                        className="btn-cute bg-red-500 text-white text-xs px-4 py-2 hover:bg-red-600">🗑️ Eliminar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
