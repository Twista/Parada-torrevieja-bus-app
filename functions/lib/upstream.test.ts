import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchLinesHtml, fetchTask } from './upstream'

afterEach(() => vi.unstubAllGlobals())

describe('fetchTask', () => {
  it('parses JSON and sends the task in the query', async () => {
    const fetchMock = vi.fn(async () => new Response('{"trayectos":[]}'))
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchTask('display.apiTrayectos', { lineId: '081', sentido: 'I' })).resolves.toEqual({ trayectos: [] })
    expect(String(fetchMock.mock.calls[0][0])).toContain('task=display.apiTrayectos&lineId=081&sentido=I')
  })

  it('rejects a captcha page', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>captcha</html>')))
    await expect(fetchTask('display.apiTrayectos', {})).rejects.toThrow('non-JSON')
  })

  it('rejects HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 403 })))
    await expect(fetchTask('display.apiTrayectos', {})).rejects.toThrow('403')
  })
})

describe('fetchLinesHtml', () => {
  it('rejects HTML without the line list', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>captcha</html>')))
    await expect(fetchLinesHtml()).rejects.toThrow('unexpected HTML')
  })
})
