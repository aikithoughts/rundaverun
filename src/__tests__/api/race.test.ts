import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/mongodb', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/models/Race', () => ({
  Race: {
    findOne: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn().mockResolvedValue(undefined),
  },
}))

import { POST } from '@/app/api/race/route'

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
  return new NextRequest('http://localhost/api/race', {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/race', () => {
  it('returns 401 when PIN header is missing', async () => {
    const res = await POST(makeRequest(undefined, { name: 'June 13 Race Day' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 when PIN is wrong', async () => {
    const res = await POST(makeRequest('wrong', { name: 'June 13 Race Day' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest(VALID_PIN, {}))
    expect(res.status).toBe(400)
  })

  it('returns 400 when name is blank', async () => {
    const res = await POST(makeRequest(VALID_PIN, { name: '   ' }))
    expect(res.status).toBe(400)
  })
})
