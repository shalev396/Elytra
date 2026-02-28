import mongoose from 'mongoose';
import { environment } from '../environment.js';

let isConnected = false;

export async function connectMongo(): Promise<void> {
  if (isConnected) {
    return;
  }

  await mongoose.connect(environment.databaseUrl);
  isConnected = true;
}

export function getMongoose(): typeof mongoose {
  return mongoose;
}
