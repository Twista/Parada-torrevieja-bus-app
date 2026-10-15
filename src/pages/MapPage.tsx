import { useState } from 'preact/hooks'
import { api } from '../api'
import { DepartureList } from '../components/DepartureList'
import { MapView } from '../components/MapView'
import { Status } from '../components/Status'
import { departuresAt } from '../lib/departures'
import { useAsync } from '../lib/useAsync'
import { useGeolocation } from '../lib/useGeolocation'
import { useNow } from '../lib/useNow'

export function MapPage() {
  const stops = useAsync(api.stops, [])
  const lines = useAsync(api.lines, [])
  const { position } = useGeolocation(true)
  const [selected, setSelected] = useState<string | null>(null)
  const stop = stops.data?.data.find((s) => s.id === selected)
  const { date, minutes } = useNow()
  const departures = useAsync(() => (stop ? departuresAt(stop, date, minutes) : Promise.resolve([])), [stop?.id, date, minutes])

  return (
    <main class="map-page">
      <header class="bar">
        <a href="/" class="back">‹</a>
        <h1>Mapa zastávek</h1>
      </header>
      <Status loading={stops.loading} error={stops.error} stale={stops.data?.stale} fetchedAt={stops.data?.fetchedAt} />
      {stops.data && (
        <MapView
          stops={stops.data.data}
          color="#c8102e"
          user={position}
          centerOnUser
          highlightStopId={selected}
          onStopClick={setSelected}
          stopPopup={(id) => stops.data?.data.find((s) => s.id === id)?.name ?? ''}
        />
      )}
      {!stop && <p class="muted">Ťukni na zastávku na mapě.</p>}
      {stop && (
        <section>
          <a href={`/zastavka/${stop.id}`} class="stop-link">{stop.name} ›</a>
          <Status loading={departures.loading} error={departures.error} />
          {departures.data && <DepartureList departures={departures.data.slice(0, 6)} lines={lines.data?.data ?? []} />}
        </section>
      )}
    </main>
  )
}
