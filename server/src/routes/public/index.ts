import { Router } from 'express';
import { authLimiter } from '../../middlewares/index.js';
import { authRouter } from './auth/index.js';

const router = Router();

// Auth hits Cognito and SES, so it has its own, tighter budget. Future public routes that don't
// touch them can be mounted here without it.
router.use('/auth', authLimiter, authRouter);

export { router as publicRouter };
