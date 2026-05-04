'use client';

import { SessionProvider } from 'next-auth/react';
import PageClassMarker from '@/components/PageClassMarker';
import CookieBanner from '@/components/CookieBanner';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { ChatProvider } from '@/components/chat/ChatContext';
import ChatPanel from '@/components/chat/ChatPanel';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChatProvider>
        <PageClassMarker />
        {children}
        <CookieBanner />
        <ChatPanel />
        <FloatingWhatsApp />
      </ChatProvider>
    </SessionProvider>
  );
}
