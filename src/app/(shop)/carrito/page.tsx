'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AnimatedBg from '@/components/AnimatedBg';

const WA = '528187087288';
const VENDEDORA = 'Veronica Guadalupe Perez Arreguin';
const BANCO = 'Banorte';
const CLABE = '072580013584894468';
const TARJETA = '4189 1432 3542 4218';

interface CartItem {
  productId: string; title: string; price: number; image: string; quantity: number;
}

export default function CartPage() {
  return (
    <Suspense fallback={<AnimatedBg theme="warm"><div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🛒</span></div></AnimatedBg>}>
      <CartPageInner />
    </Suspense>
  );
}

function CartPageInner() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const goPayImmediately = searchParams?.get('pagar') === '1';
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'done'>('cart');
  const [ordering, setOrdering] = useState(false);
  const [orderNum, setOrderNum] = useState(0);
  const [payMethod, setPayMethod] = useState<'transfer' | 'oxxo'>('transfer');
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [orderError, setOrderError] = useState('');
  const pagarHandledRef = useRef(false);

  // Datos de envío estructurados — required en /api/orders POST
  const [shipping, setShipping] = useState({
    recipientName: '',
    phone: '',
    street: '',
    exterior: '',
    interior: '',
    neighborhood: '',
    postalCode: '',
    city: '',
    state: '',
    references: '',
  });
  const [shipErrors, setShipErrors] = useState<Record<string, string>>({});

  // Recordar la dirección del cliente para próximas compras (localStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const v = localStorage.getItem('mac:lastShipping:v1');
      if (v) {
        const parsed = JSON.parse(v);
        setShipping((s) => ({ ...s, ...parsed }));
      }
    } catch {}
  }, []);

  // Auto-rellenar nombre del destinatario con el nombre del usuario logueado
  useEffect(() => {
    if (session?.user?.name && !shipping.recipientName) {
      setShipping((s) => ({ ...s, recipientName: session.user!.name as string }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name]);

  const fetchCart = async () => {
    try { const r = await fetch('/api/cart'); const d = await r.json(); setItems(d.items || []); setTotal(d.total || 0); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (session) fetchCart(); else setLoading(false); }, [session]);

  // Si el usuario entró con ?pagar=1 (desde "Comprar ahora"), saltar al paso de envío — una sola vez.
  // Limpiamos el query param para que "Volver al carrito" no rebote de regreso al checkout.
  useEffect(() => {
    if (pagarHandledRef.current) return;
    if (goPayImmediately && !loading && items.length > 0 && step === 'cart') {
      pagarHandledRef.current = true;
      setStep('shipping');
      router.replace('/carrito', { scroll: false });
    }
  }, [goPayImmediately, loading, items.length, step, router]);

  const validateShipping = (): boolean => {
    const errors: Record<string, string> = {};
    if (!shipping.recipientName.trim()) errors.recipientName = 'Requerido';
    if (!shipping.phone.trim() || !/^\d{10}$/.test(shipping.phone.replace(/\D/g, ''))) errors.phone = 'Teléfono a 10 dígitos';
    if (!shipping.street.trim()) errors.street = 'Requerido';
    if (!shipping.exterior.trim()) errors.exterior = 'Requerido';
    if (!shipping.neighborhood.trim()) errors.neighborhood = 'Requerido';
    if (!/^\d{5}$/.test(shipping.postalCode.trim())) errors.postalCode = 'CP a 5 dígitos';
    if (!shipping.city.trim()) errors.city = 'Requerido';
    if (!shipping.state.trim()) errors.state = 'Requerido';
    setShipErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToPayment = () => {
    if (!validateShipping()) return;
    // Guardar para próxima compra
    try {
      localStorage.setItem('mac:lastShipping:v1', JSON.stringify(shipping));
    } catch {}
    setStep('payment');
  };

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
    setOrderError('');
    setSavedItems([...items]);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping,
          notes: `Pago por ${payMethod === 'transfer' ? 'transferencia Banorte' : 'deposito OXXO'}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrderNum(data.orderNumber || 0);
        setStep('done');
      } else {
        const err = await res.json().catch(() => ({} as any));
        if (err?.missing && Array.isArray(err.missing)) {
          setOrderError('Faltan datos de envío. Vuelve al paso anterior y completa todos los campos.');
        } else {
          setOrderError(err?.error || 'No se pudo crear el pedido. Intenta de nuevo.');
        }
      }
    } catch {
      setOrderError('Error de conexion. Verifica tu internet e intenta de nuevo.');
    } finally { setOrdering(false); }
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
    const waMsg = encodeURIComponent(`Hola! Acabo de realizar el pedido #${orderNum} en Mundo A Crochet 🧸\nTotal: $${total.toFixed(2)} MXN\nMetodo: ${payMethod === 'transfer' ? 'Transferencia Banorte' : 'Deposito OXXO'}\nAdjunto mi comprobante de pago.`);
    return (
      <AnimatedBg theme="warm"><div className="max-w-lg mx-auto px-4 py-12 text-center">
        <span className="text-6xl block mb-4">✅</span>
        <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Pedido #{orderNum} Confirmado!</h1>
        <p className="text-cocoa-400 mb-6">Realiza tu pago y envianos el comprobante por WhatsApp. Una vez confirmado, te enviaremos tu ticket de compra.</p>

        {/* Payment details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-bubble shadow-warm border border-cream-200 p-6 mb-6 text-left">
          <h3 className="font-display font-bold text-cocoa-700 mb-4">📋 Datos para pago</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">Titular:</span><span className="font-bold text-cocoa-700">{VENDEDORA}</span></div>
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">Banco:</span><span className="font-bold text-cocoa-700">{BANCO}</span></div>
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">CLABE:</span><span className="font-bold text-cocoa-700 font-mono text-xs">{CLABE}</span></div>
            <div className="flex justify-between p-3 bg-cream-50 rounded-xl"><span className="text-cocoa-400">Tarjeta:</span><span className="font-bold text-cocoa-700 font-mono text-xs">{TARJETA}</span></div>
            <div className="flex justify-between p-3 bg-blush-50 rounded-xl border border-blush-200"><span className="text-cocoa-400">Total:</span><span className="font-bold text-xl text-blush-500">${total.toFixed(2)} MXN</span></div>
          </div>
        </div>

        {/* Info about ticket */}
        <div className="bg-lavender-50 border border-lavender-200 rounded-cute p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧾</span>
            <div>
              <p className="font-bold text-sm text-cocoa-700">Tu ticket se enviara cuando confirmemos tu pago</p>
              <p className="text-xs text-cocoa-400 mt-1">Envia tu comprobante por WhatsApp y te enviaremos tu ticket de compra personalizado.</p>
            </div>
          </div>
        </div>

        <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="btn-cute bg-green-500 text-white text-lg px-8 py-3.5 hover:bg-green-600 shadow-lg shadow-green-200 w-full flex items-center justify-center gap-2 mb-4">💬 Enviar comprobante por WhatsApp</a>
        <Link href="/pedidos" className="block text-sm font-semibold text-cocoa-400 hover:text-blush-400">Ver mis pedidos →</Link>
      </div></AnimatedBg>
    );
  }

  // ═══ SHIPPING — datos de envío estructurados ═══
  if (step === 'shipping') {
    const inputCls = (k: string) =>
      `input-cute ${shipErrors[k] ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`;
    return (
      <AnimatedBg theme="warm"><div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => setStep('cart')} className="text-sm text-cocoa-400 hover:text-blush-400 mb-6 flex items-center gap-1">← Volver al carrito</button>

        <h1 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Dirección de envío 📦</h1>
        <p className="text-cocoa-400 text-sm mb-6">¿A dónde enviamos tu pedido?</p>

        <div className="bg-white/80 backdrop-blur-sm rounded-cute shadow-soft border border-cream-200 p-5 space-y-4">
          {/* Destinatario */}
          <div>
            <label className="block text-xs font-bold text-cocoa-700 mb-1">Nombre del destinatario *</label>
            <input
              type="text" value={shipping.recipientName}
              onChange={(e) => setShipping((s) => ({ ...s, recipientName: e.target.value }))}
              className={inputCls('recipientName')} placeholder="Quién recibe el paquete" maxLength={120}
            />
            {shipErrors.recipientName && <p className="text-[11px] text-red-500 mt-1">{shipErrors.recipientName}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-cocoa-700 mb-1">Teléfono de contacto *</label>
            <input
              type="tel" value={shipping.phone}
              onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
              className={inputCls('phone')} placeholder="10 dígitos" maxLength={20}
            />
            {shipErrors.phone && <p className="text-[11px] text-red-500 mt-1">{shipErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-cocoa-700 mb-1">Calle *</label>
            <input
              type="text" value={shipping.street}
              onChange={(e) => setShipping((s) => ({ ...s, street: e.target.value }))}
              className={inputCls('street')} placeholder="Ej. Av. Constitución" maxLength={200}
            />
            {shipErrors.street && <p className="text-[11px] text-red-500 mt-1">{shipErrors.street}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cocoa-700 mb-1">Núm. exterior *</label>
              <input
                type="text" value={shipping.exterior}
                onChange={(e) => setShipping((s) => ({ ...s, exterior: e.target.value }))}
                className={inputCls('exterior')} placeholder="Ej. 123" maxLength={20}
              />
              {shipErrors.exterior && <p className="text-[11px] text-red-500 mt-1">{shipErrors.exterior}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-cocoa-700 mb-1">Núm. interior</label>
              <input
                type="text" value={shipping.interior}
                onChange={(e) => setShipping((s) => ({ ...s, interior: e.target.value }))}
                className="input-cute" placeholder="Ej. A o 2 (opcional)" maxLength={20}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cocoa-700 mb-1">Colonia *</label>
            <input
              type="text" value={shipping.neighborhood}
              onChange={(e) => setShipping((s) => ({ ...s, neighborhood: e.target.value }))}
              className={inputCls('neighborhood')} placeholder="Ej. Del Valle" maxLength={120}
            />
            {shipErrors.neighborhood && <p className="text-[11px] text-red-500 mt-1">{shipErrors.neighborhood}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-cocoa-700 mb-1">CP *</label>
              <input
                type="text" inputMode="numeric" value={shipping.postalCode}
                onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                className={inputCls('postalCode')} placeholder="64000" maxLength={5}
              />
              {shipErrors.postalCode && <p className="text-[11px] text-red-500 mt-1">{shipErrors.postalCode}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-cocoa-700 mb-1">Ciudad *</label>
              <input
                type="text" value={shipping.city}
                onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                className={inputCls('city')} placeholder="Ej. Monterrey" maxLength={80}
              />
              {shipErrors.city && <p className="text-[11px] text-red-500 mt-1">{shipErrors.city}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cocoa-700 mb-1">Estado *</label>
            <input
              type="text" value={shipping.state}
              onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
              className={inputCls('state')} placeholder="Ej. Nuevo León" maxLength={80}
            />
            {shipErrors.state && <p className="text-[11px] text-red-500 mt-1">{shipErrors.state}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-cocoa-700 mb-1">Referencias <span className="text-cocoa-400 font-normal">(opcional)</span></label>
            <textarea
              value={shipping.references}
              onChange={(e) => setShipping((s) => ({ ...s, references: e.target.value }))}
              className="input-cute" placeholder="Ej. Casa color rosa, entre calle X y calle Y" maxLength={300} rows={2}
            />
          </div>
        </div>

        <button onClick={goToPayment} className="w-full btn-cute bg-blush-400 text-white py-3.5 text-base hover:bg-blush-500 shadow-glow mt-5">
          Continuar al pago →
        </button>
        <p className="text-center text-xs text-cocoa-300 mt-2">Tus datos son privados y solo se usan para el envío.</p>
      </div></AnimatedBg>
    );
  }

  // ═══ PAYMENT ═══
  if (step === 'payment') {
    return (
      <AnimatedBg theme="warm"><div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => setStep('shipping')} className="text-sm text-cocoa-400 hover:text-blush-400 mb-6 flex items-center gap-1">← Volver a la dirección</button>

        <h1 className="font-display font-bold text-2xl text-cocoa-700 mb-2">Metodo de Pago 💳</h1>
        <p className="text-cocoa-400 text-sm mb-6">Elige como quieres pagar</p>

        {/* Resumen de envío */}
        <div className="bg-mint-50/60 border border-mint-200 rounded-cute p-4 mb-6 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-base">📦</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-cocoa-700 mb-0.5">Enviamos a:</p>
              <p className="text-cocoa-600">{shipping.recipientName} · {shipping.phone}</p>
              <p className="text-cocoa-600">{shipping.street} {shipping.exterior}{shipping.interior ? ` int. ${shipping.interior}` : ''}, Col. {shipping.neighborhood}</p>
              <p className="text-cocoa-600">CP {shipping.postalCode} · {shipping.city}, {shipping.state}</p>
              <button onClick={() => setStep('shipping')} className="text-blush-500 font-semibold hover:underline mt-1">Editar</button>
            </div>
          </div>
        </div>

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
            <div className="flex-1"><p className="font-bold text-sm text-cocoa-700">Transferencia bancaria</p><p className="text-xs text-cocoa-400">{BANCO} · Deposito directo</p></div>
            {payMethod === 'transfer' && <span className="text-blush-400 font-bold">✓</span>}
          </button>

          <button onClick={() => setPayMethod('oxxo')} className={`w-full flex items-center gap-4 p-4 rounded-cute border-2 transition-all text-left ${payMethod === 'oxxo' ? 'border-blush-400 bg-blush-50' : 'border-cream-200 bg-white hover:border-blush-200'}`}>
            <span className="text-2xl">🏪</span>
            <div className="flex-1"><p className="font-bold text-sm text-cocoa-700">Deposito en OXXO</p><p className="text-xs text-cocoa-400">Paga en efectivo en cualquier OXXO</p></div>
            {payMethod === 'oxxo' && <span className="text-blush-400 font-bold">✓</span>}
          </button>
        </div>

        {/* Bank details for transfer/oxxo */}
        <div className="bg-gradient-to-br from-cream-100/80 to-lavender-50/80 backdrop-blur-sm rounded-cute border border-cream-200 p-5 mb-6">
          <h3 className="font-display font-bold text-cocoa-700 mb-3">{payMethod === 'transfer' ? '🏦 Datos para transferencia' : '🏪 Datos para deposito OXXO'}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-cocoa-400">Titular:</span><span className="font-bold text-cocoa-700">{VENDEDORA}</span></div>
            <div className="flex justify-between"><span className="text-cocoa-400">Banco:</span><span className="font-bold text-cocoa-700">{BANCO}</span></div>
            {payMethod === 'transfer' && <div className="flex justify-between"><span className="text-cocoa-400">CLABE:</span><span className="font-bold text-cocoa-700 font-mono text-xs">{CLABE}</span></div>}
            <div className="flex justify-between"><span className="text-cocoa-400">No. Tarjeta:</span><span className="font-bold text-cocoa-700 font-mono text-xs">{TARJETA}</span></div>
          </div>
        </div>

        {orderError && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-cute p-3 mb-3 text-sm text-red-600 flex items-start gap-2">
            <span>⚠️</span><span>{orderError}</span>
          </div>
        )}

        <button onClick={placeOrder} disabled={ordering}
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
          {/* Items */}
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

              <button onClick={() => setStep('shipping')} className="w-full btn-cute bg-blush-400 text-white py-3.5 text-base hover:bg-blush-500 shadow-glow mb-3">Ir a Pagar 💕</button>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-cocoa-400 p-2 bg-cream-50 rounded-xl"><span>🏦</span> Transferencia {BANCO} / OXXO</div>
                <div className="flex items-center gap-2 text-xs text-cocoa-400 p-2 bg-cream-50 rounded-xl"><span>🧾</span> Ticket al confirmar pago</div>
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
