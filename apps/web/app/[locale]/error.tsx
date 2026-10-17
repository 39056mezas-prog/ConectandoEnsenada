'use client'

import { useEffect } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error Boundary for the [locale] segment.
 * Must be a Client Component (uses useEffect and event handlers).
 *
 * In production, errors are sent to Sentry (Step 4 config).
 * Digest is a unique ID that correlates browser errors with server logs.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // TODO (Step 4): wire to Sentry
    // Sentry.captureException(error)
    console.error('[ErrorBoundary]', error)
  }, [error])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span aria-hidden="true" style={{ width: 64, height: 64, marginBottom: '1.25rem', borderRadius: 'var(--radius-xl)', display: 'grid', placeItems: 'center', background: 'linear-gradient(145deg, #fef3c7, #fde68a)', color: '#92400e', boxShadow: 'var(--shadow-2)' }}>
        <TriangleAlert size={30} strokeWidth={1.9} />
      </span>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
        Algo salió mal
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', maxWidth: '400px' }}>
        Ocurrió un error inesperado. Por favor intenta de nuevo.
      </p>

      {/* Technical details: harmless, and lets the site owner send an exact error instead of "it broke". */}
      <details style={{ marginBottom: '1.5rem', maxWidth: '560px', width: '100%', textAlign: 'left' }}>
        <summary style={{ cursor: 'pointer', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
          Detalles técnicos
        </summary>
        <pre style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'var(--color-surface-overlay)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}>
{error.message || '(sin mensaje)'}{error.digest ? `\nDigest: ${error.digest}` : ''}
        </pre>
      </details>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '0.625rem 1.5rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9375rem',
          }}
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          style={{
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.625rem 1.5rem',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.9375rem',
          }}
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  )
}
