import { describe, expect, it } from 'vitest'
import { minutesBetween, shouldAlert, stopsLeft } from './ride'

describe('ride', () => {
  it('counts stops left to destination', () => {
    expect(stopsLeft(2, 6)).toBe(4)
  })

  it('alerts when the next stop is the destination or it was skipped', () => {
    expect(shouldAlert(2)).toBe(false)
    expect(shouldAlert(1)).toBe(true)
    expect(shouldAlert(0)).toBe(true)
  })

  it('computes minutes between trip stops', () => {
    expect(minutesBetween([440, 442, 450], 0, 2)).toBe(10)
    expect(minutesBetween([null, 442, null], 1, 2)).toBeNull()
  })
})
