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

export async function syncMongo(): Promise<string[]> {
  await connectMongo();

  const { UserMongoModel } = await import('../../models/mongoose/User.js');
  const { MediaMongoModel } = await import('../../models/mongoose/Media.js');

  await UserMongoModel.ensureIndexes();
  await MediaMongoModel.ensureIndexes();

  return ['Mongoose: indexes synced for User, Media'];
}

export async function clearAllMongo(): Promise<void> {
  await connectMongo();
  await mongoose.connection.dropDatabase();
}

export function getMongoose(): typeof mongoose {
  return mongoose;
}
