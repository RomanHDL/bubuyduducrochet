'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const WA = '528187087288';

interface CartItem {
  productId: string; title: string; price: number; image: string; quantity: number;
}

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'cart' | 'payment' | 'done'>('cart');
  const [ordering, setOrdering] = useState(false);
  const [orderId, setOrderId] = useState('');

  const fetchCart = async () => {
    try { const r = await fetch('/api/cart'); const d = await r.json(); setItems(d.items || []); setTotal(d.total || 0); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (session) fetchCart(); else setLoading(false); }, [session]);

  const updateQty = async (productId: string, quantity: number) => {
    const item = items.find(i => i.productId === productId); if (!item) return;
    await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, quantity }) });
    fetchCart();
  };

  const removeItem = async (productId: string) => {
    await fetch(`/api/cart?productId=${productId}`, { method: 'DELETE' }); fetchCart();
  };

  const goToPayment = () => { if (items.length > 0) setStep('payment'); };

  const placeOrder = async () => {
    setOrdering(true);
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: 'Pago por transferencia/OXXO' }) });
      if (res.ok) { const data = await res.json(); setOrderId(data._id || ''); setStep('done'); }
    } catch {} finally { setOrdering(false); }
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">🛒</span>
        <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-3">Inicia sesion para ver tu carrito</h2>
        <Link href="/login" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 inline-block">Iniciar Sesion 💕</Link>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🛒</span></div>;

  // ═══ STEP 3: Order confirmed ═══
  if (step === 'done') {
    const waMsg = encodeURIComponent(`Hola! Acabo de hacer un pedido en Bubu & Dudu Crochet 🧸\n\nPedido: ${orderId}\nTotal: $${total.toFixed(2)} MXN\n\nYa realice mi pago, adjunto comprobante.`);
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <span className="text-6xl block mb-4">✅</span>
        <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-3">Pedido Confirmado!</h1>
        <p className="text-cocoa-400 mb-8">Tu pedido ha sido registrado. Para completar tu compra, realiza el pago y envianos tu comprobante por WhatsApp.</p>

        <div className="bg-white rounded-cute shadow-warm border border-cream-200 p-6 mb-6 text-left">
          <h3 className="font-display font-bold text-cocoa-700 mb-4">📋 Datos para pago</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">Nombre:</span><span className="font-bold text-cocoa-700">Veronica Guadalupe</span></div>
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">Banco:</span><span className="font-bold text-cocoa-700">BBVA</span></div>
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">CLABE:</span><span className="font-bold text-cocoa-700 font-mono">0121 8000 8187 0872 88</span></div>
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">Tarjeta:</span><span className="font-bold text-cocoa-700 font-mono">4152 3141 3687 0288</span></div>
            <div className="flex justify-between p-3 bg-blush-50 rounded-xl border border-blush-200"><span className="text-cocoa-400">Total a pagar:</span><span className="font-bold text-xl text-blush-500">${total.toFixed(2)} MXN</span></div>
          </div>
          <p className="text-xs text-cocoa-300 mt-3">Tambien puedes depositar en OXXO con la tarjeta de arriba</p>
        </div>

        <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="btn-cute bg-green-500 text-white text-lg px-8 py-3.5 hover:bg-green-600 shadow-lg shadow-green-200 w-full flex items-center justify-center gap-2 mb-4">
          💬 Enviar comprobante por WhatsApp
        </a>

        <Link href="/pedidos" className="block text-sm font-semibold text-cocoa-400 hover:text-blush-400">Ver mis pedidos →</Link>
      </div>
    );
  }

  // ═══ STEP 2: Payment info ═══
  if (step === 'payment') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => setStep('cart')} className="text-sm text-cocoa-400 hover:text-blush-400 mb-6 flex items-center gap-1">← Volver al carrito</button>

        <h1 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Metodo de Pago 💳</h1>
        <p className="text-cocoa-400 text-sm mb-6">Realiza tu pago por transferencia o deposito OXXO</p>

        {/* Order summary */}
        <div className="bg-white rounded-cute shadow-soft border border-cream-200 p-5 mb-6">
          <h3 className="font-semibold text-cocoa-700 text-sm mb-3">Resumen de tu pedido</h3>
          {items.map(item => (
            <div key={item.productId} className="flex justify-between text-sm py-1.5 border-b border-cream-100 last:border-0">
              <span className="text-cocoa-500">{item.title} x{item.quantity}</span>
              <span className="font-semibold text-cocoa-700">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between mt-3 pt-3 border-t border-cream-200">
            <span className="font-display font-bold text-cocoa-700">Total</span>
            <span className="font-display font-bold text-xl text-blush-500">${total.toFixed(2)} MXN</span>
          </div>
        </div>

        {/* Payment details */}
        <div className="bg-gradient-to-br from-[#4A90D9]/10 to-lavender-50 rounded-cute border border-[#4A90D9]/20 p-6 mb-6">
          <h3 className="font-display font-bold text-cocoa-700 mb-4">🏦 Datos para transferencia</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-cocoa-400">Titular:</span><span className="font-bold text-cocoa-700">Veronica Guadalupe</span></div>
            <div className="flex justify-between"><span className="text-cocoa-400">Banco:</span><span className="font-bold text-cocoa-700">BBVA</span></div>
            <div className="flex justify-between"><span className="text-cocoa-400">CLABE:</span><span className="font-bold text-cocoa-700 font-mono text-xs">0121 8000 8187 0872 88</span></div>
            <div className="flex justify-between"><span className="text-cocoa-400">No. Tarjeta:</span><span className="font-bold text-cocoa-700 font-mono text-xs">4152 3141 3687 0288</span></div>
          </div>
          <div className="mt-4 p-3 bg-white/60 rounded-xl border border-cream-200">
            <p className="text-xs text-cocoa-400">💡 <strong>OXXO:</strong> Deposita en cualquier OXXO con el numero de tarjeta</p>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={placeOrder} disabled={ordering}
            className="w-full btn-cute bg-blush-400 text-white py-3.5 text-base hover:bg-blush-500 disabled:opacity-50 shadow-glow">
            {ordering ? '🧶 Procesando...' : 'Confirmar Pedido ✨'}
          </button>
          <p className="text-center text-xs text-cocoa-300">Al confirmar, se registra tu pedido. Despues envias tu comprobante de pago por WhatsApp.</p>
        </div>
      </div>
    );
  }

  // ═══ STEP 1: Cart ═══
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-6">Tu Carrito 🛒</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-cute shadow-soft border border-cream-200">
          <span className="text-5xl block mb-4">🧸</span>
          <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">Tu carrito esta vacio</h3>
          <p className="text-cocoa-400 mb-6">Descubre nuestras creaciones!</p>
          <Link href="/catalogo" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 inline-block">Ir al Catalogo 🧶</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.productId} className="bg-white rounded-cute shadow-soft border border-cream-200 p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-cream-100 overflow-hidden flex-shrink-0">
                  {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-2xl opacity-30">🧸</span></div>}
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
                    <button onClick={() => removeItem(item.productId)} className="text-xs font-semibold text-cocoa-300 hover:text-blush-400">Eliminar</button>
                  </div>
                </div>
                <div className="text-right font-display font-bold text-cocoa-700">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-cute shadow-warm border border-cream-200 p-6 sticky top-24">
              <h3 className="font-display font-bold text-lg text-cocoa-700 mb-4">Resumen</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-cocoa-500"><span>Subtotal ({items.length})</span><span className="font-semibold">${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-cocoa-500"><span>Envio</span><span className="font-semibold text-mint-400">Gratis 🎁</span></div>
                <div className="border-t border-cream-200 pt-3"><div className="flex justify-between"><span className="font-display font-bold text-cocoa-700">Total</span><span className="font-display font-bold text-xl text-cocoa-800">${total.toFixed(2)}</span></div></div>
              </div>
              <button onClick={goToPayment} className="w-full btn-cute bg-blush-400 text-white py-3 hover:bg-blush-500 shadow-glow">Ir a Pagar 💕</button>
              <div className="mt-4 p-3 bg-cream-50 rounded-xl text-xs text-cocoa-400 text-center">🏦 Pago por transferencia o OXXO</div>
              <Link href="/catalogo" className="block text-center text-sm text-cocoa-400 font-semibold mt-3 hover:text-blush-400">Seguir comprando 🧶</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
