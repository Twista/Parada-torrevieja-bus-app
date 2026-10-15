import { api } from '../api'
import { LineBadge } from '../components/LineBadge'
import { InstallGuide } from '../components/InstallGuide'
import { Nearby } from '../components/Nearby'
import { Status } from '../components/Status'
import { useAsync } from '../lib/useAsync'

export function Home() {
  const lines = useAsync(api.lines, [])
  return (
    <main>
      <header class="bar">
        <h1>
          Parada <span class="subtitle">autobusy Torrevieja</span>
        </h1>
      </header>
      <Nearby />
      <a class="button secondary icon-button" href="/mapa">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
          <path d="M9 4v14M15 6v14" />
        </svg>
        Mapa zastávek
      </a>
      <Status loading={lines.loading} error={lines.error} stale={lines.data?.stale} fetchedAt={lines.data?.fetchedAt} />
      <ul class="lines">
        {lines.data?.data.map((l) => (
          <li key={l.id}>
            <a href={`/linka/${l.id}`}>
              <LineBadge line={l} />
              <span>{l.name}</span>
            </a>
          </li>
        ))}
      </ul>
      <InstallGuide />
      <footer class="footer muted">
        verze {__APP_VERSION__} · <a href="https://twista.cz">twista.cz</a>
      </footer>
    </main>
  )
}
