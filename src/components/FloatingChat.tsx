'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { CHAT_DEMO_MODE, canUseChat } from '@/lib/chat';

/*
 * Chat flotante. En modo DEMO solo lo ven los admins (Roman y Vero).
 * Tiene dos vistas: "Mi chat" (la perspectiva del cliente, que escribe
 * a la vendedora) e "Inbox" (la perspectiva de la vendedora, que ve
 * todas las conversaciones y responde).
 *
 * Cuando esta abierto hace polling cada 8s para traer mensajes
 * nuevos. Cuando cerrado, polling de 30s solo para actualizar el
 * badge de no leidos.
 */

type Message = {
  _id: string;
  senderRole: 'customer' | 'admin';
  senderName?: string;
  senderImage?: string;
  text: string;
  readAt?: string | null;
  createdAt: string;
};

type Conversation = {
  _id: string;
  customer: string;
  customerName?: string;
  customerEmail?: string;
  customerImage?: string;
  unreadByAdmin: number;
  unreadByCustomer: number;
  lastMessageAt?: string;
  lastMessage?: string;
  lastSenderRole?: 'customer' | 'admin';
};

type Tab = 'mine' | 'inbox';

export default function FloatingChat() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const role = (session?.user as any)?.role as string | undefined;
  const canChat = canUseChat(role);
  const isAdmin = role === 'admin';

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('mine');
  const [mineMessages, setMineMessages] = useState<Message[]>([]);
  const [mineConversation, setMineConversation] = useState<Conversation | null>(null);
  const [inboxConversations, setInboxConversations] = useState<Conversation[]>([]);
  const [adminThread, setAdminThread] = useState<{ conversation: Conversation; messages: Message[] } | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide on admin pages — admin tiene su propio panel de chat ahi
  const hideForRoute = pathname?.startsWith('/admin');

  /* ── Cargar "mi" conversacion (vista cliente) ── */
  const loadMine = async () => {
    try {
      const r = await fetch('/api/chat/me', { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      setMineConversation(data.conversation);
      setMineMessages(data.messages || []);
    } catch { /* silent */ }
  };

  /* ── Cargar inbox (vista admin) ── */
  const loadInbox = async () => {
    if (!isAdmin) return;
    try {
      const r = await fetch('/api/chat/conversations', { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      setInboxConversations(data.conversations || []);
    } catch { /* silent */ }
  };

  /* ── Abrir un thread del inbox (admin) ── */
  const openThread = async (id: string) => {
    try {
      const r = await fetch(`/api/chat/conversations/${id}`, { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      setAdminThread(data);
    } catch { /* silent */ }
  };

  /* ── Polling: cuando abierto, refresca a la vista activa ── */
  useEffect(() => {
    if (!canChat) return;
    if (status !== 'authenticated') return;

    const refresh = () => {
      if (open && tab === 'mine') loadMine();
      if (open && tab === 'inbox' && isAdmin) {
        loadInbox();
        if (adminThread) openThread(adminThread.conversation._id);
      }
      if (!open) {
        // Solo refrescar contador de no leidos para el badge
        loadMine();
        if (isAdmin) loadInbox();
      }
    };
    refresh();
    const ms = open ? 8000 : 30000;
    const id = setInterval(() => {
      if (document.hidden) return;
      refresh();
    }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, status, canChat, isAdmin, adminThread?.conversation._id]);

  /* ── Calcular badge de no leidos ── */
  useEffect(() => {
    let total = 0;
    if (mineConversation) total += mineConversation.unreadByCustomer || 0;
    if (isAdmin) {
      for (const c of inboxConversations) total += c.unreadByAdmin || 0;
    }
    setUnreadTotal(total);
  }, [mineConversation, inboxConversations, isAdmin]);

  /* ── Auto-scroll al ultimo mensaje cuando llegan nuevos ── */
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, tab, mineMessages.length, adminThread?.messages.length]);

  /* ── Enviar mensaje ── */
  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      if (tab === 'mine') {
        const r = await fetch('/api/chat/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (r.ok) {
          setDraft('');
          await loadMine();
        }
      } else if (tab === 'inbox' && adminThread) {
        const r = await fetch(`/api/chat/conversations/${adminThread.conversation._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (r.ok) {
          setDraft('');
          await openThread(adminThread.conversation._id);
          await loadInbox();
        }
      }
    } finally {
      setSending(false);
    }
  };

  if (status !== 'authenticated' || !canChat || hideForRoute) return null;

  const myUnread = mineConversation?.unreadByCustomer || 0;
  const inboxUnread = inboxConversations.reduce((acc, c) => acc + (c.unreadByAdmin || 0), 0);

  return (
    <>
      {/* ── Bubble trigger ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir chat"
          className="fixed bottom-5 right-5 md:bottom-6 md:right-24 z-[88] w-14 h-14 md:w-16 md:h-16 rounded-full bg-blush-500 text-white flex items-center justify-center shadow-lg hover:bg-blush-600 hover:scale-105 transition-all"
          style={{ boxShadow: '0 4px 14px rgba(244, 114, 182, 0.45)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-7 md:h-7">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
              {unreadTotal > 9 ? '9+' : unreadTotal}
            </span>
          )}
          {CHAT_DEMO_MODE && (
            <span className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-900 text-[8px] font-bold uppercase tracking-wider border border-amber-600 shadow">
              demo
            </span>
          )}
        </button>
      )}

      {/* ── Panel ── */}
      {open && (
        <div className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-6 sm:right-6 z-[88] w-auto sm:w-96 max-w-full bg-white rounded-2xl shadow-2xl border border-cocoa-200 flex flex-col overflow-hidden" style={{ height: 'min(560px, 80vh)' }}>
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-blush-500 text-white">
            {adminThread && tab === 'inbox' && (
              <button
                onClick={() => setAdminThread(null)}
                className="p-1 -ml-1 hover:bg-white/15 rounded"
                aria-label="Volver al inbox"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">
                {tab === 'mine'
                  ? 'Chatea con la vendedora'
                  : adminThread
                    ? (adminThread.conversation.customerName || adminThread.conversation.customerEmail || 'Cliente')
                    : 'Inbox'}
              </div>
              <div className="text-[11px] opacity-90 truncate">
                {CHAT_DEMO_MODE ? 'Modo demo · solo admins' : 'Te respondemos pronto 💕'}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 -mr-1 hover:bg-white/15 rounded"
              aria-label="Cerrar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          {/* Tabs (solo admin) */}
          {isAdmin && (
            <div className="flex border-b border-cream-200 bg-cream-50">
              <button
                onClick={() => { setTab('mine'); setAdminThread(null); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'mine' ? 'text-blush-600 border-b-2 border-blush-500' : 'text-cocoa-500'}`}
              >
                Mi chat
                {myUnread > 0 && (
                  <span className="ml-1.5 inline-block min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-4">{myUnread}</span>
                )}
              </button>
              <button
                onClick={() => { setTab('inbox'); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'inbox' ? 'text-blush-600 border-b-2 border-blush-500' : 'text-cocoa-500'}`}
              >
                Inbox
                {inboxUnread > 0 && (
                  <span className="ml-1.5 inline-block min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-4">{inboxUnread}</span>
                )}
              </button>
            </div>
          )}

          {/* Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 bg-cream-50 space-y-2">
            {tab === 'mine' && mineMessages.length === 0 && (
              <EmptyState text="Aun no hay mensajes. Escribe para empezar." />
            )}
            {tab === 'mine' && mineMessages.map((m) => (
              <Bubble key={m._id} m={m} viewerRole="customer" />
            ))}

            {tab === 'inbox' && !adminThread && (
              <InboxList
                conversations={inboxConversations}
                onPick={(id) => openThread(id)}
              />
            )}
            {tab === 'inbox' && adminThread && (
              <>
                {adminThread.messages.length === 0 && (
                  <EmptyState text="Conversacion vacia." />
                )}
                {adminThread.messages.map((m) => (
                  <Bubble key={m._id} m={m} viewerRole="admin" />
                ))}
              </>
            )}
          </div>

          {/* Input — solo cuando estamos en una conversacion */}
          {((tab === 'mine') || (tab === 'inbox' && adminThread)) && (
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-end gap-2 p-2 border-t border-cream-200 bg-white"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Escribe un mensaje..."
                rows={1}
                maxLength={2000}
                className="flex-1 resize-none px-3 py-2 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-blush-400 max-h-24"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="px-3 py-2 rounded-xl bg-blush-500 text-white font-semibold text-sm hover:bg-blush-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar"
              >
                Enviar
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

/* ── Subcomponentes ── */

function Bubble({ m, viewerRole }: { m: Message; viewerRole: 'customer' | 'admin' }) {
  const mine = m.senderRole === viewerRole;
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
          mine
            ? 'bg-blush-500 text-white rounded-br-sm'
            : 'bg-white text-cocoa-800 border border-cocoa-100 rounded-bl-sm'
        }`}
      >
        {!mine && m.senderName && (
          <div className="text-[10px] font-bold opacity-80 mb-0.5">{m.senderName}</div>
        )}
        <div className="whitespace-pre-wrap break-words">{m.text}</div>
        <div className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-cocoa-400'} text-right`}>
          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function InboxList({ conversations, onPick }: { conversations: Conversation[]; onPick: (id: string) => void }) {
  if (conversations.length === 0) {
    return <EmptyState text="No hay conversaciones todavia." />;
  }
  return (
    <div className="-mx-1 space-y-1">
      {conversations.map((c) => {
        const unread = c.unreadByAdmin || 0;
        return (
          <button
            key={c._id}
            onClick={() => onPick(c._id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${unread > 0 ? 'bg-white border border-blush-200' : 'bg-white/60 hover:bg-white'}`}
          >
            <div className="w-9 h-9 rounded-full bg-cocoa-100 flex items-center justify-center text-xs font-bold text-cocoa-600 overflow-hidden flex-shrink-0">
              {c.customerImage
                ? <img src={c.customerImage} alt="" className="w-full h-full object-cover" />
                : (c.customerName?.[0] || c.customerEmail?.[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-sm text-cocoa-800 truncate">
                  {c.customerName || c.customerEmail || 'Cliente'}
                </div>
                {unread > 0 && (
                  <span className="ml-auto min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
                )}
              </div>
              <div className="text-xs text-cocoa-500 truncate">
                {c.lastSenderRole === 'admin' && <span className="text-cocoa-400">Tu: </span>}
                {c.lastMessage || 'Sin mensajes'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-full text-center text-cocoa-400 text-sm py-8">
      {text}
    </div>
  );
}
