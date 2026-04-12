'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import AnimatedBg from '@/components/AnimatedBg';

export default function LoginPage() {
  return (
    <AnimatedBg theme="lavender">
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-10 left-10 text-5xl opacity-15 animate-bounce" style={{ animationDuration: '3s' }}>🧸</div>
      <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🧶</div>
      <div className="absolute top-1/3 right-1/4 text-3xl opacity-10 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>💕</div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🧸</span>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Bienvenido</h1>
          <p className="text-cocoa-400 mt-1">Inicia sesion con tu cuenta de Google</p>
        </div>

        <div className="bg-white rounded-bubble shadow-warm p-8 border border-cream-200">
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 border-2 border-cream-200 rounded-bubble text-base font-bold text-cocoa-600 hover:bg-cream-50 hover:border-blush-200 hover:shadow-soft transition-all"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-cocoa-300">Al continuar aceptas nuestras condiciones de uso</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-cocoa-300">
          <span>🔒 Seguro</span><span>•</span><span>🧸 Artesanal</span><span>•</span><span>💕 Con amor</span>
        </div>
      </div>
    </div>
    </AnimatedBg>
  );
}
