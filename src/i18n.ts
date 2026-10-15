import { createContext } from 'preact'
import { useContext } from 'preact/hooks'

export type Lang = 'cs' | 'en'

const cs = {
  locale: 'cs-CZ',
  subtitle: 'autobusy Torrevieja',
  stopsMap: 'Mapa zastávek',
  version: 'verze',
  nearby: 'Poblíž',
  loading: 'Načítám…',
  noData: 'Nejsou data, připoj se k síti.',
  offlineFrom: (when: string) => `Offline – data z ${when}`,
  nothingToday: 'Dnes už odsud nic nejede.',
  installTitle: 'Přidat Paradu na plochu',
  installIntro: 'Pak se otevírá jako aplikace a funguje i bez signálu.',
  installIos: ['Dole ťukni na ikonu Sdílet (čtvereček se šipkou nahoru).', 'Sjeď dolů a vyber „Přidat na plochu“.', 'Potvrď „Přidat“.'],
  installAndroid: ['Vpravo nahoře ťukni na ⋮.', 'Vyber „Přidat na plochu“ nebo „Instalovat aplikaci“.', 'Potvrď „Instalovat“.'],
  notFound: 'Stránka neexistuje.',
  backToLines: 'Zpět na linky',
  backToLine: 'Zpět na linku',
  line: (id: string) => `Linka ${id}`,
  outbound: 'Tam',
  inbound: 'Zpět',
  routeVariant: 'Varianta trasy',
  notRunning: ' (tento den nejede)',
  loop: 'Okruh',
  via: 'přes',
  towards: (name: string) => `Směr: ${name}`,
  ride: 'Jedu',
  departures: 'Odjezdy',
  today: 'dnes',
  fromStop: 'ze zastávky',
  terminalNotice: 'Konečná zastávka – odsud linka v tomto směru neodjíždí.',
  noService: 'Tento den linka nejezdí.',
  searching: 'Hledám…',
  findNextDay: 'Najít nejbližší den',
  stopsHeading: 'Zastávky',
  showOnMap: 'Ukázat na mapě',
  terminal: 'Konečná zastávka',
  allLinesAtStop: 'Všechny linky na zastávce ›',
  destPassed: (dest: string) => `Cíl ${dest} už je za tebou.`,
  getOffNext: (dest: string) => `Vystupuj na příští zastávce: ${dest}`,
  toDest: (dest: string, stops: string) => `Do cíle ${dest}: ${stops}`,
  noGps: 'GPS není dostupná – u zastávky, kde jsi, ťukni na „Jsem tady“.',
  offRoute: (m: number) => `Jsi mimo trasu linky (~${m} m).`,
  useGps: 'Použít GPS',
  tapDestination: 'Ťukni na zastávku, kde chceš vystoupit.',
  imHere: 'Jsem tady',
  stop: 'Zastávka',
  stopNotFound: 'Zastávka nenalezena.',
  nextDepartures: 'Nejbližší odjezdy',
  tapStopOnMap: 'Ťukni na zastávku na mapě.',
  stops: (n: number) => `${n} ${n === 1 ? 'zastávka' : n >= 2 && n <= 4 ? 'zastávky' : 'zastávek'}`,
}

export type Messages = typeof cs

const en: Messages = {
  locale: 'en-GB',
  subtitle: 'Torrevieja buses',
  stopsMap: 'Stop map',
  version: 'version',
  nearby: 'Nearby',
  loading: 'Loading…',
  noData: 'No data – connect to the internet.',
  offlineFrom: (when) => `Offline – data from ${when}`,
  nothingToday: 'No more departures from here today.',
  installTitle: 'Add Parada to your home screen',
  installIntro: 'It then opens like an app and works without signal.',
  installIos: ['Tap the Share icon at the bottom (square with an arrow).', 'Scroll down and choose “Add to Home Screen”.', 'Confirm “Add”.'],
  installAndroid: ['Tap ⋮ in the top right corner.', 'Choose “Add to Home screen” or “Install app”.', 'Confirm “Install”.'],
  notFound: 'Page not found.',
  backToLines: 'Back to lines',
  backToLine: 'Back to line',
  line: (id) => `Line ${id}`,
  outbound: 'Outbound',
  inbound: 'Return',
  routeVariant: 'Route variant',
  notRunning: ' (not running this day)',
  loop: 'Loop',
  via: 'via',
  towards: (name) => `Towards ${name}`,
  ride: 'On board',
  departures: 'Departures',
  today: 'today',
  fromStop: 'from',
  terminalNotice: 'Last stop – the line does not depart from here in this direction.',
  noService: 'No service on this day.',
  searching: 'Searching…',
  findNextDay: 'Find next service day',
  stopsHeading: 'Stops',
  showOnMap: 'Show on map',
  terminal: 'Last stop',
  allLinesAtStop: 'All lines at this stop ›',
  destPassed: (dest) => `You have passed ${dest}.`,
  getOffNext: (dest) => `Get off at the next stop: ${dest}`,
  toDest: (dest, stops) => `To ${dest}: ${stops}`,
  noGps: 'GPS unavailable – tap “I’m here” at the stop where you are.',
  offRoute: (m) => `You are off the route (~${m} m).`,
  useGps: 'Use GPS',
  tapDestination: 'Tap the stop where you want to get off.',
  imHere: 'I’m here',
  stop: 'Stop',
  stopNotFound: 'Stop not found.',
  nextDepartures: 'Next departures',
  tapStopOnMap: 'Tap a stop on the map.',
  stops: (n) => `${n} ${n === 1 ? 'stop' : 'stops'}`,
}

export const messages: Record<Lang, Messages> = { cs, en }

export function initialLang(saved: string | null, browser: string): Lang {
  if (saved === 'cs' || saved === 'en') return saved
  return /^(cs|sk)\b/i.test(browser) ? 'cs' : 'en'
}

export const I18n = createContext<{ lang: Lang; t: Messages; setLang: (lang: Lang) => void }>({ lang: 'cs', t: cs, setLang: () => {} })

export function useI18n() {
  return useContext(I18n)
}
