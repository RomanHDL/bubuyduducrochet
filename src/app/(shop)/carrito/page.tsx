'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedBg from '@/components/AnimatedBg';

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
  const [orderNum, setOrderNum] = useState(0);
  const [payMethod, setPayMethod] = useState<'transfer' | 'oxxo' | 'mercadopago'>('transfer');

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

  const placeOrder = async () => {
    setOrdering(true);
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: `Pago por ${payMethod === 'transfer' ? 'transferencia' : payMethod === 'oxxo' ? 'OXXO' : 'Mercado Pago'}` }) });
      if (res.ok) { const data = await res.json(); setOrderNum(data.orderNumber || 0); setStep('done'); }
    } catch {} finally { setOrdering(false); }
  };

  if (!session) return (
    <AnimatedBg theme="warm"><div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <span className="text-5xl block mb-4">🛒</span>
      <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-3">Inicia sesion para ver tu carrito</h2>
      <Link href="/login" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 inline-block">Iniciar Sesion 💕</Link>
    </div></AnimatedBg>
  );

  if (loading) return <AnimatedBg theme="warm"><div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🛒</span></div></AnimatedBg>;

  // ═══ DONE ═══
  if (step === 'done') {
    const waMsg = encodeURIComponent(`Hola! Pedido #${orderNum} en Bubu & Dudu 🧸\nTotal: $${total.toFixed(2)} MXN\nMetodo: ${payMethod}\nAdjunto comprobante.`);
    return (
      <AnimatedBg theme="warm"><div className="max-w-lg mx-auto px-4 py-12 text-center">
        <span className="text-6xl block mb-4">✅</span>
        <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Pedido #{orderNum} Confirmado!</h1>
        <p className="text-cocoa-400 mb-8">Realiza tu pago y envianos el comprobante por WhatsApp.</p>

        <div className="bg-white/80 backdrop-blur-sm rounded-bubble shadow-warm border border-cream-200 p-6 mb-6 text-left">
          <h3 className="font-display font-bold text-cocoa-700 mb-4">📋 Datos para pago</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">Titular:</span><span className="font-bold text-cocoa-700">Veronica Guadalupe</span></div>
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">Banco:</span><span className="font-bold text-cocoa-700">BBVA</span></div>
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">CLABE:</span><span className="font-bold text-cocoa-700 font-mono text-xs">0121 8000 8187 0872 88</span></div>
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">Tarjeta:</span><span className="font-bold text-cocoa-700 font-mono text-xs">4152 3141 3687 0288</span></div>
            <div className="flex justify-between p-3 bg-blush-50 rounded-xl border border-blush-200"><span className="text-cocoa-400">Total:</span><span className="font-bold text-xl text-blush-500">${total.toFixed(2)} MXN</span></div>
          </div>
        </div>

        <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="btn-cute bg-green-500 text-white text-lg px-8 py-3.5 hover:bg-green-600 shadow-lg shadow-green-200 w-full flex items-center justify-center gap-2 mb-4">💬 Enviar comprobante por WhatsApp</a>
        <Link href="/pedidos" className="block text-sm font-semibold text-cocoa-400 hover:text-blush-400">Ver mis pedidos →</Link>
      </div></AnimatedBg>
    );
  }

  // ═══ PAYMENT ═══
  if (step === 'payment') {
    return (
      <AnimatedBg theme="warm"><div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => setStep('cart')} className="text-sm text-cocoa-400 hover:text-blush-400 mb-6 flex items-center gap-1">← Volver al carrito</button>

        <h1 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Metodo de Pago 💳</h1>
        <p className="text-cocoa-400 text-sm mb-6">Elige como quieres pagar</p>

        {/* Order summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-cute shadow-soft border border-cream-200 p-5 mb-6">
          <h3 className="font-semibold text-cocoa-700 text-sm mb-3">Resumen ({items.length} productos)</h3>
          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-3 py-2 border-b border-cream-100 last:border-0">
              <div className="w-12 h-12 rounded-lg bg-cream-100 overflow-hidden flex-shrink-0">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full">🧸</span>}
              </div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-cocoa-700 truncate">{item.title}</p><p className="text-xs text-cocoa-400">x{item.quantity}</p></div>
              <span className="font-bold text-sm text-cocoa-700">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between mt-3 pt-3 border-t border-cream-200">
            <span className="font-display font-bold text-cocoa-700">Total</span>
            <span className="font-display font-bold text-2xl text-blush-500">${total.toFixed(2)} MXN</span>
          </div>
        </div>

        {/* Payment methods */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-bold text-cocoa-600">Metodo de pago</h3>

          <button onClick={() => setPayMethod('transfer')} className={`w-full flex items-center gap-4 p-4 rounded-cute border-2 transition-all text-left ${payMethod === 'transfer' ? 'border-blush-400 bg-blush-50' : 'border-cream-200 bg-white hover:border-blush-200'}`}>
            <span className="text-2xl">🏦</span>
            <div className="flex-1"><p className="font-bold text-sm text-cocoa-700">Transferencia bancaria</p><p className="text-xs text-cocoa-400">BBVA · Deposito directo</p></div>
            {payMethod === 'transfer' && <span className="text-blush-400 font-bold">✓</span>}
          </button>

          <button onClick={() => setPayMethod('oxxo')} className={`w-full flex items-center gap-4 p-4 rounded-cute border-2 transition-all text-left ${payMethod === 'oxxo' ? 'border-blush-400 bg-blush-50' : 'border-cream-200 bg-white hover:border-blush-200'}`}>
            <span className="text-2xl">🏪</span>
            <div className="flex-1"><p className="font-bold text-sm text-cocoa-700">Deposito en OXXO</p><p className="text-xs text-cocoa-400">Paga en efectivo en cualquier OXXO</p></div>
            {payMethod === 'oxxo' && <span className="text-blush-400 font-bold">✓</span>}
          </button>

          <button onClick={() => setPayMethod('mercadopago')} className={`w-full flex items-center gap-4 p-4 rounded-cute border-2 transition-all text-left ${payMethod === 'mercadopago' ? 'border-[#00B1EA] bg-[#00B1EA]/5' : 'border-cream-200 bg-white hover:border-[#00B1EA]/40'}`}>
            <span className="text-2xl">💳</span>
            <div className="flex-1"><p className="font-bold text-sm text-cocoa-700">Mercado Pago</p><p className="text-xs text-cocoa-400">Tarjeta, MSI, Mercado Credito</p></div>
            {payMethod === 'mercadopago' && <span className="text-[#00B1EA] font-bold">✓</span>}
            <span className="text-[8px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Pronto</span>
          </button>
        </div>

        {/* Bank details for transfer/oxxo */}
        {payMethod !== 'mercadopago' && (
          <div className="bg-gradient-to-br from-cream-100/80 to-lavender-50/80 backdrop-blur-sm rounded-cute border border-cream-200 p-5 mb-6">
            <h3 className="font-display font-bold text-cocoa-700 mb-3">{payMethod === 'transfer' ? '🏦 Datos para transferencia' : '🏪 Datos para deposito OXXO'}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-cocoa-400">Titular:</span><span className="font-bold text-cocoa-700">Veronica Guadalupe</span></div>
              <div className="flex justify-between"><span className="text-cocoa-400">Banco:</span><span className="font-bold text-cocoa-700">BBVA</span></div>
              {payMethod === 'transfer' && <div className="flex justify-between"><span className="text-cocoa-400">CLABE:</span><span className="font-bold text-cocoa-700 font-mono text-xs">0121 8000 8187 0872 88</span></div>}
              <div className="flex justify-between"><span className="text-cocoa-400">No. Tarjeta:</span><span className="font-bold text-cocoa-700 font-mono text-xs">4152 3141 3687 0288</span></div>
            </div>
          </div>
        )}

        {payMethod === 'mercadopago' && (
          <div className="bg-[#00B1EA]/5 rounded-cute border border-[#00B1EA]/20 p-5 mb-6 text-center">
            <span className="text-3xl block mb-2">💳</span>
            <p className="text-sm text-cocoa-500 font-medium">Mercado Pago estara disponible muy pronto</p>
            <p className="text-xs text-cocoa-400 mt-1">Por ahora puedes pagar por transferencia o OXXO</p>
          </div>
        )}

        <button onClick={placeOrder} disabled={ordering || payMethod === 'mercadopago'}
          className="w-full btn-cute bg-blush-400 text-white py-3.5 text-base hover:bg-blush-500 disabled:opacity-50 shadow-glow mb-2">
          {ordering ? '🧶 Procesando...' : 'Confirmar Pedido ✨'}
        </button>
        <p className="text-center text-xs text-cocoa-300">Al confirmar, se registra tu pedido.</p>
      </div></AnimatedBg>
    );
  }

  // ═══ CART ═══
  return (
    <AnimatedBg theme="warm"><div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-8">Tu Carrito 🛒</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-cute shadow-soft border border-cream-200">
          <span className="text-6xl block mb-4">🧸</span>
          <h3 className="font-display font-bold text-xl text-cocoa-600 mb-2">Tu carrito esta vacio</h3>
          <p className="text-cocoa-400 mb-6">Descubre nuestras creaciones!</p>
          <Link href="/catalogo" className="btn-cute bg-blush-400 text-white px-6 py-3 hover:bg-blush-500 inline-block text-lg">Ir al Catalogo 🧶</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items — bigger cards */}
          <div className="lg:col-span-2 space-y-5">
            {items.map(item => (
              <div key={item.productId} className="bg-white/80 backdrop-blur-sm rounded-cute shadow-soft border border-cream-200 p-5 flex gap-5 hover:shadow-warm transition-all">
                <Link href={`/producto/${item.productId}`} className="w-28 h-28 rounded-xl bg-cream-100 overflow-hidden flex-shrink-0 shadow-soft hover:shadow-warm transition-shadow">
                  {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-3xl opacity-30">🧸</span></div>}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/producto/${item.productId}`} className="font-display font-bold text-lg text-cocoa-700 hover:text-blush-400 transition-colors truncate block">{item.title}</Link>
                  <p className="text-base font-bold text-blush-400 mt-1">${item.price.toFixed(2)} MXN</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border-2 border-cream-200 rounded-2xl overflow-hidden bg-white">
                      <button onClick={() => updateQty(item.productId, Math.max(1, item.quantity - 1))} className="px-4 py-2.5 text-cocoa-400 hover:bg-cream-50 text-lg font-bold">-</button>
                      <span className="px-5 py-2.5 font-bold text-cocoa-700 text-lg min-w-[3rem] text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="px-4 py-2.5 text-cocoa-400 hover:bg-cream-50 text-lg font-bold">+</button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-sm font-semibold text-red-300 hover:text-red-500 transition-colors flex items-center gap-1">🗑️ Eliminar</button>
                  </div>
                </div>
                <div className="text-right self-center">
                  <span className="font-display font-bold text-xl text-cocoa-800">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-cute shadow-warm border border-cream-200 p-6 sticky top-24">
              <h3 className="font-display font-bold text-lg text-cocoa-700 mb-5">Resumen del pedido</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-cocoa-500"><span>Productos ({items.reduce((s, i) => s + i.quantity, 0)})</span><span className="font-semibold">${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-cocoa-500"><span>Envio</span><span className="font-semibold text-cocoa-400">Se coordina por WhatsApp 📱</span></div>
                <div className="border-t border-cream-200 pt-3">
                  <div className="flex justify-between"><span className="font-display font-bold text-cocoa-700">Total</span><span className="font-display font-bold text-2xl text-cocoa-800">${total.toFixed(2)}</span></div>
                  <p className="text-[10px] text-cocoa-300 mt-1">MXN · IVA incluido</p>
                </div>
              </div>

              <button onClick={() => setStep('payment')} className="w-full btn-cute bg-blush-400 text-white py-3.5 text-base hover:bg-blush-500 shadow-glow mb-3">Ir a Pagar 💕</button>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-cocoa-400 p-2 bg-cream-50 rounded-xl"><span>🏦</span> Transferencia / OXXO</div>
                <div className="flex items-center gap-2 text-xs text-cocoa-400 p-2 bg-[#00B1EA]/5 rounded-xl border border-[#00B1EA]/10"><span>💳</span> Mercado Pago <span className="text-[8px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">Pronto</span></div>
                <div className="flex items-center gap-2 text-xs text-cocoa-400 p-2 bg-cream-50 rounded-xl"><span>📱</span> Envio se coordina por WhatsApp</div>
              </div>

              <Link href="/catalogo" className="block text-center text-sm text-cocoa-400 font-semibold mt-4 hover:text-blush-400">Seguir comprando 🧶</Link>
            </div>
          </div>
        </div>
      )}
    </div></AnimatedBg>
  );
}
