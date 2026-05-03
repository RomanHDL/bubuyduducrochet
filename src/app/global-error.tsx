'use client';

// Fallback de último recurso: cuando el error.tsx normal NO puede renderizarse
// (ej. crash en el root layout). Reemplaza el HTML completo, así que repite
// el <html> y <body> mínimos.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-MX">
      <body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#FFFDF7', color: '#4A3320', margin: 0, padding: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>😿</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#4A3320' }}>
            Error crítico
          </h1>
          <p style={{ color: '#8B6543', marginBottom: 24, lineHeight: 1.6 }}>
            Algo se rompió. Recarga la página o escríbenos por WhatsApp si persiste.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ padding: '10px 24px', backgroundColor: '#FF8FA3', color: 'white', border: 'none', borderRadius: 9999, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            Reintentar
          </button>
          {error.digest && (
            <p style={{ marginTop: 24, fontSize: 10, color: '#8B6543', fontFamily: 'monospace' }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
