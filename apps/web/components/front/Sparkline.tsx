import type { FxPoint } from '@/lib/live/fx'

/** Tiny dependency-free line chart. Decorative: the numbers are stated in text next to it. */
export function Sparkline({ points, height = 48 }: { points: FxPoint[]; height?: number }) {
  if (points.length < 2) return null
  const W = 300, pad = 4
  const vals = points.map(p => p.rate)
  const min = Math.min(...vals), max = Math.max(...vals)
  const span = max - min || 1
  const x = (i: number) => pad + (i * (W - pad * 2)) / (points.length - 1)
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2)
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.rate).toFixed(1)}`).join(' ')
  const lastX = x(points.length - 1), lastY = y(vals[vals.length - 1]!)
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block' }}>
      <path d={`${d} L${lastX.toFixed(1)} ${height} L${pad} ${height} Z`} fill="var(--color-cyan-400)" opacity="0.14" />
      <path d={d} fill="none" stroke="var(--color-cyan-700)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lastX} cy={lastY} r="3.5" fill="var(--color-navy-600)" />
    </svg>
  )
}
