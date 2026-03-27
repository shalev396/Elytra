import mongoose from 'mongoose';
import { environment } from '../environment.js';

export async function connectMongo(): Promise<void> {
  const state = mongoose.connection.readyState;
  if (
    state === mongoose.ConnectionStates.connected ||
    state === mongoose.ConnectionStates.connecting
  ) {
    return;
  }

  await mongoose.connect(environment.databaseUrl, {
    // Atlas + Lambda: https://www.mongodb.com/docs/atlas/manage-connections-aws-lambda/
    maxPoolSize: 2,
    minPoolSize: 0,
    maxIdleTimeMS: 60_000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}

/**
 * No-op: MongoDB creates collections on first write; indexes follow schema when you opt into
 * `autoIndex` / app startup patterns. The dev `sync-db` endpoint stays for parity with SQL
 * (`syncSequelize`) and still returns `string[]` like the Sequelize path.
 */
export function syncMongo(): Promise<string[]> {
  return Promise.resolve([
    'Mongoose: sync-db skipped (schema is applied at runtime; no manual sync).',
  ]);
}

export async function clearAllMongo(): Promise<void> {
  await connectMongo();
  await mongoose.connection.dropDatabase();
}

export function getMongoose(): typeof mongoose {
  return mongoose;
}
