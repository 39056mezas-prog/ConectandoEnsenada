'use client'
import { useState, useEffect, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { PlaceCard }               from './PlaceCard'
import { DirectoryFilters }        from './DirectoryFilters'
import { DiscoverMore, NoResults } from './DiscoverMore'
import { PlaceCardSkeleton }       from '@/components/ui/skeleton'
import { createClient }            from '@/lib/supabase/client'
import type { PlaceSearchResult, CategoryRow } from '@/modules/directory/types'

const Map = dynamic(() => import('@/components/map/Map').then(m => m.Map), {
  ssr: false,
  loading: () => <div style={{ height: '100%', background: 'var(--color-navy-50)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>Cargando mapa…</div>,
})

export interface DirectoryListingConfig {
  placeType: string
  categoryModule: string
  emoji: string
  titleEs: string
  subtitleEs: string
  emptyTitle: string
  emptySubtitle: string
  contributeHref: string
  contributeLabel: string
}

export function DirectoryListing({ config }: { config: DirectoryListingConfig }) {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const categoria = searchParams.get('categoria') ?? ''
  const pagina = Number(searchParams.get('pagina') ?? '1')
  const [places, setPlaces]     = useState<PlaceSearchResult[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [mapVisible, setMapVisible] = useState(false)
  const [, startTransition]     = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('categories').select('id,parent_id,module,name_es,name_en,slug,icon,color,sort_order').eq('module', config.categoryModule).eq('is_active', true).is('parent_id', null).order('sort_order')
      .then(({ data }) => setCategories((data as unknown as CategoryRow[]) ?? []))
  }, [config.categoryModule])

  useEffect(() => {
    setLoading(true)
    const run = async () => {
      const supabase = createClient()
      let catId: string | null = null
      if (categoria) {
        const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoria).single()
        catId = (cat as unknown as { id: string } | null)?.id ?? null
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.rpc as any)('search_places', { p_query: q || null, p_place_type: config.placeType, p_category_id: catId, p_limit: 24, p_offset: (pagina - 1) * 24 })
      setPlaces((data as unknown as PlaceSearchResult[]) ?? [])
      setLoading(false)
    }
    startTransition(() => { run().catch(console.error) })
  }, [q, categoria, pagina, config.placeType])

  const markers = places.filter(p => p.latitude && p.longitude).map(p => ({ id: p.id, slug: p.slug, name: p.name_es, lat: p.latitude!, lng: p.longitude! }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--color-navy-700), var(--color-navy-600))', padding: '1.75rem 1.5rem' }}>
        <div className="container-app">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>{config.emoji} {config.titleEs}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9375rem' }}>{config.subtitleEs}</p>
        </div>
      </div>
      <DirectoryFilters categories={categories} activeCategory={categoria} searchQuery={q} showMapToggle mapVisible={mapVisible} onMapToggle={() => setMapVisible(v => !v)} />
      <div className="container-app" style={{ padding: '1.5rem 1.5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mapVisible ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            {!loading && <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }}>{places.length === 0 ? 'Sin resultados' : `${places.length} resultado${places.length !== 1 ? 's' : ''}`}{q ? ` para "${q}"` : ''}</p>}
            {loading && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>{Array.from({ length: 9 }).map((_, i) => <PlaceCardSkeleton key={i} />)}</div>}
            {!loading && places.length === 0 && q && <NoResults query={q} />}
            {!loading && places.length === 0 && !q && <DiscoverMore title={config.emptyTitle} subtitle={config.emptySubtitle} contributeHref={config.contributeHref} contributeLabel={config.contributeLabel} />}
            {!loading && places.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>{places.map(place => <PlaceCard key={place.id} place={place} />)}</div>}
          </div>
          {mapVisible && <div style={{ position: 'sticky', top: '120px' }}><Map markers={markers} height="calc(100vh - 180px)" onMarkerClick={slug => { window.location.href = `/negocios/${slug}` }} /></div>}
        </div>
      </div>
    </div>
  )
}
