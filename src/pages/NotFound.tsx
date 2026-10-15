import { useI18n } from '../i18n'

export function NotFound() {
  const { t } = useI18n()
  return (
    <main>
      <p>{t.notFound}</p>
      <a href="/">{t.backToLines}</a>
    </main>
  )
}
