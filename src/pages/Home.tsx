import { api } from '../api'
import { LineBadge } from '../components/LineBadge'
import { Status } from '../components/Status'
import { useAsync } from '../lib/useAsync'

export function Home() {
  const lines = useAsync(api.lines, [])
  return (
    <main>
      <header class="bar">
        <h1>Torrebus</h1>
      </header>
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
    </main>
  )
}
