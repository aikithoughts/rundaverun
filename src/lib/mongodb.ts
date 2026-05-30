import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

// In development, reuse the connection across hot reloads
// (Next.js reloads modules on every change, which would create many connections)
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

const cache = global._mongooseCache ?? { conn: null, promise: null }
global._mongooseCache = cache

export async function connectToDatabase() {
  if (cache.conn) return cache.conn

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI)
  }

  cache.conn = await cache.promise
  return cache.conn
}
