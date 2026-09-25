import { RESET_DB_ACTION } from '../infra/lib/constants.js';
import { runApiAction } from './api-action.js';
import { fail, stageFromArgs } from './stage.js';

/**
 * npm run reset:db -- <dev|qa>
 *
 * DESTRUCTIVE: wipes the stage's database, S3 user uploads under media/ and every Cognito user,
 * then re-syncs the schema. CI runs it before the Postman and Playwright suites; run it yourself
 * before a local test run that should start from an empty stage.
 *
 * It invokes the deployed API function directly with {"action":"reset-db"} (there is no HTTP
 * route), so it needs AWS credentials for the account. Refused for prod, here and in the function.
 */

const LABEL = 'reset:db';
const stage = stageFromArgs(LABEL);
if (stage === 'prod') fail(LABEL, 'refusing to reset prod.');

const result = await runApiAction(LABEL, stage, RESET_DB_ACTION);
console.warn(`[${LABEL}] ${stage} reset: ${result}`);
