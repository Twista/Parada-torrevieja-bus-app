import { describe, expect, it } from 'vitest'
import { fixture, fixtureJson } from '../../fixtures/load'
import { buildStopIndex, cleanStopName, parseLineDirection, parseLines, parseSchedule, type RawLineDetail, type RawSchedules, type RawTrayectos } from './normalize'

describe('cleanStopName', () => {
  it('strips the town suffix with or without a space', () => {
    expect(cleanStopName('Hospital de Torrevieja, s/n _TRV')).toBe('Hospital de Torrevieja, s/n')
    expect(cleanStopName('Av. Tomas Boj Andreu, 3-65_TRV')).toBe('Av. Tomas Boj Andreu, 3-65')
  })
})

describe('parseLines', () => {
  it('reads all lines from the listing page', () => {
    const lines = parseLines(fixture('lineas.html'))
    expect(lines).toHaveLength(12)
    expect(lines[0]).toEqual({ id: '071', label: 'C', color: '#FF0000', name: 'Gregorio Marañón - E. Autobuses - Polideportivo - C.Salud Acequión' })
    expect(lines.find((l) => l.id === '081')?.label).toBe('01')
    expect(lines.find((l) => l.id === '082')?.name).toBe('Hospital - Los Balcones - Lago Jardín')
  })
})

describe('parseLineDirection', () => {
  it('normalizes stops and shape', () => {
    const d = parseLineDirection('081', 'I', fixtureJson<RawTrayectos>('trayectos-081-I.json'), fixtureJson<RawLineDetail>('detail-081-I.json'))
    expect(d.variants).toHaveLength(1)
    expect(d.variants[0].stops).toHaveLength(11)
    expect(d.variants[0].stops[0]).toEqual({ id: '82', name: 'Hospital de Torrevieja, s/n', lat: 37.9643, lng: -0.7173 })
    expect(d.variants[0].stops[10].id).toBe('110')
    expect(d.shape.length).toBeGreaterThan(0)
    expect(d.shape[0][0]).toEqual([-0.71735, 37.96435])
  })

  it('returns no variants for a missing direction of a circular line', () => {
    const d = parseLineDirection('071', 'V', fixtureJson<RawTrayectos>('trayectos-071-V.json'), {})
    expect(d).toEqual({ lineId: '071', dir: 'V', variants: [], shape: [] })
  })

  it('throws on an upstream error instead of returning an empty line', () => {
    expect(() => parseLineDirection('081', 'I', { error: 'Error de conexión con el API' }, {})).toThrow('Error de conexión')
    expect(() => parseLineDirection('081', 'I', { trayectos: [] }, { error: 'Error de conexión con el API' })).toThrow('Error de conexión')
  })

  it('drops empty shape segments', () => {
    const detail: RawLineDetail = { geojson: { features: [{ geometry: { type: 'MultiLineString', coordinates: [] } }] } }
    expect(parseLineDirection('01', 'I', { trayectos: [] }, detail).shape).toEqual([])
  })
})

describe('parseSchedule', () => {
  it('keys times by stop id', () => {
    const s = parseSchedule('081', 'I', '20261015', fixtureJson<RawSchedules>('schedules-081-I.json'))
    expect(s.lineId).toBe('081')
    expect(s.stops['753'].filter((t) => t.to === '110').slice(0, 2)).toEqual([
      { time: '07:22', to: '110' },
      { time: '07:42', to: '110' },
    ])
  })

  it('returns no stops on a day without service', () => {
    expect(parseSchedule('081', 'I', '20200101', fixtureJson<RawSchedules>('schedules-empty.json')).stops).toEqual({})
  })

  it('returns no stops when upstream reports no schedules for the date', () => {
    const raw: RawSchedules = { error: { 0: 'No se han encontrado horarios en la linea y fecha indicada' } }
    expect(parseSchedule('081', 'I', '20261015', raw).stops).toEqual({})
  })

  it('throws on an upstream connection error', () => {
    expect(() => parseSchedule('081', 'I', '20261015', { error: 'Error de conexión con el API' })).toThrow('Error de conexión')
  })
})

describe('buildStopIndex', () => {
  it('merges stops across lines and directions without duplicates', () => {
    const stop = { id: '82', name: 'Hospital', lat: 1, lng: 2 }
    const index = buildStopIndex([
      { lineId: '081', dir: 'I', shape: [], variants: [{ id: '1', name: '', stops: [stop] }, { id: '2', name: '', stops: [stop] }] },
      { lineId: '081', dir: 'V', shape: [], variants: [{ id: '3', name: '', stops: [stop] }] },
      { lineId: '082', dir: 'I', shape: [], variants: [{ id: '1', name: '', stops: [stop, { id: '9', name: 'X', lat: 3, lng: 4 }] }] },
    ])
    expect(index).toEqual([
      { ...stop, serves: [{ lineId: '081', dir: 'I' }, { lineId: '081', dir: 'V' }, { lineId: '082', dir: 'I' }] },
      { id: '9', name: 'X', lat: 3, lng: 4, serves: [{ lineId: '082', dir: 'I' }] },
    ])
  })
})
