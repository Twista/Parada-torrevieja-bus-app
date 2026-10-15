import { LngLatBounds, Map as MapLibreMap, Popup, setWorkerUrl, type GeoJSONSource, type MapLayerMouseEvent, type MapOptions } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { useEffect, useRef } from 'preact/hooks'
import type { Stop } from '../../shared/types'
import type { LatLng } from '../lib/geo'

setWorkerUrl(workerUrl)

interface Props {
  shape: [number, number][][]
  stops: Stop[]
  color: string
  user?: LatLng | null
  highlightStopId?: string | null
  follow?: boolean
  onStopClick?: (stopId: string) => void
  stopPopup?: (stopId: string) => string
  focus?: { stopId: string } | null
}

type StyleSpecification = Exclude<MapOptions['style'], string | undefined>

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'
const BLANK: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#eef0f2' } }],
}

async function loadStyle(): Promise<StyleSpecification | string> {
  try {
    const res = await fetch(STYLE_URL)
    if (!res.ok) return BLANK
    return (await res.json()) as StyleSpecification
  } catch {
    return BLANK
  }
}

function routeData(shape: [number, number][][], stops: Stop[]): GeoJSON.FeatureCollection {
  const lines = shape.length ? shape : stops.length > 1 ? [stops.map((s) => [s.lng, s.lat])] : []
  return {
    type: 'FeatureCollection',
    features: lines.map((coordinates) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } })),
  }
}

function stopsData(stops: Stop[], highlight?: string | null): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: stops.map((s) => ({
      type: 'Feature',
      properties: { id: s.id, highlight: s.id === highlight },
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
    })),
  }
}

function userData(user?: LatLng | null): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: user ? [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [user.lng, user.lat] } }] : [],
  }
}

function fit(map: MapLibreMap, stops: Stop[]) {
  if (!stops.length) return
  const bounds = new LngLatBounds()
  stops.forEach((s) => bounds.extend([s.lng, s.lat]))
  map.fitBounds(bounds, { padding: 40, duration: 0, maxZoom: 16 })
}

function source(map: MapLibreMap, id: string): GeoJSONSource | undefined {
  return map.getSource(id) as GeoJSONSource | undefined
}

export function MapView({ shape, stops, color, user, highlightStopId, follow, onStopClick, stopPopup, focus }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const popup = useRef<Popup | null>(null)
  const latest = useRef({ shape, stops, user, highlightStopId, onStopClick, stopPopup })
  latest.current = { shape, stops, user, highlightStopId, onStopClick, stopPopup }

  function showPopup(map: MapLibreMap, stopId: string) {
    const stop = latest.current.stops.find((s) => s.id === stopId)
    const text = latest.current.stopPopup?.(stopId)
    popup.current?.remove()
    if (!stop || !text) return
    popup.current = new Popup({ closeButton: false, offset: 12 }).setLngLat([stop.lng, stop.lat]).setText(text).addTo(map)
  }

  useEffect(() => {
    let cancelled = false
    let map: MapLibreMap | null = null
    loadStyle().then((style) => {
      if (cancelled || !container.current) return
      map = new MapLibreMap({ container: container.current, style, center: [-0.6821, 37.9786], zoom: 13, attributionControl: { compact: true } })
      map.on('load', () => {
        if (!map) return
        const p = latest.current
        map.addSource('route', { type: 'geojson', data: routeData(p.shape, p.stops) })
        map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': 5, 'line-opacity': 0.8 } })
        map.addSource('stops', { type: 'geojson', data: stopsData(p.stops, p.highlightStopId) })
        map.addLayer({
          id: 'stops',
          type: 'circle',
          source: 'stops',
          paint: {
            'circle-radius': ['case', ['get', 'highlight'], 10, 6],
            'circle-color': ['case', ['get', 'highlight'], color, '#ffffff'],
            'circle-stroke-color': color,
            'circle-stroke-width': 3,
          },
        })
        map.addSource('user', { type: 'geojson', data: userData(p.user) })
        map.addLayer({ id: 'user', type: 'circle', source: 'user', paint: { 'circle-radius': 8, 'circle-color': '#1e6ff5', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 } })
        map.on('click', 'stops', (e: MapLayerMouseEvent) => {
          const id = e.features?.[0]?.properties?.id
          if (id === undefined || !map) return
          latest.current.onStopClick?.(String(id))
          showPopup(map, String(id))
        })
        fit(map, p.stops)
        mapRef.current = map
      })
    })
    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    popup.current?.remove()
    source(map, 'route')?.setData(routeData(shape, stops))
    source(map, 'stops')?.setData(stopsData(stops, latest.current.highlightStopId))
    fit(map, stops)
  }, [shape, stops])

  useEffect(() => {
    const map = mapRef.current
    if (map) source(map, 'stops')?.setData(stopsData(latest.current.stops, highlightStopId))
  }, [highlightStopId])

  useEffect(() => {
    const map = mapRef.current
    const stop = focus && stops.find((s) => s.id === focus.stopId)
    if (!map || !focus || !stop) return
    map.easeTo({ center: [stop.lng, stop.lat], zoom: Math.max(map.getZoom(), 15) })
    showPopup(map, stop.id)
  }, [focus])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    source(map, 'user')?.setData(userData(user))
    if (follow && user) map.easeTo({ center: [user.lng, user.lat], zoom: Math.max(map.getZoom(), 15) })
  }, [user?.lat, user?.lng, follow])

  return <div class="map" ref={container} />
}
