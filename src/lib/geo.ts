export interface LatLng {
  lat: number
  lng: number
}

const EARTH_M = 6371000
const SPEED_KMH = 15

function rad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_M * Math.asin(Math.sqrt(h))
}

export function travelMinutes(a: LatLng, b: LatLng): number {
  return Math.max(1, Math.round((distanceM(a, b) / 1000 / SPEED_KMH) * 60))
}

export interface RoutePosition {
  segment: number
  fraction: number
  distance: number
}

function projectOnSegment(p: LatLng, a: LatLng, b: LatLng): { t: number; distance: number } {
  const k = Math.cos(rad(a.lat))
  const ax = a.lng * k
  const bx = b.lng * k
  const px = p.lng * k
  const dx = bx - ax
  const dy = b.lat - a.lat
  const len2 = dx * dx + dy * dy
  const t = len2 === 0 ? 0 : Math.min(1, Math.max(0, ((px - ax) * dx + (p.lat - a.lat) * dy) / len2))
  return { t, distance: distanceM(p, { lat: a.lat + t * dy, lng: (ax + t * dx) / k }) }
}

const TIE_M = 25

export function locateOnStops(stops: LatLng[], p: LatLng, preferFrom = 0): RoutePosition | null {
  const candidates: RoutePosition[] = []
  for (let i = 0; i < stops.length - 1; i++) {
    const { t, distance } = projectOnSegment(p, stops[i], stops[i + 1])
    candidates.push({ segment: i, fraction: t, distance })
  }
  if (!candidates.length) return null
  const min = Math.min(...candidates.map((c) => c.distance))
  const near = candidates.filter((c) => c.distance <= min + TIE_M)
  return near.find((c) => c.segment >= preferFrom) ?? near[0]
}

export function nearest<T extends LatLng>(items: T[], p: LatLng, count: number): (T & { distance: number })[] {
  return items
    .map((item) => ({ ...item, distance: distanceM(p, item) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
}
