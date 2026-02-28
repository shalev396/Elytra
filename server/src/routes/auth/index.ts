import { Router } from 'express';
import { AuthController } from '../../controllers/index.js';

const router = Router();

// ─── POST /api/auth/signup ───────────────────────────────────────────────────

export interface SignupRequestBody {
  email: string;
  password: string;
  name: string;
}

export interface SignupResponseData {
  userSub: string;
  userConfirmed: boolean;
}

router.post('/signup', AuthController.signup);

// ─── POST /api/auth/confirm ──────────────────────────────────────────────────

export interface ConfirmSignupRequestBody {
  email: string;
  code: string;
}

router.post('/confirm', AuthController.confirmSignup);

// ─── POST /api/auth/login ────────────────────────────────────────────────────

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: {
    id: string;
    email: string;
    name: string;
  };
  tokens: {
    idToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

router.post('/login', AuthController.login);

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

export interface ForgotPasswordRequestBody {
  email: string;
}

router.post('/forgot-password', AuthController.forgotPassword);

// ─── POST /api/auth/reset-password ───────────────────────────────────────────

export interface ResetPasswordRequestBody {
  email: string;
  code: string;
  password: string;
}

router.post('/reset-password', AuthController.resetPassword);

// ─── POST /api/auth/refresh ─────────────────────────────────────────────────

export interface RefreshTokenRequestBody {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  idToken: string;
  expiresIn: number;
}

router.post('/refresh', AuthController.refreshToken);

export { router as authRouter };
