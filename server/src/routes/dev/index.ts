import { Router } from 'express';
import { DevtoolsController } from '../../controllers/devtools.js';
import type { DatabaseProvider } from '../../types/env.d.ts';

const router = Router();

// ─── POST /api/dev/sync-db ───────────────────────────────────────────────────

/** No fields; any body is ignored. */
export type SyncDbRequestBody = Record<string, never>;

export interface SyncDbResponseData {
  provider: DatabaseProvider;
  results: string[];
}

router.post('/sync-db', DevtoolsController.syncDatabase);

// ─── POST /api/dev/reset ─────────────────────────────────────────────────────
// Drops and re-creates the schema, deletes every user upload under media/ and every Cognito user.

/** No fields; any body is ignored. */
export type ResetDatabaseRequestBody = Record<string, never>;

export interface ResetDatabaseResponseData {
  provider: DatabaseProvider;
  message: string;
}

router.post('/reset', DevtoolsController.resetDatabase);

export { router as devRouter };
