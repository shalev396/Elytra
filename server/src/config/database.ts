import { environment } from './environment.js';

export async function initDB(): Promise<void> {
  if (environment.databaseProvider === 'mongoose') {
    const { connectMongo } = await import('./providers/mongoose.js');
    await connectMongo();
  } else {
    const { connectSequelize } = await import('./providers/sequelize.js');
    await connectSequelize();
  }
}
