'use client';

import { SessionProvider } from 'next-auth/react';
import PageClassMarker from '@/components/PageClassMarker';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PageClassMarker />
      {children}
    </SessionProvider>
  );
}
