import { type RequestHandler } from 'express';
import { environment } from '../config/environment.js';
import { resetDatabase as resetDb, syncDB } from '../config/database.js';
import { clearAllCognitoUsers } from '../utils/cognitoReset.js';
import { clearUserUploadedAssets } from '../utils/s3Util.js';
import type { ResetDatabaseResponseData, SyncDbResponseData } from '../routes/dev/index.js';

const syncDatabase: RequestHandler = async (_req, res): Promise<void> => {
  try {
    const results = await syncDB();

    const data: SyncDbResponseData = { provider: environment.databaseProvider, results };
    res.success(data);
  } catch (error) {
    console.error('Database sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Database sync failed';
    res.error(errorMessage, 500);
  }
};

const resetDatabase: RequestHandler = async (_req, res): Promise<void> => {
  try {
    await resetDb();
    await syncDB();
    await clearUserUploadedAssets();
    await clearAllCognitoUsers();

    const data: ResetDatabaseResponseData = {
      provider: environment.databaseProvider,
      message: 'Database, S3 user uploads, and Cognito user pool reset complete',
    };
    res.success(data);
  } catch (error) {
    console.error('Reset error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Reset failed';
    res.error(errorMessage, 500);
  }
};

export const DevtoolsController = {
  resetDatabase,
  syncDatabase,
} as const;
