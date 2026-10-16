'use client'

import { useState, useEffect, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Building2 } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { PlaceCard }               from '@/components/directory/PlaceCard'
import { DirectoryFilters }        from '@/components/directory/DirectoryFilters'
import { DiscoverMore, NoResults } from '@/components/directory/DiscoverMore'
import { PlaceCardSkeleton }       from '@/components/ui/skeleton'
import type { PlaceSearchResult, CategoryRow } from '@/modules/directory/types'
import { createClient } from '@/lib/supabase/client'

const Map = dynamic(() => import('@/components/map/Map').then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', background: 'var(--color-navy-50)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
      Cargando mapa…
    </div>
  ),
})

const PLACES_PER_PAGE = 24

export default function NegociosPage() {
  const searchParams = useSearchParams()
  const q         = searchParams.get('q')        ?? ''
  const categoria = searchParams.get('categoria') ?? ''
  const pagina    = Number(searchParams.get('pagina') ?? '1')

  const [places,     setPlaces]     = useState<PlaceSearchResult[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading,    setLoading]    = useState(true)
  const [mapVisible, setMapVisible] = useState(false)
  const [, startTransition]         = useTransition()

  // Fetch categories once on mount
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('id,parent_id,module,name_es,name_en,slug,icon,color,sort_order')
      .eq('module', 'businesses')
      .eq('is_active', true)
      .is('parent_id', null)
      .order('sort_order')
      .then(({ data }) => setCategories((data as unknown as CategoryRow[]) ?? []))
  }, [])

  // Fetch places when filters change
  useEffect(() => {
    setLoading(true)

    const run = async () => {
      const supabase = createClient()

      let catId: string | null = null
      if (categoria) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categoria)
          .single()
        catId = (cat as unknown as { id: string } | null)?.id ?? null
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.rpc as any)('search_places', {
        p_query:       q || null,
        p_place_type:  'business',
        p_category_id: catId,
        p_limit:       PLACES_PER_PAGE,
        p_offset:      (pagina - 1) * PLACES_PER_PAGE,
      })

      setPlaces((data as unknown as PlaceSearchResult[]) ?? [])
      setLoading(false)
    }

    startTransition(() => { run().catch(console.error) })
  }, [q, categoria, pagina])

  const markers = places
    .filter((p) => p.latitude && p.longitude)
    .map((p) => ({
      id:   p.id,
      slug: p.slug,
      name: p.name_es,
      lat:  p.latitude!,
      lng:  p.longitude!,
    }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)' }}>
      {/* Page header */}
      <PageHero icon={Building2} title="Negocios en Ensenada" subtitle="Directorio completo de negocios locales" next="var(--color-surface)" />

      {/* Filters */}
      <DirectoryFilters
        categories={categories}
        activeCategory={categoria}
        searchQuery={q}
        showMapToggle
        mapVisible={mapVisible}
        onMapToggle={() => setMapVisible((v) => !v)}
      />

      {/* Main content */}
      <div className="container-app" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mapVisible ? '1fr 420px' : '1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Grid column */}
          <div>
            {!loading && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }}>
                {places.length === 0
                  ? 'Sin resultados'
                  : `${places.length} negocio${places.length !== 1 ? 's' : ''} encontrado${places.length !== 1 ? 's' : ''}`}
                {q ? ` para "${q}"` : ''}
              </p>
            )}

            {loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {Array.from({ length: 9 }).map((_, i) => <PlaceCardSkeleton key={i} />)}
              </div>
            )}

            {!loading && places.length === 0 && q && <NoResults query={q} />}

            {!loading && places.length === 0 && !q && (
              <DiscoverMore
                title="Aún no hay negocios registrados"
                subtitle="Sé el primero en agregar un negocio de Ensenada al directorio."
                contributeLabel="Agregar mi negocio"
                contributeHref="/negocios/nuevo"
              />
            )}

            {!loading && places.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {places.map((place) => <PlaceCard key={place.id} place={place} />)}
              </div>
            )}
          </div>

          {/* Map column */}
          {mapVisible && (
            <div style={{ position: 'sticky', top: '120px' }}>
              <Map
                markers={markers}
                height="calc(100vh - 180px)"
                onMarkerClick={(slug) => { window.location.href = `/negocios/${slug}` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
