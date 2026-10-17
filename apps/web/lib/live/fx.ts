// ============================================================================
// lib/live/fx.ts — USD → MXN exchange rate for the front page.
//
// Source: Frankfurter (https://frankfurter.dev) — European Central Bank reference
// rates. Free, no key. NOTE: this is a *reference* rate, not the buy/sell price of a
// casa de cambio; the UI says so. Fails safe: returns null on any problem so the
// front page simply hides the widget instead of crashing.
//
// Override the host for tests / self-hosting with FX_API_BASE.
// ============================================================================

export interface FxPoint { date: string; rate: number }
export interface FxSnapshot {
  rate: number              // 1 USD = rate MXN
  date: string              // date of the reference rate (YYYY-MM-DD)
  previous: number | null   // previous business day, for the up/down arrow
  series: FxPoint[]         // last ~14 days, oldest → newest (for the sparkline)
  source: string
}

const BASE = (process.env.FX_API_BASE ?? 'https://api.frankfurter.dev/v1').replace(/\/+$/, '')
const iso = (d: Date) => d.toISOString().slice(0, 10)

export async function getUsdMxn(): Promise<FxSnapshot | null> {
  try {
    const end = new Date()
    const start = new Date(end.getTime() - 20 * 86_400_000)
    const res = await fetch(`${BASE}/${iso(start)}..${iso(end)}?base=USD&symbols=MXN`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { rates?: Record<string, { MXN?: number }> }
    const series: FxPoint[] = Object.entries(json.rates ?? {})
      .map(([date, r]) => ({ date, rate: Number(r?.MXN) }))
      .filter(p => Number.isFinite(p.rate) && p.rate > 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
    const last = series[series.length - 1]
    if (!last) return null
    return {
      rate: last.rate,
      date: last.date,
      previous: series.length > 1 ? series[series.length - 2]!.rate : null,
      series,
      source: 'Banco Central Europeo (Frankfurter)',
    }
  } catch (e) {
    console.error('[live/fx]', e instanceof Error ? e.message : e)
    return null
  }
}
