import { describe, it, expect } from 'vitest'
import { CHECKPOINTS, TOTAL_MILES } from '@/data/checkpoints'

describe('CHECKPOINTS', () => {
  it('starts at mile 0', () => {
    expect(CHECKPOINTS[0].mile).toBe(0)
  })

  it('ends at TOTAL_MILES', () => {
    expect(CHECKPOINTS[CHECKPOINTS.length - 1].mile).toBe(TOTAL_MILES)
  })

  it('has strictly increasing mile values', () => {
    for (let i = 1; i < CHECKPOINTS.length; i++) {
      expect(CHECKPOINTS[i].mile).toBeGreaterThan(CHECKPOINTS[i - 1].mile)
    }
  })

  it('has unique IDs', () => {
    const ids = CHECKPOINTS.map((cp) => cp.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('return checkpoints mirror outbound counterparts', () => {
    const pairs = [
      ['start', 'finish'],
      ['machias-out', 'machias-return'],
      ['rhododendron-out', 'rhododendron-return'],
      ['armar-out', 'armar-return'],
      ['legion-out', 'legion-return'],
      ['bryant-out', 'bryant-return'],
    ]
    for (const [outId, returnId] of pairs) {
      const out = CHECKPOINTS.find((cp) => cp.id === outId)!
      const ret = CHECKPOINTS.find((cp) => cp.id === returnId)!
      expect(out.mile + ret.mile).toBeCloseTo(TOTAL_MILES, 10)
    }
  })

  it('has valid coordinates for all checkpoints', () => {
    for (const cp of CHECKPOINTS) {
      expect(cp.lat).toBeGreaterThan(0)    // northern hemisphere
      expect(cp.lng).toBeLessThan(0)       // western hemisphere
    }
  })
})
