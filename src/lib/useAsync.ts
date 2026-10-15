import { useEffect, useState } from 'preact/hooks'

export interface AsyncState<T> {
  data?: T
  error?: unknown
  loading: boolean
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ loading: true })
  useEffect(() => {
    let alive = true
    setState((s) => ({ data: s.data, loading: true }))
    fn().then(
      (data) => alive && setState({ data, loading: false }),
      (error) => alive && setState({ error, loading: false }),
    )
    return () => {
      alive = false
    }
  }, deps)
  return state
}
