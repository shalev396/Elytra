import serverlessHttp from 'serverless-http';
import type { Context } from 'aws-lambda';
import { createApp } from './app.js';
import { initDB } from './config/database.js';
import { resetStage, syncSchema } from './services/stageMaintenance.js';
import {
  API_ACTIONS,
  RESET_DB_ACTION,
  SYNC_DB_ACTION,
  type ApiAction,
} from '../infra/lib/constants.js';

/**
 * Lambda entry for the entire API. Bundled into the codebase layer at /opt/nodejs/app/index.mjs
 * and re-exported by the function's shim (server/lambda/index.mjs).
 *
 * Two event shapes reach it:
 * - API Gateway HTTP API events → the Express app
 * - A direct invoke `{ "action": … }` → stage maintenance:
 *   - `sync-db`  from `npm run deploy:backend` (every stage)
 *   - `reset-db` from `npm run reset:db` before the test suites (refused on prod)
 *   Only lambda:InvokeFunction reaches these, never the HTTP API: API Gateway events always carry
 *   `requestContext`, so HTTP traffic can never take this branch.
 */

await initDB();

// No binary types: every response is JSON (files are served by S3 through presigned URLs). If
// the app ever sends binary bodies, list their content types in a `binary` option here.
const http = serverlessHttp(createApp());

interface ActionEvent {
  action: ApiAction;
}

interface ActionResult {
  statusCode: number;
  body: string;
}

function isActionEvent(event: unknown): event is ActionEvent {
  if (typeof event !== 'object' || event === null || 'requestContext' in event) {
    return false;
  }
  const { action } = event as { action?: unknown };
  return (API_ACTIONS as readonly unknown[]).includes(action);
}

const ACTIONS: Record<ApiAction, () => Promise<unknown>> = {
  [SYNC_DB_ACTION]: syncSchema,
  [RESET_DB_ACTION]: resetStage,
};

async function runAction(action: ApiAction): Promise<ActionResult> {
  // No disconnect afterwards: the container is reused for HTTP requests.
  try {
    const result = await ACTIONS[action]();
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    console.error('%s failed:', action, error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { statusCode: 500, body: JSON.stringify({ error: message }) };
  }
}

export const handler = async (event: unknown, context: Context): Promise<unknown> => {
  if (isActionEvent(event)) {
    return runAction(event.action);
  }
  return http(event as object, context);
};
