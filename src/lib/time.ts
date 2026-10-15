const TZ = 'Europe/Madrid'

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function madridNow(date = new Date()): { date: string; minutes: number } {
  const parts = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]))
  return { date: `${parts.year}${parts.month}${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) }
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function formatMinutes(total: number): string {
  const m = ((total % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export function addDays(yyyymmdd: string, days: number): string {
  const d = new Date(Date.UTC(+yyyymmdd.slice(0, 4), +yyyymmdd.slice(4, 6) - 1, +yyyymmdd.slice(6, 8) + days))
  return d.toISOString().slice(0, 10).replaceAll('-', '')
}

export function formatDate(yyyymmdd: string): string {
  return `${+yyyymmdd.slice(6, 8)}. ${+yyyymmdd.slice(4, 6)}.`
}

export function toIsoDate(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`
}

export function fromIsoDate(iso: string): string {
  return iso.replaceAll('-', '')
}
