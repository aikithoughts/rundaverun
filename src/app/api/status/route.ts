import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { StatusUpdate } from '@/models/StatusUpdate'
import { STATUS_OPTIONS } from '@/types/race'

function verifyPin(req: NextRequest) {
  const pin = req.headers.get('x-runner-pin')
  return pin === process.env.RUNNER_PIN
}

export async function POST(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { type } = body

  const option = STATUS_OPTIONS.find((o) => o.type === type)
  if (!option) {
    return NextResponse.json({ error: 'Unknown status type' }, { status: 400 })
  }

  await connectToDatabase()

  const update = await StatusUpdate.create({
    type: option.type,
    label: option.label,
  })

  return NextResponse.json(update, { status: 201 })
}

export async function GET() {
  await connectToDatabase()
  const updates = await StatusUpdate.find().sort({ timestamp: -1 }).limit(20)
  return NextResponse.json(updates)
}

export async function DELETE(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectToDatabase()
  const latest = await StatusUpdate.findOne().sort({ timestamp: -1 })
  if (!latest) return NextResponse.json({ error: 'Nothing to undo' }, { status: 404 })
  await StatusUpdate.deleteOne({ _id: latest._id })
  return NextResponse.json({ deleted: latest._id })
}
