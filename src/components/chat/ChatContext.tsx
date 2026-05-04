'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { canUseChat } from '@/lib/chat';

/*
 * Estado global del chat. Lo consume el ChatTrigger (boton del navbar)
 * y el ChatPanel (la ventana del chat). Centraliza:
 *
 *  - open / setOpen: mostrar u ocultar el panel
 *  - badge: contador total de mensajes no leidos
 *  - tab activa para admins (mine | inbox)
 *  - thread del admin abierto (cuando entra a una conversacion)
 *  - poll: hace refresh de mi conversacion + (si es admin) inbox
 *
 * El polling vive aqui para que siempre este corriendo: cuando el
 * panel esta cerrado seguimos refrescando el badge cada 30s; cuando
 * esta abierto, cada 8s.
 */

export type Message = {
  _id: string;
  sender: string;          // ObjectId del User que escribio el mensaje
  senderRole: 'customer' | 'admin';
  senderName?: string;
  senderImage?: string;
  text: string;
  readAt?: string | null;
  createdAt: string;
};

export type Conversation = {
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

export type ChatTab = 'mine' | 'inbox';

interface ChatState {
  enabled: boolean;       // si el usuario actual tiene chat permitido
  isAdmin: boolean;
  currentUserId: string;  // _id del User logueado — fuente de verdad para "esto es mio"
  currentUserName: string;
  currentUserImage: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  unreadTotal: number;
  // Vista cliente (mi conversacion)
  mineConversation: Conversation | null;
  mineMessages: Message[];
  // Vista admin
  tab: ChatTab;
  setTab: (t: ChatTab) => void;
  inboxConversations: Conversation[];
  adminThreadId: string | null;
  adminThreadMessages: Message[];
  adminThreadConversation: Conversation | null;
  openAdminThread: (id: string | null) => Promise<void>;
  // Acciones
  sendAsCustomer: (text: string) => Promise<boolean>;
  sendAsAdmin: (text: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const noop = () => {};
const defaultState: ChatState = {
  enabled: false,
  isAdmin: false,
  currentUserId: '',
  currentUserName: '',
  currentUserImage: '',
  open: false,
  setOpen: noop,
  toggle: noop,
  unreadTotal: 0,
  mineConversation: null,
  mineMessages: [],
  tab: 'mine',
  setTab: noop,
  inboxConversations: [],
  adminThreadId: null,
  adminThreadMessages: [],
  adminThreadConversation: null,
  openAdminThread: async () => {},
  sendAsCustomer: async () => false,
  sendAsAdmin: async () => false,
  refresh: async () => {},
};

const Ctx = createContext<ChatState>(defaultState);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as string | undefined;
  const enabled = status === 'authenticated' && canUseChat(role);
  const isAdmin = role === 'admin';
  const currentUserId = (session?.user as any)?.id as string || '';
  const currentUserName = session?.user?.name || '';
  const currentUserImage = session?.user?.image || '';

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ChatTab>('mine');
  const [mineConversation, setMineConversation] = useState<Conversation | null>(null);
  const [mineMessages, setMineMessages] = useState<Message[]>([]);
  const [inboxConversations, setInboxConversations] = useState<Conversation[]>([]);
  const [adminThreadId, setAdminThreadId] = useState<string | null>(null);
  const [adminThreadMessages, setAdminThreadMessages] = useState<Message[]>([]);
  const [adminThreadConversation, setAdminThreadConversation] = useState<Conversation | null>(null);

  // Refs para evitar stale closures en el interval del polling
  const openRef = useRef(open);
  const tabRef = useRef(tab);
  const adminThreadIdRef = useRef<string | null>(null);
  openRef.current = open;
  tabRef.current = tab;
  adminThreadIdRef.current = adminThreadId;

  const loadMine = useCallback(async () => {
    try {
      const r = await fetch('/api/chat/me', { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      setMineConversation(data.conversation);
      setMineMessages(data.messages || []);
    } catch { /* silent */ }
  }, []);

  const loadInbox = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const r = await fetch('/api/chat/conversations', { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      setInboxConversations(data.conversations || []);
    } catch { /* silent */ }
  }, [isAdmin]);

  const loadAdminThread = useCallback(async (id: string) => {
    try {
      const r = await fetch(`/api/chat/conversations/${id}`, { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      setAdminThreadConversation(data.conversation);
      setAdminThreadMessages(data.messages || []);
    } catch { /* silent */ }
  }, []);

  const openAdminThread = useCallback(async (id: string | null) => {
    setAdminThreadId(id);
    if (id) {
      setAdminThreadMessages([]);
      await loadAdminThread(id);
      await loadInbox(); // refresca el inbox para limpiar el unread
    } else {
      setAdminThreadConversation(null);
      setAdminThreadMessages([]);
    }
  }, [loadAdminThread, loadInbox]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const tasks: Promise<unknown>[] = [loadMine()];
    if (isAdmin) tasks.push(loadInbox());
    const id = adminThreadIdRef.current;
    if (isAdmin && id) tasks.push(loadAdminThread(id));
    await Promise.all(tasks);
  }, [enabled, isAdmin, loadMine, loadInbox, loadAdminThread]);

  // Polling: 8s abierto, 30s cerrado
  useEffect(() => {
    if (!enabled) return;
    refresh();
    const tick = () => {
      if (document.hidden) return;
      refresh();
    };
    const ms = open ? 8000 : 30000;
    const id = setInterval(tick, ms);
    return () => clearInterval(id);
  }, [enabled, open, refresh]);

  const sendAsCustomer = useCallback(async (text: string): Promise<boolean> => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    try {
      const r = await fetch('/api/chat/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!r.ok) return false;
      await loadMine();
      return true;
    } catch {
      return false;
    }
  }, [loadMine]);

  const sendAsAdmin = useCallback(async (text: string): Promise<boolean> => {
    const trimmed = text.trim();
    if (!trimmed || !adminThreadIdRef.current) return false;
    const id = adminThreadIdRef.current;
    try {
      const r = await fetch(`/api/chat/conversations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!r.ok) return false;
      await loadAdminThread(id);
      await loadInbox();
      return true;
    } catch {
      return false;
    }
  }, [loadAdminThread, loadInbox]);

  const unreadTotal = useMemo(() => {
    let t = 0;
    if (mineConversation) t += mineConversation.unreadByCustomer || 0;
    if (isAdmin) for (const c of inboxConversations) t += c.unreadByAdmin || 0;
    return t;
  }, [mineConversation, inboxConversations, isAdmin]);

  const toggle = useCallback(() => setOpen(o => !o), []);

  const value = useMemo<ChatState>(() => ({
    enabled,
    isAdmin,
    currentUserId,
    currentUserName,
    currentUserImage,
    open,
    setOpen,
    toggle,
    unreadTotal,
    mineConversation,
    mineMessages,
    tab,
    setTab,
    inboxConversations,
    adminThreadId,
    adminThreadMessages,
    adminThreadConversation,
    openAdminThread,
    sendAsCustomer,
    sendAsAdmin,
    refresh,
  }), [
    enabled, isAdmin, currentUserId, currentUserName, currentUserImage,
    open, toggle, unreadTotal,
    mineConversation, mineMessages, tab,
    inboxConversations, adminThreadId, adminThreadMessages, adminThreadConversation,
    openAdminThread, sendAsCustomer, sendAsAdmin, refresh,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChat() {
  return useContext(Ctx);
}
