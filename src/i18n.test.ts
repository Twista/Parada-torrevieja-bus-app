import { describe, expect, it } from 'vitest'
import { initialLang, messages } from './i18n'

describe('stops count', () => {
  it('declines Czech plural', () => {
    expect(messages.cs.stops(1)).toBe('1 zastávka')
    expect(messages.cs.stops(3)).toBe('3 zastávky')
    expect(messages.cs.stops(5)).toBe('5 zastávek')
  })

  it('uses English plural', () => {
    expect(messages.en.stops(1)).toBe('1 stop')
    expect(messages.en.stops(4)).toBe('4 stops')
  })
})

describe('initialLang', () => {
  it('prefers a saved choice', () => {
    expect(initialLang('en', 'cs-CZ')).toBe('en')
  })

  it('uses Czech for Czech and Slovak browsers', () => {
    expect(initialLang(null, 'cs-CZ')).toBe('cs')
    expect(initialLang(null, 'sk')).toBe('cs')
  })

  it('falls back to English otherwise', () => {
    expect(initialLang(null, 'es-ES')).toBe('en')
    expect(initialLang('xx', 'de')).toBe('en')
  })
})
