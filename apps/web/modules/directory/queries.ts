// ============================================================================
// modules/directory/queries.ts
// All database reads for the directory module.
// Called from Server Components and Server Actions only.
// Note: RPC calls use type assertions because Database types are stubs until
// Supabase CLI generates them (after migrations are run — Step 5).
// ============================================================================

import { createClient } from '@/lib/supabase/server'
import type {
  PlaceSearchResult,
  PlaceDetails,
  CategoryRow,
  DirectoryFilters,
} from './types'

const PLACES_PER_PAGE = 24

// ── getCategories ─────────────────────────────────────────────────────────────
export async function getCategories(module: string): Promise<CategoryRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('id, parent_id, module, name_es, name_en, slug, icon, color, sort_order')
    .eq('module', module)
    .eq('is_active', true)
    .is('parent_id', null)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[getCategories]', error.message)
    return []
  }

  return (data as unknown as CategoryRow[]) ?? []
}

// ── searchPlaces ──────────────────────────────────────────────────────────────
export async function searchPlaces(
  filters: DirectoryFilters = {},
  placeType?: string
): Promise<{ places: PlaceSearchResult[]; total: number }> {
  const supabase = await createClient()
  const page   = Math.max(1, filters.pagina ?? 1)
  const offset = (page - 1) * PLACES_PER_PAGE

  let categoryId: string | undefined
  if (filters.categoria) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categoria)
      .single()
    categoryId = (cat as unknown as { id: string } | null)?.id
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('search_places', {
    p_query:       filters.q       ?? null,
    p_place_type:  placeType       ?? null,
    p_category_id: categoryId      ?? null,
    p_limit:       PLACES_PER_PAGE,
    p_offset:      offset,
  })

  if (error) {
    console.error('[searchPlaces]', error.message)
    return { places: [], total: 0 }
  }

  const results = (data as unknown as PlaceSearchResult[]) ?? []
  return { places: results, total: results.length }
}

// ── getPlaceBySlug ────────────────────────────────────────────────────────────
export async function getPlaceBySlug(slug: string): Promise<PlaceDetails | null> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('get_place_with_details', {
    p_slug: slug,
  })

  if (error) {
    console.error('[getPlaceBySlug]', error.message)
    return null
  }

  return (data as unknown as PlaceDetails) ?? null
}

// ── getActivePlaceSlugs ───────────────────────────────────────────────────────
export async function getActivePlaceSlugs(
  placeType?: string,
  limit = 200
): Promise<string[]> {
  const supabase = await createClient()

  // Use RPC to avoid schema-qualification TypeScript issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('search_places', {
    p_query:       null,
    p_place_type:  placeType ?? null,
    p_category_id: null,
    p_limit:       limit,
    p_offset:      0,
  })

  if (error) {
    console.warn('[getActivePlaceSlugs] falling back to empty:', error.message)
    return []
  }

  return ((data as unknown as PlaceSearchResult[]) ?? []).map((r) => r.slug)
}

// ── getFeaturedPlaces ─────────────────────────────────────────────────────────
export async function getFeaturedPlaces(limit = 6): Promise<PlaceSearchResult[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('search_places', {
    p_query: null, p_place_type: null, p_category_id: null,
    p_limit: limit, p_offset: 0,
  })

  if (error) {
    console.error('[getFeaturedPlaces]', error.message)
    return []
  }

  return (data as unknown as PlaceSearchResult[]) ?? []
}

// ── incrementPlaceView ────────────────────────────────────────────────────────
export async function incrementPlaceView(placeId: string): Promise<void> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.rpc as any)('increment_view_count', {
    p_entity_type: 'place',
    p_entity_id:   placeId,
  })
}
