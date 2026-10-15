import { describe, expect, it, vi } from 'vitest'
import { cachedJson, type CacheLike } from './cache'

class MemoryCache implements CacheLike {
  store = new Map<string, Response>()
  async match(req: Request) {
    return this.store.get(req.url)?.clone()
  }
  async put(req: Request, res: Response) {
    this.store.set(req.url, res)
  }
}

const KEY = 'https://example.com/api/lines'

describe('cachedJson', () => {
  it('produces and stores on a miss', async () => {
    const cache = new MemoryCache()
    const res = await cachedJson(cache, KEY, 60, async () => ({ a: 1 }), 1000)
    expect(await res.json()).toEqual({ a: 1 })
    expect(res.headers.get('x-stale')).toBe('0')
    expect(res.headers.get('x-fetched-at')).toBe('1000')
    expect(cache.store.has(KEY)).toBe(true)
  })

  it('serves a fresh hit without producing', async () => {
    const cache = new MemoryCache()
    await cachedJson(cache, KEY, 60, async () => ({ a: 1 }), 1000)
    const produce = vi.fn(async () => ({ a: 2 }))
    const res = await cachedJson(cache, KEY, 60, produce, 30_000)
    expect(produce).not.toHaveBeenCalled()
    expect(await res.json()).toEqual({ a: 1 })
  })

  it('refreshes an expired hit', async () => {
    const cache = new MemoryCache()
    await cachedJson(cache, KEY, 60, async () => ({ a: 1 }), 1000)
    const res = await cachedJson(cache, KEY, 60, async () => ({ a: 2 }), 120_000)
    expect(await res.json()).toEqual({ a: 2 })
    expect(res.headers.get('x-stale')).toBe('0')
  })

  it('falls back to the expired hit when upstream fails', async () => {
    const cache = new MemoryCache()
    await cachedJson(cache, KEY, 60, async () => ({ a: 1 }), 1000)
    const res = await cachedJson(cache, KEY, 60, async () => { throw new Error('down') }, 120_000)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ a: 1 })
    expect(res.headers.get('x-stale')).toBe('1')
    expect(res.headers.get('x-fetched-at')).toBe('1000')
  })

  it('returns 502 without any cached copy', async () => {
    const res = await cachedJson(new MemoryCache(), KEY, 60, async () => { throw new Error('down') }, 1000)
    expect(res.status).toBe(502)
  })
})
