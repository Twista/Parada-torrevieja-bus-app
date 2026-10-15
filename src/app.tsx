import { LocationProvider, Route, Router } from 'preact-iso'
import { Home } from './pages/Home'
import { LinePage } from './pages/LinePage'
import { MapPage } from './pages/MapPage'
import { NotFound } from './pages/NotFound'
import { RidePage } from './pages/RidePage'
import { StopPage } from './pages/StopPage'

export function App() {
  return (
    <LocationProvider>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/linka/:id" component={LinePage} />
        <Route path="/linka/:id/:dir/jedu" component={RidePage} />
        <Route path="/mapa" component={MapPage} />
        <Route path="/zastavka/:id" component={StopPage} />
        <Route default component={NotFound} />
      </Router>
    </LocationProvider>
  )
}
