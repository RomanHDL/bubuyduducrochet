'use client';

import { SessionProvider } from 'next-auth/react';
import PageClassMarker from '@/components/PageClassMarker';
import CookieBanner from '@/components/CookieBanner';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PageClassMarker />
      {children}
      <CookieBanner />
      <FloatingWhatsApp />
    </SessionProvider>
  );
}
