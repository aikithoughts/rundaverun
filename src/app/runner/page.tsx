'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { CHECKPOINTS } from '@/data/checkpoints'
import { STATUS_OPTIONS } from '@/types/race'

const RaceMap = dynamic(() => import('@/components/RaceMap'), { ssr: false })

type View = 'pin' | 'main'

export default function RunnerView() {
  const [view, setView] = useState<View>('pin')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [activeTab, setActiveTab] = useState<'checkin' | 'status'>('checkin')
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [lastStatus, setLastStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)
  const [undoType, setUndoType] = useState<'checkin' | 'status' | null>(null)
  const [undoSeconds, setUndoSeconds] = useState(0)
  const undoTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  function startUndoCountdown(type: 'checkin' | 'status') {
    if (undoTimer.current) clearInterval(undoTimer.current)
    setUndoType(type)
    setUndoSeconds(10)
    undoTimer.current = setInterval(() => {
      setUndoSeconds((s) => {
        if (s <= 1) {
          clearInterval(undoTimer.current!)
          setUndoType(null)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  async function doUndo() {
    if (!undoType) return
    if (undoTimer.current) clearInterval(undoTimer.current)
    setUndoType(null)
    setBusy(true)
    try {
      await fetch(`/api/${undoType === 'checkin' ? 'checkin' : 'status'}`, {
        method: 'DELETE',
        headers: { 'x-runner-pin': pin },
      })
      if (undoType === 'checkin') setLastCheckIn(null)
      else setLastStatus(null)
      setFeedback({ msg: 'Undone', ok: true })
    } catch {
      setFeedback({ msg: 'Undo failed', ok: false })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => () => { if (undoTimer.current) clearInterval(undoTimer.current) }, [])

  function handlePinSubmit() {
    // We verify the PIN server-side on every request.
    // Here we just move to the main view; if the PIN is wrong, actions will fail.
    if (pin.length >= 4) {
      setView('main')
      setPinError(false)
    } else {
      setPinError(true)
    }
  }

  async function doCheckIn(checkpointId: string) {
    setBusy(true)
    setFeedback(null)

    let lat: number | undefined
    let lng: number | undefined

    // Try to grab GPS in the background — non-blocking
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
      )
      lat = pos.coords.latitude
      lng = pos.coords.longitude
    } catch {
      // GPS unavailable — that's fine, we'll use the checkpoint coords
    }

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-runner-pin': pin },
        body: JSON.stringify({ checkpointId, lat, lng }),
      })
      if (res.ok) {
        const cp = CHECKPOINTS.find((c) => c.id === checkpointId)
        setLastCheckIn(checkpointId)
        setFeedback({ msg: `Checked in: ${cp?.shortName}`, ok: true })
        startUndoCountdown('checkin')
      } else if (res.status === 401) {
        setView('pin')
        setPinError(true)
      } else {
        setFeedback({ msg: 'Check-in failed. Try again.', ok: false })
      }
    } catch {
      setFeedback({ msg: 'No connection. Try again.', ok: false })
    } finally {
      setBusy(false)
    }
  }

  async function doStatus(type: string, label: string) {
    setBusy(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-runner-pin': pin },
        body: JSON.stringify({ type }),
      })
      if (res.ok) {
        setLastStatus(type)
        setFeedback({ msg: `Status: ${label}`, ok: true })
        startUndoCountdown('status')
      } else if (res.status === 401) {
        setView('pin')
        setPinError(true)
      } else {
        setFeedback({ msg: 'Update failed. Try again.', ok: false })
      }
    } catch {
      setFeedback({ msg: 'No connection. Try again.', ok: false })
    } finally {
      setBusy(false)
    }
  }

  if (view === 'pin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-950">
        <h1 className="text-2xl font-bold mb-1">Run Dave Run</h1>
        <p className="text-gray-400 mb-8 text-sm">Runner access</p>
        <div className="w-full max-w-xs">
          <input
            type="password"
            inputMode="numeric"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest mb-3 focus:outline-none focus:border-green-500"
          />
          {pinError && (
            <p className="text-red-400 text-sm text-center mb-3">Invalid PIN</p>
          )}
          <button
            onClick={handlePinSubmit}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-white">Runner View 🏃</h1>
        <a href="/" className="text-xs text-gray-500 hover:text-gray-300">Supporter view</a>
      </header>

      {/* Feedback toast */}
      {feedback && (
        <div
          className={`px-4 py-2 text-sm text-center font-medium ${
            feedback.ok ? 'bg-green-700' : 'bg-red-700'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Map */}
      <div className="h-48">
        <RaceMap checkIns={lastCheckIn ? [{ checkpointId: lastCheckIn } as never] : []} minimal />
      </div>

      {/* Undo button */}
      {undoType && (
        <button
          onClick={doUndo}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 text-sm transition-colors"
        >
          Undo last {undoType === 'checkin' ? 'check-in' : 'status'} ({undoSeconds}s)
        </button>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'checkin'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400'
          }`}
        >
          Check In
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'status'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400'
          }`}
        >
          Status
        </button>
      </div>

      {/* Check-in tab */}
      {activeTab === 'checkin' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          <p className="text-xs text-gray-500 mb-3">Tap when you reach a checkpoint</p>
          {CHECKPOINTS.map((cp) => {
            const isLast = lastCheckIn === cp.id
            return (
              <button
                key={cp.id}
                onClick={() => doCheckIn(cp.id)}
                disabled={busy}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-left transition-colors ${
                  isLast
                    ? 'bg-green-700 border border-green-500'
                    : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'
                } ${busy ? 'opacity-50' : ''}`}
              >
                <div>
                  <p className="font-medium text-white">{cp.name}</p>
                  <p className="text-xs text-gray-400">Mile {cp.mile}</p>
                </div>
                {isLast && <span className="text-green-300 text-xs">✓ Last check-in</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Status tab */}
      {activeTab === 'status' && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-xs text-gray-500 mb-3">Tap to update your supporters</p>

          {/* SOS — always at top, visually distinct */}
          <button
            onClick={() => doStatus('sos', 'SOS — Need help')}
            disabled={busy}
            className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-5 rounded-xl mb-4 text-lg transition-colors"
          >
            🆘 SOS — Need Help
          </button>

          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.filter((s) => s.type !== 'sos').map((s) => {
              const isActive = lastStatus === s.type
              return (
                <button
                  key={s.type}
                  onClick={() => doStatus(s.type, s.label)}
                  disabled={busy}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-colors text-center ${
                    isActive
                      ? 'bg-green-700 border border-green-500'
                      : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'
                  } ${busy ? 'opacity-50' : ''}`}
                >
                  <span className="text-2xl mb-1">{s.emoji}</span>
                  <span className="text-xs text-white leading-tight">{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
