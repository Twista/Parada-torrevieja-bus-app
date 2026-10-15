import type { Schedule, Variant } from '../../shared/types'
import { stopsWord } from './ride'
import { stopTimes } from './schedule'

function uniqueStopIndexes(variant: Variant, all: Variant[]): number[] {
  const others = new Set(all.filter((v) => v !== variant).flatMap((v) => v.stops.map((s) => s.id)))
  return variant.stops.flatMap((s, i) => (others.has(s.id) ? [] : [i]))
}

export function variantLabel(variant: Variant, all: Variant[]): string {
  const first = variant.stops[0]
  const last = variant.stops[variant.stops.length - 1]
  const n = variant.stops.length
  const ends = first?.id === last?.id ? 'Okruh' : `${first?.name} → ${last?.name}`
  const unique = uniqueStopIndexes(variant, all)
  const via = unique.length > 0 && unique.length <= 2 ? ` · přes ${unique.map((i) => variant.stops[i].name).join(', ')}` : ''
  return `${ends} · ${n} ${stopsWord(n)}${via}`
}

export function variantRuns(schedule: Schedule, variant: Variant, all: Variant[]): boolean {
  const unique = uniqueStopIndexes(variant, all).filter((i) => i < variant.stops.length - 1)
  return unique.length === 0 || unique.some((i) => stopTimes(schedule, variant, i).length > 0)
}
