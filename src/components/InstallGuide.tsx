import { useI18n } from '../i18n'

const standalone =
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

export function InstallGuide() {
  const { t } = useI18n()
  if (standalone) return null
  return (
    <details class="card install">
      <summary>{t.installTitle}</summary>
      <p>{t.installIntro}</p>
      <h3>iPhone (Safari)</h3>
      <ol>
        {t.installIos.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <h3>Android (Chrome)</h3>
      <ol>
        {t.installAndroid.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </details>
  )
}
