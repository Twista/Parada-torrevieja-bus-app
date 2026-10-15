import type { LineDirection, Schedule, StopIndexEntry } from '../../shared/types'
import { api } from '../api'
import { stopTimes } from './schedule'

export interface Departure {
  lineId: string
  to: string
  time: number
}

export function departuresFromSchedule(schedule: Schedule, direction: LineDirection, stopId: string, now: number): Departure[] {
  const seen = new Set<string>()
  const result: Departure[] = []
  for (const variant of direction.variants) {
    const to = variant.stops[variant.stops.length - 1]?.name ?? ''
    variant.stops.forEach((s, i) => {
      if (s.id !== stopId) return
      for (const time of stopTimes(schedule, variant, i)) {
        const key = `${to}|${time}`
        if (time < now || seen.has(key)) continue
        seen.add(key)
        result.push({ lineId: direction.lineId, to, time })
      }
    })
  }
  return result.sort((a, b) => a.time - b.time)
}

export async function departuresAt(stop: StopIndexEntry, date: string, now: number): Promise<Departure[]> {
  const lists = await Promise.all(
    stop.serves.map(async ({ lineId, dir }) => {
      const [schedule, direction] = await Promise.all([api.schedule(lineId, dir, date), api.direction(lineId, dir)])
      return departuresFromSchedule(schedule.data, direction.data, stop.id, now)
    }),
  )
  return lists.flat().sort((a, b) => a.time - b.time)
}
