import { Router } from 'express';
import { AuthController } from '../../../controllers/index.js';
import type { EmptySuccessResponseData } from '../../../types/response.js';

const router = Router();

// ─── POST /api/public/auth/signup ───────────────────────────────────────────

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

// ─── POST /api/public/auth/confirm ──────────────────────────────────────────

export interface ConfirmSignupRequestBody {
  email: string;
  code: string;
}

export type ConfirmSignupResponseData = EmptySuccessResponseData;

router.post('/confirm', AuthController.confirmSignup);

// ─── POST /api/public/auth/resend-confirmation ──────────────────────────────

export interface ResendConfirmationRequestBody {
  email: string;
}

/** Also returned for an unknown email, so the endpoint doesn't reveal which emails exist. */
export type ResendConfirmationResponseData = EmptySuccessResponseData;

router.post('/resend-confirmation', AuthController.resendConfirmation);

// ─── POST /api/public/auth/login ────────────────────────────────────────────

export interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * The user in a login response.
 *
 * `id` is the user's **Cognito sub**, not the database id that GET /api/private/me returns as
 * `id` (the sub is `cognitoSub` there). The client identifies the session by the sub, which is
 * also the token's `sub` claim.
 */
export interface LoginUserPayload {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponseData {
  user: LoginUserPayload;
  tokens: {
    idToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

router.post('/login', AuthController.login);

// ─── POST /api/public/auth/forgot-password ──────────────────────────────────

export interface ForgotPasswordRequestBody {
  email: string;
}

/** Also returned for an unknown email, so the endpoint doesn't reveal which emails exist. */
export type ForgotPasswordResponseData = EmptySuccessResponseData;

router.post('/forgot-password', AuthController.forgotPassword);

// ─── POST /api/public/auth/reset-password ───────────────────────────────────

export interface ResetPasswordRequestBody {
  email: string;
  code: string;
  password: string;
}

export type ResetPasswordResponseData = EmptySuccessResponseData;

router.post('/reset-password', AuthController.resetPassword);

// ─── POST /api/public/auth/refresh ──────────────────────────────────────────

export interface RefreshTokenRequestBody {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  idToken: string;
  expiresIn: number;
}

router.post('/refresh', AuthController.refreshToken);

export { router as authRouter };
