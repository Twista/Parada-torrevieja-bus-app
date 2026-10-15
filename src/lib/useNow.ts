import { useEffect, useState } from 'preact/hooks'
import { madridNow } from './time'

export function useNow(): { date: string; minutes: number } {
  const [now, setNow] = useState(() => madridNow())
  useEffect(() => {
    const id = setInterval(() => setNow(madridNow()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}
