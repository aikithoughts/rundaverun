import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/mongodb', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/models/Race', () => ({
  Race: { findOne: vi.fn() },
}))

vi.mock('@/models/StatusUpdate', () => ({
  StatusUpdate: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
  },
}))

import { POST } from '@/app/api/status/route'
import { Race } from '@/models/Race'

const VALID_PIN = '1234'

beforeAll(() => {
  process.env.RUNNER_PIN = VALID_PIN
})

beforeEach(() => {
  vi.clearAllMocks()
})

function makeRequest(pin?: string, body?: Record<string, unknown>): NextRequest {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (pin !== undefined) headers.set('x-runner-pin', pin)
  return new NextRequest('http://localhost/api/status', {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/status', () => {
  it('returns 401 when PIN header is missing', async () => {
    const res = await POST(makeRequest(undefined, { type: 'feeling_great' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 when PIN is wrong', async () => {
    const res = await POST(makeRequest('wrong', { type: 'feeling_great' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for an unknown status type', async () => {
    const res = await POST(makeRequest(VALID_PIN, { type: 'vibes_only' }))
    expect(res.status).toBe(400)
  })

  it('returns 409 when there is no active race', async () => {
    vi.mocked(Race.findOne).mockReturnValue({ sort: vi.fn().mockResolvedValue(null) } as any)
    const res = await POST(makeRequest(VALID_PIN, { type: 'feeling_great' }))
    expect(res.status).toBe(409)
  })
})
