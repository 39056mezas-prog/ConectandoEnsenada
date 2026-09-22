import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'plan-free'
  | 'plan-starter'
  | 'plan-pro'
  | 'plan-enterprise'
  | 'verified'
  | 'featured'
  | 'pending'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  'plan-free': 'bg-slate-100 text-slate-600',
  'plan-starter': 'bg-blue-100 text-blue-700',
  'plan-pro': 'bg-violet-100 text-violet-700',
  'plan-enterprise': 'bg-amber-100 text-amber-700',
  verified: 'bg-blue-100 text-blue-700',
  featured: 'bg-amber-100 text-amber-700',
  pending: 'bg-orange-100 text-orange-700',
}

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        'px-2 py-0.5',
        'rounded-[var(--radius-full)]',
        'text-xs font-semibold',
        'whitespace-nowrap',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// ─── Convenience wrappers ────────────────────────────────────────────────────

export function VerifiedBadge({ label = 'Verificado' }: { label?: string }) {
  return (
    <Badge variant="verified">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
      {label}
    </Badge>
  )
}

export function FeaturedBadge({ label = 'Destacado' }: { label?: string }) {
  return (
    <Badge variant="featured">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {label}
    </Badge>
  )
}
