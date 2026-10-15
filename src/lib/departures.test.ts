import { describe, expect, it } from 'vitest'
import { fixtureJson } from '../../fixtures/load'
import { parseLineDirection, parseSchedule, type RawLineDetail, type RawSchedules, type RawTrayectos } from '../../functions/lib/normalize'
import { departuresFromSchedule } from './departures'
import { toMinutes } from './time'

const schedule = parseSchedule('081', 'I', '20261015', fixtureJson<RawSchedules>('schedules-081-I.json'))
const direction = parseLineDirection('081', 'I', fixtureJson<RawTrayectos>('trayectos-081-I.json'), fixtureJson<RawLineDetail>('detail-081-I.json'))

describe('departuresFromSchedule', () => {
  it('lists upcoming departures with the terminal name', () => {
    const result = departuresFromSchedule(schedule, direction, '753', toMinutes('07:30'))
    expect(result[0]).toEqual({ lineId: '081', to: 'C/ Mar Rizada, s/n', time: toMinutes('07:42') })
    expect(result.every((d) => d.time >= toMinutes('07:30'))).toBe(true)
  })

  it('shows nothing at the terminal of the direction', () => {
    expect(departuresFromSchedule(schedule, direction, '110', 0)).toEqual([])
  })

  it('shows nothing for a stop not on the line', () => {
    expect(departuresFromSchedule(schedule, direction, 'nope', 0)).toEqual([])
  })
})
