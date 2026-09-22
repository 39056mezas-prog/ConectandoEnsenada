'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import type { CategoryRow } from '@/modules/directory/types'

interface DirectoryFiltersProps {
  categories: CategoryRow[]
  activeCategory?: string
  searchQuery?: string
  showMapToggle?: boolean
  mapVisible?: boolean
  onMapToggle?: () => void
}

export function DirectoryFilters({
  categories,
  activeCategory,
  searchQuery = '',
  showMapToggle = true,
  mapVisible,
  onMapToggle,
}: DirectoryFiltersProps) {
  const router      = useRouter()
  const pathname    = usePathname()
  const params      = useSearchParams()
  const [pending, startTransition] = useTransition()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('pagina') // reset to page 1 on filter change
      startTransition(() => router.push(`${pathname}?${next.toString()}`))
    },
    [params, pathname, router]
  )

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: '60px',  // below the header
        zIndex: 100,
      }}
    >
      <div className="container-app" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>

        {/* ── Search row ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-text-tertiary)" strokeWidth="2.5"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              defaultValue={searchQuery}
              placeholder="Buscar negocios en Ensenada…"
              aria-label="Buscar negocios"
              style={{
                width: '100%',
                paddingLeft: '2.25rem',
                paddingRight: '1rem',
                paddingBlock: '0.5rem',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                background: 'var(--color-surface-raised)',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e)  => (e.target.style.borderColor = 'var(--color-border)')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateParam('q', (e.target as HTMLInputElement).value || null)
                }
              }}
            />
          </div>

          {/* Map / List toggle */}
          {showMapToggle && (
            <button
              onClick={onMapToggle}
              aria-label={mapVisible ? 'Ver lista' : 'Ver mapa'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                background: mapVisible ? 'var(--color-navy-600)' : 'var(--color-surface-raised)',
                color: mapVisible ? '#fff' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
              </svg>
              {mapVisible ? 'Lista' : 'Mapa'}
            </button>
          )}
        </div>

        {/* ── Category pills ──────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '0.375rem',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          aria-label="Filtrar por categoría"
        >
          {/* All pill */}
          <button
            onClick={() => updateParam('categoria', null)}
            disabled={pending}
            style={{
              flexShrink: 0,
              padding: '0.3125rem 0.75rem',
              border: '1.5px solid',
              borderColor: !activeCategory ? 'var(--color-navy-600)' : 'var(--color-border)',
              borderRadius: 'var(--radius-full)',
              background: !activeCategory ? 'var(--color-navy-600)' : 'transparent',
              color: !activeCategory ? '#fff' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            Todos
          </button>

          {categories.map((cat) => {
            const active = activeCategory === cat.slug
            return (
              <button
                key={cat.id}
                onClick={() => updateParam('categoria', active ? null : cat.slug)}
                disabled={pending}
                style={{
                  flexShrink: 0,
                  padding: '0.3125rem 0.75rem',
                  border: '1.5px solid',
                  borderColor: active ? 'var(--color-navy-600)' : 'var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  background: active ? 'var(--color-navy-600)' : 'transparent',
                  color: active ? '#fff' : 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: pending ? 'wait' : 'pointer',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  opacity: pending ? 0.7 : 1,
                }}
              >
                {cat.name_es}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
