'use client';

import { useState } from 'react';

// Form compacto del newsletter para el footer. Validación cliente +
// llamada a /api/newsletter. Muestra estado: idle / sending / success / error.
export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data?.error || 'No se pudo procesar tu suscripción');
        return;
      }
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg('Error de conexión');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-mint-100/20 border border-mint-200/40 rounded-xl p-3">
        <p className="text-xs font-semibold text-mint-200">✨ ¡Listo!</p>
        <p className="text-[11px] text-cream-300 mt-0.5">Te avisaremos de novedades y promos.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <p className="text-[11px] text-cream-300">Recibe novedades y promos exclusivas.</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
          placeholder="tucorreo@email.com"
          required
          maxLength={254}
          aria-label="Correo electrónico para newsletter"
          className="flex-1 min-w-0 px-3 py-2 rounded-full bg-white/10 border border-cream-300/30 text-cream-100 placeholder-cream-400/60 text-xs focus:outline-none focus:border-blush-300 focus:bg-white/15 transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-blush-400 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-blush-500 transition-colors disabled:opacity-60"
        >
          {status === 'sending' ? '...' : 'Suscribir'}
        </button>
      </div>
      {status === 'error' && <p className="text-[10px] text-red-300">{errorMsg}</p>}
    </form>
  );
}
