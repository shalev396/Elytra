import {
  CloudFormationClient,
  DescribeStacksCommand,
  type Stack as CfnStack,
} from '@aws-sdk/client-cloudformation';
import { OUTPUTS, resolveRegion, stackName, type OutputName, type Stage } from './constants.js';

/** Returns the stack description, or undefined when the stack does not exist. */
export async function describeStack(stage: Stage): Promise<CfnStack | undefined> {
  // A new client per call, destroyed afterwards: it is created after the caller has loaded its env
  // file (AWS_REGION), and a cached client's keep-alive socket can go stale during a long
  // `cdk deploy` (the next call then failed with `write ECONNABORTED`).
  const client = new CloudFormationClient({ region: resolveRegion() });
  try {
    const { Stacks } = await client.send(
      new DescribeStacksCommand({ StackName: stackName(stage) }),
    );
    return Stacks?.[0];
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') return undefined;
    throw error;
  } finally {
    client.destroy();
  }
}

/** Reads the requested outputs from the deployed stack; throws if the stack or a key is missing. */
export async function readStackOutputs<N extends OutputName>(
  stage: Stage,
  names: readonly N[],
): Promise<Record<N, string>> {
  const stack = await describeStack(stage);
  if (stack === undefined) {
    throw new Error(`Stack ${stackName(stage)} not found in ${resolveRegion()}. Deploy it first.`);
  }

  const byKey = new Map((stack.Outputs ?? []).map((o) => [o.OutputKey, o.OutputValue]));
  const result = {} as Record<N, string>;
  for (const name of names) {
    const value = byKey.get(OUTPUTS[name]);
    if (value === undefined || value === '') {
      throw new Error(`Stack ${stackName(stage)} has no "${OUTPUTS[name]}" output.`);
    }
    result[name] = value;
  }
  return result;
}
