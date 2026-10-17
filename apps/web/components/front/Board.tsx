import { getTranslations } from 'next-intl/server'
import { Droplets, Sunrise, Sunset, Sun, Waves, Wind } from 'lucide-react'
import type { FxSnapshot } from '@/lib/live/fx'
import { cToF, describeCode, mToFt, type MarineSnapshot, type WeatherSnapshot } from '@/lib/live/weather'
import { formatClock, formatShortDate, formatWeekday, num, windCompass } from '@/lib/format'
import { Sparkline } from './Sparkline'
import { FxConverter } from './FxConverter'
import { WxIcon } from './WxIcon'

export async function FxPanel({ locale, fx }: { locale: string; fx: FxSnapshot | null }) {
  const t = await getTranslations({ locale, namespace: 'front' })
  return (
    <section className="fp-panel" aria-labelledby="fx-h">
      <h2 id="fx-h">{t('fx_title')}</h2>
      {!fx ? (
        <p className="fp-small" style={{ marginTop: '0.75rem' }}>{t('fx_unavailable')}</p>
      ) : (
        <>
          <p className="fp-small" style={{ marginTop: '0.75rem' }}>{t('fx_per')}</p>
          <p className="fp-big" aria-label={`${num(fx.rate, locale, 2)} ${t('fx_mxn')}`}>
            ${num(fx.rate, locale, 2)} <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: 0 }}>MXN</span>
          </p>
          <div style={{ margin: '0.75rem 0 0.25rem' }}><Sparkline points={fx.series} /></div>
          <p className="fp-small">{t('fx_14d')} · {t('fx_date')} {formatShortDate(fx.date, locale)}</p>
          <hr />
          <FxConverter rate={fx.rate} locale={locale} labels={{ usd: t('conv_usd'), mxn: t('conv_mxn') }} />
          <p className="fp-small" style={{ marginTop: '0.75rem' }}>{t('fx_ref')}</p>
        </>
      )}
    </section>
  )
}

export async function WeatherPanel({ locale, wx, sea }: { locale: string; wx: WeatherSnapshot | null; sea: MarineSnapshot | null }) {
  const t = await getTranslations({ locale, namespace: 'front' })
  return (
    <section className="fp-panel" aria-labelledby="wx-h">
      <h2 id="wx-h">{t('wx_title')}</h2>
      {!wx ? (
        <p className="fp-small" style={{ marginTop: '0.75rem' }}>{t('wx_unavailable')}</p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', margin: '0.875rem 0 0.25rem' }}>
            <WxIcon code={wx.code} isDay={wx.isDay} size={44} />
            <div>
              <p className="fp-big">{num(wx.tempC, locale)}°<span style={{ fontSize: '1.25rem', fontWeight: 700 }}>C</span></p>
              <p className="fp-small" style={{ marginTop: 4 }}>{t(`wx.${describeCode(wx.code, wx.isDay).key}`)} · {cToF(wx.tempC)}°F</p>
            </div>
          </div>
          <dl className="fp-stats">
            <div><dt>{t('feels')}</dt><dd>{num(wx.feelsC, locale)}°C</dd></div>
            <div><dt><Droplets size={11} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> {t('humidity')}</dt><dd>{num(wx.humidity, locale)}%</dd></div>
            <div><dt><Wind size={11} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> {t('wind')}</dt><dd>{num(wx.windKmh, locale)} km/h {windCompass(wx.windDir)}</dd></div>
            {wx.uvMax != null && <div><dt><Sun size={11} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> {t('uv')}</dt><dd>{num(wx.uvMax, locale)}</dd></div>}
            {wx.sunrise && <div><dt><Sunrise size={11} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> {t('sunrise')}</dt><dd>{formatClock(wx.sunrise, locale)}</dd></div>}
            {wx.sunset && <div><dt><Sunset size={11} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> {t('sunset')}</dt><dd>{formatClock(wx.sunset, locale)}</dd></div>}
          </dl>
          <hr />
          <ol className="fp-days" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {wx.days.slice(0, 5).map((d, i) => (
              <li key={d.date} className="fp-day" aria-label={`${formatWeekday(d.date, locale)}: ${t(`wx.${describeCode(d.code).key}`)}, ${num(d.max, locale)}° / ${num(d.min, locale)}°`}>
                <span>{i === 0 ? t('today') : formatWeekday(d.date, locale)}</span>
                <WxIcon code={d.code} size={20} />
                <b>{num(d.max, locale)}°</b>
                <span>{num(d.min, locale)}°</span>
              </li>
            ))}
          </ol>
        </>
      )}
      {sea && (
        <>
          <hr />
          <h3 style={{ font: '800 1rem var(--font-serif)', color: 'var(--color-navy-600)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Waves size={16} aria-hidden="true" /> {t('sea_title')}
          </h3>
          <dl className="fp-stats">
            {sea.waveM != null && <div><dt>{t('sea_wave')}</dt><dd>{num(sea.waveM, locale, 1)} m · {num(mToFt(sea.waveM), locale, 1)} ft</dd></div>}
            {sea.wavePeriodS != null && <div><dt>{t('sea_period')}</dt><dd>{num(sea.wavePeriodS, locale)} s</dd></div>}
            {sea.seaTempC != null && <div><dt>{t('sea_temp')}</dt><dd>{num(sea.seaTempC, locale)}°C · {cToF(sea.seaTempC)}°F</dd></div>}
          </dl>
          <p className="fp-small" style={{ marginTop: '0.625rem' }}>{t('sea_note')}</p>
        </>
      )}
      {(wx || sea) && (
        <p className="fp-small" style={{ marginTop: '0.75rem' }}>
          {t('credit_wx')} <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-cyan-700)', fontWeight: 700 }}>Open-Meteo</a>
        </p>
      )}
    </section>
  )
}
