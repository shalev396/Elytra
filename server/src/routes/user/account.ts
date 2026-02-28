import { Router } from 'express';
import { AccountController } from '../../controllers/index.js';

const router = Router();

export interface MeResponseData {
  id: string;
  email: string;
  name: string;
  lastLoginAt: Date | null;
  createdAt: Date;
}

router.get('/me', AccountController.getMe);

export interface DeleteUserResponseData {
  message: string;
}

router.delete('/delete', AccountController.deleteAccount);

export { router as accountRouter };
