// Shared types — safe to import in both client and server components
// (no Mongoose or Node.js imports here)

export interface ICheckIn {
  _id?: string
  checkpointId: string
  checkpointName: string
  mile: number
  timestamp: string | Date
  lat?: number
  lng?: number
}

export interface IStatusUpdate {
  _id?: string
  type: string
  label: string
  timestamp: string | Date
}

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
  { type: 'feeling_great',   label: 'Feeling great!',      emoji: '🔥', color: 'green'  },
  { type: 'feeling_good',    label: 'Feeling good',         emoji: '👍', color: 'green'  },
  { type: 'feeling_tired',   label: 'Feeling tired',        emoji: '😓', color: 'yellow' },
  { type: 'need_water',      label: 'Need water',           emoji: '💧', color: 'yellow' },
  { type: 'need_food',       label: 'Need food',            emoji: '🍌', color: 'yellow' },
  { type: 'need_both',       label: 'Need water & food',    emoji: '🥤', color: 'orange' },
  { type: 'taking_break',    label: 'Taking a break',       emoji: '⏸️', color: 'blue'   },
  { type: 'medical_concern', label: 'Medical concern',      emoji: '🏥', color: 'red'    },
  { type: 'sos',             label: 'SOS — Need help',      emoji: '🆘', color: 'red'    },
]
