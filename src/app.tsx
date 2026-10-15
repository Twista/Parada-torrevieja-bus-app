import { useEffect, useState } from 'preact/hooks'
import { LocationProvider, Route, Router } from 'preact-iso'
import { LangSwitch } from './components/LangSwitch'
import { I18n, initialLang, messages, type Lang } from './i18n'
import { Home } from './pages/Home'
import { LinePage } from './pages/LinePage'
import { MapPage } from './pages/MapPage'
import { NotFound } from './pages/NotFound'
import { RidePage } from './pages/RidePage'
import { StopPage } from './pages/StopPage'

export function App() {
  const [lang, setLangState] = useState<Lang>(() => initialLang(localStorage.getItem('lang'), navigator.language))

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  function setLang(next: Lang) {
    localStorage.setItem('lang', next)
    setLangState(next)
  }

  return (
    <I18n.Provider value={{ lang, t: messages[lang], setLang }}>
      <LocationProvider>
        <LangSwitch />
        <Router>
          <Route path="/" component={Home} />
          <Route path="/linka/:id" component={LinePage} />
          <Route path="/linka/:id/:dir/jedu" component={RidePage} />
          <Route path="/mapa" component={MapPage} />
          <Route path="/zastavka/:id" component={StopPage} />
          <Route default component={NotFound} />
        </Router>
      </LocationProvider>
    </I18n.Provider>
  )
}
