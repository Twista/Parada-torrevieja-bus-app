import type { Line } from '../../shared/types'
import { lineColor } from '../lib/lineColor'

export function LineBadge({ line }: { line: Pick<Line, 'label' | 'color'> }) {
  return (
    <span class="badge" style={{ background: lineColor(line) }}>
      {line.label}
    </span>
  )
}
