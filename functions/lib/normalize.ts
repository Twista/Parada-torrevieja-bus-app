import type { Dir, Line, LineDirection, Schedule, StopIndexEntry, StopTime } from '../../shared/types'

export interface RawTrayectos {
  error?: unknown
  trayectos?: {
    codtray: string
    nomtray: string
    paradas: { codigo: string; nombre: string; coordinates: [string, string] }[]
  }[]
}

export interface RawLineDetail {
  error?: unknown
  geojson?: { features?: { geometry?: { type: string; coordinates: unknown } }[] }
}

export interface RawSchedules {
  paradas?: Record<string, { hora: string; hasta: string }[]>
  error?: unknown
}

export function cleanStopName(name: string): string {
  return name.replace(/\s*_[A-Z]+$/, '').trim()
}

function match(text: string, re: RegExp): string {
  return text.match(re)?.[1] ?? ''
}

export function parseLines(html: string): Line[] {
  return html
    .split('class="avanzainfo-line-item"')
    .slice(1)
    .map((block) => ({
      id: match(block, /data-line-id="([^"]+)"/),
      label: match(block, /avanzainfo-line-badge[^>]*>\s*([^<]*?)\s*</),
      name: match(block, /avanzainfo-line-name">([^<]*)</).replace(/\s+/g, ' ').trim(),
      color: match(block, /data-line-color="([^"]+)"/),
    }))
}

export function parseLineDirection(lineId: string, dir: Dir, trayectos: RawTrayectos, detail: RawLineDetail): LineDirection {
  for (const raw of [trayectos, detail]) if (typeof raw.error === 'string') throw new Error(raw.error)
  const variants = (trayectos.trayectos ?? []).map((t) => ({
    id: t.codtray,
    name: t.nomtray,
    stops: t.paradas.map((p) => ({
      id: p.codigo,
      name: cleanStopName(p.nombre),
      lat: Number(p.coordinates[1]),
      lng: Number(p.coordinates[0]),
    })),
  }))
  const shape = (detail.geojson?.features ?? []).flatMap((f) =>
    f.geometry?.type === 'MultiLineString' ? (f.geometry.coordinates as [number, number][][]).filter((s) => s.length > 1) : [],
  )
  return { lineId, dir, variants, shape }
}

export function parseSchedule(lineId: string, dir: Dir, date: string, raw: RawSchedules): Schedule {
  if (typeof raw.error === 'string') throw new Error(raw.error)
  const stops: Record<string, StopTime[]> = {}
  for (const [key, times] of Object.entries(raw.paradas ?? {})) {
    stops[key.replace(/^P_/, '')] = times.map((t) => ({ time: t.hora, to: t.hasta }))
  }
  return { lineId, dir, date, stops }
}

export function buildStopIndex(directions: LineDirection[]): StopIndexEntry[] {
  const index = new Map<string, StopIndexEntry>()
  for (const d of directions) {
    for (const v of d.variants) {
      for (const s of v.stops) {
        const entry = index.get(s.id) ?? { ...s, serves: [] }
        if (!entry.serves.some((x) => x.lineId === d.lineId && x.dir === d.dir)) entry.serves.push({ lineId: d.lineId, dir: d.dir })
        index.set(s.id, entry)
      }
    }
  }
  return [...index.values()]
}
