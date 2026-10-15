export function stopsLeft(segment: number, destIndex: number): number {
  return destIndex - segment
}

export function shouldAlert(left: number): boolean {
  return left <= 1
}

export function minutesBetween(trip: (number | null)[], from: number, to: number): number | null {
  const a = trip[from]
  const b = trip[to]
  return a == null || b == null ? null : b - a
}

export function stopsWord(n: number): string {
  if (n === 1) return 'zastávka'
  if (n >= 2 && n <= 4) return 'zastávky'
  return 'zastávek'
}
