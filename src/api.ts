import type { Dir, Line, LineDirection, Schedule, StopIndexEntry } from '../shared/types'
import { addDays } from './lib/time'

export interface Loaded<T> {
  data: T
  stale: boolean
  fetchedAt: number
}

async function get<T>(path: string): Promise<Loaded<T>> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return {
    data: (await res.json()) as T,
    stale: res.headers.get('x-stale') === '1',
    fetchedAt: Number(res.headers.get('x-fetched-at') ?? 0),
  }
}

export const api = {
  lines: () => get<Line[]>('/api/lines'),
  direction: (lineId: string, dir: Dir) => get<LineDirection>(`/api/lines/${lineId}/${dir}`),
  schedule: (lineId: string, dir: Dir, date: string) => get<Schedule>(`/api/lines/${lineId}/${dir}/schedule?date=${date}`),
  stops: () => get<StopIndexEntry[]>('/api/stops'),
}

export async function findNextServiceDate(lineId: string, dir: Dir, from: string, days = 7): Promise<string | null> {
  for (let i = 0; i < days; i++) {
    const date = addDays(from, i)
    const { data } = await api.schedule(lineId, dir, date)
    if (Object.keys(data.stops).length > 0) return date
  }
  return null
}
