import { environment } from './environment.js';

let shutdownRegistered = false;

function registerGracefulShutdown(): void {
  if (shutdownRegistered) return;
  shutdownRegistered = true;

  process.on('SIGTERM', () => {
    if (environment.databaseProvider === 'mongoose') {
      void import('mongoose')
        .then((m) => m.default.disconnect())
        .catch((error: unknown) => {
          console.error('Error disconnecting from MongoDB:', error);
        });
    } else {
      void import('./providers/sequelize.js')
        .then(({ getSequelize }) => getSequelize().close())
        .catch((error: unknown) => {
          console.error('Error disconnecting from PostgreSQL:', error);
        });
    }
  });
}

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

  registerGracefulShutdown();
}

export async function disconnectDB(): Promise<void> {
  try {
    if (environment.databaseProvider === 'mongoose') {
      const mongoose = await import('mongoose');
      await mongoose.default.disconnect();
    } else {
      const { getSequelize } = await import('./providers/sequelize.js');
      await getSequelize().close();
    }
  } catch {
    // Best-effort cleanup
  }
}

export async function syncDB(): Promise<string[]> {
  if (environment.databaseProvider === 'mongoose') {
    const { syncMongo } = await import('./providers/mongoose.js');
    return await syncMongo();
  } else {
    const { syncSequelize } = await import('./providers/sequelize.js');
    return syncSequelize();
  }
}

export async function resetDatabase(): Promise<void> {
  if (environment.env !== 'qa' && environment.env !== 'dev') {
    throw new Error('resetDatabase can only run on QA or DEV environment');
  }

  if (environment.databaseProvider === 'mongoose') {
    const { clearAllMongo } = await import('./providers/mongoose.js');
    await clearAllMongo();
  } else {
    const { clearAllSequelize } = await import('./providers/sequelize.js');
    await clearAllSequelize();
  }
}
