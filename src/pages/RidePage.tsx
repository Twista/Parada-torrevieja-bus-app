import { useEffect, useRef, useState } from 'preact/hooks'
import { useRoute } from 'preact-iso'
import type { Dir } from '../../shared/types'
import { api } from '../api'
import { LineBadge } from '../components/LineBadge'
import { MapView } from '../components/MapView'
import { Status } from '../components/Status'
import { locateOnStops } from '../lib/geo'
import { minutesBetween, shouldAlert, stopsLeft, stopsWord } from '../lib/ride'
import { currentTripAnchor, tripFrom } from '../lib/schedule'
import { formatMinutes, madridNow } from '../lib/time'
import { useAsync } from '../lib/useAsync'
import { useGeolocation } from '../lib/useGeolocation'
import { useWakeLock } from '../lib/useWakeLock'

const OFF_ROUTE_M = 300

function RideBanner({ left, minutes, dest }: { left: number | null; minutes: number | null; dest: string | null }) {
  if (dest === null || left === null || left < 1) return null
  if (shouldAlert(left)) return <div class="banner alert">Vystupuj na příští zastávce: {dest}</div>
  return (
    <div class="banner">
      Do cíle {dest}: {left} {stopsWord(left)}
      {minutes !== null ? `, ~${minutes} min` : ''}
    </div>
  )
}

export function RidePage() {
  const { params, query } = useRoute()
  const lineId = params.id
  const dir = params.dir as Dir
  const today = madridNow().date
  const lines = useAsync(api.lines, [])
  const direction = useAsync(() => api.direction(lineId, dir), [lineId, dir])
  const schedule = useAsync(() => api.schedule(lineId, dir, today), [lineId, dir, today])
  const { position, error: gpsError } = useGeolocation(true)
  useWakeLock()
  const [manualSegment, setManualSegment] = useState<number | null>(null)
  const [destId, setDestId] = useState<string | null>(null)
  const lastSegment = useRef(0)
  const alerted = useRef(false)

  const variants = direction.data?.data.variants ?? []
  const variant = variants.find((v) => v.id === query.v) ?? variants[0]
  const located = variant && position ? locateOnStops(variant.stops, position, Math.max(0, lastSegment.current - 1)) : null
  const offRoute = manualSegment === null && located !== null && located.distance > OFF_ROUTE_M
  const segment = manualSegment ?? (located && !offRoute ? located.segment : null)
  const destIndex = variant && destId ? variant.stops.findIndex((s, i) => s.id === destId && (segment === null || i > segment)) : -1
  const sched = schedule.data?.data
  const anchor = sched && variant && segment !== null ? currentTripAnchor(sched, variant, segment, madridNow().minutes) : null
  const trip = sched && variant && segment !== null && anchor !== null ? tripFrom(sched, variant, segment, anchor) : []
  const left = segment !== null && destIndex >= 0 ? stopsLeft(segment, destIndex) : null
  const minutes = segment !== null && destIndex >= 0 ? minutesBetween(trip, segment, destIndex) : null

  useEffect(() => {
    if (located && !offRoute) lastSegment.current = located.segment
  }, [located?.segment, offRoute])

  useEffect(() => {
    alerted.current = false
  }, [destId])

  useEffect(() => {
    if (left !== null && shouldAlert(left) && !alerted.current) {
      alerted.current = true
      navigator.vibrate?.([400, 200, 400, 200, 400])
    }
  }, [left])

  const line = lines.data?.data.find((l) => l.id === lineId)

  if (!variant) {
    return (
      <main>
        <Status loading={direction.loading} error={direction.error ?? (direction.data ? 'empty' : undefined)} />
        <a href={`/linka/${lineId}`}>Zpět na linku</a>
      </main>
    )
  }

  return (
    <main>
      <header class="bar">
        <a href={`/linka/${lineId}`} class="back">‹</a>
        {line && <LineBadge line={line} />}
        <h1>Směr {variant.stops[variant.stops.length - 1]?.name}</h1>
      </header>
      <RideBanner left={left} minutes={minutes} dest={destIndex >= 0 ? variant.stops[destIndex].name : null} />
      {gpsError && manualSegment === null && <p class="notice">GPS není dostupná – u zastávky, kde jsi, ťukni na „Jsem tady“.</p>}
      {offRoute && located && <p class="notice">Jsi mimo trasu linky (~{Math.round(located.distance)} m).</p>}
      {manualSegment !== null && (
        <button class="small" onClick={() => setManualSegment(null)}>Použít GPS</button>
      )}
      <MapView
        shape={direction.data!.data.shape}
        stops={variant.stops}
        color={line?.color ?? '#c8102e'}
        user={position}
        highlightStopId={destId}
        follow
        onStopClick={setDestId}
      />
      <p class="muted">Ťukni na zastávku, kde chceš vystoupit.</p>
      <ol class="stops">
        {variant.stops.map((s, i) => (
          <li key={`${s.id}-${i}`} class={[segment !== null && i <= segment ? 'past' : '', i === destIndex ? 'dest' : ''].join(' ')}>
            <button class="stop-name" onClick={() => setDestId(s.id)}>{s.name}</button>
            <span class="time">{trip[i] != null ? formatMinutes(trip[i]!) : ''}</span>
            <button class="small" onClick={() => setManualSegment(i)}>Jsem tady</button>
          </li>
        ))}
      </ol>
    </main>
  )
}
