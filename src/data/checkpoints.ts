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
    id: 'machias-out',
    name: 'Machias',
    shortName: 'Machias',
    mile: 5.83,
    lat: 47.9820067,
    lng: -122.0480884,
  },
  {
    id: 'rhododendron-out',
    name: 'Rhododendron',
    shortName: 'Rhododendron',
    mile: 11.42,
    lat: 48.0455524,
    lng: -122.0835571,
  },
  {
    id: 'armar-out',
    name: 'Armar Road',
    shortName: 'Armar Rd',
    mile: 18.51,
    lat: 48.1349545,
    lng: -122.1403999,
  },
  {
    id: 'legion-out',
    name: 'Legion Memorial',
    shortName: 'Legion Memorial',
    mile: 22.98,
    lat: 48.1929397,
    lng: -122.1269524,
  },
  {
    id: 'bryant-out',
    name: 'Bryant',
    shortName: 'Bryant',
    mile: 27.00,
    lat: 48.2392449,
    lng: -122.1586994,
  },
  {
    id: 'redbarn',
    name: 'Red Barn — Turnaround',
    shortName: 'Red Barn',
    mile: 31.00,
    lat: 48.2908691,
    lng: -122.1974288,
  },
  // ── Return ────────────────────────────────────────────────────────────────
  {
    id: 'bryant-return',
    name: 'Bryant — Return',
    shortName: 'Bryant ↩',
    mile: 35.00,
    lat: 48.2392449,
    lng: -122.1586994,
  },
  {
    id: 'legion-return',
    name: 'Legion Memorial — Return',
    shortName: 'Legion Memorial ↩',
    mile: 39.02,
    lat: 48.1929397,
    lng: -122.1269524,
  },
  {
    id: 'armar-return',
    name: 'Armar Road — Return',
    shortName: 'Armar Rd ↩',
    mile: 43.49,
    lat: 48.1349545,
    lng: -122.1403999,
  },
  {
    id: 'rhododendron-return',
    name: 'Rhododendron — Return',
    shortName: 'Rhododendron ↩',
    mile: 50.58,
    lat: 48.0455524,
    lng: -122.0835571,
  },
  {
    id: 'machias-return',
    name: 'Machias — Return',
    shortName: 'Machias ↩',
    mile: 56.17,
    lat: 47.9820067,
    lng: -122.0480884,
  },
  {
    id: 'finish',
    name: 'Finish — Space 802, Snohomish',
    shortName: 'Finish',
    mile: 62.00,
    lat: 47.91109,
    lng: -122.0927,
  },
]

export const TOTAL_MILES = 62
