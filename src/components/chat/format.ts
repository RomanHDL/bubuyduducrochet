/* Helpers de formato para el panel de chat — separar fechas por dia
   estilo WhatsApp, formatear hora, y linkificar URLs. */

export function dayLabel(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Hoy';
  if (sameDay(d, yesterday)) return 'Ayer';
  // Si es de la misma semana muestra el nombre del dia, si no fecha completa
  const diff = (today.getTime() - d.getTime()) / 86400000;
  if (diff < 7 && diff >= 0) {
    return d.toLocaleDateString('es-MX', { weekday: 'long' });
  }
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function timeLabel(d: Date): string {
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function relativeShort(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 60_000) return 'ahora';
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h`;
  if (diffMs < 7 * 86_400_000) return `${Math.floor(diffMs / 86_400_000)}d`;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

/* Convierte texto plano en partes [{type:'text',value}, {type:'link',value,href}]
   para renderizar links sin meter HTML crudo. */
export type Part = { type: 'text' | 'link' | 'newline'; value: string; href?: string };

const URL_RE = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

export function parseLinks(raw: string): Part[] {
  const out: Part[] = [];
  for (const line of raw.split('\n')) {
    if (out.length > 0) out.push({ type: 'newline', value: '' });
    let last = 0;
    line.replace(URL_RE, (match, _g1, _g2, idx: number) => {
      if (idx > last) out.push({ type: 'text', value: line.slice(last, idx) });
      const href = match.startsWith('http') ? match : `https://${match}`;
      out.push({ type: 'link', value: match, href });
      last = idx + match.length;
      return match;
    });
    if (last < line.length) out.push({ type: 'text', value: line.slice(last) });
  }
  return out;
}

export function initialsOf(name?: string, email?: string): string {
  const src = (name || email || '?').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.slice(0, 2) || '?').toUpperCase();
}
