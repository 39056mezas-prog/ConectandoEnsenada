import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'errors' })
  return { title: t('not_found_title') }
}

export default function NotFound() {
  const t = useTranslations('errors')
  const tDiscover = useTranslations('discover_more')

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
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌊</div>
      <h1
        style={{
          fontSize: '1.875rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        {t('not_found_title')}
      </h1>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          marginBottom: '2rem',
          maxWidth: '400px',
        }}
      >
        {t('not_found_description')}
      </p>

      {/* Discover More fallback — "Never a Dead End" pattern */}
      <div
        style={{
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          maxWidth: '480px',
          width: '100%',
        }}
      >
        <p
          style={{
            fontWeight: 600,
            marginBottom: '1rem',
            color: 'var(--color-text-primary)',
          }}
        >
          {tDiscover('title')}
        </p>
        {/* PLACEHOLDER: DiscoverMore component will replace this in Sprint 4 */}
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: 'var(--color-primary)',
            color: 'white',
            padding: '0.625rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          ← Inicio
        </Link>
      </div>
    </main>
  )
}
