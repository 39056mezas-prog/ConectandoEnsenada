'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { PlaceMedia } from '@/modules/directory/types'

interface PlaceGalleryProps {
  media: PlaceMedia[]
  placeName: string
}

export function PlaceGallery({ media, placeName }: PlaceGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (!media || media.length === 0) return null

  const photos = media.filter((m) => m.media_type === 'photo')
  if (photos.length === 0) return null

  const cover  = photos.find((p) => p.is_cover) ?? photos[0]!
  const others = photos.filter((p) => p.id !== cover.id).slice(0, 4)
  const total  = photos.length

  const open  = (i: number) => setLightbox(i)
  const close = () => setLightbox(null)
  const prev  = () => setLightbox((i) => (i !== null ? (i - 1 + total) % total : null))
  const next  = () => setLightbox((i) => (i !== null ? (i + 1) % total : null))

  return (
    <>
      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: others.length > 0 ? '1fr 1fr' : '1fr',
          gridTemplateRows: '220px',
          gap: '0.25rem',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Cover — spans full height */}
        <div
          style={{
            position: 'relative',
            gridRow: '1 / -1',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          onClick={() => open(photos.indexOf(cover))}
        >
          <Image
            src={cover.url}
            alt={cover.caption_es ?? placeName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            priority
          />
        </div>

        {/* Thumbnails */}
        {others.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${Math.min(others.length, 2)}, 1fr)`,
              gap: '0.25rem',
            }}
          >
            {others.slice(0, 2).map((photo, idx) => {
              const isLast = idx === 1 && total > 3
              return (
                <div
                  key={photo.id}
                  style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                  onClick={() => open(photos.indexOf(photo))}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption_es ?? `${placeName} ${idx + 2}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  {isLast && total > 3 && (
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(11,28,50,0.65)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                      }}
                    >
                      +{total - 3}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galería de fotos"
          style={{
            position: 'fixed', inset: 0, zIndex: 'var(--z-modal)' as never,
            background: 'rgba(4,21,42,0.96)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            aria-label="Cerrar galería"
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(255,255,255,0.12)', border: 'none',
              borderRadius: 'var(--radius-full)', color: '#fff',
              width: '40px', height: '40px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', transition: 'background var(--transition-fast)',
            }}
          >
            ✕
          </button>

          {/* Prev */}
          {total > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              aria-label="Foto anterior"
              style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)', border: 'none',
                borderRadius: 'var(--radius-full)', color: '#fff',
                width: '44px', height: '44px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh', width: '800px', height: '540px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightbox]!.url}
              alt={photos[lightbox]!.caption_es ?? placeName}
              fill
              sizes="90vw"
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Counter */}
          <p
            style={{
              position: 'absolute', bottom: '1.25rem',
              color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem',
              fontFamily: 'var(--font-display)',
            }}
          >
            {lightbox + 1} / {total}
          </p>

          {/* Next */}
          {total > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              aria-label="Foto siguiente"
              style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)', border: 'none',
                borderRadius: 'var(--radius-full)', color: '#fff',
                width: '44px', height: '44px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  )
}
