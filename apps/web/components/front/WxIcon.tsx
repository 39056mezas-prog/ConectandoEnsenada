import { Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from 'lucide-react'
import { describeCode } from '@/lib/live/weather'

const MAP = { sun: Sun, moon: Moon, 'cloud-sun': CloudSun, 'cloud-moon': CloudMoon, cloud: Cloud, fog: CloudFog, drizzle: CloudDrizzle, rain: CloudRain, snow: CloudSnow, storm: CloudLightning } as const

export function WxIcon({ code, isDay = true, size = 22 }: { code: number; isDay?: boolean; size?: number }) {
  const Icon = MAP[describeCode(code, isDay).icon]
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" style={{ color: 'var(--color-navy-600)' }} />
}
