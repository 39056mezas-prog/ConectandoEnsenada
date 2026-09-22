/**
 * Root Layout
 *
 * This is intentionally minimal. It exists only because Next.js requires
 * a root layout. All real layout work happens in [locale]/layout.tsx
 * which has access to the locale, translations, and fonts.
 *
 * We return `children` directly — the [locale] segment provides the
 * <html> and <body> tags with the correct lang attribute.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
