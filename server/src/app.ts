import express, { type Express, type RequestHandler } from 'express';
import {
  responseFormatter,
  errorHandler,
  notFound,
  expressAuth,
  privateLimiter,
  devLimiter,
} from './middlewares/index.js';
import { publicRouter, privateRouter, devRouter } from './routes/index.js';
import { environment } from './config/environment.js';

/** Express 5 leaves `req.body` undefined when a request has no body; handlers can rely on `{}`. */
const defaultBody: RequestHandler = (req, _res, next) => {
  req.body ??= {};
  next();
};

/**
 * JSON and form parsers with the default size limit, mounted per prefix rather than globally so a
 * handler that needs the raw body (a webhook, say) can be mounted ahead of them. Files never come
 * through the API: browsers upload straight to S3 (POST /api/private/uploads/presign).
 */
const parseBody: RequestHandler[] = [
  express.json(),
  express.urlencoded({ extended: true }),
  defaultBody,
];

/**
 * The whole API as one Express app — served by the single Lambda (lambda.ts) and by the
 * local dev server (local.ts).
 *
 * - /api/public  → no auth (Cognito sign-up/login flows; rate-limited in routes/public/index.ts)
 * - /api/private → JWT verified in-app by expressAuth (API Gateway also runs a JWT authorizer)
 * - /api/dev     → developer tools, mounted only outside prod (infra also omits the route in prod)
 */
export function createApp(): Express {
  const app = express();

  // CloudFront → API Gateway → Lambda. Measured on a deployed stage: req.ip is the viewer's address
  // (API Gateway's sourceIp), a spoofed X-Forwarded-For entry is ignored, and CloudFront's edge
  // address is not used, so the rate limits are per viewer. Trusting one hop also stops
  // express-rate-limit's ERR_ERL_UNEXPECTED_X_FORWARDED_FOR warning.
  app.set('trust proxy', 1);

  app.use(responseFormatter);

  app.use('/api/public', ...parseBody, publicRouter);
  app.use('/api/private', privateLimiter, expressAuth, ...parseBody, privateRouter);

  if (environment.enableDevTools) {
    app.use('/api/dev', devLimiter, ...parseBody, devRouter);
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
