import {
  CloudFormationClient,
  DescribeStacksCommand,
  type Stack as CfnStack,
} from '@aws-sdk/client-cloudformation';
import { OUTPUTS, resolveRegion, stackName, type OutputName, type Stage } from './constants.js';

// Created on first use so AWS_REGION from an env file loaded by the caller is honoured.
let client: CloudFormationClient | undefined;
const cloudFormation = (): CloudFormationClient =>
  (client ??= new CloudFormationClient({ region: resolveRegion() }));

/** Returns the stack description, or undefined when the stack does not exist. */
export async function describeStack(stage: Stage): Promise<CfnStack | undefined> {
  try {
    const { Stacks } = await cloudFormation().send(
      new DescribeStacksCommand({ StackName: stackName(stage) }),
    );
    return Stacks?.[0];
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') return undefined;
    throw error;
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
