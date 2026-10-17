/**
 * Brand marks — the one place the logo is drawn.
 *
 * Mark = the pin-with-anchor, traced from the owner's original logo PNG (see mark-path.ts) and drawn
 * as inline SVG so it stays crisp at any size and takes its colour from CSS.
 * Wordmark = real text in Manrope (not outlined in the SVG), so it never shrinks
 * into unreadable pixels like the old 1800px-wide logo.svg did in the header.
 */
import type { CSSProperties } from 'react'
import { MARK_PATH, MARK_VIEWBOX_H, MARK_VIEWBOX_W } from './mark-path'

/** Just the pin + anchor, filled with `color` (defaults to currentColor). `size` = height in px. */
export function BrandMark({
  size = 34,
  color = 'currentColor',
  style,
}: {
  size?: number
  color?: string
  style?: CSSProperties
}) {
  return (
    <svg
      width={(size * MARK_VIEWBOX_W) / MARK_VIEWBOX_H}
      height={size}
      viewBox={`0 0 ${MARK_VIEWBOX_W} ${MARK_VIEWBOX_H}`}
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <path fill={color} fillRule="evenodd" d={MARK_PATH} />
    </svg>
  )
}

type Props = {
  /** light = white on navy (header, footer, hero). dark = navy on white. */
  tone?: 'light' | 'dark'
  /** Height of the pin mark in px. The wordmark scales with it. */
  size?: number
  wordmark?: boolean
  className?: string
}

export function BrandLogo({ tone = 'light', size = 34, wordmark = true, className }: Props) {
  const ink = tone === 'light' ? '#ffffff' : 'var(--color-navy-600)'
  const accent = tone === 'light' ? 'var(--color-cyan-300)' : 'var(--color-cyan-600)'
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.3, lineHeight: 1 }}>
      <BrandMark
        size={size}
        color={ink}
        style={tone === 'light' ? { filter: 'drop-shadow(0 2px 6px rgba(2,11,24,.35))' } : undefined}
      />
      {wordmark && (
        <span style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.56, letterSpacing: '-0.02em', color: ink, whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 600 }}>conecta</span>
          <span style={{ fontWeight: 800, color: accent }}>ensenada</span>
          <span style={{ fontWeight: 500, opacity: 0.7 }}>.org</span>
        </span>
      )}
    </span>
  )
}
