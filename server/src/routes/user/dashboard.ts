import { Router } from 'express';
import { DashboardController } from '../../controllers/index.js';

const router = Router();

router.get('/', DashboardController.getDashboard);

export { router as dashboardRouter };
