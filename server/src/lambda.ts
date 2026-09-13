import serverlessHttp from 'serverless-http';
import type { Context } from 'aws-lambda';
import { createApp } from './app.js';
import { initDB, syncDB } from './config/database.js';
import { SYNC_DB_ACTION } from '../infra/lib/constants.js';

/**
 * Lambda entry for the entire API. Bundled into the codebase layer at /opt/nodejs/app/index.mjs
 * and re-exported by the function's shim (server/lambda/index.mjs).
 *
 * Two event shapes reach it:
 * - API Gateway HTTP API events → the Express app
 * - A direct invoke `{ "action": "sync-db" }` from `npm run deploy:backend` → schema sync. API
 *   Gateway events always carry `requestContext`, so HTTP traffic can never take this branch.
 */

await initDB();

const http = serverlessHttp(createApp(), { binary: ['application/zip'] });

interface SyncDbEvent {
  action: typeof SYNC_DB_ACTION;
}

interface SyncDbResult {
  statusCode: number;
  body: string;
}

function isSyncDbEvent(event: unknown): event is SyncDbEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    !('requestContext' in event) &&
    (event as { action?: unknown }).action === SYNC_DB_ACTION
  );
}

async function runSyncDb(): Promise<SyncDbResult> {
  // No disconnect afterwards: the container is reused for HTTP requests.
  try {
    const results = await syncDB();
    return { statusCode: 200, body: JSON.stringify({ results }) };
  } catch (error) {
    console.error('sync-db failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { statusCode: 500, body: JSON.stringify({ error: message }) };
  }
}

export const handler = async (event: unknown, context: Context): Promise<unknown> => {
  if (isSyncDbEvent(event)) {
    return runSyncDb();
  }
  return http(event as object, context);
};
