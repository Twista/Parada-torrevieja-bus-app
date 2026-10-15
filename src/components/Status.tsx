interface Props {
  loading: boolean
  error?: unknown
  stale?: boolean
  fetchedAt?: number
}

export function Status({ loading, error, stale, fetchedAt }: Props) {
  if (error) return <p class="notice">Nejsou data, připoj se k síti.</p>
  if (loading) return <p class="muted">Načítám…</p>
  if ((stale || !navigator.onLine) && fetchedAt) {
    const when = new Date(fetchedAt).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
    return <p class="notice">Offline – data z {when}</p>
  }
  return null
}
