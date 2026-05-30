import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Race } from '@/models/Race'

// GET all races, newest first
export async function GET() {
  await connectToDatabase()
  const races = await Race.find().sort({ startedAt: -1 })
  return NextResponse.json(races)
}
