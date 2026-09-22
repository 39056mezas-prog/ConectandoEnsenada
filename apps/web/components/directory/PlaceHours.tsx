import type { PlaceHour } from '@/modules/directory/types'

interface PlaceHoursProps {
  hours: PlaceHour[]
}

const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function formatTime(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h ?? '0', 10)
  const suffix = hour >= 12 ? 'pm' : 'am'
  const hour12 = hour % 12 || 12
  return m === '00' ? `${hour12}${suffix}` : `${hour12}:${m}${suffix}`
}

function isCurrentlyOpen(hours: PlaceHour[]): { open: boolean; todayHours: PlaceHour | null } {
  const now = new Date()
  // UTC-7 / UTC-8 for Ensenada (Baja California follows Pacific Time)
  const ensenada = new Date(now.toLocaleString('en-US', { timeZone: 'America/Ensenada' }))
  const dayOfWeek = ensenada.getDay()
  const currentMinutes = ensenada.getHours() * 60 + ensenada.getMinutes()

  const todayHours = hours.find((h) => h.day_of_week === dayOfWeek) ?? null

  if (!todayHours || todayHours.is_closed || !todayHours.opens_at || !todayHours.closes_at) {
    return { open: false, todayHours }
  }

  const [oh, om] = todayHours.opens_at.split(':').map(Number)
  const [ch, cm] = todayHours.closes_at.split(':').map(Number)
  const opensMin  = (oh ?? 0) * 60 + (om ?? 0)
  const closesMin = (ch ?? 0) * 60 + (cm ?? 0)

  return { open: currentMinutes >= opensMin && currentMinutes < closesMin, todayHours }
}

export function PlaceHours({ hours }: PlaceHoursProps) {
  if (!hours || hours.length === 0) return null

  const sorted = [...hours].sort((a, b) => a.day_of_week - b.day_of_week)
  const { open, todayHours } = isCurrentlyOpen(hours)

  return (
    <div>
      {/* Open / Closed indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.875rem',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: open ? 'var(--color-success)' : 'var(--color-error)',
          }}
        >
          <span
            style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: open ? 'var(--color-success)' : 'var(--color-error)',
              flexShrink: 0,
            }}
          />
          {open ? 'Abierto ahora' : 'Cerrado ahora'}
        </span>
        {todayHours && !todayHours.is_closed && todayHours.opens_at && todayHours.closes_at && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
            · {open
              ? `Cierra a las ${formatTime(todayHours.closes_at)}`
              : `Abre a las ${formatTime(todayHours.opens_at)}`}
          </span>
        )}
      </div>

      {/* Hours table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {sorted.map((h) => {
            const isToday = h.day_of_week === new Date().getDay()
            return (
              <tr
                key={h.id ?? h.day_of_week}
                style={{
                  background: isToday ? 'var(--color-navy-50)' : 'transparent',
                }}
              >
                <td
                  style={{
                    padding: '0.375rem 0.5rem 0.375rem 0',
                    fontSize: '0.8125rem',
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? 'var(--color-navy-600)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-display)',
                    width: '110px',
                  }}
                >
                  {DAY_NAMES_ES[h.day_of_week]}
                </td>
                <td
                  style={{
                    padding: '0.375rem 0',
                    fontSize: '0.8125rem',
                    color: h.is_closed ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                    textAlign: 'right',
                  }}
                >
                  {h.is_closed
                    ? 'Cerrado'
                    : `${formatTime(h.opens_at)} – ${formatTime(h.closes_at)}`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
