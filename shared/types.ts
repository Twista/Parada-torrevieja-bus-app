export type Dir = 'I' | 'V'

export interface Line {
  id: string
  label: string
  name: string
  color: string
}

export interface Stop {
  id: string
  name: string
  lat: number
  lng: number
}

export interface Variant {
  id: string
  name: string
  stops: Stop[]
}

export interface LineDirection {
  lineId: string
  dir: Dir
  variants: Variant[]
  shape: [number, number][][]
}

export interface StopTime {
  time: string
  to: string
}

export interface Schedule {
  lineId: string
  dir: Dir
  date: string
  stops: Record<string, StopTime[]>
}

export interface StopIndexEntry extends Stop {
  serves: { lineId: string; dir: Dir }[]
}
