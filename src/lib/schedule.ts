import type { Schedule, Variant } from '../../shared/types'
import { travelMinutes } from './geo'
import { toMinutes } from './time'

export function stopTimes(schedule: Schedule, variant: Variant, index: number): number[] {
  const last = variant.stops.length - 1
  if (index === last && index > 0) return []
  const terminal = variant.stops[last]?.id
  const times = (schedule.stops[variant.stops[index].id] ?? []).filter((t) => t.to === terminal).map((t) => toMinutes(t.time))
  return [...new Set(times)].sort((a, b) => a - b)
}

export function upcoming(times: number[], now: number, count: number): number[] {
  return times.filter((t) => t >= now).slice(0, count)
}

export function currentTripAnchor(schedule: Schedule, variant: Variant, index: number, now: number): number | null {
  const times = stopTimes(schedule, variant, index)
  const due = times.filter((t) => t <= now + 2)
  return due.length ? due[due.length - 1] : (times[0] ?? null)
}

export function tripFrom(schedule: Schedule, variant: Variant, anchorIndex: number, anchorTime: number): (number | null)[] {
  const trip: (number | null)[] = variant.stops.map(() => null)
  const last = variant.stops.length - 1
  trip[anchorIndex] = anchorTime
  let prev = anchorTime
  for (let i = anchorIndex + 1; i <= last; i++) {
    const next = i === last ? prev + travelMinutes(variant.stops[i - 1], variant.stops[i]) : stopTimes(schedule, variant, i).find((t) => t >= prev)
    if (next === undefined) break
    trip[i] = next
    prev = next
  }
  return trip
}
