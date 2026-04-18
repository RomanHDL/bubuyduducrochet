'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AnimatedBg from '@/components/AnimatedBg';
// Carga diferida: ticket.ts trae html2canvas/jspdf (~200KB). Sólo se carga al presionar generar ticket.
const loadTicket = () => import('@/lib/ticket');

const WA = '528187087288';

const STATUS_MAP: Record<string, { label: string; color: string; emoji: string; bg: string }> = {
  pending:   { label: 'Pendiente',  color: 'text-amber-700',   emoji: '⏳', bg: 'bg-amber-50 border-amber-200' },
  confirmed: { label: 'Confirmado', color: 'text-sky-700',     emoji: '✅', bg: 'bg-sky-50 border-sky-200' },
  shipped:   { label: 'Enviado',    color: 'text-indigo-700',  emoji: '📦', bg: 'bg-indigo-50 border-indigo-200' },
  delivered: { label: 'Entregado',  color: 'text-green-700',   emoji: '🎉', bg: 'bg-green-50 border-green-200' },
  cancelled: { label: 'Cancelado',  color: 'text-red-600',     emoji: '❌', bg: 'bg-red-50 border-red-200' },
};

const PAYMENT_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  pending:  { label: 'Pendiente', color: 'text-amber-600', emoji: '💳' },
  paid:     { label: 'Pagado',    color: 'text-green-600', emoji: '✅' },
  refunded: { label: 'Reembolsado', color: 'text-red-500', emoji: '↩️' },
};

export default function PedidosPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ticketPreview, setTicketPreview] = useState<{ img: string; orderId: string; orderNum: number } | null>(null);
  const [generatingTicket, setGeneratingTicket] = useState<string | null>(null);

  const fetchOrders = async () => {
    try { const r = await fetch('/api/orders'); const d = await r.json(); setOrders(Array.isArray(d) ? d : []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [session]);

  const updateOrder = async (id: string, updates: any) => {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    fetchOrders();
  };

  // Admin: generate ticket image, auto-download it, show preview, then open WhatsApp
  const handleSendTicket = async (order: any) => {
    setGeneratingTicket(order._id);
    try {
      const payMethod = order.notes?.includes('OXXO') ? 'oxxo' : 'transfer';
      const { generateTicket } = await loadTicket();
      const ticketImg = await generateTicket(
        order.orderNumber || 0,
        order.items || [],
        order.total || 0,
        payMethod,
        order.userName || 'Cliente',
      );

      // Auto-download the ticket image so admin can attach it in WhatsApp
      const link = document.createElement('a');
      link.href = ticketImg;
      link.download = `ticket-${order.orderNumber || order._id.slice(-6)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show preview modal
      setTicketPreview({ img: ticketImg, orderId: order._id, orderNum: order.orderNumber || 0 });

      // Open WhatsApp with instructions to attach the downloaded image
      const msg = encodeURIComponent(
        `🧾 *TICKET DE COMPRA #${order.orderNumber || 0}*\n\n` +
        `Hola ${order.userName}! Tu pago ha sido confirmado ✅\n` +
        `Adjunto tu ticket de compra.\n\n` +
        `Total: $${order.total?.toFixed(2)} MXN\n` +
        `Gracias por tu compra! 🧶💕\n` +
        `— Mundo A Crochet`
      );
      setTimeout(() => {
        window.open(`https://wa.me/${WA}?text=${msg}`, '_blank');
      }, 1000);
    } catch {} finally { setGeneratingTicket(null); }
  };

  if (!session) return (
    <AnimatedBg theme="sky">
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <span className="text-5xl block mb-4">📦</span>
      <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-3">Inicia sesion para ver tus pedidos</h2>
      <Link href="/login" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 inline-block">Iniciar Sesion</Link>
    </div>
    </AnimatedBg>
  );

  if (loading) return <AnimatedBg theme="sky"><div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">📦</span></div></AnimatedBg>;

  // ═══ ADMIN VIEW ═══
  if (isAdmin) {
    const filtered = orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
      if (searchQuery) { const q = searchQuery.toLowerCase(); return o.userName?.toLowerCase().includes(q) || o.userEmail?.toLowerCase().includes(q) || o._id?.includes(q); }
      return true;
    });

    const totalSales = orders.filter(o => o.paymentStatus === 'paid').reduce((s: number, o: any) => s + (o.total || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const paidCount = orders.filter(o => o.paymentStatus === 'paid').length;

    return (
      <AnimatedBg theme="sky">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div><h1 className="font-display font-bold text-3xl text-cocoa-700">Gestion de Pedidos 📋</h1><p className="text-cocoa-400 text-sm mt-1">{orders.length} pedidos totales</p></div>
          <span className="text-xs font-bold text-lavender-400 bg-lavender-50 px-3 py-1.5 rounded-full border border-lavender-200">👑 Vista Admin</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-4"><p className="text-2xl font-bold text-cocoa-700">{orders.length}</p><p className="text-xs text-cocoa-400 mt-0.5">Total pedidos</p></div>
          <div className="bg-amber-50 rounded-cute shadow-soft border border-amber-200 p-4"><p className="text-2xl font-bold text-amber-700">{pendingCount}</p><p className="text-xs text-amber-600 mt-0.5">⏳ Pendientes</p></div>
          <div className="bg-green-50 rounded-cute shadow-soft border border-green-200 p-4"><p className="text-2xl font-bold text-green-700">{paidCount}</p><p className="text-xs text-green-600 mt-0.5">✅ Pagados</p></div>
          <div className="bg-blush-50 rounded-cute shadow-soft border border-blush-200 p-4"><p className="text-2xl font-bold text-blush-500">${totalSales.toFixed(2)}</p><p className="text-xs text-blush-400 mt-0.5">💰 Ventas</p></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cliente, email, ID..." className="input-cute pl-9 text-sm py-2.5" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-cute text-sm py-2.5 w-auto"><option value="all">📋 Estado</option>{Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}</select>
          <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="input-cute text-sm py-2.5 w-auto"><option value="all">💳 Pago</option>{Object.entries(PAYMENT_MAP).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}</select>
        </div>

        {/* Ticket preview modal */}
        {ticketPreview && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-20 overflow-y-auto">
            <div className="fixed inset-0 bg-cocoa-800/50 backdrop-blur-sm" onClick={() => setTicketPreview(null)} />
            <div className="relative w-full max-w-md bg-white rounded-bubble shadow-warm border border-cream-200 p-5 my-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-cocoa-700">🧾 Ticket #{ticketPreview.orderNum}</h2>
                <button onClick={() => setTicketPreview(null)} className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-cocoa-400 hover:bg-cream-200">✕</button>
              </div>

              {/* Instruction */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                <span className="text-lg">✅</span>
                <div>
                  <p className="text-xs font-bold text-green-700">Ticket descargado e imagen lista</p>
                  <p className="text-[11px] text-green-600 mt-0.5">En WhatsApp, adjunta la imagen del ticket (📎 → Galeria) junto con el mensaje.</p>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-cream-200 mb-4">
                <img src={ticketPreview.img} alt="Ticket" className="w-full" />
              </div>
              <div className="flex gap-2">
                <a href={ticketPreview.img} download={`ticket-${ticketPreview.orderNum}.png`} className="flex-1 btn-cute bg-lavender-100 text-lavender-600 text-xs py-2.5 border border-lavender-200 text-center">📥 Descargar otra vez</a>
                <button onClick={() => setTicketPreview(null)} className="flex-1 btn-cute bg-blush-400 text-white text-xs py-2.5">✓ Listo</button>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200"><span className="text-4xl block mb-3">📭</span><p className="text-cocoa-400">No hay pedidos con estos filtros</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const pay = PAYMENT_MAP[order.paymentStatus] || PAYMENT_MAP.pending;
              const exp = expandedId === order._id;

              return (
                <div key={order._id} className={`bg-white rounded-cute shadow-soft border transition-all ${exp ? 'border-[#4A90D9]/30 shadow-warm' : 'border-cream-200'}`}>
                  <button onClick={() => setExpandedId(exp ? null : order._id)} className="w-full p-4 flex items-center gap-4 text-left">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-cocoa-300">#{order.orderNumber || order._id?.slice(-8)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.bg} ${st.color}`}>{st.emoji} {st.label}</span>
                        <span className={`text-[10px] font-bold ${pay.color}`}>{pay.emoji} {pay.label}</span>
                      </div>
                      <p className="font-semibold text-cocoa-700 mt-1">{order.userName}</p>
                      <p className="text-xs text-cocoa-400">{order.userEmail} · {new Date(order.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right flex-shrink-0"><p className="font-display font-bold text-lg text-cocoa-700">${order.total?.toFixed(2)}</p><p className="text-[10px] text-cocoa-300">{order.items?.length} prod.</p></div>
                    <span className={`text-cocoa-300 transition-transform ${exp ? 'rotate-180' : ''}`}>▾</span>
                  </button>

                  {exp && (
                    <div className="px-4 pb-4 border-t border-cream-200">
                      {/* Products */}
                      <div className="mt-4 mb-5">
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

                      {/* Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div><label className="text-xs font-bold text-cocoa-500 mb-1 block">Estado pedido</label><select value={order.status} onChange={e => updateOrder(order._id, { status: e.target.value })} className="input-cute text-sm py-2.5">{Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}</select></div>
                        <div><label className="text-xs font-bold text-cocoa-500 mb-1 block">Estado pago</label><select value={order.paymentStatus} onChange={e => updateOrder(order._id, { paymentStatus: e.target.value })} className="input-cute text-sm py-2.5">{Object.entries(PAYMENT_MAP).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}</select></div>
                      </div>

                      {/* Quick actions */}
                      <div className="flex flex-wrap gap-2">
                        {/* ═══ SEND TICKET — admin generates & sends via WhatsApp ═══ */}
                        <button onClick={() => handleSendTicket(order)} disabled={generatingTicket === order._id}
                          className="btn-cute bg-gradient-to-r from-blush-400 to-lavender-400 text-white text-xs px-5 py-2 hover:from-blush-500 hover:to-lavender-500 shadow-md disabled:opacity-50 flex items-center gap-1.5">
                          {generatingTicket === order._id ? '🧶 Generando...' : '🧾 Enviar Ticket'}
                        </button>

                        <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola ${order.userName}! Tu pedido #${order.orderNumber || order._id?.slice(-8)} de Mundo A Crochet esta ${st.label.toLowerCase()}. Total: $${order.total?.toFixed(2)}`)}`} target="_blank" rel="noopener noreferrer" className="btn-cute bg-green-500 text-white text-xs px-4 py-2 hover:bg-green-600">💬 WhatsApp</a>
                        <a href={`mailto:${order.userEmail}?subject=Pedido%20%23${order.orderNumber || order._id?.slice(-8)}`} className="btn-cute bg-[#4A90D9] text-white text-xs px-4 py-2 hover:bg-[#3A7BC8]">📧 Email</a>
                        {order.status === 'pending' && <button onClick={() => updateOrder(order._id, { status: 'confirmed', paymentStatus: 'paid' })} className="btn-cute bg-green-100 text-green-700 text-xs px-4 py-2 border border-green-200">✅ Confirmar pago</button>}
                        {order.status === 'confirmed' && <button onClick={() => updateOrder(order._id, { status: 'shipped' })} className="btn-cute bg-indigo-100 text-indigo-700 text-xs px-4 py-2 border border-indigo-200">📦 Enviado</button>}
                        {order.status === 'shipped' && <button onClick={() => updateOrder(order._id, { status: 'delivered' })} className="btn-cute bg-green-100 text-green-700 text-xs px-4 py-2 border border-green-200">🎉 Entregado</button>}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && <button onClick={() => { if (confirm('Cancelar pedido?')) updateOrder(order._id, { status: 'cancelled' }) }} className="btn-cute bg-red-50 text-red-500 text-xs px-4 py-2 border border-red-200">❌ Cancelar</button>}
                        {order.paymentStatus !== 'paid' && <button onClick={async () => { if (!confirm(`Eliminar permanentemente pedido #${order.orderNumber || order._id?.slice(-8)}?`)) return; await fetch(`/api/orders/${order._id}`, { method: 'DELETE' }); fetchOrders(); }} className="btn-cute bg-red-500 text-white text-xs px-4 py-2 hover:bg-red-600">🗑️ Eliminar</button>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </AnimatedBg>
    );
  }

  // ═══ CUSTOMER VIEW ═══
  return (
    <AnimatedBg theme="sky">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-6">Mis Pedidos 📦</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200">
          <span className="text-5xl block mb-4">🧸</span>
          <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">Aun no tienes pedidos</h3>
          <p className="text-cocoa-400 mb-6">Explora nuestro catalogo!</p>
          <Link href="/catalogo" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 inline-block">Ver Catalogo 🧶</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
            const pay = PAYMENT_MAP[order.paymentStatus] || PAYMENT_MAP.pending;
            return (
              <div key={order._id} className="bg-white rounded-cute shadow-soft border border-cream-200 overflow-hidden">
                <div className={`px-5 py-2.5 flex items-center justify-between ${st.bg} border-b`}>
                  <span className={`text-xs font-bold ${st.color}`}>{st.emoji} {st.label}</span>
                  <span className={`text-xs font-semibold ${pay.color}`}>{pay.emoji} Pago {pay.label.toLowerCase()}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div><span className="font-mono text-xs text-cocoa-300">#{order.orderNumber || order._id?.slice(-8)}</span><p className="text-xs text-cocoa-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                    <span className="font-display font-bold text-xl text-cocoa-700">${order.total?.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cream-100 overflow-hidden flex-shrink-0">{item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-sm">🧸</span>}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-cocoa-700 truncate">{item.title}</p><p className="text-xs text-cocoa-400">x{item.quantity} · ${item.price}</p></div>
                      </div>
                    ))}
                  </div>
                  {order.status === 'pending' && (
                    <div className="space-y-3">
                      {order.paymentStatus === 'pending' && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                          <p className="text-xs text-amber-700 font-medium mb-2">Envia tu comprobante de pago</p>
                          <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola! Pedido #${order.orderNumber || order._id?.slice(-8)} por $${order.total?.toFixed(2)}. Adjunto comprobante.`)}`} target="_blank" rel="noopener noreferrer" className="btn-cute bg-green-500 text-white text-xs px-5 py-2 hover:bg-green-600 inline-flex items-center gap-1">💬 WhatsApp</a>
                        </div>
                      )}
                      <button onClick={async () => {
                        if (!confirm('Cancelar este pedido?')) return;
                        await fetch(`/api/orders/${order._id}`, { method: 'DELETE' });
                        fetchOrders();
                      }} className="w-full py-2.5 rounded-bubble border-2 border-red-200 text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-500 transition-all">
                        ❌ Cancelar pedido
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </AnimatedBg>
  );
}
