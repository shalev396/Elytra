import { InvokeCommand, LambdaClient, waitUntilFunctionUpdatedV2 } from '@aws-sdk/client-lambda';
import { resolveRegion, type ApiAction, type Stage } from '../infra/lib/constants.js';
import { readStackOutputs } from '../infra/lib/stack-outputs.js';
import { fail } from './stage.js';

/**
 * Runs a stage maintenance action (`sync-db`, `reset-db`) by invoking the stage's API function
 * directly, the only way to reach them: they are not exposed over HTTP. Needs AWS credentials
 * allowed to lambda:GetFunction and lambda:InvokeFunction on the function. Fails the script unless
 * the function returns statusCode 200; returns the result body.
 */
export async function runApiAction(
  label: string,
  stage: Stage,
  action: ApiAction,
): Promise<string> {
  const { apiFunctionName } = await readStackOutputs(stage, ['apiFunctionName']);
  const lambda = new LambdaClient({ region: resolveRegion() });
  try {
    console.warn(`[${label}] ${action} through ${apiFunctionName}`);
    // A deploy may still be updating the function; invoking it mid-update fails.
    await waitUntilFunctionUpdatedV2(
      { client: lambda, maxWaitTime: 300 },
      { FunctionName: apiFunctionName },
    );
    const response = await lambda.send(
      new InvokeCommand({
        FunctionName: apiFunctionName,
        Payload: new TextEncoder().encode(JSON.stringify({ action })),
      }),
    );
    const payload = new TextDecoder().decode(response.Payload);
    const { statusCode, body } = parseResult(payload);
    if (response.FunctionError !== undefined || statusCode !== 200) {
      fail(
        label,
        `${action} failed (FunctionError=${response.FunctionError ?? 'none'}): ${payload}`,
      );
    }
    return body ?? payload;
  } finally {
    lambda.destroy();
  }
}

function parseResult(payload: string): { statusCode?: unknown; body?: string } {
  try {
    return JSON.parse(payload) as { statusCode?: unknown; body?: string };
  } catch {
    return {};
  }
}
