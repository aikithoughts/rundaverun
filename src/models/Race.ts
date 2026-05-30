import mongoose, { Schema, model, models } from 'mongoose'

export interface IRace {
  _id?: mongoose.Types.ObjectId
  startedAt: Date
  finishedAt?: Date
  status: 'active' | 'finished'
}

const RaceSchema = new Schema<IRace>({
  startedAt:  { type: Date, default: Date.now },
  finishedAt: Date,
  status:     { type: String, enum: ['active', 'finished'], default: 'active' },
})

export const Race = models.Race ?? model<IRace>('Race', RaceSchema)
