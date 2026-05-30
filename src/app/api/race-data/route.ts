import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { CheckIn } from '@/models/CheckIn'
import { StatusUpdate } from '@/models/StatusUpdate'
import { Race } from '@/models/Race'

export async function GET() {
  await connectToDatabase()

  const race = await Race.findOne({ status: 'active' }).sort({ startedAt: -1 })

  if (!race) {
    return NextResponse.json(
      { race: null, checkIns: [], statusUpdates: [] },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const [checkIns, statusUpdates] = await Promise.all([
    CheckIn.find({ raceId: race._id }).sort({ timestamp: -1 }),
    StatusUpdate.find({ raceId: race._id }).sort({ timestamp: -1 }).limit(10),
  ])

  return NextResponse.json(
    { race, checkIns, statusUpdates },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
