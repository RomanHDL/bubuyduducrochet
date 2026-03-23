'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  pending: { label: 'Pendiente', color: 'bg-cream-200 text-cocoa-600', emoji: '⏳' },
  confirmed: { label: 'Confirmado', color: 'bg-sky-100 text-sky-700', emoji: '✅' },
  shipped: { label: 'Enviado', color: 'bg-lavender-100 text-lavender-400', emoji: '📦' },
  delivered: { label: 'Entregado', color: 'bg-mint-100 text-green-700', emoji: '🎉' },
  cancelled: { label: 'Cancelado', color: 'bg-blush-100 text-blush-500', emoji: '❌' },
};

export default function PedidosPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [session]);

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">📦</span>
        <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-3">Inicia sesion para ver tus pedidos</h2>
        <Link href="/login" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 inline-block">Iniciar Sesion</Link>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">📦</span></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-6">Mis Pedidos 📦</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200">
          <span className="text-5xl block mb-4">🧸</span>
          <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">Aun no tienes pedidos</h3>
          <p className="text-cocoa-400 mb-6">Explora nuestro catalogo y haz tu primer pedido!</p>
          <Link href="/catalogo" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 inline-block">Ver Catalogo 🧶</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
            return (
              <div key={order._id} className="bg-white rounded-cute shadow-soft border border-cream-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-cocoa-300 font-medium">Pedido #{order._id?.slice(-8)}</span>
                    <span className="mx-2 text-cream-300">|</span>
                    <span className="text-xs text-cocoa-400">{new Date(order.createdAt).toLocaleDateString('es-MX')}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${st.color}`}>{st.emoji} {st.label}</span>
                </div>

                <div className="flex flex-wrap gap-3 mb-3">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-cream-50 rounded-xl px-3 py-1.5">
                      <span className="text-sm font-medium text-cocoa-600">{item.title}</span>
                      <span className="text-xs text-cocoa-300">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                  <span className="text-sm text-cocoa-400">{order.items?.length || 0} productos</span>
                  <span className="font-display font-bold text-lg text-cocoa-700">${(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
