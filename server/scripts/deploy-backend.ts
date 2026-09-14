import { InvokeCommand, LambdaClient, waitUntilFunctionUpdatedV2 } from '@aws-sdk/client-lambda';
import {
  DATABASE_URL_PARAMETER,
  resolveRegion,
  stackName,
  SYNC_DB_ACTION,
} from '../infra/lib/constants.js';
import { readStackOutputs } from '../infra/lib/stack-outputs.js';
import {
  cdkContext,
  fail,
  findHostedZone,
  requireEnv,
  runCdk,
  runScript,
  stageFromArgs,
} from './stage.js';
import { activateCostAllocationTags } from './cost-allocation-tags.js';

/**
 * npm run deploy:backend -- <stage>
 *
 * The one backend deploy path, used locally and by CI, for a new or an existing stack alike:
 *   1. find the Route 53 hosted zone for DOMAIN_NAME
 *   2. build + verify the two Lambda layers
 *   3. cdk deploy, passing DATABASE_URL as the NoEcho parameter. CDK creates the stack or updates
 *      it; a failed deploy rolls back, and a stack whose creation rolled back is recreated.
 *   4. sync the database schema: invoke the API function with {"action":"sync-db"}
 *   5. activate the Project and Stage cost allocation tags for billing (never fails the deploy)
 *
 * Inputs: DOMAIN_NAME and DATABASE_URL (shell or server/.env.<stage>) plus AWS credentials.
 */

const LABEL = 'deploy:backend';
const stage = stageFromArgs(LABEL);
const stack = stackName(stage);
const databaseUrl = requireEnv(LABEL, stage, 'DATABASE_URL');
const domainName = requireEnv(LABEL, stage, 'DOMAIN_NAME');

// 1. Hosted zone
const zone = await findHostedZone(domainName);
console.warn(`[${LABEL}] hosted zone ${zone.name} (${zone.id}) for ${domainName}`);

// 2. Layers
runScript(LABEL, 'building layers', 'scripts/build-layers.ts');
runScript(LABEL, 'verifying layers', 'scripts/verify-layers.ts');

// 3. Deploy
runCdk(LABEL, `cdk deploy ${stack}`, [
  'deploy',
  stack,
  ...cdkContext(stage, zone),
  '--parameters',
  `${DATABASE_URL_PARAMETER}=${databaseUrl}`,
  '--require-approval',
  'never',
  '--ci',
]);

// 4. Database schema
const { apiFunctionName } = await readStackOutputs(stage, ['apiFunctionName']);
const lambda = new LambdaClient({ region: resolveRegion() });
console.warn(`[${LABEL}] syncing the database schema through ${apiFunctionName}`);
await waitUntilFunctionUpdatedV2(
  { client: lambda, maxWaitTime: 300 },
  { FunctionName: apiFunctionName },
);
const response = await lambda.send(
  new InvokeCommand({
    FunctionName: apiFunctionName,
    Payload: JSON.stringify({ action: SYNC_DB_ACTION }),
  }),
);
const payload = new TextDecoder().decode(response.Payload);
function statusCodeOf(body: string): unknown {
  try {
    return (JSON.parse(body) as { statusCode?: unknown }).statusCode;
  } catch {
    return undefined;
  }
}
const statusCode = statusCodeOf(payload);
if (response.FunctionError !== undefined || statusCode !== 200) {
  fail(
    LABEL,
    `database schema sync failed (FunctionError=${response.FunctionError ?? 'none'}): ${payload}`,
  );
}
console.warn(`[${LABEL}] database schema synced: ${payload}`);

// 5. Cost allocation tags
await activateCostAllocationTags(LABEL);
