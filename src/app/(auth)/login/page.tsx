'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedBg from '@/components/AnimatedBg';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Email o contrasena incorrectos');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <AnimatedBg theme="lavender">
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-cream-50 via-blush-50 to-lavender-50 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-10 left-10 text-5xl opacity-15 animate-bounce" style={{ animationDuration: '3s' }}>🧸</div>
      <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🧶</div>
      <div className="absolute top-1/3 right-1/4 text-3xl opacity-10 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>💕</div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🧸</span>
          <h1 className="font-display font-bold text-3xl text-cocoa-700">Bienvenido de vuelta</h1>
          <p className="text-cocoa-400 mt-1">Inicia sesion en tu cuenta</p>
        </div>

        <div className="bg-white rounded-bubble shadow-warm p-8 border border-cream-200">
          {/* Google sign in */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-cream-200 rounded-bubble text-sm font-semibold text-cocoa-600 hover:bg-cream-50 hover:border-blush-200 hover:shadow-soft transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cream-200"></div></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-4 text-cocoa-300 font-medium">o con tu email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-blush-50 border border-blush-200 rounded-2xl px-4 py-3 text-sm text-blush-500 font-medium flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-cocoa-600 mb-1.5">Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">📧</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-cute pl-10" placeholder="tu@email.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cocoa-600 mb-1.5">Contrasena</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">🔒</span>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-cute pl-10 pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-cocoa-400 hover:text-blush-400 transition-colors">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-cute bg-blush-400 text-white py-3.5 text-base hover:bg-blush-500 disabled:opacity-50 shadow-glow">
              {loading ? (
                <span className="flex items-center justify-center gap-2"><span className="animate-spin">🧶</span> Entrando...</span>
              ) : 'Iniciar Sesion 💕'}
            </button>
          </form>

          <p className="text-center text-sm text-cocoa-400 mt-6">
            No tienes cuenta?{' '}
            <Link href="/registro" className="text-blush-400 font-bold hover:text-blush-500 hover:underline">Registrate gratis</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-cocoa-300">
          <span>🔒 Seguro</span><span>•</span><span>🧸 Artesanal</span><span>•</span><span>💕 Con amor</span>
        </div>
      </div>
    </div>
    </AnimatedBg>
  );
}
