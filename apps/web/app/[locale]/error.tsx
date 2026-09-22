'use client'

import { useEffect } from 'react'
import Link from 'next/link'

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
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          color: 'var(--color-text-primary)',
        }}
      >
        Algo salió mal
      </h1>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          marginBottom: '2rem',
          maxWidth: '400px',
        }}
      >
        Ocurrió un error inesperado. Por favor intenta de nuevo.
      </p>

      {/* Show digest in dev so developers can trace it in server logs */}
      {process.env.NODE_ENV === 'development' && error.digest && (
        <code
          style={{
            display: 'block',
            fontSize: '0.75rem',
            color: 'var(--color-text-tertiary)',
            marginBottom: '1.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--color-surface-overlay)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          Digest: {error.digest}
        </code>
      )}

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
