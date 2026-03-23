'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };
const STATUS_COLORS: Record<string, string> = { pending: 'bg-cream-200 text-cocoa-600', confirmed: 'bg-sky-100 text-sky-700', shipped: 'bg-lavender-100 text-lavender-400', delivered: 'bg-mint-100 text-green-700', cancelled: 'bg-blush-100 text-blush-500' };

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/'); return; }
    fetchOrders();
  }, [session, status]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      setOrders(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
  };

  if (status === 'loading' || loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">📦</span></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-6">Pedidos 📦</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200">
          <span className="text-5xl block mb-4">📦</span>
          <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">Sin pedidos</h3>
          <p className="text-cocoa-400">Los pedidos de tus clientes apareceran aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <span className="font-display font-bold text-cocoa-700">Pedido #{order._id?.slice(-8)}</span>
                  <span className="text-xs text-cocoa-300 ml-3">{new Date(order.createdAt).toLocaleString('es-MX')}</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
                <div><span className="text-cocoa-400">Cliente:</span> <span className="font-semibold text-cocoa-700">{order.userName}</span></div>
                <div><span className="text-cocoa-400">Email:</span> <span className="text-cocoa-600">{order.userEmail}</span></div>
                <div><span className="text-cocoa-400">Total:</span> <span className="font-display font-bold text-cocoa-700">${(order.total || 0).toFixed(2)}</span></div>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-2 mb-4">
                {order.items?.map((item: any, i: number) => (
                  <span key={i} className="bg-cream-50 rounded-xl px-3 py-1.5 text-xs font-medium text-cocoa-600">
                    {item.title} x{item.quantity}
                  </span>
                ))}
              </div>

              {/* Status changer */}
              <div className="flex items-center gap-2 pt-3 border-t border-cream-200">
                <span className="text-xs font-semibold text-cocoa-400">Cambiar estado:</span>
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((st) => (
                    <button key={st} onClick={() => updateStatus(order._id, st)}
                      disabled={order.status === st}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                        order.status === st ? 'bg-blush-400 text-white' : 'bg-cream-100 text-cocoa-400 hover:bg-cream-200'
                      }`}>
                      {STATUS_LABELS[st]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
