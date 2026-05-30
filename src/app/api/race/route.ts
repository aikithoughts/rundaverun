import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Race } from '@/models/Race'

function verifyPin(req: NextRequest) {
  return req.headers.get('x-runner-pin') === process.env.RUNNER_PIN
}

// GET active race — used by supporter view poller and runner view on load
export async function GET() {
  await connectToDatabase()
  const race = await Race.findOne({ status: 'active' }).sort({ startedAt: -1 })
  return NextResponse.json(race ?? null)
}

// POST — create a new race (deactivates any current active race)
export async function POST(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Race name is required' }, { status: 400 })
  }
  await connectToDatabase()
  await Race.updateMany({ status: 'active' }, { status: 'inactive' })
  const race = await Race.create({ name: name.trim(), status: 'active' })
  return NextResponse.json(race, { status: 201 })
}
