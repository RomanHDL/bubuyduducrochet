// ═══ Ticket generator — shared between admin & checkout ═══

const LOGO = 'https://i.pinimg.com/originals/f7/97/e0/f797e0d435f74e1b41a49ba08f908d25.png';
const VENDEDORA = 'Veronica Guadalupe Perez Arreguin';
const BANCO = 'Banorte';
const CLABE = '072580013584894468';
const TARJETA = '4189 1432 3542 4218';
const WA_DISPLAY = '818 708 7288';

interface TicketItem {
  title: string;
  price: number;
  quantity: number;
}

export function generateTicket(
  orderNum: number,
  items: TicketItem[],
  total: number,
  payMethod: string,
  userName: string,
): Promise<string> {
  return new Promise((resolve) => {
    const W = 600;
    const lineH = 28;
    const itemCount = items.length;
    const H = 500 + itemCount * lineH * 2 + 40;

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
      const logoSize = 80;
      ctx.drawImage(logo, (W - logoSize) / 2, y, logoSize, logoSize);
      y += logoSize + 12;
      drawContent();
    };
    logo.onerror = () => {
      ctx.font = 'bold 24px Nunito, sans-serif';
      ctx.fillStyle = '#8B6543';
      ctx.textAlign = 'center';
      ctx.fillText('🧶 Mundo A Crochet', W / 2, y + 30);
      y += 50;
      drawContent();
    };
    logo.src = LOGO;

    function drawContent() {
      // Slogan only (logo already has store name)
      ctx.font = '13px Nunito, sans-serif';
      ctx.fillStyle = '#A0896E';
      ctx.textAlign = 'center';
      ctx.fillText('Hecho a mano con amor desde Monterrey 💕', W / 2, y);
      y += 24;

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
        const title = item.title.length > 28 ? item.title.substring(0, 28) + '...' : item.title;
        ctx.textAlign = 'left';
        ctx.font = '14px Nunito, sans-serif';
        ctx.fillStyle = '#4A3320';
        ctx.fillText(`🧸 ${title}`, 40, y);
        y += 22;

        ctx.font = '12px Nunito, sans-serif';
        ctx.fillStyle = '#A0896E';
        ctx.textAlign = 'left';
        ctx.fillText(`   $${item.price.toFixed(2)} c/u`, 52, y);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#4A3320';
        ctx.font = 'bold 14px Nunito, sans-serif';
        ctx.fillText(`x${item.quantity}`, W / 2 + 60, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#4A3320';
        ctx.fillText(`$${(item.price * item.quantity).toFixed(2)}`, W - 40, y);
        y += lineH;
      });

      y += 4;

      // Divider before total
      ctx.strokeStyle = '#D8C8B8';
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
      y += 22;

      // Total — same column as subtotal (right-aligned at W-40), same color #4A3320, slightly bigger
      ctx.textAlign = 'right';
      ctx.font = 'bold 18px Nunito, sans-serif';
      ctx.fillStyle = '#4A3320';
      ctx.fillText(`TOTAL:  $${total.toFixed(2)} MXN`, W - 40, y);
      y += 30;

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
      ctx.fillText(VENDEDORA, W / 2, y);
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
      ctx.fillText(`WhatsApp: ${WA_DISPLAY}`, W / 2, y);

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

export function buildTicketWhatsAppMsg(
  orderNum: number,
  items: TicketItem[],
  total: number,
  payMethod: string,
): string {
  const itemLines = items.map(i => `• ${i.title} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join('\n');
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const method = payMethod === 'transfer' ? 'Transferencia Banorte' : 'Deposito OXXO';
  return encodeURIComponent(
    `🧾 *TICKET DE COMPRA #${orderNum}*\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `📅 ${dateStr} · 🕐 ${timeStr}\n\n` +
    `📦 *Productos:*\n${itemLines}\n\n` +
    `💰 *Total: $${total.toFixed(2)} MXN*\n` +
    `💳 Metodo: ${method}\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `Gracias por tu compra! 🧶💕\n` +
    `Mundo A Crochet`
  );
}
