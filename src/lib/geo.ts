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
