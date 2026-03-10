import rateLimit from 'express-rate-limit';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * General rate limiter for user and dev APIs.
 * 100 requests per 15 minutes per client (IP).
 */
export const generalLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for auth endpoints (login, signup, forgot-password).
 * 50 requests per 15 minutes per client (IP).
 * Auth routes hit Cognito/SES and are commonly targeted for abuse.
 */
export const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});
