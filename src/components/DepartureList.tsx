import type { Line } from '../../shared/types'
import { useI18n } from '../i18n'
import type { Departure } from '../lib/departures'
import { formatMinutes } from '../lib/time'
import { LineBadge } from './LineBadge'

export function DepartureList({ departures, lines }: { departures: Departure[]; lines: Line[] }) {
  const { t } = useI18n()
  if (!departures.length) return <p class="muted">{t.nothingToday}</p>
  return (
    <ul class="departures">
      {departures.map((d) => {
        const line = lines.find((l) => l.id === d.lineId)
        return (
          <li key={`${d.lineId}-${d.to}-${d.time}`}>
            <a href={`/linka/${d.lineId}`}>{line ? <LineBadge line={line} /> : d.lineId}</a>
            <span class="to">→ {d.to}</span>
            <span class="time">{formatMinutes(d.time)}</span>
          </li>
        )
      })}
    </ul>
  )
}
