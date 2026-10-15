import { useI18n, type Lang } from '../i18n'

const LANGS: Lang[] = ['cs', 'en']

export function LangSwitch() {
  const { lang, setLang } = useI18n()
  return (
    <div class="lang-switch">
      {LANGS.map((l) => (
        <button key={l} class={l === lang ? 'active' : ''} onClick={() => setLang(l)}>
          {l === 'cs' ? 'CZ' : 'EN'}
        </button>
      ))}
    </div>
  )
}
