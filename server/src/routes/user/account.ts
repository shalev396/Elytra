import { Router } from 'express';
import { AccountController } from '../../controllers/index.js';

const router = Router();

// ─── GET /api/user/me ────────────────────────────────────────────────────────

export interface MeResponseData {
  id: string;
  cognitoSub: string;
  email: string;
  name: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

router.get('/me', AccountController.getMe);

// ─── DELETE /api/user/delete ─────────────────────────────────────────────────

export interface DeleteUserResponseData {
  message: string;
}

router.delete('/delete', AccountController.deleteAccount);

export { router as accountRouter };
