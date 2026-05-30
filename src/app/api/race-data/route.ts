import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { CheckIn } from '@/models/CheckIn'
import { StatusUpdate } from '@/models/StatusUpdate'

// Single endpoint the supporter view polls every 15 seconds
export async function GET() {
  await connectToDatabase()

  const [checkIns, statusUpdates] = await Promise.all([
    CheckIn.find().sort({ timestamp: -1 }),
    StatusUpdate.find().sort({ timestamp: -1 }).limit(10),
  ])

  return NextResponse.json(
    { checkIns, statusUpdates },
    {
      headers: {
        // Don't cache — always fetch fresh data
        'Cache-Control': 'no-store',
      },
    }
  )
}
