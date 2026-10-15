import { describe, expect, it } from 'vitest'
import { fixtureJson } from '../../fixtures/load'
import { parseLineDirection, parseSchedule, type RawLineDetail, type RawSchedules, type RawTrayectos } from '../../functions/lib/normalize'
import { distanceM, travelMinutes } from './geo'
import { currentTripAnchor, stopTimes, tripFrom, upcoming } from './schedule'
import { toMinutes } from './time'

const schedule = parseSchedule('081', 'I', '20261015', fixtureJson<RawSchedules>('schedules-081-I.json'))
const variant = parseLineDirection('081', 'I', fixtureJson<RawTrayectos>('trayectos-081-I.json'), fixtureJson<RawLineDetail>('detail-081-I.json')).variants[0]

describe('geo basics', () => {
  it('measures distance between hospital and Mar Rizada', () => {
    const d = distanceM({ lat: 37.9643, lng: -0.7173 }, { lat: 37.947, lng: -0.7092 })
    expect(Math.abs(d - 2051)).toBeLessThan(30)
  })

  it('estimates travel time at 15 km/h with a 1 minute floor', () => {
    expect(travelMinutes({ lat: 37.9643, lng: -0.7173 }, { lat: 37.947, lng: -0.7092 })).toBe(8)
    expect(travelMinutes({ lat: 1, lng: 1 }, { lat: 1, lng: 1 })).toBe(1)
  })
})

describe('stopTimes', () => {
  it('returns times towards this variant terminal only', () => {
    expect(stopTimes(schedule, variant, 0).slice(0, 3)).toEqual([440, 460, 480])
    expect(stopTimes(schedule, variant, 1).slice(0, 3)).toEqual([442, 462, 484])
  })

  it('has no reliable times at the terminal', () => {
    expect(stopTimes(schedule, variant, 10)).toEqual([])
  })
})

describe('upcoming', () => {
  it('keeps times from now on', () => {
    expect(upcoming([440, 460, 480, 500], 460, 2)).toEqual([460, 480])
  })
})

describe('currentTripAnchor', () => {
  it('picks the latest departure already due at the stop', () => {
    expect(currentTripAnchor(schedule, variant, 1, toMinutes('07:45'))).toBe(462)
  })

  it('falls back to the first departure before service starts', () => {
    expect(currentTripAnchor(schedule, variant, 1, toMinutes('05:00'))).toBe(442)
  })
})

describe('tripFrom', () => {
  it('chains times stop by stop and estimates the terminal', () => {
    const trip = tripFrom(schedule, variant, 0, 440)
    expect(trip.slice(0, 10)).toEqual([440, 442, 444, 445, 447, 448, 449, 451, 453, 454])
    expect(trip[10]).toBe(454 + travelMinutes(variant.stops[9], variant.stops[10]))
  })

  it('leaves stops before the anchor empty', () => {
    const trip = tripFrom(schedule, variant, 2, 444)
    expect(trip[0]).toBeNull()
    expect(trip[1]).toBeNull()
    expect(trip[3]).toBe(445)
  })
})
