'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedBg from '@/components/AnimatedBg';

const WA = '528187087288';
const LOGO = 'https://i.pinimg.com/originals/f7/97/e0/f797e0d435f74e1b41a49ba08f908d25.png';
const VENDEDORA = 'Veronica Guadalupe Perez Arreguin';
const BANCO = 'Banorte';
const CLABE = '072580013584894468';
const TARJETA = '4189 1432 3542 4218';

interface CartItem {
  productId: string; title: string; price: number; image: string; quantity: number;
}

// ═══ Ticket generator — creates an image from a canvas ═══
function generateTicket(
  orderNum: number,
  items: CartItem[],
  total: number,
  payMethod: string,
  userName: string,
): Promise<string> {
  return new Promise((resolve) => {
    const W = 600;
    const lineH = 28;
    const itemCount = items.length;
    const H = 520 + itemCount * lineH * 2 + 40;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(0, 0, W, H);

    // Top accent bar
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#FFB4B4');
    grad.addColorStop(0.5, '#DCC0EE');
    grad.addColorStop(1, '#B8E6CC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 8);

    // Decorative border
    ctx.strokeStyle = '#F0E0D0';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, W - 24, H - 24);

    let y = 40;

    // Load logo and draw rest
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.onload = () => {
      // Logo centered
      const logoSize = 80;
      ctx.drawImage(logo, (W - logoSize) / 2, y, logoSize, logoSize);
      y += logoSize + 12;

      drawContent();
    };
    logo.onerror = () => {
      // Fallback: text logo
      ctx.font = 'bold 28px Nunito, sans-serif';
      ctx.fillStyle = '#8B6543';
      ctx.textAlign = 'center';
      ctx.fillText('🧶 Mundo A Crochet', W / 2, y + 30);
      y += 50;
      drawContent();
    };
    logo.src = LOGO;

    function drawContent() {
      // Store name
      ctx.font = 'bold 22px Nunito, sans-serif';
      ctx.fillStyle = '#8B6543';
      ctx.textAlign = 'center';
      ctx.fillText('Mundo A Crochet', W / 2, y);
      y += 22;

      ctx.font = '13px Nunito, sans-serif';
      ctx.fillStyle = '#A0896E';
      ctx.fillText('Hecho a mano con amor desde Monterrey 💕', W / 2, y);
      y += 28;

      // Divider
      ctx.strokeStyle = '#E8D8C8';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
      ctx.setLineDash([]);
      y += 20;

      // Ticket title
      ctx.font = 'bold 20px Nunito, sans-serif';
      ctx.fillStyle = '#4A3320';
      ctx.fillText(`TICKET DE COMPRA #${orderNum}`, W / 2, y);
      y += 28;

      // Date & time
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      ctx.font = '13px Nunito, sans-serif';
      ctx.fillStyle = '#8B7B6B';
      ctx.fillText(`📅 ${dateStr}`, W / 2, y);
      y += 20;
      ctx.fillText(`🕐 ${timeStr}`, W / 2, y);
      y += 24;

      // Customer
      ctx.font = '13px Nunito, sans-serif';
      ctx.fillStyle = '#8B7B6B';
      ctx.fillText(`Cliente: ${userName}`, W / 2, y);
      y += 24;

      // Divider
      ctx.strokeStyle = '#E8D8C8';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
      ctx.setLineDash([]);
      y += 16;

      // Items header
      ctx.textAlign = 'left';
      ctx.font = 'bold 13px Nunito, sans-serif';
      ctx.fillStyle = '#8B6543';
      ctx.fillText('PRODUCTO', 40, y);
      ctx.textAlign = 'center';
      ctx.fillText('CANT.', W / 2 + 60, y);
      ctx.textAlign = 'right';
      ctx.fillText('SUBTOTAL', W - 40, y);
      y += 8;

      ctx.strokeStyle = '#D8C8B8';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
      y += 18;

      // Items
      items.forEach((item) => {
        // Title (truncated)
        const title = item.title.length > 28 ? item.title.substring(0, 28) + '...' : item.title;
        ctx.textAlign = 'left';
        ctx.font = '14px Nunito, sans-serif';
        ctx.fillStyle = '#4A3320';
        ctx.fillText(`🧸 ${title}`, 40, y);
        y += 22;

        // Price per unit
        ctx.font = '12px Nunito, sans-serif';
        ctx.fillStyle = '#A0896E';
        ctx.textAlign = 'left';
        ctx.fillText(`   $${item.price.toFixed(2)} c/u`, 52, y);

        // Quantity
        ctx.textAlign = 'center';
        ctx.fillStyle = '#4A3320';
        ctx.font = 'bold 14px Nunito, sans-serif';
        ctx.fillText(`x${item.quantity}`, W / 2 + 60, y);

        // Subtotal
        ctx.textAlign = 'right';
        ctx.fillStyle = '#4A3320';
        ctx.fillText(`$${(item.price * item.quantity).toFixed(2)}`, W - 40, y);
        y += lineH;
      });

      y += 4;

      // Divider
      ctx.strokeStyle = '#D8C8B8';
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
      y += 20;

      // Total
      ctx.textAlign = 'left';
      ctx.font = 'bold 16px Nunito, sans-serif';
      ctx.fillStyle = '#8B6543';
      ctx.fillText('TOTAL:', 40, y);
      ctx.textAlign = 'right';
      ctx.font = 'bold 24px Nunito, sans-serif';
      ctx.fillStyle = '#E07070';
      ctx.fillText(`$${total.toFixed(2)} MXN`, W - 40, y);
      y += 32;

      // Payment method
      ctx.textAlign = 'center';
      ctx.font = '13px Nunito, sans-serif';
      ctx.fillStyle = '#8B7B6B';
      const methodLabel = payMethod === 'transfer' ? '🏦 Transferencia Banorte' : '🏪 Deposito OXXO';
      ctx.fillText(`Metodo de pago: ${methodLabel}`, W / 2, y);
      y += 28;

      // Seller info box
      ctx.fillStyle = '#FFF5F0';
      const boxY = y;
      ctx.fillRect(30, boxY, W - 60, 70);
      ctx.strokeStyle = '#F0D8C8';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, boxY, W - 60, 70);

      y = boxY + 20;
      ctx.font = 'bold 13px Nunito, sans-serif';
      ctx.fillStyle = '#8B6543';
      ctx.textAlign = 'center';
      ctx.fillText('Vendedora', W / 2, y);
      y += 20;
      ctx.font = '14px Nunito, sans-serif';
      ctx.fillStyle = '#4A3320';
      ctx.fillText(`${VENDEDORA}`, W / 2, y);
      y += 20;
      ctx.font = '12px Nunito, sans-serif';
      ctx.fillStyle = '#A0896E';
      ctx.fillText(`Banco: ${BANCO} · Tarjeta: ${TARJETA}`, W / 2, y);

      y = boxY + 84;

      // Divider
      ctx.strokeStyle = '#E8D8C8';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
      ctx.setLineDash([]);
      y += 20;

      // Footer
      ctx.textAlign = 'center';
      ctx.font = '12px Nunito, sans-serif';
      ctx.fillStyle = '#A0896E';
      ctx.fillText('Gracias por tu compra! 🧶💕', W / 2, y);
      y += 18;
      ctx.font = '11px Nunito, sans-serif';
      ctx.fillStyle = '#C0B0A0';
      ctx.fillText('Mundo A Crochet · Monterrey, Nuevo Leon', W / 2, y);
      y += 16;
      ctx.fillText('WhatsApp: 818 708 7288', W / 2, y);

      // Bottom accent bar
      const grad2 = ctx.createLinearGradient(0, 0, W, 0);
      grad2.addColorStop(0, '#FFB4B4');
      grad2.addColorStop(0.5, '#DCC0EE');
      grad2.addColorStop(1, '#B8E6CC');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, H - 8, W, 8);

      resolve(canvas.toDataURL('image/png'));
    }
  });
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
  const [ticketImg, setTicketImg] = useState('');
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);

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
    // Save items before cart clears
    setSavedItems([...items]);
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: `Pago por ${payMethod === 'transfer' ? 'transferencia Banorte' : payMethod === 'oxxo' ? 'deposito OXXO' : 'Mercado Pago'}` }) });
      if (res.ok) {
        const data = await res.json();
        setOrderNum(data.orderNumber || 0);
        // Generate ticket
        const userName = (session?.user as any)?.name || 'Cliente';
        const ticket = await generateTicket(data.orderNumber || 0, items, total, payMethod, userName);
        setTicketImg(ticket);
        setStep('done');
      }
    } catch {} finally { setOrdering(false); }
  };

  // Auto-open WhatsApp with ticket when done
  useEffect(() => {
    if (step === 'done' && ticketImg && orderNum) {
      // Build WhatsApp message with ticket info
      const itemLines = savedItems.map(i => `• ${i.title} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join('\n');
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      const method = payMethod === 'transfer' ? 'Transferencia Banorte' : 'Deposito OXXO';
      const msg = encodeURIComponent(
        `🧾 *TICKET DE COMPRA #${orderNum}*\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📅 ${dateStr} · 🕐 ${timeStr}\n\n` +
        `📦 *Productos:*\n${itemLines}\n\n` +
        `💰 *Total: $${total.toFixed(2)} MXN*\n` +
        `💳 Metodo: ${method}\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `Adjunto mi comprobante de pago.\n` +
        `Gracias! 🧶💕`
      );
      // Small delay to let user see the ticket first
      setTimeout(() => {
        window.open(`https://wa.me/${WA}?text=${msg}`, '_blank');
      }, 1500);
    }
  }, [step, ticketImg, orderNum]);

  if (!session) return (
    <AnimatedBg theme="warm"><div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <span className="text-5xl block mb-4">🛒</span>
      <h2 className="font-display font-bold text-2xl text-cocoa-700 mb-3">Inicia sesion para ver tu carrito</h2>
      <Link href="/login" className="btn-cute bg-blush-400 text-white px-6 py-2.5 hover:bg-blush-500 inline-block">Iniciar Sesion 💕</Link>
    </div></AnimatedBg>
  );

  if (loading) return <AnimatedBg theme="warm"><div className="flex items-center justify-center min-h-[60vh]"><span className="text-4xl animate-bounce">🛒</span></div></AnimatedBg>;

  // ═══ DONE — Ticket view ═══
  if (step === 'done') {
    const itemLines = savedItems.map(i => `• ${i.title} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join('\n');
    const now = new Date();
    const method = payMethod === 'transfer' ? 'Transferencia Banorte' : 'Deposito OXXO';
    const waMsg = encodeURIComponent(
      `🧾 *TICKET DE COMPRA #${orderNum}*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📅 ${now.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })} · 🕐 ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}\n\n` +
      `📦 *Productos:*\n${itemLines}\n\n` +
      `💰 *Total: $${total.toFixed(2)} MXN*\n` +
      `💳 Metodo: ${method}\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `Adjunto mi comprobante de pago.\n` +
      `Gracias! 🧶💕`
    );

    return (
      <AnimatedBg theme="warm"><div className="max-w-lg mx-auto px-4 py-12 text-center">
        <span className="text-6xl block mb-4">✅</span>
        <h1 className="font-display font-bold text-3xl text-cocoa-700 mb-2">Pedido #{orderNum} Confirmado!</h1>
        <p className="text-cocoa-400 mb-6">Tu ticket se genero automaticamente. Envialo por WhatsApp junto con tu comprobante de pago.</p>

        {/* Ticket image preview */}
        {ticketImg && (
          <div className="mb-6">
            <div className="bg-white rounded-bubble shadow-warm border border-cream-200 p-3 inline-block">
              <img src={ticketImg} alt={`Ticket #${orderNum}`} className="max-w-full rounded-lg" />
            </div>
            <div className="mt-3 flex justify-center gap-3">
              <a href={ticketImg} download={`ticket-${orderNum}.png`}
                className="text-xs font-semibold text-lavender-500 hover:text-lavender-600 flex items-center gap-1">📥 Descargar ticket</a>
            </div>
          </div>
        )}

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

        <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="btn-cute bg-green-500 text-white text-lg px-8 py-3.5 hover:bg-green-600 shadow-lg shadow-green-200 w-full flex items-center justify-center gap-2 mb-4">💬 Enviar ticket por WhatsApp</a>
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
            <div className="flex-1"><p className="font-bold text-sm text-cocoa-700">Transferencia bancaria</p><p className="text-xs text-cocoa-400">{BANCO} · Deposito directo</p></div>
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
              <div className="flex justify-between"><span className="text-cocoa-400">Titular:</span><span className="font-bold text-cocoa-700">{VENDEDORA}</span></div>
              <div className="flex justify-between"><span className="text-cocoa-400">Banco:</span><span className="font-bold text-cocoa-700">{BANCO}</span></div>
              {payMethod === 'transfer' && <div className="flex justify-between"><span className="text-cocoa-400">CLABE:</span><span className="font-bold text-cocoa-700 font-mono text-xs">{CLABE}</span></div>}
              <div className="flex justify-between"><span className="text-cocoa-400">No. Tarjeta:</span><span className="font-bold text-cocoa-700 font-mono text-xs">{TARJETA}</span></div>
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
          {ordering ? '🧶 Generando ticket...' : 'Confirmar Pedido ✨'}
        </button>
        <p className="text-center text-xs text-cocoa-300">Al confirmar, se genera tu ticket y se abre WhatsApp automaticamente.</p>
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
                <div className="flex items-center gap-2 text-xs text-cocoa-400 p-2 bg-cream-50 rounded-xl"><span>🏦</span> Transferencia {BANCO} / OXXO</div>
                <div className="flex items-center gap-2 text-xs text-cocoa-400 p-2 bg-[#00B1EA]/5 rounded-xl border border-[#00B1EA]/10"><span>💳</span> Mercado Pago <span className="text-[8px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">Pronto</span></div>
                <div className="flex items-center gap-2 text-xs text-cocoa-400 p-2 bg-cream-50 rounded-xl"><span>🧾</span> Ticket automatico al confirmar</div>
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
