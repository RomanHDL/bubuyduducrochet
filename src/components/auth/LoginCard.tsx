'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import BenefitsBadges from './BenefitsBadges';
import ProductPreviewMini, { type PreviewProduct } from './ProductPreviewMini';

// Card de login — Client Component que vive sobre un fondo con
// gradient animado. Glassmorphism + sombra colorida + botón Google
// con gradient + hover scale.

type Intent = 'buy' | 'order' | undefined;

type Props = {
  callbackUrl: string;
  intent?: Intent;
  product?: PreviewProduct | null;
};

export default function LoginCard({ callbackUrl, intent, product }: Props) {
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = () => {
    setSigningIn(true);
    signIn('google', { callbackUrl });
  };

  const title =
    intent === 'buy'
      ? 'Estás a un paso de tu compra'
      : intent === 'order'
        ? 'Estás a un paso de tu encargo'
        : 'Bienvenida a Mundo a Crochet';

  const subtitle =
    intent === 'buy'
      ? 'Inicia sesión con Google y vamos directo al pago.'
      : intent === 'order'
        ? 'Inicia sesión con Google para agregar al carrito.'
        : 'Inicia sesión con tu cuenta de Google para continuar.';

  return (
    <div className="min-h-[85vh] relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Fondo con gradient animado */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blush-300 via-lavender-300 to-peach-300 bg-[length:200%_200%] animate-gradient"
        aria-hidden
      />
      {/* Overlay translucido para subir contraste del texto */}
      <div
        className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"
        aria-hidden
      />

      {/* Blobs decorativos */}
      <div
        className="absolute -top-20 -left-20 w-72 h-72 bg-blush-400/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '6s' }}
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-lavender-400/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '8s', animationDelay: '1s' }}
        aria-hidden
      />
      <div
        className="absolute top-1/3 right-1/4 w-48 h-48 bg-peach-300/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '7s', animationDelay: '0.5s' }}
        aria-hidden
      />

      {/* Emojis flotantes — guiño al lenguaje visual del sitio */}
      <div
        className="absolute top-16 left-12 text-6xl opacity-20 animate-bounce"
        style={{ animationDuration: '4s' }}
        aria-hidden
      >
        🧶
      </div>
      <div
        className="absolute bottom-24 right-16 text-5xl opacity-20 animate-bounce"
        style={{ animationDuration: '5s', animationDelay: '1s' }}
        aria-hidden
      >
        🧸
      </div>
      <div
        className="absolute top-1/2 left-1/4 text-4xl opacity-15 animate-bounce"
        style={{ animationDuration: '4.5s', animationDelay: '0.8s' }}
        aria-hidden
      >
        💕
      </div>

      {/* Card central */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/30 backdrop-blur-xl rounded-bubble border border-white/50 shadow-2xl shadow-blush-400/30 p-7 sm:p-8">
          {/* Logo / heading */}
          <div className="text-center mb-6">
            <span
              className="inline-block text-5xl mb-2 drop-shadow-lg"
              aria-hidden
            >
              🧸
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-cocoa-700 leading-tight">
              {title}
            </h1>
            <p className="text-sm text-cocoa-500 mt-2 px-2">{subtitle}</p>
          </div>

          {/* Product preview si lo hay */}
          {product && (
            <div className="mb-5">
              <ProductPreviewMini product={product} intent={intent} />
            </div>
          )}

          {/* Botón Google */}
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-bubble font-bold text-white text-base bg-gradient-to-r from-blush-400 to-lavender-400 hover:from-blush-500 hover:to-lavender-500 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg shadow-lavender-300/50 disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100"
          >
            <span className="bg-white rounded-full w-7 h-7 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </span>
            {signingIn ? 'Conectando…' : 'Continuar con Google'}
          </button>

          {/* Promesa de marca debajo del boton */}
          <p className="text-[11px] text-cocoa-500 text-center mt-4 px-2">
            Hecho con amor en México · Tu pedido en buenas manos 💕
          </p>

          {/* Separador */}
          <div className="my-5 flex items-center gap-3" aria-hidden>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cocoa-300/40 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-cocoa-400">
              Por qué comprar con nosotras
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cocoa-300/40 to-transparent" />
          </div>

          {/* Beneficios de marca */}
          <BenefitsBadges />
        </div>

        {/* Footer mini */}
        <p className="text-center text-[11px] text-cocoa-600/80 mt-5 px-4 font-medium">
          Al continuar aceptas nuestras condiciones de uso.
          <br />
          🧶 Hecho con amor en México · mundoacrochet.store
        </p>
      </div>
    </div>
  );
}
