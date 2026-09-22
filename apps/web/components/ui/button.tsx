import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Style maps
// ─────────────────────────────────────────────────────────────────────────────
const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-primary)] text-white',
    'hover:bg-[var(--color-primary-hover)]',
    'active:scale-[0.98]',
    'shadow-sm',
  ].join(' '),

  secondary: [
    'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]',
    'border border-[var(--color-border)]',
    'hover:bg-[var(--color-surface-overlay)]',
    'active:scale-[0.98]',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--color-text-secondary)]',
    'hover:bg-[var(--color-surface-raised)]',
    'hover:text-[var(--color-text-primary)]',
  ].join(' '),

  danger: [
    'bg-[var(--color-error)] text-white',
    'hover:opacity-90',
    'active:scale-[0.98]',
  ].join(' '),

  outline: [
    'bg-transparent text-[var(--color-primary)]',
    'border border-[var(--color-primary)]',
    'hover:bg-[var(--color-brand-50)]',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled ?? loading

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        // Base
        'inline-flex items-center justify-center',
        'rounded-[var(--radius-full)]',
        'font-semibold',
        'transition-all duration-[var(--transition-fast)]',
        'cursor-pointer select-none',
        'focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2',
        // Disabled
        'disabled:opacity-50 disabled:pointer-events-none',
        // Variant
        variantClasses[variant],
        // Size
        sizeClasses[size],
        // Full width
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="32"
            strokeDashoffset="12"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
