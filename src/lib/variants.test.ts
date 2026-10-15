import { describe, expect, it } from 'vitest'
import type { Schedule, Variant } from '../../shared/types'
import { variantLabel, variantRuns } from './variants'

const stop = (id: string, name = `Stop ${id}`) => ({ id, name, lat: 0, lng: 0 })
const loop: Variant = { id: '1', name: '', stops: [stop('453', 'Gregorio'), stop('2'), stop('3'), stop('453', 'Gregorio')] }
const market: Variant = { id: '3', name: '', stops: [stop('453', 'Gregorio'), stop('2'), stop('455', 'Mercadillo'), stop('3'), stop('453', 'Gregorio')] }
const station: Variant = { id: '21', name: '', stops: [stop('439', 'Estación'), stop('7'), stop('8'), stop('9'), stop('2'), stop('453', 'Gregorio')] }
const all = [loop, market, station]

const schedule = (stops: Schedule['stops']): Schedule => ({ lineId: '071', dir: 'I', date: '20261015', stops })

describe('variantLabel', () => {
  it('names a loop by its stop count', () => {
    expect(variantLabel(loop, all)).toBe('Okruh · 4 zastávky')
  })

  it('mentions the one or two stops only this variant serves', () => {
    expect(variantLabel(market, all)).toBe('Okruh · 5 zastávek · přes Mercadillo')
  })

  it('names a one-way variant by its ends and skips long lists of unique stops', () => {
    expect(variantLabel(station, all)).toBe('Estación → Gregorio · 6 zastávek')
  })
})

describe('variantRuns', () => {
  it('runs when a stop unique to the variant has departures', () => {
    expect(variantRuns(schedule({ '455': [{ time: '08:00', to: '453' }] }), market, all)).toBe(true)
  })

  it('does not run when its unique stops have no departures that day', () => {
    expect(variantRuns(schedule({ '2': [{ time: '08:00', to: '453' }] }), market, all)).toBe(false)
  })

  it('is assumed to run when it has no unique stops', () => {
    expect(variantRuns(schedule({}), loop, all)).toBe(true)
  })
})
