'use client';

import { SessionProvider } from 'next-auth/react';
import PageClassMarker from '@/components/PageClassMarker';
import CookieBanner from '@/components/CookieBanner';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import FloatingChat from '@/components/FloatingChat';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PageClassMarker />
      {children}
      <CookieBanner />
      <FloatingChat />
      <FloatingWhatsApp />
    </SessionProvider>
  );
}
