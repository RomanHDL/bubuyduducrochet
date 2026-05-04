'use client';

import { useChat } from './ChatContext';
import { CHAT_DEMO_MODE } from '@/lib/chat';

/* Boton del navbar que abre el chat. Solo se renderiza si el usuario
   tiene chat habilitado (en demo: solo admins). */
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
      className={`
        relative inline-flex items-center justify-center w-10 h-10 rounded-full
        transition-all duration-200
        ${open
          ? 'bg-gradient-to-br from-blush-500 to-blush-600 text-white shadow-lg shadow-blush-500/30 scale-105'
          : 'bg-white text-blush-500 shadow-sm hover:shadow-md hover:scale-105 border border-blush-200/60 hover:border-blush-300'}
      `}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {/* Badge de no-leidos */}
      {unreadTotal > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
          {unreadTotal > 9 ? '9+' : unreadTotal}
        </span>
      )}
      {/* Sticker DEMO mientras el chat este restringido a admins */}
      {CHAT_DEMO_MODE && (
        <span className="absolute -bottom-1 -left-1 px-1 py-px rounded-md bg-amber-400 text-amber-950 text-[7px] font-bold uppercase tracking-wider border border-amber-600 leading-none shadow-sm rotate-[-8deg]">
          demo
        </span>
      )}
    </button>
  );
}
