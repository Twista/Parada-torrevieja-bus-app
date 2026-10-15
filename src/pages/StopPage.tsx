import { useMemo } from 'preact/hooks'
import { useRoute } from 'preact-iso'
import { api } from '../api'
import { DepartureList } from '../components/DepartureList'
import { MapView } from '../components/MapView'
import { Status } from '../components/Status'
import { departuresAt } from '../lib/departures'
import { useAsync } from '../lib/useAsync'
import { useNow } from '../lib/useNow'

export function StopPage() {
  const { params } = useRoute()
  const stops = useAsync(api.stops, [])
  const lines = useAsync(api.lines, [])
  const stop = stops.data?.data.find((s) => s.id === params.id)
  const mapStops = useMemo(() => (stop ? [stop] : []), [stop])
  const { date, minutes } = useNow()
  const departures = useAsync(() => (stop ? departuresAt(stop, date, minutes) : Promise.resolve([])), [stop?.id, date, minutes])

  return (
    <main>
      <header class="bar">
        <a href="/" class="back" onClick={(e) => { if (history.length > 1) { e.preventDefault(); history.back() } }}>‹</a>
        <h1>{stop?.name ?? 'Zastávka'}</h1>
      </header>
      <Status loading={stops.loading} error={stops.error} stale={stops.data?.stale} fetchedAt={stops.data?.fetchedAt} />
      {stops.data && !stop && <p class="notice">Zastávka nenalezena.</p>}
      {stop && (
        <>
          <MapView stops={mapStops} color="#c8102e" highlightStopId={stop.id} />
          <h2>Nejbližší odjezdy</h2>
          <Status loading={departures.loading} error={departures.error} />
          {departures.data && <DepartureList departures={departures.data.slice(0, 15)} lines={lines.data?.data ?? []} />}
        </>
      )}
    </main>
  )
}
