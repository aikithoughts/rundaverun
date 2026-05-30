import mongoose, { Schema, model, models } from 'mongoose'

export interface ICheckIn {
  _id?: mongoose.Types.ObjectId
  checkpointId: string
  checkpointName: string
  mile: number
  timestamp: Date
  lat?: number
  lng?: number
  note?: string
}

const CheckInSchema = new Schema<ICheckIn>({
  checkpointId: { type: String, required: true },
  checkpointName: { type: String, required: true },
  mile: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  lat: Number,
  lng: Number,
  note: String,
})

export const CheckIn = models.CheckIn ?? model<ICheckIn>('CheckIn', CheckInSchema)
