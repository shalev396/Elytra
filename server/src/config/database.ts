import { environment } from './environment.js';

export async function clearDB(): Promise<void> {
  if (environment.env !== 'qa') {
    throw new Error('clearDB can only run on QA environment');
  }

  if (environment.databaseProvider === 'mongoose') {
    const { clearAllMongo } = await import('./providers/mongoose.js');
    await clearAllMongo();
  } else {
    const { clearAllSequelize } = await import('./providers/sequelize.js');
    await clearAllSequelize();
  }
}

export async function initDB(): Promise<void> {
  if (environment.databaseProvider === 'mongoose') {
    const { connectMongo } = await import('./providers/mongoose.js');
    await connectMongo();
  } else {
    const { connectSequelize } = await import('./providers/sequelize.js');
    await connectSequelize();
    const { defineAssociations } = await import('../models/sequelize/associations.js');
    defineAssociations();
  }
}

export async function syncDB(): Promise<string[]> {
  if (environment.databaseProvider === 'mongoose') {
    const { syncMongo } = await import('./providers/mongoose.js');
    return syncMongo();
  } else {
    const { syncSequelize } = await import('./providers/sequelize.js');
    return syncSequelize();
  }
}
