import { InvokeCommand, LambdaClient, waitUntilFunctionUpdatedV2 } from '@aws-sdk/client-lambda';
import {
  APP_NAME,
  DATABASE_URL_PARAMETER,
  resolveRegion,
  stackName,
  stackTags,
  SYNC_DB_ACTION,
} from '../infra/lib/constants.js';
import { describeStack, readStackOutputs } from '../infra/lib/stack-outputs.js';
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
 * The one backend deploy path, used locally and by CI:
 *   1. guard: refuse to touch a stack this app doesn't own (no Project/Stage tags) or one that is
 *      mid-operation
 *   2. find the Route 53 hosted zone for DOMAIN_NAME
 *   3. build + verify the two Lambda layers
 *   4. cdk deploy, passing DATABASE_URL as the NoEcho parameter
 *   5. sync the database schema: invoke the API function with {"action":"sync-db"}
 *   6. activate the Project and Stage cost allocation tags for billing (never fails the deploy)
 *
 * Inputs: DOMAIN_NAME and DATABASE_URL (shell or server/.env.<stage>) plus AWS credentials.
 */

const LABEL = 'deploy:backend';
const stage = stageFromArgs(LABEL);
const stack = stackName(stage);
const databaseUrl = requireEnv(LABEL, stage, 'DATABASE_URL');
const domainName = requireEnv(LABEL, stage, 'DOMAIN_NAME');

// 1. Guard
const existing = await describeStack(stage);
const status = existing?.StackStatus ?? 'NONE';
if (existing !== undefined) {
  const tags = new Map((existing.Tags ?? []).map((t) => [t.Key, t.Value]));
  const ours = Object.entries(stackTags(stage)).every(([key, value]) => tags.get(key) === value);
  if (!ours) {
    fail(
      LABEL,
      `${stack} exists but is not tagged as ${APP_NAME}'s CDK stack, so this app did not create it.\n` +
        `Empty its buckets and delete it, then deploy again.`,
    );
  }
  if (status.endsWith('_IN_PROGRESS'))
    fail(LABEL, `${stack} is ${status}. Wait for it to finish and retry.`);
  if (status === 'ROLLBACK_COMPLETE' || status === 'ROLLBACK_FAILED') {
    fail(
      LABEL,
      `${stack} is ${status} and cannot be updated. Delete the stack, then deploy again.`,
    );
  }
}

// 2. Hosted zone
const zone = await findHostedZone(domainName);
console.warn(`[${LABEL}] hosted zone ${zone.name} (${zone.id}) for ${domainName}`);

// 3. Layers
runScript(LABEL, 'building layers', 'scripts/build-layers.ts');
runScript(LABEL, 'verifying layers', 'scripts/verify-layers.ts');

// 4. Deploy. The first create keeps successful resources on failure (--no-rollback), so a re-run
// continues from the failed resource instead of starting over.
const firstCreate = existing === undefined || status === 'CREATE_FAILED';
runCdk(LABEL, `cdk deploy ${stack}${firstCreate ? ' (first create, --no-rollback)' : ''}`, [
  'deploy',
  stack,
  ...cdkContext(stage, zone),
  '--parameters',
  `${DATABASE_URL_PARAMETER}=${databaseUrl}`,
  '--require-approval',
  'never',
  '--ci',
  ...(firstCreate ? ['--no-rollback'] : []),
]);

// 5. Database schema
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

// 6. Cost allocation tags
await activateCostAllocationTags(LABEL);
