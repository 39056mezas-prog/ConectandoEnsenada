// ============================================================================
// lib/live/weather.ts — Ensenada weather + sea state for the front page.
//
// Source: Open-Meteo (https://open-meteo.com). Free tier = NON-COMMERCIAL use only.
// Before selling ads / premium plans, buy a commercial key and set OPEN_METEO_API_KEY
// (we then switch automatically to the paid "customer-*" hosts). Attribution is shown
// in the UI. Marine data is informative only — NOT for navigation.
//
// Fails safe: every function returns null on any problem.
// Test overrides: WEATHER_API_URL / MARINE_API_URL.
// ============================================================================

export const ENSENADA = { lat: 31.8667, lon: -116.5964, tz: 'America/Tijuana' } as const
// Marine models need an open-water grid cell, so we sample just off the coast.
const MARINE_POINT = { lat: 31.85, lon: -116.8 } as const

export interface WeatherDay { date: string; code: number; max: number; min: number; rainChance: number | null }
export interface WeatherSnapshot {
  tempC: number; feelsC: number; humidity: number; windKmh: number; windDir: number
  code: number; isDay: boolean
  uvMax: number | null; sunrise: string | null; sunset: string | null
  days: WeatherDay[]
}
export interface MarineSnapshot { waveM: number | null; wavePeriodS: number | null; seaTempC: number | null }

const KEY = process.env.OPEN_METEO_API_KEY?.trim()
const FORECAST_URL = process.env.WEATHER_API_URL ?? (KEY ? 'https://customer-api.open-meteo.com/v1/forecast' : 'https://api.open-meteo.com/v1/forecast')
const MARINE_URL = process.env.MARINE_API_URL ?? (KEY ? 'https://customer-marine-api.open-meteo.com/v1/marine' : 'https://marine-api.open-meteo.com/v1/marine')

async function getJson<T>(base: string, params: Record<string, string>, revalidate: number): Promise<T> {
  const qs = new URLSearchParams({ ...params, timezone: ENSENADA.tz, ...(KEY ? { apikey: KEY } : {}) })
  const res = await fetch(`${base}?${qs}`, { next: { revalidate }, signal: AbortSignal.timeout(4000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function getWeather(): Promise<WeatherSnapshot | null> {
  try {
    const j = await getJson<{
      current?: { temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; weather_code: number; wind_speed_10m: number; wind_direction_10m: number; is_day: number }
      daily?: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max?: (number | null)[]; uv_index_max?: (number | null)[]; sunrise?: string[]; sunset?: string[] }
    }>(FORECAST_URL, {
      latitude: String(ENSENADA.lat), longitude: String(ENSENADA.lon),
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset',
      forecast_days: '5', wind_speed_unit: 'kmh', temperature_unit: 'celsius',
    }, 900)
    const c = j.current, d = j.daily
    if (!c || !d || !d.time?.length) return null
    return {
      tempC: c.temperature_2m, feelsC: c.apparent_temperature, humidity: c.relative_humidity_2m,
      windKmh: c.wind_speed_10m, windDir: c.wind_direction_10m, code: c.weather_code, isDay: c.is_day === 1,
      uvMax: d.uv_index_max?.[0] ?? null, sunrise: d.sunrise?.[0] ?? null, sunset: d.sunset?.[0] ?? null,
      days: d.time.map((date, i) => ({
        date, code: d.weather_code[i] ?? 0, max: d.temperature_2m_max[i] ?? 0, min: d.temperature_2m_min[i] ?? 0,
        rainChance: d.precipitation_probability_max?.[i] ?? null,
      })),
    }
  } catch (e) {
    console.error('[live/weather]', e instanceof Error ? e.message : e)
    return null
  }
}

export async function getMarine(): Promise<MarineSnapshot | null> {
  try {
    const j = await getJson<{ hourly?: { time: string[]; wave_height?: (number | null)[]; wave_period?: (number | null)[]; sea_surface_temperature?: (number | null)[] } }>(MARINE_URL, {
      latitude: String(MARINE_POINT.lat), longitude: String(MARINE_POINT.lon),
      hourly: 'wave_height,wave_period,sea_surface_temperature', forecast_days: '2',
    }, 1800)
    const h = j.hourly
    if (!h?.time?.length) return null
    // `time` is local Ensenada time without offset; pick the hour closest to "now" in that zone.
    const nowLocal = new Intl.DateTimeFormat('sv-SE', { timeZone: ENSENADA.tz, dateStyle: 'short', timeStyle: 'short' }).format(new Date()).replace(' ', 'T')
    let idx = h.time.findIndex(t => t >= nowLocal.slice(0, 13) + ':00')
    if (idx < 0) idx = h.time.length - 1
    const pick = (a?: (number | null)[]) => (a && typeof a[idx] === 'number' ? (a[idx] as number) : null)
    const out = { waveM: pick(h.wave_height), wavePeriodS: pick(h.wave_period), seaTempC: pick(h.sea_surface_temperature) }
    return out.waveM == null && out.seaTempC == null ? null : out
  } catch (e) {
    console.error('[live/marine]', e instanceof Error ? e.message : e)
    return null
  }
}

/** WMO weather code → i18n key (front.wx.*) + which icon to draw. */
export function describeCode(code: number, isDay = true): { key: string; icon: 'sun' | 'moon' | 'cloud-sun' | 'cloud-moon' | 'cloud' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm' } {
  if (code === 0) return { key: 'clear', icon: isDay ? 'sun' : 'moon' }
  if (code === 1 || code === 2) return { key: 'partly', icon: isDay ? 'cloud-sun' : 'cloud-moon' }
  if (code === 3) return { key: 'cloudy', icon: 'cloud' }
  if (code === 45 || code === 48) return { key: 'fog', icon: 'fog' }
  if (code >= 51 && code <= 57) return { key: 'drizzle', icon: 'drizzle' }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { key: 'rain', icon: 'rain' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { key: 'snow', icon: 'snow' }
  if (code >= 95) return { key: 'storm', icon: 'storm' }
  return { key: 'cloudy', icon: 'cloud' }
}

export const cToF = (c: number) => Math.round((c * 9) / 5 + 32)
export const mToFt = (m: number) => Math.round(m * 3.281 * 10) / 10
