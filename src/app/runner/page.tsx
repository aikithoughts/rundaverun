'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { CHECKPOINTS } from '@/data/checkpoints'
import { STATUS_OPTIONS, IRace } from '@/types/race'

const RaceMap = dynamic(() => import('@/components/RaceMap'), { ssr: false })

type View = 'pin' | 'select' | 'racing' | 'deleting'

export default function RunnerView() {
  const [view, setView] = useState<View>('pin')
  const [digits, setDigits] = useState<string[]>(['', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])
  const pin = digits.join('')

  const [races, setRaces] = useState<IRace[]>([])
  const [activeRace, setActiveRace] = useState<IRace | null>(null)
  const [newRaceName, setNewRaceName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'checkin' | 'status'>('checkin')
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [lastStatus, setLastStatus] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)
  const [undoType, setUndoType] = useState<'checkin' | 'status' | null>(null)
  const [undoSeconds, setUndoSeconds] = useState(0)
  const undoTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (undoTimer.current) clearInterval(undoTimer.current) }
  }, [])

  // ── PIN ──────────────────────────────────────────────────────────────────

  function handlePinSubmit() {
    if (pin.length >= 4) {
      setPinError(false)
      loadRaces()
    } else {
      setPinError(true)
    }
  }

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 3) {
      digitRefs.current[index + 1]?.focus()
    } else if (digit && index === 3 && next.every((d) => d !== '')) {
      setPinError(false)
      loadRaces()
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits]
      next[index - 1] = ''
      setDigits(next)
      digitRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length > 0) {
      const next = ['', '', '', '']
      pasted.split('').forEach((d, i) => { next[i] = d })
      setDigits(next)
      digitRefs.current[Math.min(pasted.length, 3)]?.focus()
      if (pasted.length === 4) {
        setPinError(false)
        loadRaces()
      }
    }
  }

  // ── Race loading ──────────────────────────────────────────────────────────

  async function loadRaces() {
    setBusy(true)
    setError(null)
    try {
      const [allRes, activeRes] = await Promise.all([
        fetch('/api/races'),
        fetch('/api/race'),
      ])
      if (allRes.status === 401 || activeRes.status === 401) {
        setPinError(true)
        setDigits(['', '', '', ''])
        return
      }
      const allRaces: IRace[] = await allRes.json()
      const active: IRace | null = await activeRes.json()
      setRaces(allRaces)
      setActiveRace(active)
      setView('select')
    } catch {
      setError('Could not connect. Check your connection.')
    } finally {
      setBusy(false)
    }
  }

  async function startNewRace() {
    if (!newRaceName.trim()) { setError('Please give the race a name'); return }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-runner-pin': pin },
        body: JSON.stringify({ name: newRaceName.trim() }),
      })
      if (res.status === 401) { setPinError(true); setDigits(['', '', '', '']); setView('pin'); return }
      const race: IRace = await res.json()
      setActiveRace(race)
      setLastCheckIn(null)
      setLastStatus(null)
      setNewRaceName('')
      setView('racing')
    } catch {
      setError('Failed to start race')
    } finally {
      setBusy(false)
    }
  }

  async function loadRace(id: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/races/${id}`, {
        method: 'PATCH',
        headers: { 'x-runner-pin': pin },
      })
      if (res.status === 401) { setPinError(true); setDigits(['', '', '', '']); setView('pin'); return }
      const race: IRace = await res.json()
      setActiveRace(race)
      setLastCheckIn(null)
      setLastStatus(null)
      setView('racing')
    } catch {
      setError('Failed to load race')
    } finally {
      setBusy(false)
    }
  }

  async function deleteRace(id: string) {
    setBusy(true)
    try {
      await fetch(`/api/races/${id}`, {
        method: 'DELETE',
        headers: { 'x-runner-pin': pin },
      })
      const updated = races.filter((r) => r._id !== id)
      setRaces(updated)
      if (activeRace?._id === id) setActiveRace(null)
    } catch {
      setError('Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  // ── Undo ─────────────────────────────────────────────────────────────────

  function startUndoCountdown(type: 'checkin' | 'status') {
    if (undoTimer.current) clearInterval(undoTimer.current)
    setUndoType(type)
    setUndoSeconds(10)
    undoTimer.current = setInterval(() => {
      setUndoSeconds((s) => {
        if (s <= 1) { clearInterval(undoTimer.current!); setUndoType(null); return 0 }
        return s - 1
      })
    }, 1000)
  }

  async function doUndo() {
    if (!undoType) return
    if (undoTimer.current) clearInterval(undoTimer.current)
    const type = undoType
    setUndoType(null)
    setBusy(true)
    try {
      await fetch(`/api/${type}`, { method: 'DELETE', headers: { 'x-runner-pin': pin } })
      if (type === 'checkin') setLastCheckIn(null)
      else setLastStatus(null)
      setFeedback({ msg: 'Undone', ok: true })
    } catch {
      setFeedback({ msg: 'Undo failed', ok: false })
    } finally {
      setBusy(false)
    }
  }

  // ── Check-in / Status ─────────────────────────────────────────────────────

  async function doCheckIn(checkpointId: string) {
    setBusy(true)
    setFeedback(null)
    let lat: number | undefined, lng: number | undefined
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
      )
      lat = pos.coords.latitude
      lng = pos.coords.longitude
    } catch { /* use checkpoint coords */ }

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
        setDigits(['', '', '', '']); setView('pin'); setPinError(true)
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
        setDigits(['', '', '', '']); setView('pin'); setPinError(true)
      } else {
        setFeedback({ msg: 'Update failed. Try again.', ok: false })
      }
    } catch {
      setFeedback({ msg: 'No connection. Try again.', ok: false })
    } finally {
      setBusy(false)
    }
  }

  // ── Views ─────────────────────────────────────────────────────────────────

  if (view === 'pin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-950">
        <h1 className="text-2xl font-bold mb-1">Run Dave Run</h1>
        <p className="text-gray-400 mb-8 text-sm">Runner access</p>
        <div className="w-full max-w-xs">
          <div className="flex gap-3 justify-center mb-3">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { digitRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={digit}
                autoFocus={i === 0}
                autoComplete="off"
                className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-xl text-center text-2xl font-bold focus:outline-none focus:border-green-500 caret-transparent"
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleDigitKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
              />
            ))}
          </div>
          {pinError && <p className="text-red-400 text-sm text-center mb-3">Invalid PIN</p>}
          <button
            onClick={handlePinSubmit}
            disabled={busy || pin.length < 4}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {busy ? 'Loading...' : 'Unlock'}
          </button>
        </div>
      </div>
    )
  }

  if (view === 'select' || view === 'deleting') {
    const isDeleting = view === 'deleting'
    return (
      <div className="min-h-screen flex flex-col bg-gray-950">
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
          <h1 className="font-bold text-white">Run Dave Run 🏃</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Start new race */}
          {!isDeleting && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Start New Race
              </h2>
              <input
                type="text"
                placeholder="Race name (e.g. June 13 Race Day)"
                value={newRaceName}
                onChange={(e) => setNewRaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startNewRace()}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mb-3 focus:outline-none focus:border-green-500"
              />
              <button
                onClick={startNewRace}
                disabled={busy}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Start New Race
              </button>
            </div>
          )}

          {/* Existing races */}
          {races.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {isDeleting ? 'Delete a Race' : 'Load Existing Race'}
              </h2>
              <div className="space-y-2">
                {races.map((r) => (
                  <div key={r._id} className="flex items-center gap-2">
                    <button
                      onClick={() => isDeleting ? deleteRace(r._id) : loadRace(r._id)}
                      disabled={busy}
                      className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors disabled:opacity-50 ${
                        isDeleting
                          ? 'bg-red-900 hover:bg-red-800 border border-red-700'
                          : r.status === 'active'
                          ? 'bg-green-800 border border-green-600 hover:bg-green-700'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-white">{r.name}</p>
                        <p className="text-xs text-gray-400">{formatDate(new Date(r.startedAt))}</p>
                      </div>
                      {!isDeleting && r.status === 'active' && (
                        <span className="text-xs text-green-300 bg-green-900 px-2 py-0.5 rounded-full">Active</span>
                      )}
                      {isDeleting && (
                        <span className="text-red-400 text-lg">✕</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {/* Delete toggle — tucked at the bottom */}
          <div className="pt-4 border-t border-gray-800">
            {isDeleting ? (
              <button
                onClick={() => setView('select')}
                className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
              >
                Done deleting
              </button>
            ) : (
              <button
                onClick={() => setView('deleting')}
                className="w-full text-gray-600 hover:text-red-400 text-xs py-2 transition-colors"
              >
                Delete a race...
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Racing view ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-white">Runner View 🏃</h1>
          {activeRace && <p className="text-xs text-gray-400">{activeRace.name}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { loadRaces(); }} className="text-xs text-gray-500 hover:text-gray-300">
            Switch race
          </button>
          <a href="/" className="text-xs text-gray-500 hover:text-gray-300">Supporter view</a>
        </div>
      </header>

      {feedback && (
        <div className={`px-4 py-2 text-sm text-center font-medium ${feedback.ok ? 'bg-green-700' : 'bg-red-700'}`}>
          {feedback.msg}
        </div>
      )}

      {undoType && (
        <button
          onClick={doUndo}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 text-sm transition-colors"
        >
          Undo last {undoType === 'checkin' ? 'check-in' : 'status'} ({undoSeconds}s)
        </button>
      )}

      <div className="h-48">
        <RaceMap checkIns={lastCheckIn ? [{ checkpointId: lastCheckIn } as never] : []} minimal />
      </div>

      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'checkin' ? 'text-white border-b-2 border-green-500' : 'text-gray-400'}`}
        >
          Check In
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'status' ? 'text-white border-b-2 border-green-500' : 'text-gray-400'}`}
        >
          Status
        </button>
      </div>

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
                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-left transition-colors ${isLast ? 'bg-green-700 border border-green-500' : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'} ${busy ? 'opacity-50' : ''}`}
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

      {activeTab === 'status' && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-xs text-gray-500 mb-3">Tap to update your supporters</p>
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
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-colors text-center ${isActive ? 'bg-green-700 border border-green-500' : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'} ${busy ? 'opacity-50' : ''}`}
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

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}
