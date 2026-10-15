import { describe, expect, it } from 'vitest'
import { locateOnStops, nearest } from './geo'

const A = { lat: 37.96, lng: -0.7 }
const B = { lat: 37.96, lng: -0.69 }
const C = { lat: 37.97, lng: -0.69 }

describe('locateOnStops', () => {
  it('finds the segment between two stops', () => {
    const pos = locateOnStops([A, B, C], { lat: 37.9601, lng: -0.695 })!
    expect(pos.segment).toBe(0)
    expect(pos.fraction).toBeCloseTo(0.5, 1)
    expect(pos.distance).toBeLessThan(20)
  })

  it('finds a later segment', () => {
    expect(locateOnStops([A, B, C], { lat: 37.965, lng: -0.6899 })!.segment).toBe(1)
  })

  it('reports distance when far from the route', () => {
    expect(locateOnStops([A, B, C], { lat: 37.95, lng: -0.695 })!.distance).toBeGreaterThan(300)
  })

  it('does not jump back to the start on a circular route', () => {
    expect(locateOnStops([A, B, C, A], { lat: 37.9601, lng: -0.6999 }, 2)!.segment).toBe(2)
  })

  it('prefers the start of a circular route at the shared stop', () => {
    expect(locateOnStops([A, B, C, A], { lat: 37.9601, lng: -0.7 })!.segment).toBe(0)
  })

  it('recovers from an earlier bad fix further along the route', () => {
    expect(locateOnStops([A, B, C], { lat: 37.9601, lng: -0.695 }, 1)!.segment).toBe(0)
  })

  it('returns null for fewer than two stops', () => {
    expect(locateOnStops([A], A)).toBeNull()
  })
})

describe('nearest', () => {
  it('sorts by distance and limits count', () => {
    const result = nearest([{ id: 'c', ...C }, { id: 'a', ...A }, { id: 'b', ...B }], { lat: 37.9601, lng: -0.7001 }, 2)
    expect(result.map((r) => r.id)).toEqual(['a', 'b'])
    expect(result[0].distance).toBeLessThan(20)
  })
})
