import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '../globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://conectandoensenada.org'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('site_name'), template: `%s | ${t('site_name')}` },
    description: t('site_description'),
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      // TODO: Replace apple-touch-icon.png with proper branded 180x180 icon before production launch
      apple: '/apple-touch-icon.png',
    },
    openGraph: { type: 'website', siteName: t('site_name'), locale: locale === 'en' ? 'en_US' : 'es_MX', alternateLocale: locale === 'en' ? ['es_MX'] : ['en_US'], images: [{ url: '/og-default.png', width: 1200, height: 630, alt: t('site_name') }] },
    twitter: { card: 'summary_large_image', images: ['/og-default.png'] },
    alternates: { canonical: SITE_URL, languages: { 'es-MX': SITE_URL, 'en-US': `${SITE_URL}/en`, 'x-default': SITE_URL } },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound()
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
