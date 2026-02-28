import { Router } from 'express';
import { dashboardRouter } from './dashboard.js';
import { accountRouter } from './account.js';

const router = Router();

router.use('/dashboard', dashboardRouter);
router.use('/', accountRouter);

export { router as userRouter };
