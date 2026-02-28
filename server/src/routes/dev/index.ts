import { Router } from 'express';
import { DevtoolsController } from '../../controllers/devtools.js';

const router = Router();

// ─── POST /api/dev/sync-db ───────────────────────────────────────────────────

export interface SyncDbResponseData {
  provider: string;
  results: string[];
}

router.post('/sync-db', DevtoolsController.syncDatabase);

export { router as devRouter };
