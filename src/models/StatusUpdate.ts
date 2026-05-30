import mongoose, { Schema, model, models } from 'mongoose'

export type StatusType =
  | 'feeling_great'
  | 'feeling_good'
  | 'feeling_tired'
  | 'need_water'
  | 'need_food'
  | 'need_both'
  | 'taking_break'
  | 'medical_concern'
  | 'sos'

export const STATUS_OPTIONS: { type: StatusType; label: string; emoji: string; color: string }[] = [
  { type: 'feeling_great', label: 'Feeling great!', emoji: '🔥', color: 'green' },
  { type: 'feeling_good',  label: 'Feeling good',   emoji: '👍', color: 'green' },
  { type: 'feeling_tired', label: 'Feeling tired',  emoji: '😓', color: 'yellow' },
  { type: 'need_water',    label: 'Need water',      emoji: '💧', color: 'yellow' },
  { type: 'need_food',     label: 'Need food',       emoji: '🍌', color: 'yellow' },
  { type: 'need_both',     label: 'Need water & food', emoji: '🆘', color: 'orange' },
  { type: 'taking_break',  label: 'Taking a break',  emoji: '⏸️', color: 'blue' },
  { type: 'medical_concern', label: 'Medical concern', emoji: '🏥', color: 'red' },
  { type: 'sos',           label: 'SOS — Need help', emoji: '🆘', color: 'red' },
]

export interface IStatusUpdate {
  _id?: mongoose.Types.ObjectId
  type: StatusType
  label: string
  timestamp: Date
}

const StatusUpdateSchema = new Schema<IStatusUpdate>({
  type: { type: String, required: true },
  label: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

export const StatusUpdate = models.StatusUpdate ?? model<IStatusUpdate>('StatusUpdate', StatusUpdateSchema)
