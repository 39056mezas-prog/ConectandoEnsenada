import { Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { formatLongDate } from '@/lib/format'

/** Folio line under the site header: today's date, tagline, directory search. */
export async function Dateline({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'front' })
  return (
    <div className="container-app">
      <div className="fp-folio">
        <div>
          <h1 className="sr-only">ConectandoEnsenada.org — {t('tagline')}</h1>
          <p className="fp-date">{formatLongDate(new Date(), locale)}</p>
          <p className="fp-tagline">{t('tagline')}</p>
        </div>
        <form className="fp-search" action="/negocios" method="get" role="search">
          <Search size={16} strokeWidth={2.25} aria-hidden="true" style={{ alignSelf: 'center', marginLeft: '0.875rem', color: 'var(--color-text-secondary)', flexShrink: 0 }} />
          <input name="q" type="search" aria-label={t('search_label')} placeholder={t('search_placeholder')} />
          <button type="submit">{t('search_btn')}</button>
        </form>
      </div>
      <hr className="fp-double-rule" />
    </div>
  )
}
