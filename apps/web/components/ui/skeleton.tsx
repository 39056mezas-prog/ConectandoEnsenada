import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Explicit height — required when content height isn't deterministic */
  height?: string | number
  /** Explicit width */
  width?: string | number
  /** Makes the skeleton circular (for avatars) */
  circle?: boolean
}

/**
 * Skeleton loading placeholder.
 * Renders an animated shimmer block matching the shape of expected content.
 *
 * Usage:
 *   <Skeleton height={20} width={200} />           ← text line
 *   <Skeleton height={48} width={48} circle />     ← avatar
 *   <Skeleton height={200} className="w-full" />   ← card image
 */
export function Skeleton({
  height,
  width,
  circle = false,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{
        height: height !== undefined ? height : undefined,
        width: width !== undefined ? width : undefined,
        borderRadius: circle ? '9999px' : undefined,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  )
}

// ─── Compound skeletons for common patterns ──────────────────────────────────

/** Skeleton for a place card (business, beach, etc.) */
export function PlaceCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      <Skeleton height={180} className="w-full" style={{ borderRadius: 0 }} />
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton height={16} width="70%" />
        <Skeleton height={12} width="50%" />
        <Skeleton height={12} width="40%" />
      </div>
    </div>
  )
}

/** Skeleton for an article/news card */
export function ArticleCardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton height={200} className="w-full" />
      <Skeleton height={14} width="30%" />
      <Skeleton height={20} className="w-full" />
      <Skeleton height={14} className="w-full" />
      <Skeleton height={14} width="80%" />
    </div>
  )
}
