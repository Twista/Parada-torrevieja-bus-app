import { useEffect, useState } from 'preact/hooks'
import { useRoute } from 'preact-iso'
import type { Dir } from '../../shared/types'
import { api, findNextServiceDate } from '../api'
import { LineBadge } from '../components/LineBadge'
import { MapView } from '../components/MapView'
import { Status } from '../components/Status'
import { stopTimes, upcoming } from '../lib/schedule'
import { addDays, formatDate, formatMinutes, fromIsoDate, toIsoDate } from '../lib/time'
import { lineColor } from '../lib/lineColor'
import { useAsync } from '../lib/useAsync'
import { useGeolocation } from '../lib/useGeolocation'
import { useNow } from '../lib/useNow'

export function LinePage() {
  const { params } = useRoute()
  const lineId = params.id
  const clock = useNow()
  const { position } = useGeolocation(true)
  const today = clock.date
  const [dir, setDir] = useState<Dir>('I')
  const [variantIndex, setVariantIndex] = useState(0)
  const [date, setDate] = useState(today)
  const [stopIndex, setStopIndex] = useState(0)
  const [focus, setFocus] = useState<{ stopId: string } | null>(null)
  const [searching, setSearching] = useState(false)
  const lines = useAsync(api.lines, [])
  const directions = useAsync(() => Promise.all([api.direction(lineId, 'I'), api.direction(lineId, 'V')]), [lineId])
  const schedule = useAsync(() => api.schedule(lineId, dir, date), [lineId, dir, date])

  useEffect(() => {
    api.schedule(lineId, dir, addDays(today, 1)).catch(() => {})
  }, [lineId, dir, today])

  const line = lines.data?.data.find((l) => l.id === lineId)
  const both = directions.data
  const hasReturn = (both?.[1].data.variants.length ?? 0) > 0
  const direction = both?.[dir === 'I' ? 0 : 1].data
  const variant = direction?.variants[variantIndex] ?? direction?.variants[0]
  const now = date === today ? clock.minutes : -1
  const sched = schedule.data?.data
  const stop = variant?.stops[stopIndex] ?? variant?.stops[0]
  const isTerminal = variant !== undefined && stopIndex > 0 && stopIndex === variant.stops.length - 1
  const departures = sched && variant && stop ? stopTimes(sched, variant, variant.stops.indexOf(stop)) : []
  const noService = sched !== undefined && Object.keys(sched.stops).length === 0

  function switchDir(next: Dir) {
    setDir(next)
    setVariantIndex(0)
    setStopIndex(0)
  }

  function showOnMap(index: number) {
    setStopIndex(index)
    if (variant) setFocus({ stopId: variant.stops[index].id })
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function nextTimes(index: number): string[] {
    return sched && variant ? upcoming(stopTimes(sched, variant, index), now, 3).map(formatMinutes) : []
  }

  function popupText(stopId: string): string {
    const index = variant ? variant.stops.findIndex((s) => s.id === stopId) : -1
    if (!variant || index < 0) return ''
    const next = nextTimes(index)
    return next.length ? `${variant.stops[index].name}\n${next.join('  ')}` : variant.stops[index].name
  }

  async function findNextDay() {
    setSearching(true)
    const next = await findNextServiceDate(lineId, dir, date < today ? today : addDays(date, 1)).catch(() => null)
    setSearching(false)
    if (next) setDate(next)
  }

  return (
    <main>
      <header class="bar">
        <a href="/" class="back">‹</a>
        {line && <LineBadge line={line} />}
        <h1>{line?.name ?? `Linka ${lineId}`}</h1>
      </header>
      <Status loading={directions.loading} error={directions.error} stale={both?.[0].stale} fetchedAt={both?.[0].fetchedAt} />
      {hasReturn && (
        <div class="tabs">
          <button class={dir === 'I' ? 'active' : ''} onClick={() => switchDir('I')}>Tam</button>
          <button class={dir === 'V' ? 'active' : ''} onClick={() => switchDir('V')}>Zpět</button>
        </div>
      )}
      {direction && direction.variants.length > 1 && (
        <select
          value={variantIndex}
          onChange={(e) => {
            setVariantIndex(Number(e.currentTarget.value))
            setStopIndex(0)
          }}
        >
          {direction.variants.map((v, i) => (
            <option key={v.id} value={i}>{v.name}</option>
          ))}
        </select>
      )}
      {variant && (
        <>
          <p class="muted">Směr: {variant.stops[variant.stops.length - 1]?.name}</p>
          <a class="button primary" href={`/linka/${lineId}/${dir}/jedu?v=${variant.id}`}>Jedu</a>
          <div id="map">
            <MapView
              shape={direction!.shape}
              stops={variant.stops}
              color={lineColor(line)}
              user={position}
              highlightStopId={stop?.id}
              onStopClick={(id) => setStopIndex(Math.max(0, variant.stops.findIndex((s) => s.id === id)))}
              stopPopup={popupText}
              focus={focus}
            />
          </div>
          <section id="departures">
            <div class="row">
              <h2>Odjezdy {date === today ? 'dnes' : formatDate(date)}</h2>
              <input type="date" value={toIsoDate(date)} onChange={(e) => e.currentTarget.value && setDate(fromIsoDate(e.currentTarget.value))} />
            </div>
            <p class="muted">ze zastávky <strong>{stop?.name}</strong></p>
            <Status loading={schedule.loading} error={schedule.error} />
            {isTerminal && !noService && <p class="notice">Konečná zastávka – odsud linka v tomto směru neodjíždí.</p>}
            {noService && (
              <div class="notice">
                Tento den linka nejezdí.{' '}
                <button onClick={findNextDay} disabled={searching}>{searching ? 'Hledám…' : 'Najít nejbližší den'}</button>
              </div>
            )}
            <div class="times">
              {departures.map((t) => (
                <span key={t} class={t < now ? 'past' : ''}>{formatMinutes(t)}</span>
              ))}
            </div>
          </section>
          <section>
            <h2>Zastávky</h2>
            <ol class="stops">
              {variant.stops.map((s, i) => (
                <li key={`${s.id}-${i}`} class={stopIndex === i ? 'dest' : ''}>
                  <button class="stop-name" onClick={() => setStopIndex(i)}>{s.name}</button>
                  <button class="small" aria-label="Ukázat na mapě" onClick={() => showOnMap(i)}>📍</button>
                  {stopIndex === i && (
                    <div class="stop-times">
                      {i === variant.stops.length - 1 && i > 0 ? (
                        <span class="muted">Konečná zastávka</span>
                      ) : nextTimes(i).length ? (
                        <div class="times">
                          {nextTimes(i).map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      ) : (
                        <span class="muted">Dnes už odsud nic nejede.</span>
                      )}
                      <a href={`/zastavka/${s.id}`}>Všechny linky na zastávce ›</a>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </main>
  )
}
