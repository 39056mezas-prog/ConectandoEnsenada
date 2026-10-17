import { BrandMark } from '@/components/brand/BrandLogo'

/** Story / ad image. Plain <img> on purpose: source images can come from any host. */
export function Thumb({ src, alt = '', ratio = '16 / 10', style, priority = false }: { src: string | null; alt?: string; ratio?: string; style?: React.CSSProperties; priority?: boolean }) {
  return (
    <div className="fp-thumb" style={{ aspectRatio: ratio, ...style }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer" />
      ) : (
        <div className="fp-thumb-empty" aria-hidden="true"><BrandMark size={44} color="rgb(255 255 255 / 0.28)" /></div>
      )}
    </div>
  )
}
