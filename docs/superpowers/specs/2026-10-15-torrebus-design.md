# Torrebus – design

Datum: 2026-10-15

## Cíl

Mobilní web (PWA) pro městské autobusy v Torrevieji (Avanza, linky 071, 081–093), který:

- funguje přes mobilní data (oficiální web https://torrevieja.avanzagrupo.com/lineas je za bot ochranou Radware/ShieldSquare a z mobilních dat blokuje přístup),
- ukazuje odjezdy v detailu linky,
- ukazuje mapu trasy s polohou uživatele a pomáhá určit, kde vystoupit (i když nastoupí do „náhodného“ busu).

UI je česky. Názvy zastávek zůstávají španělsky (jak je vrací API).

## Mimo rozsah (v1)

- Real-time příjezdy (`apiEtas` existuje, ale vrací `Error de conexión con el API` a v konfiguraci Torrevieji je vypnuté).
- Plánování tras s přestupy.
- Offline podkladová mapa.
- Upozornění na pozadí (push).
- Více jazyků.

## Architektura

```
telefon (PWA, service worker + cache)
   │  stejná doména
   ▼
Cloudflare Pages ── statický frontend
   └─ Pages Function /api/*  ── proxy + edge cache ──► avanzagrupo JSON API
```

- Hosting: Cloudflare Pages na doméně uživatele (routování už existuje).
- Backend: jediná Pages Function `/api/*` – proxy na avanzagrupo s normalizací dat a edge cache (Cache API). Bez cronu, bez úložiště.
- Frontend: Vite + TypeScript + Preact + MapLibre GL, podklad OpenFreeMap (bez API klíče).
- Testy: Vitest.

### Riziko a fallback

Bot ochrana může blokovat i egress IP Cloudflare. První krok implementace je ověřit to testovací funkcí. Pokud neprojde: cron na VPS stáhne data a nahraje normalizované JSON do Cloudflare R2; `/api/*` pak čte z R2. Frontend se nemění.

## Zdrojové API (avanzagrupo)

Základ: `https://torrevieja.avanzagrupo.com/index.php?option=com_avanzainfo&task=<task>&...`, hlavička `Accept: application/json`.

| task | parametry | obsah |
|---|---|---|
| `display.apiTrayectos` | `lineId`, `sentido` (`I`/`V`) | trajekty, zastávky v pořadí (`codigo`, `nombre`, `coordinates` [lng, lat] jako stringy, `enlaces` = návazné linky) |
| `display.apiLineDetail` | `lineId`, `iv` (`I`/`V`) | `geojson` FeatureCollection – `MultiLineString` trasy (+ případně `Point` zastávek) |
| `display.apiSchedulesCabecera` | `lineId`, `iv`, `date` (`YYYYMMDD`) | odjezdy z výchozích zastávek (`hora`, `desde`, `hasta`, `trayecto`) |
| `display.apiSchedules` | `lineId`, `iv`, `date` | časy na všech zastávkách, `paradas.P_<kód>` |

Seznam linek (id, název, barva) se parsuje z HTML stránky `/lineas`. Když pro datum nejsou jízdní řády, API vrací `{"error": {...}}`.

## Naše API (Pages Function)

| Endpoint | Zdroj | Edge cache |
|---|---|---|
| `GET /api/lines` | HTML `/lineas` | 24 h |
| `GET /api/lines/:id/:dir` | `apiTrayectos` + `apiLineDetail` | 24 h |
| `GET /api/lines/:id/:dir/schedule?date=YYYYMMDD` | `apiSchedules` | 24 h (klíč obsahuje datum) |
| `GET /api/stops` | index všech zastávek složený z `apiTrayectos` všech linek a směrů (zastávka → které linky/směry ji obsluhují) | 24 h |

`:dir` je `I` nebo `V`. Detail zastávky a „Poblíž“ se počítají na klientovi z `/api/stops` + jízdních řádů linek.

### Poznatky o datech

- Linka může mít ve směru víc variant trasy (`trayectos`, např. 071 má 5). Detail linky má výběr varianty, výchozí je první.
- Okružní linky (071 „C“) mají jen směr `I`; směr `V` vrací prázdné `trayectos` → přepínač směru se skryje.
- `apiSchedules` pro `iv=I` vrací časy i pro zastávky opačného směru. Časy zastávky pro variantu = položky `paradas.P_<zastávka>`, kde `hasta` == poslední zastávka varianty.
- Časy na zastávkách nejsou propojené ID spoje. Spoj se skládá řetězením: čas na další zastávce = první čas ≥ čas na předchozí zastávce.
- Na konečné zastávce varianty (`desde == hasta`) API neuvádí čas příjezdu, ale čas odjezdu spoje z výchozí zastávky. Čas příjezdu na konečnou se proto odhaduje z předchozí zastávky a vzdálenosti (15 km/h vzdušnou čarou, min. 1 min). Výjimka: okružní linka, kde konečná == výchozí – tam jsou to platné odjezdy.
- Pro minulé dny i dny bez provozu vrací `apiSchedules` `{"cabecera":[],"paradas":[]}`.
- Názvy zastávek mají příponu ` _TRV` – odstraňuje se.
- Všechny linky mají v HTML barvu `#FF0000`, zobrazované číslo je badge (`C`, `01`…`08`, `N1`…`N3`), ID je `071`, `081`…. Odpovědi jsou v našem normalizovaném formátu (čísla místo stringů u souřadnic, jednotné názvy polí). Když upstream selže a v cache je starší odpověď, vrátí se ta s hlavičkou/příznakem `stale`. Když nejsou jízdní řády na dané datum, vrátí se prázdný seznam (ne chyba).

## Obrazovky

1. **Domů**
   - Karta „Poblíž“: nejbližší zastávky podle GPS a nejbližší odjezdy z nich.
   - Seznam linek (barva, číslo, název).
2. **Detail linky**
   - Přepínač směru (tam/zpět).
   - Nejbližší odjezdy (minulé zašedlé), možnost zvolit jiný den.
   - Mapa trasy se zastávkami.
   - Seznam zastávek („teploměr“); ťuknutí na zastávku ukáže časy pro ni.
   - Tlačítko „Jedu“.
3. **Režim „Jedu“**
   - Mapa sleduje GPS polohu; určí se pozice na trase a poslední projetá zastávka.
   - Zvýrazněné další zastávky s očekávanými časy (z `apiSchedules` podle nejbližšího spoje).
   - Ťuknutím se nastaví cílová zastávka: „ještě N zastávek, ~M min“; jednu zastávku před cílem vibrace + výrazný banner (jen při otevřené obrazovce).
   - Obrazovka se drží rozsvícená (Wake Lock API), aby upozornění fungovalo.
   - Poloha na trase = nejbližší úsek mezi po sobě jdoucími zastávkami (přímka); dál než 300 m = „mimo trasu“. Hledá se od posledního známého úseku −1 (kvůli okružním linkám).
   - Bez GPS: ruční výběr aktuální zastávky („Jsem tady“).
4. **Detail zastávky**
   - Linky, které tu staví, a jejich nejbližší odjezdy.

## Offline / PWA

- Manifest + service worker, instalovatelné na plochu.
- Statické soubory: precache.
- `/api/*`: stale-while-revalidate. Po otevření detailu linky se předem stáhne i jízdní řád na zítřek.
- Bez sítě: zobrazit poslední data s informací o jejich stáří. Podkladová mapa se nenačte, ale trasa, zastávky a poloha ano.

## Zpracování chyb

- Bez sítě a bez cache: „Nejsou data, připoj se k síti“.
- Bez GPS / zamítnuté oprávnění: „Poblíž“ se skryje, „Jedu“ přejde na ruční výběr zastávky.
- Bez jízdních řádů na den: „Dnes nejezdí“ + nabídka nejbližšího dne, kdy linka jede.

## Testy

- Vitest: normalizace odpovědí v proxy (fixtures = uložené reálné odpovědi API).
- Vitest: logika „Jedu“ – projekce polohy na trasu, poslední projetá zastávka, odhad času do cíle.
- Ruční test na telefonu přes mobilní data.

## Pořadí prací

1. Spike: ověřit, že Cloudflare Function projde bot ochranou avanzagrupo.
2. Proxy (`/api/*`) s normalizací a cache.
3. Seznam linek + detail linky (odjezdy, zastávky).
4. Mapa (MapLibre + OpenFreeMap).
5. Režim „Jedu“.
6. PWA + offline.
