import { environment } from '../config/environment.js';
import { resetDatabase, syncDB } from '../config/database.js';
import { clearAllCognitoUsers } from '../utils/cognitoReset.js';
import { clearUserUploadedAssets } from '../utils/s3Util.js';
import type { DatabaseProvider } from '../types/env.d.ts';

/**
 * Stage maintenance run by the direct-invoke actions in lambda.ts (`npm run deploy:backend` and
 * `npm run reset:db`). Never reachable over HTTP.
 */

export interface SyncSchemaResult {
  provider: DatabaseProvider;
  results: string[];
}

export interface ResetStageResult {
  provider: DatabaseProvider;
  message: string;
}

export async function syncSchema(): Promise<SyncSchemaResult> {
  const results = await syncDB();
  return { provider: environment.databaseProvider, results };
}

/**
 * Drops and re-creates the schema, deletes every user upload under media/ and every Cognito user.
 * Refused on prod.
 */
export async function resetStage(): Promise<ResetStageResult> {
  if (!environment.allowsStageReset) {
    throw new Error(`reset-db is not allowed on the ${environment.env} stage`);
  }
  await resetDatabase();
  await syncDB();
  await clearUserUploadedAssets();
  await clearAllCognitoUsers();
  return {
    provider: environment.databaseProvider,
    message: 'Database, S3 user uploads, and Cognito user pool reset complete',
  };
}
