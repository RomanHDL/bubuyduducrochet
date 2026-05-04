'use client';

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useChat, type Message, type Conversation } from './ChatContext';
import { CHAT_DEMO_MODE } from '@/lib/chat';
import { dayLabel, timeLabel, relativeShort, parseLinks, initialsOf } from './format';

/*
 * Panel de chat estilo WhatsApp/Messenger. Se abre desde ChatTrigger
 * (boton del navbar). Soporta:
 *
 *  - Vista cliente: mi conversacion con la vendedora.
 *  - Vista admin: tabs "Mi chat" e "Inbox" con lista de conversaciones.
 *  - Burbujas con avatar, agrupadas por persona consecutiva.
 *  - Separadores de dia (Hoy / Ayer / nombre del dia / fecha).
 *  - Links auto-detectados.
 *  - Tildes de leido (uno gris = enviado, dos azules = leido).
 *  - Auto-scroll al ultimo mensaje al abrir y al recibir uno nuevo.
 *  - Textarea que crece hasta 5 lineas.
 *  - Enter envia, Shift+Enter salto de linea.
 *
 * En desktop es un panel flotante abajo a la derecha. En mobile ocupa
 * toda la pantalla.
 */

export default function ChatPanel() {
  const chat = useChat();
  const pathname = usePathname();

  // Ocultar en /admin (los admins tienen su propia gestion ahi)
  const hideOnRoute = pathname?.startsWith('/admin');
  if (!chat.enabled || !chat.open || hideOnRoute) return null;

  return <PanelInner />;
}

function PanelInner() {
  const {
    isAdmin, setOpen,
    tab, setTab,
    mineConversation, mineMessages,
    inboxConversations,
    adminThreadId, adminThreadMessages, adminThreadConversation,
    openAdminThread,
    sendAsCustomer, sendAsAdmin,
  } = useChat();

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Decide que mensajes mostrar en esta vista
  const showingThread = tab === 'mine' || (tab === 'inbox' && adminThreadId);
  const messages = tab === 'mine' ? mineMessages : adminThreadMessages;
  const viewerRole: 'customer' | 'admin' = tab === 'mine' ? 'customer' : 'admin';

  // Auto-scroll al fondo cuando llegan mensajes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, showingThread]);

  // Auto-resize del textarea (hasta 5 lineas)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 130) + 'px';
  }, [draft]);

  const handleSend = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const ok = tab === 'mine' ? await sendAsCustomer(draft) : await sendAsAdmin(draft);
      if (ok) {
        setDraft('');
        // re-focus para escritura continua
        inputRef.current?.focus();
      }
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Backdrop solo en mobile */}
      <div
        className="md:hidden fixed inset-0 bg-black/30 z-[88]"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        className="
          fixed z-[89] bg-white shadow-2xl border border-cocoa-200 flex flex-col overflow-hidden
          inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[400px] md:rounded-2xl
        "
        style={{ height: 'auto', maxHeight: '100dvh' }}
      >
        <Header
          tab={tab}
          isAdmin={isAdmin}
          mineConversation={mineConversation}
          adminThreadConversation={adminThreadConversation}
          adminThreadId={adminThreadId}
          onClose={() => setOpen(false)}
          onBack={() => openAdminThread(null)}
        />

        {isAdmin && (
          <Tabs
            tab={tab}
            onChange={(t) => { setTab(t); if (t === 'mine') openAdminThread(null); }}
            myUnread={mineConversation?.unreadByCustomer || 0}
            inboxUnread={inboxConversations.reduce((acc, c) => acc + (c.unreadByAdmin || 0), 0)}
          />
        )}

        {/* Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 bg-[#f6f1ec]" style={{ minHeight: '300px' }}>
          {/* Inbox del admin */}
          {tab === 'inbox' && !adminThreadId && (
            <InboxList
              conversations={inboxConversations}
              onPick={(id) => openAdminThread(id)}
            />
          )}

          {/* Thread (mine o admin abierto) */}
          {showingThread && (
            <Thread messages={messages} viewerRole={viewerRole} />
          )}
        </div>

        {/* Composer */}
        {showingThread && (
          <Composer
            ref={inputRef}
            draft={draft}
            sending={sending}
            onChange={setDraft}
            onKeyDown={onKeyDown}
            onSend={handleSend}
          />
        )}
      </div>
    </>
  );
}

/* ── Header ── */
function Header({
  tab, isAdmin, mineConversation, adminThreadConversation, adminThreadId,
  onClose, onBack,
}: {
  tab: 'mine' | 'inbox';
  isAdmin: boolean;
  mineConversation: Conversation | null;
  adminThreadConversation: Conversation | null;
  adminThreadId: string | null;
  onClose: () => void;
  onBack: () => void;
}) {
  const inThread = tab === 'inbox' && adminThreadId;
  const title = tab === 'mine'
    ? (isAdmin ? 'Mi chat con la vendedora' : 'Bubu & Dudu')
    : inThread
      ? (adminThreadConversation?.customerName || adminThreadConversation?.customerEmail || 'Cliente')
      : 'Conversaciones';
  const subtitle = tab === 'mine'
    ? (CHAT_DEMO_MODE ? 'Modo demo · solo admins' : 'Hecho con cariño · contestamos pronto 🧶')
    : inThread
      ? adminThreadConversation?.customerEmail
      : `${0} sin leer · ${0} en total`;

  const avatarSrc = inThread
    ? adminThreadConversation?.customerImage
    : tab === 'mine'
      ? '/icons/icon-192.png' // logo de la tienda como avatar de "vendedora"
      : null;
  const avatarName = inThread
    ? (adminThreadConversation?.customerName || adminThreadConversation?.customerEmail)
    : tab === 'mine'
      ? 'Bubu & Dudu'
      : 'Inbox';

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-blush-500 text-white">
      {inThread && (
        <button
          onClick={onBack}
          className="p-1 hover:bg-white/15 rounded-full"
          aria-label="Volver al inbox"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      )}
      <Avatar src={avatarSrc} name={avatarName} size={36} className="border-2 border-white/40" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate">{title}</div>
        <div className="text-[11px] opacity-95 truncate">{subtitle || ' '}</div>
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/15 rounded-full"
        aria-label="Cerrar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ── Tabs (admin) ── */
function Tabs({
  tab, onChange, myUnread, inboxUnread,
}: {
  tab: 'mine' | 'inbox';
  onChange: (t: 'mine' | 'inbox') => void;
  myUnread: number;
  inboxUnread: number;
}) {
  const Tab = ({ id, label, badge }: { id: 'mine' | 'inbox'; label: string; badge: number }) => (
    <button
      onClick={() => onChange(id)}
      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${tab === id ? 'text-blush-600 border-b-2 border-blush-500 bg-white' : 'text-cocoa-500 hover:bg-cream-100'}`}
    >
      {label}
      {badge > 0 && (
        <span className="min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{badge}</span>
      )}
    </button>
  );
  return (
    <div className="flex border-b border-cream-200 bg-cream-50">
      <Tab id="mine" label="Mi chat" badge={myUnread} />
      <Tab id="inbox" label="Inbox" badge={inboxUnread} />
    </div>
  );
}

/* ── Lista de conversaciones (admin) ── */
function InboxList({
  conversations, onPick,
}: {
  conversations: Conversation[];
  onPick: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return <Empty text="No hay conversaciones todavia." />;
  }
  return (
    <div className="-mx-1 space-y-1">
      {conversations.map((c) => {
        const unread = c.unreadByAdmin || 0;
        const time = c.lastMessageAt ? relativeShort(new Date(c.lastMessageAt)) : '';
        return (
          <button
            key={c._id}
            onClick={() => onPick(c._id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${unread > 0 ? 'bg-white border border-blush-200 shadow-sm' : 'bg-white/60 hover:bg-white'}`}
          >
            <Avatar src={c.customerImage} name={c.customerName || c.customerEmail} size={42} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-sm text-cocoa-800 truncate flex-1">
                  {c.customerName || c.customerEmail || 'Cliente'}
                </div>
                {time && <span className="text-[10px] text-cocoa-400 flex-shrink-0">{time}</span>}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`text-xs truncate flex-1 ${unread > 0 ? 'text-cocoa-700 font-semibold' : 'text-cocoa-500'}`}>
                  {c.lastSenderRole === 'admin' && <span className="text-cocoa-400">Tu: </span>}
                  {c.lastMessage || 'Sin mensajes'}
                </div>
                {unread > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-blush-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Lista de mensajes con separadores de dia y burbujas agrupadas ── */
function Thread({ messages, viewerRole }: { messages: Message[]; viewerRole: 'customer' | 'admin' }) {
  if (messages.length === 0) {
    return <Empty text="Aun no hay mensajes. Escribe para empezar." subtle />;
  }

  // Agrupar mensajes por dia y por sender consecutivo
  const items = useMemo(() => {
    const out: Array<
      { kind: 'day'; key: string; label: string }
      | { kind: 'msg'; key: string; m: Message; isMine: boolean; firstOfGroup: boolean; lastOfGroup: boolean }
    > = [];
    let prevDay: string | null = null;
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const date = new Date(m.createdAt);
      const dayKey = date.toDateString();
      if (dayKey !== prevDay) {
        out.push({ kind: 'day', key: `day-${dayKey}`, label: dayLabel(date) });
        prevDay = dayKey;
      }
      const prev = i > 0 ? messages[i - 1] : null;
      const next = i < messages.length - 1 ? messages[i + 1] : null;
      const sameAsPrev = prev && prev.senderRole === m.senderRole && new Date(prev.createdAt).toDateString() === dayKey;
      const sameAsNext = next && next.senderRole === m.senderRole && new Date(next.createdAt).toDateString() === dayKey;
      const firstOfGroup = !sameAsPrev;
      const lastOfGroup = !sameAsNext;
      out.push({
        kind: 'msg',
        key: m._id,
        m,
        isMine: m.senderRole === viewerRole,
        firstOfGroup,
        lastOfGroup,
      });
    }
    return out;
  }, [messages, viewerRole]);

  return (
    <div className="space-y-1">
      {items.map((item) => {
        if (item.kind === 'day') {
          return (
            <div key={item.key} className="flex justify-center my-3">
              <span className="text-[11px] text-cocoa-500 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-cream-200 capitalize">
                {item.label}
              </span>
            </div>
          );
        }
        return <Bubble key={item.key} m={item.m} isMine={item.isMine} firstOfGroup={item.firstOfGroup} lastOfGroup={item.lastOfGroup} />;
      })}
    </div>
  );
}

/* ── Burbuja de mensaje ── */
function Bubble({
  m, isMine, firstOfGroup, lastOfGroup,
}: {
  m: Message;
  isMine: boolean;
  firstOfGroup: boolean;
  lastOfGroup: boolean;
}) {
  const parts = parseLinks(m.text);
  const time = timeLabel(new Date(m.createdAt));
  const corner = isMine
    ? (lastOfGroup ? 'rounded-br-sm' : '')
    : (lastOfGroup ? 'rounded-bl-sm' : '');
  const groupSpacing = firstOfGroup ? 'mt-2' : 'mt-0.5';

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${groupSpacing} items-end gap-1.5`}>
      {!isMine && (
        <div className={`w-7 ${lastOfGroup ? '' : 'invisible'}`}>
          <Avatar src={m.senderImage} name={m.senderName} size={28} />
        </div>
      )}
      <div className="max-w-[78%]">
        {firstOfGroup && !isMine && m.senderName && (
          <div className="text-[10px] font-bold text-cocoa-500 ml-2 mb-0.5">{m.senderName}</div>
        )}
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-snug ${corner} ${isMine
            ? 'bg-blush-500 text-white shadow-sm'
            : 'bg-white text-cocoa-800 border border-cream-200 shadow-sm'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {parts.map((p, i) => {
              if (p.type === 'link') {
                return (
                  <a
                    key={i}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline ${isMine ? 'text-white' : 'text-blush-600'}`}
                  >
                    {p.value}
                  </a>
                );
              }
              if (p.type === 'newline') return <br key={i} />;
              return <span key={i}>{p.value}</span>;
            })}
          </div>
          <div className={`flex items-center gap-1 justify-end mt-0.5 text-[10px] ${isMine ? 'text-white/80' : 'text-cocoa-400'}`}>
            <span>{time}</span>
            {isMine && (
              <ReadTicks read={!!m.readAt} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tildes de leido (single = sent, double = read) ── */
function ReadTicks({ read }: { read: boolean }) {
  return (
    <span className="inline-flex items-center" aria-label={read ? 'Leido' : 'Enviado'}>
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
        <path d="M0 5.5 L3 8.5 L8 1.5" stroke={read ? '#7DD3FC' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5.5 L8 8.5 L13 1.5" stroke={read ? '#7DD3FC' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* ── Composer (input) ── */
type ComposerProps = {
  draft: string;
  sending: boolean;
  onChange: (s: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
};
const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  { draft, sending, onChange, onKeyDown, onSend },
  ref
) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSend(); }}
      className="flex items-end gap-2 px-3 py-2 border-t border-cream-200 bg-white"
    >
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Escribe un mensaje..."
        rows={1}
        maxLength={2000}
        className="flex-1 resize-none px-3 py-2 rounded-2xl border border-cocoa-200 text-sm focus:outline-none focus:border-blush-400 bg-cream-50 leading-snug"
        style={{ maxHeight: 130 }}
      />
      <button
        type="submit"
        disabled={sending || !draft.trim()}
        aria-label="Enviar"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-blush-500 text-white hover:bg-blush-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" />
        </svg>
      </button>
    </form>
  );
});

/* ── Avatar circular con fallback a iniciales ── */
function Avatar({
  src, name, size = 36, className = '',
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const initials = initialsOf(name || undefined);
  const dim = { width: size, height: size };
  const radius = size / 2;
  if (!src || errored) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-blush-300 to-lavender-300 text-white flex items-center justify-center font-bold flex-shrink-0 ${className}`}
        style={{ ...dim, fontSize: Math.max(10, radius * 0.7) }}
        aria-hidden="true"
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={`rounded-full object-cover flex-shrink-0 ${className}`}
      style={dim}
    />
  );
}

/* ── Empty state ── */
function Empty({ text, subtle }: { text: string; subtle?: boolean }) {
  return (
    <div className={`flex items-center justify-center text-center text-sm py-12 ${subtle ? 'text-cocoa-400' : 'text-cocoa-500'}`}>
      {text}
    </div>
  );
}
