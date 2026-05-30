import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { CheckIn } from '@/models/CheckIn'
import { Race } from '@/models/Race'
import { CHECKPOINTS } from '@/data/checkpoints'

function verifyPin(req: NextRequest) {
  const pin = req.headers.get('x-runner-pin')
  return pin === process.env.RUNNER_PIN
}

async function getActiveRace() {
  return Race.findOne({ status: 'active' }).sort({ startedAt: -1 })
}

export async function POST(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { checkpointId, lat, lng } = body

  const checkpoint = CHECKPOINTS.find((c) => c.id === checkpointId)
  if (!checkpoint) {
    return NextResponse.json({ error: 'Unknown checkpoint' }, { status: 400 })
  }

  await connectToDatabase()

  const race = await getActiveRace()
  if (!race) {
    return NextResponse.json({ error: 'No active race. Start a race first.' }, { status: 409 })
  }

  const checkIn = await CheckIn.create({
    raceId: race._id,
    checkpointId: checkpoint.id,
    checkpointName: checkpoint.name,
    mile: checkpoint.mile,
    lat: lat ?? checkpoint.lat,
    lng: lng ?? checkpoint.lng,
  })

  return NextResponse.json(checkIn, { status: 201 })
}

export async function GET() {
  await connectToDatabase()
  const race = await getActiveRace()
  if (!race) return NextResponse.json([])
  const checkIns = await CheckIn.find({ raceId: race._id }).sort({ timestamp: -1 })
  return NextResponse.json(checkIns)
}

export async function DELETE(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectToDatabase()
  const race = await getActiveRace()
  if (!race) return NextResponse.json({ error: 'No active race' }, { status: 404 })
  const latest = await CheckIn.findOne({ raceId: race._id }).sort({ timestamp: -1 })
  if (!latest) return NextResponse.json({ error: 'Nothing to undo' }, { status: 404 })
  await CheckIn.deleteOne({ _id: latest._id })
  return NextResponse.json({ deleted: latest._id })
}
