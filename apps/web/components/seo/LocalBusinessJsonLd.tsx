// ============================================================================
// components/seo/LocalBusinessJsonLd.tsx
// Injects Schema.org JSON-LD into the <head> of place detail pages.
// Google uses this for rich snippets and Google Maps integration.
// ============================================================================

import type { PlaceDetails } from '@/modules/directory/types'

interface LocalBusinessJsonLdProps {
  place: PlaceDetails
  url: string
}

export function LocalBusinessJsonLd({ place, url }: LocalBusinessJsonLdProps) {
  const p = place.place
  const hours = place.hours
  const media = place.media
  const cover = media?.find((m) => m.is_cover) ?? media?.[0]

  const openingHours = hours
    ?.filter((h) => !h.is_closed && h.opens_at && h.closes_at)
    .map((h) => {
      const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
      const day = days[h.day_of_week]
      // Format: "Mo 09:00-18:00"
      return `${day} ${h.opens_at?.slice(0, 5)}-${h.closes_at?.slice(0, 5)}`
    })

  const schemaType = place.category?.name_es?.toLowerCase().includes('restaurant')
    ? 'Restaurant'
    : 'LocalBusiness'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: p.name_es,
    description: p.short_desc_es ?? p.description_es ?? undefined,
    url,
    ...(cover && { image: cover.url }),
    ...(p.phone && { telephone: p.phone }),
    ...(p.email && { email: p.email }),
    ...(p.website && { sameAs: [p.website] }),
    address: p.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: p.address,
          addressLocality: p.city,
          addressRegion: p.state,
          addressCountry: p.country,
          ...(p.zip_code && { postalCode: p.zip_code }),
        }
      : undefined,
    ...(p.latitude && p.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: p.latitude,
        longitude: p.longitude,
      },
    }),
    ...(openingHours && openingHours.length > 0 && { openingHours }),
    ...(p.avg_rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: p.avg_rating.toFixed(1),
        reviewCount: p.review_count,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    currenciesAccepted: 'MXN',
    areaServed: {
      '@type': 'City',
      name: 'Ensenada',
      containedInPlace: {
        '@type': 'State',
        name: 'Baja California',
        containedInPlace: { '@type': 'Country', name: 'Mexico' },
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// Breadcrumb JSON-LD — used on detail pages
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
