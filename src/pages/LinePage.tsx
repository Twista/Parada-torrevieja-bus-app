import { useState } from 'preact/hooks'
import { useRoute } from 'preact-iso'
import type { Dir } from '../../shared/types'
import { api, findNextServiceDate } from '../api'
import { LineBadge } from '../components/LineBadge'
import { MapView } from '../components/MapView'
import { Status } from '../components/Status'
import { stopTimes, upcoming } from '../lib/schedule'
import { addDays, formatDate, formatMinutes, fromIsoDate, madridNow, toIsoDate } from '../lib/time'
import { useAsync } from '../lib/useAsync'

export function LinePage() {
  const { params } = useRoute()
  const lineId = params.id
  const today = madridNow().date
  const [dir, setDir] = useState<Dir>('I')
  const [variantIndex, setVariantIndex] = useState(0)
  const [date, setDate] = useState(today)
  const [openStop, setOpenStop] = useState<number | null>(null)
  const [searching, setSearching] = useState(false)
  const lines = useAsync(api.lines, [])
  const directions = useAsync(() => Promise.all([api.direction(lineId, 'I'), api.direction(lineId, 'V')]), [lineId])
  const schedule = useAsync(() => api.schedule(lineId, dir, date), [lineId, dir, date])

  const line = lines.data?.data.find((l) => l.id === lineId)
  const both = directions.data
  const hasReturn = (both?.[1].data.variants.length ?? 0) > 0
  const direction = both?.[dir === 'I' ? 0 : 1].data
  const variant = direction?.variants[variantIndex] ?? direction?.variants[0]
  const now = date === today ? madridNow().minutes : -1
  const sched = schedule.data?.data
  const departures = sched && variant ? stopTimes(sched, variant, 0) : []
  const noService = sched !== undefined && Object.keys(sched.stops).length === 0

  function switchDir(next: Dir) {
    setDir(next)
    setVariantIndex(0)
    setOpenStop(null)
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
            setOpenStop(null)
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
          <MapView
            shape={direction!.shape}
            stops={variant.stops}
            color={line?.color ?? '#c8102e'}
            highlightStopId={openStop !== null ? variant.stops[openStop]?.id : null}
            onStopClick={(id) => setOpenStop(variant.stops.findIndex((s) => s.id === id))}
          />
          <section>
            <div class="row">
              <h2>Odjezdy {date === today ? 'dnes' : formatDate(date)}</h2>
              <input type="date" value={toIsoDate(date)} onChange={(e) => e.currentTarget.value && setDate(fromIsoDate(e.currentTarget.value))} />
            </div>
            <Status loading={schedule.loading} error={schedule.error} />
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
                <li key={`${s.id}-${i}`} class={openStop === i ? 'open' : ''}>
                  <button class="stop-name" onClick={() => setOpenStop(openStop === i ? null : i)}>{s.name}</button>
                  {openStop === i && sched && (
                    <div class="stop-times">
                      <div class="times">
                        {upcoming(stopTimes(sched, variant, i), now, 8).map((t) => (
                          <span key={t}>{formatMinutes(t)}</span>
                        ))}
                      </div>
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
