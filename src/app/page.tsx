'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ICheckIn, IStatusUpdate, STATUS_OPTIONS } from '@/types/race'
import { CHECKPOINTS, TOTAL_MILES } from '@/data/checkpoints'

const RaceMap = dynamic(() => import('@/components/RaceMap'), { ssr: false })

export default function SupporterView() {
  const [checkIns, setCheckIns] = useState<ICheckIn[]>([])
  const [statusUpdates, setStatusUpdates] = useState<IStatusUpdate[]>([])
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  async function fetchData() {
    try {
      const res = await fetch('/api/race-data')
      const data = await res.json()
      setCheckIns(data.checkIns)
      setStatusUpdates(data.statusUpdates)
      setLastFetch(new Date())
    } catch {
      // silently retry on next interval
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const latest = checkIns[0] ?? null
  const latestStatus = statusUpdates[0] ?? null
  const statusOption = latestStatus
    ? STATUS_OPTIONS.find((s) => s.type === latestStatus.type)
    : null

  const progressPercent = latest
    ? Math.round((latest.mile / TOTAL_MILES) * 100)
    : 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Run Dave Run 🏃</h1>
          <p className="text-xs text-gray-400">Centennial Trail 100k · June 13, 2026</p>
        </div>
        <a href="/runner" className="text-xs text-gray-500 hover:text-gray-300">
          Runner
        </a>
      </header>

      {/* Status banner */}
      {latestStatus && statusOption && (
        <div
          className={`px-4 py-3 text-center font-medium ${
            statusOption.color === 'red'
              ? 'bg-red-600'
              : statusOption.color === 'orange'
              ? 'bg-orange-500'
              : statusOption.color === 'yellow'
              ? 'bg-yellow-500 text-gray-900'
              : statusOption.color === 'blue'
              ? 'bg-blue-600'
              : 'bg-green-600'
          }`}
        >
          {statusOption.emoji} {latestStatus.label} ·{' '}
          <span className="text-sm font-normal opacity-80">
            {formatTimeAgo(new Date(latestStatus.timestamp))}
          </span>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 min-h-[40vh]">
        <RaceMap checkIns={checkIns} />
      </div>

      {/* Progress bar */}
      <div className="bg-gray-900 px-4 py-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Mile {latest?.mile ?? 0} of {TOTAL_MILES}</span>
          <span>{progressPercent}% complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Latest check-in */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Latest Check-in
        </h2>
        {latest ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">{latest.checkpointName}</p>
              <p className="text-sm text-gray-400">Mile {latest.mile}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white">{formatTime(new Date(latest.timestamp))}</p>
              <p className="text-xs text-gray-400">{formatTimeAgo(new Date(latest.timestamp))}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Race hasn't started yet</p>
        )}
      </div>

      {/* Checkpoint list */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Checkpoints
        </h2>
        <div className="space-y-1">
          {CHECKPOINTS.map((cp) => {
            const hit = checkIns.find((c) => c.checkpointId === cp.id)
            return (
              <div key={cp.id} className="flex items-center gap-3 py-1">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    hit ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
                <span className={`text-sm flex-1 ${hit ? 'text-white' : 'text-gray-500'}`}>
                  {cp.shortName}
                </span>
                <span className="text-xs text-gray-500">mi {cp.mile}</span>
                {hit && (
                  <span className="text-xs text-green-400">
                    {formatTime(new Date(hit.timestamp))}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Status history */}
      {statusUpdates.length > 0 && (
        <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 pb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Status Updates
          </h2>
          <div className="space-y-2">
            {statusUpdates.map((u) => {
              const opt = STATUS_OPTIONS.find((s) => s.type === u.type)
              return (
                <div key={String(u._id)} className="flex items-center gap-2 text-sm">
                  <span>{opt?.emoji}</span>
                  <span className="text-white">{u.label}</span>
                  <span className="text-gray-500 text-xs ml-auto">
                    {formatTimeAgo(new Date(u.timestamp))}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-gray-950 text-center text-xs text-gray-600 py-2">
        {lastFetch ? `Updated ${formatTimeAgo(lastFetch)}` : 'Loading...'}
      </div>
    </div>
  )
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m ago`
}
