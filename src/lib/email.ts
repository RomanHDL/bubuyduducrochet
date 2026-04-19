import { Resend } from 'resend';

// Destinatarios de las notificaciones de pedidos.
// Editar aquí si se añaden/quitan admins.
export const ADMIN_NOTIFY_EMAILS = [
  'romanherrera548@gmail.com',
  'veritoguadalupita@gmail.com',
];

// Remitente. Si aún no hay dominio verificado en Resend, dejar el sandbox 'onboarding@resend.dev'.
// Cuando verifiquen un dominio en Resend (ej. bubuyduducrochet.com), cambiar por:
//   `Bubu & Dudu Crochet <pedidos@bubuyduducrochet.com>`
const FROM = process.env.RESEND_FROM || 'Bubu & Dudu <onboarding@resend.dev>';

let _client: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null; // sin key, no-op (no rompe el flujo de pedidos)
  if (!_client) _client = new Resend(key);
  return _client;
}

type OrderLike = {
  orderNumber: number;
  userName?: string;
  userEmail?: string;
  total: number;
  items?: { title: string; price: number; quantity: number }[];
  shippingAddress?: string;
  notes?: string;
  createdAt?: Date | string;
};

function money(n: number) {
  return `$${Number(n || 0).toFixed(2)} MXN`;
}

function itemsTable(items: OrderLike['items'] = []) {
  if (items.length === 0) return '';
  const rows = items.map(it => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(it.title)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${it.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${money(it.price)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${money(it.price * it.quantity)}</td>
    </tr>
  `).join('');
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
      <thead>
        <tr style="background:#f3e8ff;color:#6b5a4a;">
          <th style="padding:10px 12px;text-align:left;">Producto</th>
          <th style="padding:10px 12px;text-align:center;">Cant.</th>
          <th style="padding:10px 12px;text-align:right;">Precio</th>
          <th style="padding:10px 12px;text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

/**
 * Envía un email a todos los admins con los detalles del pedido.
 * No-op silencioso si no hay RESEND_API_KEY (no rompe el flujo de checkout).
 */
export async function sendOrderNotificationEmail(order: OrderLike): Promise<boolean> {
  const c = client();
  if (!c) {
    console.warn('[email] RESEND_API_KEY no configurada — email de pedido no enviado');
    return false;
  }

  const subject = `🛒 Nuevo pedido #${order.orderNumber} · ${money(order.total)}`;

  const html = `
    <div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fffdf7;color:#4a3320;">
      <div style="background:linear-gradient(135deg,#ffe8e8,#ede5ff);padding:20px 24px;border-radius:20px;margin-bottom:20px;text-align:center;">
        <h1 style="margin:0;font-size:22px;color:#6b5a4a;">🧶 Bubu &amp; Dudu Crochet</h1>
        <p style="margin:6px 0 0;color:#8b6543;font-size:13px;">Tienes un pedido nuevo</p>
      </div>

      <div style="background:#fff;border:1px solid #f1e9e0;border-radius:16px;padding:20px 24px;">
        <h2 style="margin:0 0 12px;font-size:18px;color:#6b5a4a;">Pedido #${order.orderNumber}</h2>
        <p style="margin:4px 0;font-size:13px;">
          <strong>Cliente:</strong> ${escapeHtml(order.userName || '—')}<br/>
          <strong>Email:</strong> ${escapeHtml(order.userEmail || '—')}<br/>
          <strong>Fecha:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString('es-MX') : new Date().toLocaleString('es-MX')}<br/>
          ${order.shippingAddress ? `<strong>Dirección:</strong> ${escapeHtml(order.shippingAddress)}<br/>` : ''}
          ${order.notes ? `<strong>Método de pago / notas:</strong> ${escapeHtml(order.notes)}<br/>` : ''}
        </p>

        ${itemsTable(order.items)}

        <div style="margin-top:20px;padding-top:14px;border-top:2px dashed #f1e9e0;display:flex;justify-content:space-between;align-items:baseline;">
          <span style="font-size:14px;color:#8b6543;">Total del pedido</span>
          <span style="font-size:22px;font-weight:bold;color:#d97d90;">${money(order.total)}</span>
        </div>

        <div style="margin-top:20px;text-align:center;">
          <a href="https://bubuyduducrochet-jb4z.vercel.app/admin/pedidos"
             style="display:inline-block;background:#d97d90;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold;font-size:14px;">
            Ver pedido en el panel →
          </a>
        </div>
      </div>

      <p style="text-align:center;font-size:11px;color:#a8998a;margin-top:20px;">
        Esta es una notificación automática enviada a los administradores. No respondas a este correo.
      </p>
    </div>
  `;

  try {
    const res = await c.emails.send({
      from: FROM,
      to: ADMIN_NOTIFY_EMAILS,
      subject,
      html,
    });
    if ((res as any)?.error) {
      console.error('[email] Resend error:', (res as any).error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] Fallo al enviar:', err);
    return false;
  }
}
