import type { Dir } from '../../shared/types'
import { cachedJson } from '../lib/cache'
import { buildStopIndex, parseLineDirection, parseLines, parseSchedule, type RawLineDetail, type RawSchedules, type RawTrayectos } from '../lib/normalize'
import { fetchLinesHtml, fetchTask } from '../lib/upstream'

const DAY = 86400
const DIRS: Dir[] = ['I', 'V']

function isDir(value: string | undefined): value is Dir {
  return value === 'I' || value === 'V'
}

async function loadLines() {
  return parseLines(await fetchLinesHtml())
}

async function loadDirection(lineId: string, dir: Dir) {
  const [trayectos, detail] = await Promise.all([
    fetchTask('display.apiTrayectos', { lineId, sentido: dir }),
    fetchTask('display.apiLineDetail', { lineId, iv: dir }),
  ])
  return parseLineDirection(lineId, dir, trayectos as RawTrayectos, detail as RawLineDetail)
}

async function loadSchedule(lineId: string, dir: Dir, date: string) {
  return parseSchedule(lineId, dir, date, (await fetchTask('display.apiSchedules', { lineId, iv: dir, date })) as RawSchedules)
}

async function loadStopIndex() {
  const lines = await loadLines()
  const directions = await Promise.all(
    lines.flatMap((l) =>
      DIRS.map(async (dir) => parseLineDirection(l.id, dir, (await fetchTask('display.apiTrayectos', { lineId: l.id, sentido: dir })) as RawTrayectos, {})),
    ),
  )
  return buildStopIndex(directions)
}

export const onRequestGet: PagesFunction = async ({ request, params }) => {
  const url = new URL(request.url)
  const [resource, id, dir, sub] = (params.path as string[] | undefined) ?? []
  const cache = caches.default
  const validId = id !== undefined && /^[0-9A-Za-z]+$/.test(id)

  if (resource === 'lines' && id === undefined) return cachedJson(cache, url.href, DAY, loadLines)
  if (resource === 'lines' && validId && isDir(dir) && sub === undefined) return cachedJson(cache, url.href, DAY, () => loadDirection(id, dir))
  if (resource === 'lines' && validId && isDir(dir) && sub === 'schedule') {
    const date = url.searchParams.get('date') ?? ''
    if (!/^\d{8}$/.test(date)) return Response.json({ error: 'bad date' }, { status: 400 })
    return cachedJson(cache, url.href, DAY, () => loadSchedule(id, dir, date))
  }
  if (resource === 'stops' && id === undefined) return cachedJson(cache, url.href, DAY, loadStopIndex)
  return Response.json({ error: 'not found' }, { status: 404 })
}
