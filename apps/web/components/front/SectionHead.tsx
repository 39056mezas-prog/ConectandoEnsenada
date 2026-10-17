import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export function SectionHead({ title, href, linkLabel, id }: { title: string; href?: string; linkLabel?: string; id?: string }) {
  return (
    <div className="fp-sechead">
      <h2 id={id}>{title}</h2>
      {href && linkLabel && (
        <Link href={href}>{linkLabel} <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" /></Link>
      )}
    </div>
  )
}
