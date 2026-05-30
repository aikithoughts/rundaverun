import mongoose, { Schema, model, models } from 'mongoose'
import type { ICheckIn } from '@/types/race'

const CheckInSchema = new Schema<ICheckIn>({
  checkpointId:   { type: String, required: true },
  checkpointName: { type: String, required: true },
  mile:           { type: Number, required: true },
  timestamp:      { type: Date, default: Date.now },
  lat:            Number,
  lng:            Number,
})

export const CheckIn = models.CheckIn ?? model<ICheckIn>('CheckIn', CheckInSchema)
