import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://amanshukla:289n2tEXLT8Sum9O@slotswapper.yacbhhj.mongodb.net/?appName=SlotSwapper';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} | undefined;

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var _mongoose: MongooseCache;
}

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    } as mongoose.ConnectOptions;

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectDB;