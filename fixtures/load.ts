import { readFileSync } from 'node:fs'

export function fixture(name: string): string {
  return readFileSync(new URL(`./${name}`, import.meta.url), 'utf8')
}

export function fixtureJson<T>(name: string): T {
  return JSON.parse(fixture(name)) as T
}
