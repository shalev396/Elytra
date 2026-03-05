import { Router } from 'express';
import { DevtoolsController } from '../../controllers/devtools.js';

const router = Router();

// ─── POST /api/dev/sync-db ───────────────────────────────────────────────────

export interface SyncDbResponseData {
  provider: string;
  results: string[];
}

router.post('/sync-db', DevtoolsController.syncDatabase);

// ─── POST /api/dev/reset ─────────────────────────────────────────────────────

router.post('/reset', DevtoolsController.resetDatabase);

export { router as devRouter };
