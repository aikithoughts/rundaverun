import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Race } from '@/models/Race'
import { CheckIn } from '@/models/CheckIn'
import { StatusUpdate } from '@/models/StatusUpdate'

function verifyPin(req: NextRequest) {
  return req.headers.get('x-runner-pin') === process.env.RUNNER_PIN
}

// PATCH — activate a race (deactivates all others)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await connectToDatabase()
  await Race.updateMany({ status: 'active' }, { status: 'inactive' })
  const race = await Race.findByIdAndUpdate(id, { status: 'active' }, { new: true })
  if (!race) return NextResponse.json({ error: 'Race not found' }, { status: 404 })
  return NextResponse.json(race)
}

// DELETE — remove a race and all its data
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await connectToDatabase()
  await Promise.all([
    Race.findByIdAndDelete(id),
    CheckIn.deleteMany({ raceId: id }),
    StatusUpdate.deleteMany({ raceId: id }),
  ])
  return NextResponse.json({ deleted: id })
}
