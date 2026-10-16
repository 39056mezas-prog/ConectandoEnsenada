/**
 * Brand marks — the one place the logo is drawn.
 *
 * Mark = the pin-with-anchor from favicon.ico (thin ring, solid tip), redrawn as inline SVG so it stays
 * crisp at any size and takes its colour from CSS (no tiny raster/SVG-in-<img>).
 * Wordmark = real text in Manrope (not outlined in the SVG), so it never shrinks
 * into unreadable pixels like the old 1800px-wide logo.svg did in the header.
 */
import type { CSSProperties } from 'react'

const PIN_RING =
  'M100 0C45 0 0 45 0 100c0 70 100 135 100 135s100-65 100-135C200 45 155 0 100 0ZM100 14a86 86 0 1 0 0 172 86 86 0 0 0 0-172Z'

/** Just the pin + anchor, filled with `color` (defaults to currentColor). */
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
      width={size * (200 / 235)}
      height={size}
      viewBox="0 0 200 235"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <path fill={color} fillRule="evenodd" d={PIN_RING} />
      <g fill={color} transform="translate(100 100) scale(.95) translate(-100 -100)">
        <path fillRule="evenodd" d="M100 41a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 6a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
        <rect x="95" y="63" width="10" height="83" rx="5" />
        <rect x="70" y="78" width="60" height="10" rx="5" />
        <path d="M95 136C72 136 55 128 43 114C34 104 30 92 30 79L42 79C42 102 60 120 95 120Z" />
        <path d="M105 136C128 136 145 128 157 114C166 104 170 92 170 79L158 79C158 102 140 120 105 120Z" />
        <polygon points="30,79 46,72 41,91" />
        <polygon points="170,79 154,72 159,91" />
        <polygon points="92,146 108,146 100,158" />
      </g>
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
