import { useEffect, useState } from 'preact/hooks'
import type { LatLng } from './geo'

export function useGeolocation(enabled: boolean): { position: LatLng | null; error: string | null } {
  const [position, setPosition] = useState<LatLng | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!enabled) return
    if (!('geolocation' in navigator)) {
      setError('unsupported')
      return
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude })
        setError(null)
      },
      (e) => setError(e.message || 'error'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [enabled])
  return { position, error }
}
