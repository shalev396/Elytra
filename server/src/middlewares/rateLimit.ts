import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import { environment } from '../config/environment.js';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * `max` requests per 15 minutes per client IP, counted per limiter instance.
 *
 * Every API surface gets its own instance (its own in-memory counter): one Lambda serves them
 * all, and a shared counter would add public, private and dev traffic into a single budget.
 *
 * Off on the local dev server (src/local.ts sets DISABLE_RATE_LIMIT): one process sees every
 * request from one IP, and a test run alone exceeds the per-IP limits.
 */
function limiter(max: number): RateLimitRequestHandler {
  return rateLimit({
    windowMs: WINDOW_MS,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // The API's error envelope, instead of the library's plain-text default.
    message: { message: 'Too many requests. Please try again later.' },
    skip: () => !environment.rateLimitEnabled,
  });
}

/** Authenticated user APIs (/api/private). */
export const privateLimiter = limiter(200);

/** Developer tools (/api/dev, every stage except prod). */
export const devLimiter = limiter(200);

/**
 * Auth endpoints (/api/public/auth: login, signup, forgot-password, …).
 * These hit Cognito/SES and are the primary abuse target — keep tight.
 */
export const authLimiter = limiter(100);
