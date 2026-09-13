import { existsSync } from 'node:fs';
import express, { type RequestHandler } from 'express';
import { isStage, resolveRegion, STAGES } from '../infra/lib/constants.js';
import { readStackOutputs } from '../infra/lib/stack-outputs.js';

/**
 * Local dev server — the same Express app the Lambda serves, on http://localhost:3000.
 *
 * Usage: tsx watch src/local.ts --stage dev
 *
 * Inputs: DOMAIN_NAME and DATABASE_URL, from the shell or server/.env.<stage>.
 * Everything else (Cognito ids, assets bucket) is read from the deployed elytra-<stage> stack,
 * so AWS credentials for the account are required.
 */

const PORT = 3000;
const CLIENT_ORIGIN = 'http://localhost:5173';

const stageFlag = process.argv.indexOf('--stage');
const stage = stageFlag === -1 ? 'dev' : process.argv[stageFlag + 1];
if (!isStage(stage)) {
  console.error(`Invalid --stage "${String(stage)}". Expected one of: ${STAGES.join(', ')}`);
  process.exit(1);
}

const envFile = `.env.${stage}`;
if (existsSync(envFile)) {
  process.loadEnvFile(envFile); // never overrides variables already set in the shell
}

const requiredInputs: string[] = ['DOMAIN_NAME', 'DATABASE_URL'];
const missing = requiredInputs.filter((name) => (process.env[name] ?? '') === '');
if (missing.length > 0) {
  console.error(`${missing.join(', ')} not set. Add to server/${envFile} or export in the shell.`);
  process.exit(1);
}

const outputs = await readStackOutputs(stage, [
  'userPoolId',
  'userPoolClientId',
  'assetsBucketName',
]);

// Wired values always come from the stack, so stale copies in an old .env file can't win.
process.env.ENV = stage;
process.env.AWS_REGION = resolveRegion();
process.env.COGNITO_USER_POOL_ID = outputs.userPoolId;
process.env.COGNITO_CLIENT_ID = outputs.userPoolClientId;
process.env.S3_ASSETS_BUCKET_NAME = outputs.assetsBucketName;

// Imported only after the environment is populated: config/environment.ts reads it at load time.
const { createApp } = await import('./app.js');
const { initDB } = await import('./config/database.js');

/** CloudFront makes the deployed app same-origin; locally the Vite client runs on another port. */
const localCors: RequestHandler = (req, res, next) => {
  if (req.headers.origin === CLIENT_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', CLIENT_ORIGIN);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
};

await initDB();

const app = express();
app.use(localCors);
app.use(createApp());

app.listen(PORT, () => {
  console.warn(`[local] ${stage} API listening on http://localhost:${String(PORT)}/api`);
});
