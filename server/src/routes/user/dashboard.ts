import { Router } from 'express';
import { DashboardController } from '../../controllers/index.js';

const router = Router();

// ─── GET /api/user/dashboard ─────────────────────────────────────────────────

export interface DashboardResponseData {
  userId: string;
  message: string;
}

router.get('/', DashboardController.getDashboard);

export { router as dashboardRouter };
