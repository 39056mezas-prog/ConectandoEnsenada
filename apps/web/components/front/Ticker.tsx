import { getTranslations } from 'next-intl/server'
import { TrendingDown, TrendingUp } from 'lucide-react'
import type { FxSnapshot } from '@/lib/live/fx'
import { describeCode, type MarineSnapshot, type WeatherSnapshot } from '@/lib/live/weather'
import { formatClock, num } from '@/lib/format'

/** One-line strip of live numbers (dollar, weather, waves, sunset). Hides what it doesn't have. */
export async function Ticker({ locale, fx, wx, sea }: { locale: string; fx: FxSnapshot | null; wx: WeatherSnapshot | null; sea: MarineSnapshot | null }) {
  const t = await getTranslations({ locale, namespace: 'front' })
  const change = fx && fx.previous ? ((fx.rate - fx.previous) / fx.previous) * 100 : null
  const sunset = wx ? formatClock(wx.sunset, locale) : null
  if (!fx && !wx && !sea) return null
  return (
    <div className="fp-ticker" role="region" aria-label={t('ticker_label')}>
      <div className="container-app">
        <div className="fp-ticker-row">
          {fx && (
            <div className="fp-tick">
              <span className="fp-tick-k">{t('ticker_usd')}</span>
              <span className="fp-tick-v">${num(fx.rate, locale, 2)} MXN</span>
              {change != null && Math.abs(change) >= 0.005 && (
                <span className={change >= 0 ? 'fp-up' : 'fp-down'} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700 }}>
                  {change >= 0 ? <TrendingUp size={13} aria-hidden="true" /> : <TrendingDown size={13} aria-hidden="true" />}
                  {num(Math.abs(change), locale, 2)}%
                </span>
              )}
            </div>
          )}
          {wx && (
            <div className="fp-tick">
              <span className="fp-tick-k">{t('ticker_temp')}</span>
              <span className="fp-tick-v">{num(wx.tempC, locale)}°C</span>
              <span style={{ color: 'rgb(255 255 255 / 0.85)' }}>{t(`wx.${describeCode(wx.code, wx.isDay).key}`)}</span>
            </div>
          )}
          {sea?.waveM != null && (
            <div className="fp-tick">
              <span className="fp-tick-k">{t('ticker_waves')}</span>
              <span className="fp-tick-v">{num(sea.waveM, locale, 1)} m</span>
            </div>
          )}
          {sunset && (
            <div className="fp-tick" style={{ borderRight: 0 }}>
              <span className="fp-tick-k">{t('ticker_sunset')}</span>
              <span className="fp-tick-v">{sunset}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
