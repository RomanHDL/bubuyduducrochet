import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB() {
  if (!MONGODB_URI) {
    const msg = '[MongoDB] MONGODB_URI is not defined in environment variables';
    console.error(msg);
    throw new Error(msg);
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log('[MongoDB] Connecting to database...');
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => {
      console.log('[MongoDB] Connected successfully');
      return m;
    }).catch((err) => {
      console.error('[MongoDB] Connection failed:', err.message);
      cached.promise = null; // Reset so next call retries
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
