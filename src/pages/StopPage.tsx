import { useRoute } from 'preact-iso'
import { api } from '../api'
import { DepartureList } from '../components/DepartureList'
import { MapView } from '../components/MapView'
import { Status } from '../components/Status'
import { departuresAt } from '../lib/departures'
import { madridNow } from '../lib/time'
import { useAsync } from '../lib/useAsync'

export function StopPage() {
  const { params } = useRoute()
  const stops = useAsync(api.stops, [])
  const lines = useAsync(api.lines, [])
  const stop = stops.data?.data.find((s) => s.id === params.id)
  const departures = useAsync(() => {
    const { date, minutes } = madridNow()
    return stop ? departuresAt(stop, date, minutes) : Promise.resolve([])
  }, [stop?.id])

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
          <MapView shape={[]} stops={[stop]} color="#c8102e" highlightStopId={stop.id} />
          <h2>Nejbližší odjezdy</h2>
          <Status loading={departures.loading} error={departures.error} />
          {departures.data && <DepartureList departures={departures.data.slice(0, 15)} lines={lines.data?.data ?? []} />}
        </>
      )}
    </main>
  )
}
