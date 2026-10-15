import { describe, expect, it } from 'vitest'
import { addDays, formatDate, formatMinutes, fromIsoDate, madridNow, toIsoDate, toMinutes } from './time'

describe('madridNow', () => {
  it('uses Madrid summer time regardless of host zone', () => {
    expect(madridNow(new Date('2026-10-15T07:52:00Z'))).toEqual({ date: '20261015', minutes: 9 * 60 + 52 })
  })

  it('rolls the date at Madrid midnight in winter', () => {
    expect(madridNow(new Date('2026-12-31T23:30:00Z'))).toEqual({ date: '20270101', minutes: 30 })
  })
})

describe('toMinutes / formatMinutes', () => {
  it('parses HH:MM', () => {
    expect(toMinutes('07:20')).toBe(440)
  })

  it('accepts hours past midnight', () => {
    expect(toMinutes('24:10')).toBe(1450)
    expect(formatMinutes(1450)).toBe('00:10')
  })

  it('pads output', () => {
    expect(formatMinutes(65)).toBe('01:05')
  })
})

describe('dates', () => {
  it('adds days across year end', () => {
    expect(addDays('20261231', 1)).toBe('20270101')
  })

  it('formats for display', () => {
    expect(formatDate('20261005', 'cs')).toBe('5. 10.')
    expect(formatDate('20261005', 'en')).toBe('5 Oct')
  })

  it('converts to and from ISO', () => {
    expect(toIsoDate('20261015')).toBe('2026-10-15')
    expect(fromIsoDate('2026-10-15')).toBe('20261015')
  })
})
