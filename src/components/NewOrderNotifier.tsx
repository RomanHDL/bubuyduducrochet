'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type OrderItem = {
  _id: string;
  orderNumber: number;
  userName: string;
  userEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

const STORAGE_KEY = 'admin:lastSeenOrderNumber';
const POLL_MS = 3000;
const AUTO_DISMISS_MS = 5000;
const RECOVER_LIMIT = 3;

// Generador de "ding" sintético (no requiere archivo de audio)
function playDing() {
  try {
    const AC: typeof AudioContext | undefined = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    setTimeout(() => ctx.close().catch(() => {}), 600);
  } catch { /* ignore */ }
}

export default function NewOrderNotifier() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [queue, setQueue] = useState<OrderItem[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const lastSeenRef = useRef<number>(0);
  const firstLoadRef = useRef<boolean>(true);
  const isAdmin = status === 'authenticated' && (session?.user as any)?.role === 'admin';

  // Estado del permiso
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  }, [isAdmin]);

  const requestPerm = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const p = await Notification.requestPermission();
      setPermission(p);
    } catch { /* ignore */ }
  };

  // Polling
  useEffect(() => {
    if (!isAdmin) return;

    const stored = Number(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : 0) || 0;
    // Si aún no hay baseline, hacemos un "fetch silencioso" inicial que
    // establece la baseline al último orderNumber del DB. Así, en la primerísima
    // vez que el admin abre el sistema, no se llena de pedidos antiguos —
    // pero a partir de la segunda visita, cualquier pedido nuevo que entre
    // mientras la pestaña estuvo cerrada SÍ se muestra.
    lastSeenRef.current = stored;
    const silentBaselineOnFirstTick = stored === 0;

    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch('/api/admin/new-orders?since=' + encodeURIComponent(String(lastSeenRef.current)), { cache: 'no-store' });
        if (!res.ok) return;
        const orders: OrderItem[] = await res.json();
        if (cancelled) return;

        const isFirst = firstLoadRef.current;
        firstLoadRef.current = false;

        if (!Array.isArray(orders) || orders.length === 0) return;

        // Actualizar último número visto
        const maxNum = Math.max(...orders.map(o => o.orderNumber || 0), lastSeenRef.current);
        if (maxNum > lastSeenRef.current) {
          lastSeenRef.current = maxNum;
          try { localStorage.setItem(STORAGE_KEY, String(maxNum)); } catch { /* ignore */ }
        }

        // Solo silenciamos si es la primerísima vez ABSOLUTA (sin baseline previa)
        if (isFirst && silentBaselineOnFirstTick) return;

        // Mostrar toast + notificación browser + sonido (auto-dismiss 5s)
        enqueueWithAutoDismiss(orders);
        playDing();
        orders.forEach(o => {
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              const n = new Notification('🛒 Nuevo pedido #' + o.orderNumber, {
                body: `${o.userName} · $${Number(o.total || 0).toFixed(2)} MXN`,
                tag: 'order-' + o._id,
              });
              n.onclick = () => { window.focus(); router.push('/admin/pedidos'); n.close(); };
            } catch { /* ignore */ }
          }
        });
      } catch { /* silent */ }
    };

    // Arranque inmediato (establece baseline) y luego cada POLL_MS
    tick();
    const interval = setInterval(tick, POLL_MS);

    // Cuando la pestaña regresa a foreground, forzar un tick inmediato.
    // Algunos navegadores pausan los timers cuando la pestaña está en background.
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [isAdmin, router]);

  const dismiss = (id: string) => setQueue(prev => prev.filter(o => o._id !== id));

  // Encola pedidos y programa el auto-dismiss de cada uno a los AUTO_DISMISS_MS
  const enqueueWithAutoDismiss = (orders: OrderItem[]) => {
    if (!orders.length) return;
    setQueue(prev => {
      const map = new Map(prev.map(o => [o._id, o]));
      orders.forEach(o => map.set(o._id, o));
      return Array.from(map.values()).slice(-5);
    });
    orders.forEach(o => {
      setTimeout(() => {
        setQueue(prev => prev.filter(x => x._id !== o._id));
      }, AUTO_DISMISS_MS);
    });
  };

  const testNotification = () => {
    const fake: OrderItem = {
      _id: 'test-' + Date.now(),
      orderNumber: 9999,
      userName: 'Cliente de Prueba',
      userEmail: 'test@example.com',
      total: 450,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };
    enqueueWithAutoDismiss([fake]);
    playDing();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('🛒 Prueba · Nuevo pedido #' + fake.orderNumber, {
          body: `${fake.userName} · $${fake.total.toFixed(2)} MXN`,
          tag: 'test-notif',
        });
      } catch { /* ignore */ }
    }
  };

  // Re-mostrar los últimos N pedidos al instante. Útil cuando el admin
  // sospecha que perdió alguno. NO borra la baseline — solo trae los últimos
  // y los muestra con auto-dismiss, sin afectar la lógica del polling normal.
  const resetBaseline = async () => {
    try {
      const r = await fetch(`/api/admin/new-orders?since=0&limit=${RECOVER_LIMIT}`, { cache: 'no-store' });
      if (!r.ok) return;
      const orders: OrderItem[] = await r.json();
      if (!Array.isArray(orders) || orders.length === 0) return;
      enqueueWithAutoDismiss(orders.slice(0, RECOVER_LIMIT));
      playDing();
    } catch { /* silent */ }
  };

  if (!isAdmin) return null;

  // Banner cuando el admin aún no otorgó permiso de notificaciones del navegador
  const showPermBanner = permission === 'default' || permission === 'denied';

  return (
    <div className="fixed z-[100] bottom-4 right-4 flex flex-col gap-2 max-w-[360px]">
      {showPermBanner && (
        <div className="bg-amber-50 border-2 border-amber-300 shadow-warm rounded-cute p-3">
          <div className="flex items-start gap-2">
            <span className="text-base">🔔</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-700">
                {permission === 'denied' ? 'Notificaciones bloqueadas' : 'Activa notificaciones de pedidos'}
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                {permission === 'denied'
                  ? 'Habilítalas en la configuración del navegador para recibir alertas aunque tengas otra pestaña abierta.'
                  : 'Recibirás un aviso cada vez que un cliente confirme un pedido, incluso con el sitio minimizado.'}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {permission === 'default' && (
                  <button onClick={requestPerm} className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-white hover:bg-amber-600">
                    ✨ Activar notificaciones
                  </button>
                )}
                <button onClick={testNotification} className="text-xs font-bold px-3 py-1 rounded-full bg-white text-amber-700 border border-amber-300 hover:bg-amber-50">
                  🔔 Probar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botones flotantes discretos: probar y recuperar */}
      {!showPermBanner && queue.length === 0 && (
        <div className="self-end flex gap-1">
          <button
            onClick={resetBaseline}
            title="Volver a mostrar los últimos pedidos (útil si crees que te perdiste alguno)"
            className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/80 text-blush-500 border border-blush-200 hover:bg-blush-50 shadow-sm opacity-60 hover:opacity-100"
          >
            ↻ recuperar
          </button>
          <button
            onClick={testNotification}
            title="Probar notificación"
            className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/80 text-cocoa-500 border border-cream-200 hover:bg-cream-50 shadow-sm opacity-60 hover:opacity-100"
          >
            🔔 probar
          </button>
        </div>
      )}

      {queue.map(o => (
        <div key={o._id} className="bg-white border-2 border-blush-300 shadow-warm rounded-cute p-4 animate-in slide-in-from-right-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🛒</span>
                <span className="font-display font-bold text-sm text-cocoa-700">Nuevo pedido #{o.orderNumber}</span>
              </div>
              <p className="text-xs font-semibold text-cocoa-700 truncate">{o.userName}</p>
              <p className="text-[10px] text-cocoa-400 truncate">{o.userEmail}</p>
              <p className="text-sm font-bold text-blush-500 mt-1">${Number(o.total || 0).toFixed(2)} MXN</p>
            </div>
            <button onClick={() => dismiss(o._id)} className="text-cocoa-300 hover:text-cocoa-500 text-sm" aria-label="Cerrar">✕</button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { dismiss(o._id); router.push('/admin/pedidos'); }}
              className="flex-1 btn-cute bg-blush-400 text-white text-[11px] py-1.5 hover:bg-blush-500"
            >
              Ver pedido →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
