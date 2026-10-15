export interface CacheLike {
  match(req: Request): Promise<Response | undefined>
  put(req: Request, res: Response): Promise<void>
}

const KEEP_SECONDS = 14 * 86400

function respond(res: Response, stale: boolean): Response {
  const out = new Response(res.body, res)
  out.headers.set('x-stale', stale ? '1' : '0')
  out.headers.set('cache-control', 'no-cache')
  return out
}

export async function cachedJson(
  cache: CacheLike,
  key: string,
  ttlSeconds: number,
  produce: () => Promise<unknown>,
  now = Date.now(),
): Promise<Response> {
  const req = new Request(key)
  const hit = await cache.match(req)
  const fetchedAt = Number(hit?.headers.get('x-fetched-at') ?? 0)
  if (hit && now - fetchedAt < ttlSeconds * 1000) return respond(hit, false)
  try {
    const res = new Response(JSON.stringify(await produce()), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': `public, max-age=${KEEP_SECONDS}`,
        'x-fetched-at': String(now),
      },
    })
    await cache.put(req, res.clone())
    return respond(res, false)
  } catch (err) {
    if (hit) return respond(hit, true)
    return Response.json({ error: String(err) }, { status: 502 })
  }
}
