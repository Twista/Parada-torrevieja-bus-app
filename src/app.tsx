import { LocationProvider, Route, Router } from 'preact-iso'
import { Home } from './pages/Home'
import { LinePage } from './pages/LinePage'
import { NotFound } from './pages/NotFound'

export function App() {
  return (
    <LocationProvider>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/linka/:id" component={LinePage} />
        <Route default component={NotFound} />
      </Router>
    </LocationProvider>
  )
}
