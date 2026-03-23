'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (session) fetchCart();
    else setLoading(false);
  }, [session]);

  const updateQty = async (productId: string, quantity: number) => {
    const item = items.find(i => i.productId === productId);
    if (!item) return;

    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, quantity }),
    });
    fetchCart();
  };

  const removeItem = async (productId: string) => {
    await fetch(`/api/cart?productId=${productId}`, { method: 'DELETE' });
    fetchCart();
  };

  const placeOrder = async () => {
    setOrdering(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        router.push('/pedidos');
      }
    } catch { /* silent */ }
    finally { setOrdering(false); }
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">🛒</span>
        <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-3">Inicia sesion para ver tu carrito</h2>
        <Link href="/login" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 inline-block">
          Iniciar Sesion 💕
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🛒</span></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-6">Tu Carrito 🛒</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200">
          <span className="text-5xl block mb-4">🧸</span>
          <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">Tu carrito esta vacio</h3>
          <p className="text-cocoa-400 mb-6">Descubre nuestras creaciones y agrega algo lindo!</p>
          <Link href="/catalogo" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 inline-block">
            Ir al Catalogo 🧶
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-cute shadow-soft border border-cream-200 p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-cream-100 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><span className="text-2xl opacity-30">🧸</span></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-cocoa-700 truncate">{item.title}</h3>
                  <p className="text-sm font-semibold text-blush-400">${item.price.toFixed(2)}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-cream-200 rounded-xl overflow-hidden">
                      <button onClick={() => updateQty(item.productId, Math.max(1, item.quantity - 1))} className="px-2.5 py-1 text-cocoa-400 hover:bg-cream-50 text-sm font-bold">-</button>
                      <span className="px-3 py-1 text-sm font-bold text-cocoa-700">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="px-2.5 py-1 text-cocoa-400 hover:bg-cream-50 text-sm font-bold">+</button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-xs font-semibold text-cocoa-300 hover:text-blush-400 transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="text-right font-display font-bold text-cocoa-700">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-cute shadow-warm border border-cream-200 p-6 sticky top-24">
              <h3 className="font-display font-bold text-lg text-cocoa-700 mb-4">Resumen</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-cocoa-500">
                  <span>Subtotal ({items.length} productos)</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-cocoa-500">
                  <span>Envio</span>
                  <span className="font-semibold text-mint-400">Gratis 🎁</span>
                </div>
                <div className="border-t border-cream-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-display font-bold text-cocoa-700">Total</span>
                    <span className="font-display font-bold text-xl text-cocoa-800">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={ordering}
                className="w-full btn-cute bg-blush-400 text-white py-3 hover:bg-blush-500 disabled:opacity-50 shadow-glow"
              >
                {ordering ? 'Procesando...' : 'Hacer Pedido 💕'}
              </button>

              <Link href="/catalogo" className="block text-center text-sm text-cocoa-400 font-semibold mt-4 hover:text-blush-400 transition-colors">
                Seguir comprando 🧶
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
