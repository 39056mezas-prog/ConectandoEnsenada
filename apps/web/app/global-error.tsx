'use client'

/**
 * Last-resort error page: catches failures in the root layout itself (the [locale] error
 * boundary can't, because it lives inside that layout). Must render its own <html>/<body>.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f7f9fc', color: '#0b1f36' }}>
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Algo salió mal</h1>
          <p style={{ color: '#3d5470', marginBottom: '1.5rem' }}>Ocurrió un error inesperado. Por favor intenta de nuevo.</p>
          <details style={{ marginBottom: '1.5rem', maxWidth: 560, textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', textAlign: 'center', fontSize: 13, color: '#56708f' }}>Detalles técnicos</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#edf1f7', padding: 12, borderRadius: 8 }}>
              {error.message || '(sin mensaje)'}{error.digest ? `\nDigest: ${error.digest}` : ''}
            </pre>
          </details>
          <button onClick={reset} style={{ background: '#0b3c6f', color: '#fff', border: 0, borderRadius: 999, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>
            Intentar de nuevo
          </button>
        </main>
      </body>
    </html>
  )
}
