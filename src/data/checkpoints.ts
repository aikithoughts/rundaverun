export interface Checkpoint {
  id: string
  name: string
  shortName: string
  mile: number        // outbound mile marker
  returnMile: number  // inbound mile marker (62 - mile for out-and-back)
  lat: number
  lng: number
}

export const CHECKPOINTS: Checkpoint[] = [
  {
    id: 'start',
    name: 'Start — Space 802, Snohomish',
    shortName: 'Start',
    mile: 0,
    returnMile: 62,
    lat: 47.91109,
    lng: -122.0927,
  },
  {
    id: 'three-lakes',
    name: 'Three Lakes Rd',
    shortName: 'Three Lakes Rd',
    mile: 2.4,
    returnMile: 59.6,
    lat: 47.93416,
    lng: -122.0761597,
  },
  {
    id: 'dubuque',
    name: 'Dubuque Rd',
    shortName: 'Dubuque Rd',
    mile: 5.5,
    returnMile: 56.5,
    lat: 47.9515499,
    lng: -122.0721188,
  },
  {
    id: 'hwy92',
    name: 'Hwy 92 Trailhead',
    shortName: 'Hwy 92 TH',
    mile: 9.9,
    returnMile: 52.5,
    lat: 48.0310606,
    lng: -122.057497,
  },
  {
    id: 'getchell',
    name: 'Getchell Trailhead',
    shortName: 'Getchell TH',
    mile: 12.6,
    returnMile: 49.4,
    lat: 48.0574106,
    lng: -122.0915607,
  },
  {
    id: 'wade',
    name: 'Wade Rd',
    shortName: 'Wade Rd',
    mile: 17.1,
    returnMile: 44.9,
    lat: 48.1160203,
    lng: -122.1398111,
  },
  {
    id: 'lebanon',
    name: 'Lebanon St (Stanley)',
    shortName: 'Lebanon St',
    mile: 22.4,
    returnMile: 39.6,
    lat: 48.1838895,
    lng: -122.1372757,
  },
  {
    id: 'turnaround',
    name: 'Turnaround — Nakashima Barn, Arlington',
    shortName: 'Turnaround',
    mile: 31.0,
    returnMile: 31.0,
    lat: 48.29214,
    lng: -122.1972892,
  },
]

export const TOTAL_MILES = 62
