const BASE = 'https://torrevieja.avanzagrupo.com'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Accept-Language': 'es-ES,es;q=0.9',
}

export async function fetchTask(task: string, params: Record<string, string>): Promise<unknown> {
  const qs = new URLSearchParams({ option: 'com_avanzainfo', task, ...params })
  const res = await fetch(`${BASE}/index.php?${qs}`, { headers: { ...HEADERS, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`upstream HTTP ${res.status}`)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('upstream returned non-JSON')
  }
}

export async function fetchLinesHtml(): Promise<string> {
  const res = await fetch(`${BASE}/lineas`, { headers: HEADERS })
  if (!res.ok) throw new Error(`upstream HTTP ${res.status}`)
  const html = await res.text()
  if (!html.includes('avanzainfo-line-item')) throw new Error('upstream returned unexpected HTML')
  return html
}
