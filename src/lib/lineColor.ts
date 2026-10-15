import type { Line } from '../../shared/types'

const NIGHT = '#6b6b75'
const FALLBACK = '#c8102e'

export function lineColor(line?: Pick<Line, 'label' | 'color'>): string {
  if (!line) return FALLBACK
  return line.label.startsWith('N') ? NIGHT : line.color
}
