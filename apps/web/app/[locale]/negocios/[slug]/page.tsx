// ============================================================================
// app/[locale]/negocios/[slug]/page.tsx
// Business detail page — ISR, JSON-LD SEO, full place profile.
// ============================================================================

import { notFound }          from 'next/navigation'
import Link                   from 'next/link'
import type { Metadata }     from 'next'
import { PlaceProfile }      from '@/components/directory/PlaceProfile'
import { DiscoverMore }      from '@/components/directory/DiscoverMore'
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from '@/components/seo/LocalBusinessJsonLd'
import { getPlaceBySlug, incrementPlaceView } from '@/modules/directory/queries'

// ISR: revalidate every 5 minutes
export const revalidate = 300

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const place = await getPlaceBySlug(slug)

  if (!place) return { title: 'Negocio no encontrado' }

  const p    = place.place
  const name = locale === 'en' && p.name_en ? p.name_en : p.name_es
  const desc = p.seo_description ?? p.short_desc_es ?? p.description_es?.slice(0, 160)
  const cover = place.media?.find((m) => m.is_cover) ?? place.media?.[0]

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://conectandoensenada.org'

  return {
    title:       p.seo_title ?? name,
    description: desc ?? undefined,
    openGraph: {
      title:       p.seo_title ?? name,
      description: desc ?? undefined,
      type:        'website',
      url:         `${siteUrl}/negocios/${slug}`,
      images: cover ? [{ url: cover.url, width: 1200, height: 630, alt: name }] : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/negocios/${slug}`,
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function PlaceDetailPage({ params }: Props) {
  const { slug, locale } = await params
  const place = await getPlaceBySlug(slug)

  if (!place) notFound()

  // Fire-and-forget view count increment (non-blocking)
  incrementPlaceView(place.place.id).catch(() => {})

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://conectandoensenada.org'
  const pageUrl = `${siteUrl}/negocios/${slug}`

  return (
    <>
      {/* ── JSON-LD ────────────────────────────────────────────────────── */}
      <LocalBusinessJsonLd place={place} url={pageUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Inicio',   url: siteUrl },
          { name: 'Negocios', url: `${siteUrl}/negocios` },
          { name: place.place.name_es, url: pageUrl },
        ]}
      />

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--color-surface-raised)', minHeight: '100vh' }}>
        <div className="container-app" style={{ padding: '2rem 1.5rem 4rem' }}>
          <PlaceProfile place={place} locale={locale} />

          {/* Reviews placeholder (Sprint 4) */}
          <section style={{ marginTop: '3rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-navy-600)',
                marginBottom: '1rem',
              }}
            >
              Reseñas
            </h2>
            <div
              style={{
                padding: '2rem',
                background: 'var(--color-surface)',
                border: '1.5px dashed var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                textAlign: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: '0.9375rem',
              }}
            >
              <p style={{ marginBottom: '0.5rem' }}>⭐ Las reseñas llegan en Sprint 4.</p>
              <p style={{ fontSize: '0.8125rem' }}>
                ¿Ya visitaste este lugar?{' '}
                <Link href="/registro" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                  Crea una cuenta
                </Link>{' '}
                para dejar tu opinión.
              </p>
            </div>
          </section>
        </div>

        {/* Discover more */}
        <div style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <DiscoverMore
            title="Explorar más en Ensenada"
            subtitle="Descubre otros lugares, eventos y noticias de la ciudad."
            contributeLabel="Agregar un lugar"
          />
        </div>
      </div>
    </>
  )
}
