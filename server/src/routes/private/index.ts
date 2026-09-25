import { Router } from 'express';
import { dashboardRouter } from './dashboard.js';
import { accountRouter } from './account.js';
import { uploadsRouter } from './uploads.js';

const router = Router();

router.use('/dashboard', dashboardRouter);
router.use('/uploads', uploadsRouter);
router.use('/', accountRouter);

export { router as privateRouter };
