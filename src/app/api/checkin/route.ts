import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { CheckIn } from '@/models/CheckIn'
import { CHECKPOINTS } from '@/data/checkpoints'

function verifyPin(req: NextRequest) {
  const pin = req.headers.get('x-runner-pin')
  return pin === process.env.RUNNER_PIN
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

  const checkIn = await CheckIn.create({
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
  const checkIns = await CheckIn.find().sort({ timestamp: -1 })
  return NextResponse.json(checkIns)
}

export async function DELETE(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectToDatabase()
  const latest = await CheckIn.findOne().sort({ timestamp: -1 })
  if (!latest) return NextResponse.json({ error: 'Nothing to undo' }, { status: 404 })
  await CheckIn.deleteOne({ _id: latest._id })
  return NextResponse.json({ deleted: latest._id })
}
