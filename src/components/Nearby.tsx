import { api } from '../api'
import { departuresAt } from '../lib/departures'
import { nearest } from '../lib/geo'
import { useAsync } from '../lib/useAsync'
import { useGeolocation } from '../lib/useGeolocation'
import { useNow } from '../lib/useNow'
import { DepartureList } from './DepartureList'

const MAX_DISTANCE_M = 1000

export function Nearby() {
  const { position } = useGeolocation(true)
  const stops = useAsync(api.stops, [])
  const lines = useAsync(api.lines, [])
  const close = position && stops.data ? nearest(stops.data.data, position, 2).filter((s) => s.distance < MAX_DISTANCE_M) : []
  const key = close.map((s) => s.id).join(',')
  const { date, minutes } = useNow()
  const departures = useAsync(() => Promise.all(close.map(async (s) => ({ id: s.id, list: await departuresAt(s, date, minutes) }))), [key, date, minutes])

  const list = (id: string) => departures.data?.find((d) => d.id === id)?.list

  if (!close.length) return null
  return (
    <section class="card">
      <h2>Poblíž</h2>
      {close.map((s) => (
        <div key={s.id}>
          <a href={`/zastavka/${s.id}`} class="stop-link">
            {s.name} <span class="muted">{Math.round(s.distance)} m</span>
          </a>
          {list(s.id) ? <DepartureList departures={list(s.id)!.slice(0, 3)} lines={lines.data?.data ?? []} /> : <p class="muted">Načítám…</p>}
        </div>
      ))}
    </section>
  )
}
