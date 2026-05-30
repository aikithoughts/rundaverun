export interface Checkpoint {
  id: string
  name: string
  shortName: string
  mile: number  // total distance covered at this checkpoint
  lat: number
  lng: number
}

export const CHECKPOINTS: Checkpoint[] = [
  // ── Outbound ──────────────────────────────────────────────────────────────
  {
    id: 'start',
    name: 'Start — Space 802, Snohomish',
    shortName: 'Start',
    mile: 0,
    lat: 47.91109,
    lng: -122.0927,
  },
  {
    id: 'three-lakes-out',
    name: 'Three Lakes Rd',
    shortName: 'Three Lakes Rd',
    mile: 2.4,
    lat: 47.93416,
    lng: -122.0761597,
  },
  {
    id: 'dubuque-out',
    name: 'Dubuque Rd',
    shortName: 'Dubuque Rd',
    mile: 5.5,
    lat: 47.9515499,
    lng: -122.0721188,
  },
  {
    id: 'hwy92-out',
    name: 'Hwy 92 Trailhead',
    shortName: 'Hwy 92 TH',
    mile: 9.9,
    lat: 48.0310606,
    lng: -122.057497,
  },
  {
    id: 'getchell-out',
    name: 'Getchell Trailhead',
    shortName: 'Getchell TH',
    mile: 12.6,
    lat: 48.0574106,
    lng: -122.0915607,
  },
  {
    id: 'wade-out',
    name: 'Wade Rd',
    shortName: 'Wade Rd',
    mile: 17.1,
    lat: 48.1160203,
    lng: -122.1398111,
  },
  {
    id: 'lebanon-out',
    name: 'Lebanon St (Stanley)',
    shortName: 'Lebanon St',
    mile: 22.4,
    lat: 48.1838895,
    lng: -122.1372757,
  },
  {
    id: 'turnaround',
    name: 'Turnaround — Nakashima Barn, Arlington',
    shortName: 'Turnaround',
    mile: 31.0,
    lat: 48.29214,
    lng: -122.1972892,
  },
  // ── Return ────────────────────────────────────────────────────────────────
  {
    id: 'lebanon-return',
    name: 'Lebanon St — Return',
    shortName: 'Lebanon St ↩',
    mile: 39.6,
    lat: 48.1838895,
    lng: -122.1372757,
  },
  {
    id: 'wade-return',
    name: 'Wade Rd — Return',
    shortName: 'Wade Rd ↩',
    mile: 44.9,
    lat: 48.1160203,
    lng: -122.1398111,
  },
  {
    id: 'getchell-return',
    name: 'Getchell Trailhead — Return',
    shortName: 'Getchell TH ↩',
    mile: 49.4,
    lat: 48.0574106,
    lng: -122.0915607,
  },
  {
    id: 'hwy92-return',
    name: 'Hwy 92 Trailhead — Return',
    shortName: 'Hwy 92 TH ↩',
    mile: 52.5,
    lat: 48.0310606,
    lng: -122.057497,
  },
  {
    id: 'dubuque-return',
    name: 'Dubuque Rd — Return',
    shortName: 'Dubuque Rd ↩',
    mile: 56.5,
    lat: 47.9515499,
    lng: -122.0721188,
  },
  {
    id: 'three-lakes-return',
    name: 'Three Lakes Rd — Return',
    shortName: 'Three Lakes Rd ↩',
    mile: 59.6,
    lat: 47.93416,
    lng: -122.0761597,
  },
  {
    id: 'finish',
    name: 'Finish — Space 802, Snohomish',
    shortName: 'Finish',
    mile: 62,
    lat: 47.91109,
    lng: -122.0927,
  },
]

export const TOTAL_MILES = 62
