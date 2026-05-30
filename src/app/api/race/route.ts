import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Race } from '@/models/Race'

function verifyPin(req: NextRequest) {
  const pin = req.headers.get('x-runner-pin')
  return pin === process.env.RUNNER_PIN
}

// Get the active race
export async function GET() {
  await connectToDatabase()
  const race = await Race.findOne({ status: 'active' }).sort({ startedAt: -1 })
  return NextResponse.json(race ?? null)
}

// Start a new race (marks any active race as finished first)
export async function POST(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectToDatabase()
  await Race.updateMany({ status: 'active' }, { status: 'finished', finishedAt: new Date() })
  const race = await Race.create({ status: 'active' })
  return NextResponse.json(race, { status: 201 })
}
