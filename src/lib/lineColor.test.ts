import { describe, expect, it } from 'vitest'
import { lineColor } from './lineColor'

describe('lineColor', () => {
  it('keeps the upstream colour for day lines', () => {
    expect(lineColor({ label: '01', color: '#FF0000' })).toBe('#FF0000')
  })

  it('greys out night lines', () => {
    expect(lineColor({ label: 'N2', color: '#FF0000' })).toBe('#6b6b75')
  })

  it('falls back to the accent colour while lines load', () => {
    expect(lineColor(undefined)).toBe('#c8102e')
  })
})
