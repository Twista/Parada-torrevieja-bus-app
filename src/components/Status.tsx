import { isOutdated } from '../api'
import { useI18n } from '../i18n'

interface Props {
  loading: boolean
  error?: unknown
  stale?: boolean
  fetchedAt?: number
}

export function Status({ loading, error, stale, fetchedAt }: Props) {
  const { t } = useI18n()
  if (error) return <p class="notice">{t.noData}</p>
  if (loading) return <p class="muted">{t.loading}</p>
  if (fetchedAt && (!navigator.onLine || isOutdated({ stale: !!stale, fetchedAt }))) {
    const when = new Date(fetchedAt).toLocaleString(t.locale, { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
    return <p class="notice">{t.offlineFrom(when)}</p>
  }
  return null
}
