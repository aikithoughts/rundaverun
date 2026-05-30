import mongoose, { Schema, model, models } from 'mongoose'

export interface IRace {
  _id?: mongoose.Types.ObjectId
  name: string
  startedAt: Date
  status: 'active' | 'inactive'
}

const RaceSchema = new Schema<IRace>({
  name:      { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  status:    { type: String, enum: ['active', 'inactive'], default: 'active' },
})

export const Race = models.Race ?? model<IRace>('Race', RaceSchema)
