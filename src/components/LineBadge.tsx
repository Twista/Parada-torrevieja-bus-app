import type { Line } from '../../shared/types'

export function LineBadge({ line }: { line: Pick<Line, 'label' | 'color'> }) {
  return (
    <span class="badge" style={{ background: line.color }}>
      {line.label}
    </span>
  )
}
