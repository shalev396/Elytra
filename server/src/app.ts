import express, { type Express } from 'express';
import {
  responseFormatter,
  errorHandler,
  notFound,
  expressAuth,
  generalLimiter,
  authLimiter,
} from './middlewares/index.js';
import { publicRouter, privateRouter, devRouter } from './routes/index.js';
import { environment } from './config/environment.js';

/**
 * The whole API as one Express app — served by the single Lambda (lambda.ts) and by the
 * local dev server (local.ts).
 *
 * - /api/public  → no auth (Cognito sign-up/login flows)
 * - /api/private → JWT verified in-app by expressAuth (API Gateway also runs a JWT authorizer)
 * - /api/dev     → developer tools, mounted only outside prod (infra also omits the route in prod)
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(responseFormatter);

  app.use('/api/public', authLimiter, publicRouter);
  app.use('/api/private', generalLimiter, expressAuth, privateRouter);

  if (environment.enableDevTools) {
    app.use('/api/dev', generalLimiter, devRouter);
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
