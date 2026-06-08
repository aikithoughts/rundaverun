import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/mongodb', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/models/Race', () => ({
  Race: { findOne: vi.fn() },
}))

vi.mock('@/models/CheckIn', () => ({
  CheckIn: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
  },
}))

import { POST, DELETE } from '@/app/api/checkin/route'
import { Race } from '@/models/Race'
import { CheckIn } from '@/models/CheckIn'

const VALID_PIN = '1234'

beforeAll(() => {
  process.env.RUNNER_PIN = VALID_PIN
})

beforeEach(() => {
  vi.clearAllMocks()
})

function makeRequest(method: string, pin?: string, body?: Record<string, unknown>): NextRequest {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (pin !== undefined) headers.set('x-runner-pin', pin)
  return new NextRequest('http://localhost/api/checkin', {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/checkin', () => {
  it('returns 401 when PIN header is missing', async () => {
    const res = await POST(makeRequest('POST', undefined, { checkpointId: 'start' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 when PIN is wrong', async () => {
    const res = await POST(makeRequest('POST', 'wrong', { checkpointId: 'start' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for an unknown checkpoint ID', async () => {
    const res = await POST(makeRequest('POST', VALID_PIN, { checkpointId: 'nowhere' }))
    expect(res.status).toBe(400)
  })

  it('returns 409 when there is no active race', async () => {
    vi.mocked(Race.findOne).mockReturnValue({ sort: vi.fn().mockResolvedValue(null) } as any)
    const res = await POST(makeRequest('POST', VALID_PIN, { checkpointId: 'start' }))
    expect(res.status).toBe(409)
  })
})

describe('DELETE /api/checkin', () => {
  it('returns 401 when PIN header is missing', async () => {
    const res = await DELETE(makeRequest('DELETE'))
    expect(res.status).toBe(401)
  })

  it('returns 401 when PIN is wrong', async () => {
    const res = await DELETE(makeRequest('DELETE', 'wrong'))
    expect(res.status).toBe(401)
  })
})
