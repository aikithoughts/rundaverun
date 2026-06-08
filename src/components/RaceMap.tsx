'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import { ICheckIn } from '@/types/race'
import { CHECKPOINTS } from '@/data/checkpoints'
import 'leaflet/dist/leaflet.css'

// Outbound route coordinates (start → turnaround)
const OUTBOUND_COORDS: [number, number][] = [
  [47.91109, -122.0927],
  [47.91301, -122.08759],
  [47.91862, -122.08681],
  [47.92183, -122.08429],
  [47.93416, -122.07616],
  [47.94029, -122.07555],
  [47.94474, -122.07473],
  [47.95155, -122.07212],
  [47.97824, -122.05619],
  [47.97988, -122.05257],
  [47.98927, -122.04265],
  [48.00065, -122.0393],
  [48.00386, -122.04135],
  [48.00779, -122.0440],
  [48.01194, -122.04755],
  [48.02277, -122.05424],
  [48.03106, -122.05750],
  [48.03470, -122.06550],
  [48.04089, -122.08117],
  [48.04920, -122.08744],
  [48.05741, -122.09156],
  [48.06239, -122.09326],
  [48.06674, -122.09620],
  [48.07175, -122.10182],
  [48.07498, -122.10559],
  [48.08079, -122.11205],
  [48.08333, -122.11409],
  [48.08604, -122.11625],
  [48.08874, -122.11900],
  [48.09229, -122.12234],
  [48.09473, -122.12392],
  [48.09682, -122.12790],
  [48.09783, -122.12928],
  [48.09931, -122.13029],
  [48.10245, -122.13308],
  [48.10650, -122.13628],
  [48.10870, -122.13757],
  [48.11117, -122.13899],
  [48.11370, -122.13965],
  [48.11602, -122.13981],
  [48.11851, -122.13979],
  [48.12146, -122.14025],
  [48.12455, -122.13923],
  [48.12924, -122.13711],
  [48.13129, -122.13688],
  [48.13430, -122.13714],
  [48.13550, -122.13759],
  [48.13767, -122.13823],
  [48.13995, -122.13892],
  [48.14236, -122.13971],
  [48.14441, -122.14021],
  [48.14609, -122.14041],
  [48.14889, -122.14060],
  [48.15306, -122.14045],
  [48.15651, -122.14043],
  [48.15747, -122.14042],
  [48.15851, -122.14045],
  [48.15917, -122.14046],
  [48.16055, -122.14049],
  [48.16256, -122.14049],
  [48.16476, -122.14044],
  [48.16574, -122.14044],
  [48.16784, -122.14039],
  [48.16926, -122.14043],
  [48.16994, -122.14049],
  [48.17105, -122.14067],
  [48.17204, -122.14065],
  [48.17332, -122.14060],
  [48.17442, -122.14056],
  [48.17550, -122.14053],
  [48.17681, -122.14049],
  [48.17928, -122.14045],
  [48.18016, -122.14036],
  [48.18113, -122.13800],
  [48.18285, -122.13754],
  [48.18389, -122.13728],
  [48.18456, -122.13705],
  [48.18567, -122.13625],
  [48.18662, -122.13517],
  [48.18741, -122.13387],
  [48.18832, -122.13230],
  [48.18904, -122.13116],
  [48.18998, -122.12973],
  [48.19067, -122.12869],
  [48.19120, -122.12785],
  [48.19217, -122.12730],
  [48.19332, -122.12726],
  [48.19520, -122.12743],
  [48.19556, -122.12746],
  [48.19676, -122.12747],
  [48.19787, -122.12736],
  [48.19906, -122.12733],
  [48.19985, -122.12723],
  [48.20069, -122.12740],
  [48.20162, -122.12728],
  [48.20265, -122.12761],
  [48.20390, -122.12830],
  [48.20493, -122.12886],
  [48.20646, -122.12968],
  [48.20794, -122.13048],
  [48.20957, -122.13140],
  [48.21157, -122.13225],
  [48.21289, -122.13206],
  [48.21335, -122.13182],
  [48.21422, -122.13119],
  [48.21485, -122.13085],
  [48.21687, -122.13146],
  [48.21771, -122.13274],
  [48.21845, -122.13404],
  [48.22008, -122.13717],
  [48.22230, -122.14091],
  [48.22602, -122.14429],
  [48.22911, -122.14762],
  [48.23108, -122.15028],
  [48.23393, -122.15410],
  [48.23780, -122.15777],
  [48.24017, -122.15931],
  [48.24278, -122.16101],
  [48.24587, -122.16304],
  [48.24942, -122.16536],
  [48.25183, -122.16691],
  [48.25365, -122.16808],
  [48.25536, -122.16922],
  [48.25712, -122.17037],
  [48.26028, -122.17242],
  [48.26215, -122.17273],
  [48.26347, -122.17280],
  [48.26465, -122.17355],
  [48.26653, -122.17508],
  [48.26780, -122.17613],
  [48.27007, -122.17804],
  [48.27201, -122.18032],
  [48.27370, -122.18257],
  [48.27510, -122.18445],
  [48.27733, -122.18761],
  [48.28816, -122.19711],
  [48.29214, -122.19729],
]

// Full out-and-back route: outbound + return (outbound reversed, turnaround not duplicated)
const ROUTE_COORDS: [number, number][] = [
  ...OUTBOUND_COORDS,
  ...OUTBOUND_COORDS.slice(0, -1).reverse(),
]

interface Props {
  checkIns: ICheckIn[]
  minimal?: boolean
}

function MapController({ checkIns }: { checkIns: ICheckIn[] }) {
  const map = useMap()

  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(map.getContainer())
    return () => ro.disconnect()
  }, [map])

  useEffect(() => {
    const latest = checkIns[0]
    if (latest) {
      const cp = CHECKPOINTS.find((c) => c.id === latest.checkpointId)
      if (cp) map.setView([cp.lat, cp.lng], map.getZoom())
    }
  }, [checkIns, map])
  return null
}

export default function RaceMap({ checkIns, minimal = false }: Props) {
  const completedIds = new Set(checkIns.map((c) => c.checkpointId))
  const latestCheckIn = checkIns[0]
  const latestCheckpoint = latestCheckIn
    ? CHECKPOINTS.find((c) => c.id === latestCheckIn.checkpointId)
    : null

  // Use checkpoint index to determine progress through the full route.
  // This works correctly for out-and-back and any other course shape —
  // no coordinate lookup needed, so return-leg checkpoints aren't confused
  // with their outbound counterparts at the same lat/lng.
  const latestCpIndex = latestCheckpoint
    ? CHECKPOINTS.findIndex((c) => c.id === latestCheckpoint.id)
    : -1

  const splitIndex = latestCpIndex >= 0
    ? Math.round(((latestCpIndex + 1) / CHECKPOINTS.length) * ROUTE_COORDS.length)
    : 0

  const completedRoute = splitIndex > 0 ? ROUTE_COORDS.slice(0, splitIndex) : []
  const remainingRoute = ROUTE_COORDS.slice(splitIndex)

  const center: [number, number] = latestCheckpoint
    ? [latestCheckpoint.lat, latestCheckpoint.lng]
    : [48.1, -122.12]

  return (
    <MapContainer
      center={center}
      zoom={minimal ? 11 : 10}
      style={{ height: '100%', width: '100%', minHeight: minimal ? '192px' : '300px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController checkIns={checkIns} />

      {/* Remaining route — gray */}
      {remainingRoute.length > 1 && (
        <Polyline positions={remainingRoute} color="#4b5563" weight={3} />
      )}

      {/* Completed route — green */}
      {completedRoute.length > 1 && (
        <Polyline positions={completedRoute} color="#22c55e" weight={4} />
      )}

      {/* Checkpoint markers — deduplicated by lat/lng so return stops don't
          draw a second dot on top of their outbound counterpart */}
      {CHECKPOINTS.filter((cp, i, all) =>
        i === all.findIndex((c) => c.lat === cp.lat && c.lng === cp.lng) ||
        completedIds.has(cp.id)
      ).map((cp) => {
        const done = completedIds.has(cp.id)
        const isCurrent = latestCheckpoint?.id === cp.id
        return (
          <CircleMarker
            key={cp.id}
            center={[cp.lat, cp.lng]}
            radius={isCurrent ? 9 : 6}
            pathOptions={{
              color: isCurrent ? '#fff' : done ? '#22c55e' : '#4b5563',
              fillColor: isCurrent ? '#22c55e' : done ? '#22c55e' : '#1f2937',
              fillOpacity: 1,
              weight: isCurrent ? 3 : 2,
            }}
          >
            {!minimal && (
              <Tooltip permanent={isCurrent} direction="top">
                {cp.shortName} · mi {cp.mile}
              </Tooltip>
            )}
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
