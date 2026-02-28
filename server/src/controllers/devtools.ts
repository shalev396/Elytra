import { type RequestHandler } from 'express';
import { environment } from '../config/environment.js';
import { syncDB } from '../config/database.js';

const syncDatabase: RequestHandler = async (_req, res): Promise<void> => {
  try {
    const results = await syncDB();

    res.success({
      provider: environment.databaseProvider,
      results,
    });
  } catch (error) {
    console.error('Database sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Database sync failed';
    res.error(errorMessage, 500);
  }
};

export const DevtoolsController = {
  syncDatabase,
} as const;
