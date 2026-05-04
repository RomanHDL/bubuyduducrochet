'use client';

import { useChat } from './ChatContext';
import { CHAT_DEMO_MODE } from '@/lib/chat';

/* Boton del navbar que abre el chat. Solo se renderiza si el usuario
   tiene chat habilitado (en demo: solo admins). Muestra badge de no
   leidos y un sticker "demo" si aplica. */
export default function ChatTrigger() {
  const { enabled, toggle, open, unreadTotal } = useChat();

  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={open ? 'Cerrar chat' : 'Abrir chat'}
      aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
      aria-pressed={open}
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-sm border border-cocoa-200/40 text-cocoa-600 hover:scale-105 hover:shadow-md transition-all"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {unreadTotal > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
          {unreadTotal > 9 ? '9+' : unreadTotal}
        </span>
      )}
      {CHAT_DEMO_MODE && (
        <span className="absolute -bottom-1 -left-1 px-1 py-px rounded bg-amber-300 text-amber-900 text-[7px] font-bold uppercase tracking-wider border border-amber-500 leading-none">
          demo
        </span>
      )}
    </button>
  );
}
