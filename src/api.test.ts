import { describe, expect, it } from 'vitest'
import { isOutdated } from './api'

const HOUR = 3600_000

describe('isOutdated', () => {
  it('trusts the edge stale flag', () => {
    expect(isOutdated({ stale: true, fetchedAt: 10 * HOUR }, 10 * HOUR)).toBe(true)
  })

  it('flags data older than the edge cache lifetime even without the flag', () => {
    expect(isOutdated({ stale: false, fetchedAt: 0 }, 27 * HOUR)).toBe(true)
  })

  it('accepts recent data', () => {
    expect(isOutdated({ stale: false, fetchedAt: 0 }, 20 * HOUR)).toBe(false)
  })
})
