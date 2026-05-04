'use client';

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useChat, type Message, type Conversation } from './ChatContext';
import { CHAT_DEMO_MODE } from '@/lib/chat';
import { dayLabel, timeLabel, relativeShort, parseLinks, initialsOf } from './format';

/*
 * Panel de chat estilo WhatsApp/Messenger.
 *
 * Identidad SOLIDA:
 *   - "isMine" se decide por m.sender === currentUserId (no por rol).
 *     Asi cuando dos admins chatean entre ellos no hay confusion: cada
 *     uno ve sus mensajes a la derecha y los del otro a la izquierda.
 *   - Identity strip arriba muestra "Conectada como Roman" para que
 *     siempre tengas contexto visual de quien estas siendo.
 *
 * UX:
 *   - Burbujas con avatar y agrupadas por emisor consecutivo.
 *   - Separadores de dia (Hoy / Ayer / dia / fecha).
 *   - Tildes de leido tipo WhatsApp.
 *   - Auto-scroll y textarea que crece hasta 5 lineas.
 *   - Enter envia, Shift+Enter salto.
 */

export default function ChatPanel() {
  const chat = useChat();
  const pathname = usePathname();

  const hideOnRoute = pathname?.startsWith('/admin');
  if (!chat.enabled || !chat.open || hideOnRoute) return null;

  return <PanelInner />;
}

function PanelInner() {
  const {
    isAdmin, setOpen,
    currentUserId, currentUserName, currentUserImage,
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

  const showingThread = tab === 'mine' || (tab === 'inbox' && adminThreadId);
  const messages = tab === 'mine' ? mineMessages : adminThreadMessages;

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, showingThread]);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 130) + 'px';
  }, [draft]);

  // Focus al abrir un thread
  useEffect(() => {
    if (showingThread) inputRef.current?.focus();
  }, [showingThread, tab, adminThreadId]);

  const handleSend = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const ok = tab === 'mine' ? await sendAsCustomer(draft) : await sendAsAdmin(draft);
      if (ok) {
        setDraft('');
        inputRef.current?.focus();
      } else {
        alert('No se pudo enviar el mensaje. Intenta de nuevo.');
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
      <div
        className="md:hidden fixed inset-0 bg-black/40 z-[88]"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        className="
          fixed z-[89] bg-white shadow-2xl border border-cocoa-200 flex flex-col overflow-hidden
          inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:rounded-2xl
        "
        style={{ maxHeight: '100dvh' }}
      >
        <Header
          tab={tab}
          isAdmin={isAdmin}
          adminThreadConversation={adminThreadConversation}
          adminThreadId={adminThreadId}
          onClose={() => setOpen(false)}
          onBack={() => openAdminThread(null)}
        />

        {/* Identity strip — siempre visible para que sepas quien eres */}
        <IdentityStrip
          name={currentUserName}
          image={currentUserImage}
          isAdmin={isAdmin}
          tab={tab}
          inThread={!!(tab === 'inbox' && adminThreadId)}
        />

        {isAdmin && (
          <Tabs
            tab={tab}
            onChange={(t) => { setTab(t); if (t === 'mine') openAdminThread(null); }}
            myUnread={mineConversation?.unreadByCustomer || 0}
            inboxUnread={inboxConversations.reduce((acc, c) => acc + (c.unreadByAdmin || 0), 0)}
            inboxTotal={inboxConversations.length}
          />
        )}

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
            <Thread messages={messages} currentUserId={currentUserId} />
          )}
        </div>

        {showingThread && (
          <Composer
            ref={inputRef}
            draft={draft}
            sending={sending}
            placeholder={
              tab === 'mine'
                ? 'Escribele a la vendedora...'
                : `Responde a ${adminThreadConversation?.customerName || 'cliente'}...`
            }
            onChange={setDraft}
            onKeyDown={onKeyDown}
            onSend={handleSend}
          />
        )}
      </div>
    </>
  );
}

/* ── Header con gradient ── */
function Header({
  tab, isAdmin, adminThreadConversation, adminThreadId,
  onClose, onBack,
}: {
  tab: 'mine' | 'inbox';
  isAdmin: boolean;
  adminThreadConversation: Conversation | null;
  adminThreadId: string | null;
  onClose: () => void;
  onBack: () => void;
}) {
  const inThread = tab === 'inbox' && adminThreadId;
  const title = tab === 'mine'
    ? 'Bubu & Dudu'
    : inThread
      ? (adminThreadConversation?.customerName || adminThreadConversation?.customerEmail || 'Cliente')
      : 'Conversaciones';
  const subtitle = tab === 'mine'
    ? 'La vendedora · responde pronto 🧶'
    : inThread
      ? adminThreadConversation?.customerEmail
      : 'Todas las conversaciones de tus clientes';

  const avatarSrc = inThread
    ? adminThreadConversation?.customerImage
    : null;
  const avatarName = inThread
    ? (adminThreadConversation?.customerName || adminThreadConversation?.customerEmail)
    : tab === 'mine'
      ? 'Bubu Dudu'
      : 'Inbox';

  return (
    <div className="relative px-3 py-3 text-white overflow-hidden">
      {/* Fondo con gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blush-500 via-blush-500 to-lavender-400" />
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
        backgroundSize: '14px 14px',
      }} />
      <div className="relative flex items-center gap-2.5">
        {inThread && (
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/15 active:bg-white/25 rounded-full transition-colors"
            aria-label="Volver al inbox"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}
        <Avatar src={avatarSrc} name={avatarName} size={40} className="border-2 border-white/50 shadow-md" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[15px] truncate flex items-center gap-1.5">
            {title}
            {tab === 'mine' && <VerifiedDot />}
          </div>
          <div className="text-[11px] opacity-95 truncate">{subtitle || ' '}</div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/15 active:bg-white/25 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function VerifiedDot() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/95 flex-shrink-0" aria-label="Verificado">
      <path d="M12 2l2.5 2.5L18 4l1 3.5L22 9l-1 3.5L22 16l-3 1-1 3.5-3.5-.5L12 22l-2.5-1.5L6 21l-1-3.5L2 16l1-3.5L2 9l3-1 1-3.5L9.5 5z" />
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ── Strip de identidad: "Estás conectada como Roman" ── */
function IdentityStrip({
  name, image, isAdmin, tab, inThread,
}: {
  name: string;
  image: string;
  isAdmin: boolean;
  tab: 'mine' | 'inbox';
  inThread: boolean;
}) {
  const role = (() => {
    if (tab === 'mine') return 'Cliente';
    if (inThread) return 'Vendedora';
    return isAdmin ? 'Admin' : 'Cliente';
  })();
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-cream-50 border-b border-cream-200 text-[11px]">
      <Avatar src={image} name={name} size={20} />
      <div className="flex-1 min-w-0 truncate">
        <span className="text-cocoa-500">Conectada como </span>
        <strong className="text-cocoa-700">{name || 'tu cuenta'}</strong>
      </div>
      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
        role === 'Vendedora'
          ? 'bg-blush-100 text-blush-600 border-blush-200'
          : role === 'Admin'
            ? 'bg-amber-100 text-amber-700 border-amber-200'
            : 'bg-lavender-100 text-lavender-600 border-lavender-200'
      }`}>
        {role}
      </span>
    </div>
  );
}

/* ── Tabs ── */
function Tabs({
  tab, onChange, myUnread, inboxUnread, inboxTotal,
}: {
  tab: 'mine' | 'inbox';
  onChange: (t: 'mine' | 'inbox') => void;
  myUnread: number;
  inboxUnread: number;
  inboxTotal: number;
}) {
  const Tab = ({ id, label, sublabel, badge }: { id: 'mine' | 'inbox'; label: string; sublabel: string; badge: number }) => (
    <button
      onClick={() => onChange(id)}
      className={`flex-1 py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 ${
        tab === id
          ? 'text-blush-600 border-b-2 border-blush-500 bg-white font-bold'
          : 'text-cocoa-500 hover:bg-cream-100 font-semibold'
      }`}
    >
      <div className="flex flex-col leading-tight">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="text-[9px] font-normal opacity-80">{sublabel}</span>
      </div>
      {badge > 0 && (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{badge > 99 ? '99+' : badge}</span>
      )}
    </button>
  );
  return (
    <div className="flex border-b border-cream-200 bg-cream-50">
      <Tab id="mine" label="Mi chat" sublabel="como cliente" badge={myUnread} />
      <Tab id="inbox" label="Inbox" sublabel={inboxTotal === 1 ? '1 cliente' : `${inboxTotal} clientes`} badge={inboxUnread} />
    </div>
  );
}

/* ── Inbox list ── */
function InboxList({
  conversations, onPick,
}: {
  conversations: Conversation[];
  onPick: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <Empty
        title="Inbox vacio"
        text={CHAT_DEMO_MODE
          ? 'Aun nadie te ha escrito. Ve a "Mi chat" como cliente para iniciar una conversacion de prueba.'
          : 'Cuando un cliente escriba, aparecera aqui.'}
      />
    );
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
            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
              unread > 0
                ? 'bg-white border border-blush-200 shadow-sm hover:bg-blush-50'
                : 'bg-white/70 hover:bg-white border border-transparent'
            }`}
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

/* ── Thread con separadores de dia y burbujas agrupadas ── */
function Thread({ messages, currentUserId }: { messages: Message[]; currentUserId: string }) {
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
      // Identidad por sender._id, no por rol — robusta cuando dos admins chatean.
      const isMine = !!currentUserId && String(m.sender) === String(currentUserId);
      const sameAsPrev = prev && String(prev.sender) === String(m.sender) && new Date(prev.createdAt).toDateString() === dayKey;
      const sameAsNext = next && String(next.sender) === String(m.sender) && new Date(next.createdAt).toDateString() === dayKey;
      out.push({
        kind: 'msg',
        key: m._id,
        m,
        isMine,
        firstOfGroup: !sameAsPrev,
        lastOfGroup: !sameAsNext,
      });
    }
    return out;
  }, [messages, currentUserId]);

  if (messages.length === 0) {
    return <Empty title="Aun no hay mensajes" text="Escribe el primero para comenzar la conversacion." subtle />;
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        if (item.kind === 'day') {
          return (
            <div key={item.key} className="flex justify-center my-3">
              <span className="text-[11px] text-cocoa-500 bg-white/85 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-cream-200 capitalize">
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

/* ── Burbuja ── */
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
    ? (lastOfGroup ? 'rounded-br-md' : '')
    : (lastOfGroup ? 'rounded-bl-md' : '');
  const groupSpacing = firstOfGroup ? 'mt-2.5' : 'mt-0.5';

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
          className={`px-3.5 py-2 rounded-2xl text-sm leading-snug shadow-sm ${corner} ${isMine
            ? 'bg-gradient-to-br from-blush-500 to-blush-600 text-white'
            : 'bg-white text-cocoa-800 border border-cream-200'
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
                    className={`underline ${isMine ? 'text-white font-medium' : 'text-blush-600 font-medium'}`}
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
            {isMine && <ReadTicks read={!!m.readAt} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Read ticks ── */
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

/* ── Composer ── */
type ComposerProps = {
  draft: string;
  sending: boolean;
  placeholder: string;
  onChange: (s: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
};
const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  { draft, sending, placeholder, onChange, onKeyDown, onSend },
  ref
) {
  const remaining = 2000 - draft.length;
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSend(); }}
      className="flex items-end gap-2 px-3 py-2.5 border-t border-cream-200 bg-white"
    >
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        maxLength={2000}
        className="flex-1 resize-none px-3.5 py-2 rounded-2xl border border-cocoa-200 text-sm focus:outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 bg-cream-50 leading-snug transition-colors"
        style={{ maxHeight: 130 }}
      />
      <button
        type="submit"
        disabled={sending || !draft.trim()}
        aria-label="Enviar"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blush-500 to-blush-600 text-white shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 transition-all flex-shrink-0"
      >
        {sending ? (
          <svg width="18" height="18" viewBox="0 0 24 24" className="animate-spin" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeOpacity="0.3" />
            <path d="M12 2 a 10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" />
          </svg>
        )}
      </button>
      {draft.length > 1700 && (
        <span className={`absolute bottom-1 right-16 text-[10px] ${remaining < 100 ? 'text-red-500' : 'text-cocoa-400'}`}>
          {remaining}
        </span>
      )}
    </form>
  );
});

/* ── Avatar ── */
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
  if (!src || errored) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-blush-300 via-blush-400 to-lavender-400 text-white flex items-center justify-center font-bold flex-shrink-0 select-none ${className}`}
        style={{ ...dim, fontSize: Math.max(10, size * 0.36) }}
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

/* ── Empty ── */
function Empty({ title, text, subtle }: { title?: string; text: string; subtle?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${subtle ? 'text-cocoa-400' : 'text-cocoa-500'}`}>
      <div className="w-14 h-14 rounded-full bg-blush-100 flex items-center justify-center mb-3 shadow-inner">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-blush-400" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      {title && <div className="font-bold text-sm text-cocoa-700 mb-1">{title}</div>}
      <div className="text-xs leading-relaxed max-w-xs">{text}</div>
    </div>
  );
}
