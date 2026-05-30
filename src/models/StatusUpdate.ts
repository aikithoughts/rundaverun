import { Schema, model, models } from 'mongoose'
import type { IStatusUpdate } from '@/types/race'

const StatusUpdateSchema = new Schema<IStatusUpdate>({
  raceId:    { type: Schema.Types.ObjectId, required: true, ref: 'Race' },
  type:      { type: String, required: true },
  label:     { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

export const StatusUpdate = models.StatusUpdate ?? model<IStatusUpdate>('StatusUpdate', StatusUpdateSchema)
