// Deploy-time wait for SES domain verification. Runs on the Lambda runtime's built-in AWS SDK.
//
// Cognito refuses to create a user pool whose SES sender is not verified yet, and SES verifies a
// new domain some time after its DKIM records appear (usually minutes, sometimes close to an
// hour). The stack therefore puts a WaitCondition (up to 12 hours) before the user pool:
//
//   1. CloudFormation calls this function as a custom resource (Create/Update). It starts a
//      background check (an async invocation of itself) and answers CloudFormation right away.
//   2. The background check polls SES. Once the domain is verified it signals the WaitCondition
//      handle and CloudFormation continues with the user pool. A Lambda runs at most 15 minutes,
//      so the check hands over to a fresh invocation until the deadline.
import { GetEmailIdentityCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

const POLL_MS = 30_000;
const HANDOVER_MARGIN_MS = 60_000;
// Just under the WaitCondition timeout, so a failure is reported with a reason instead of a timeout.
const MAX_WAIT_MS = 11.5 * 60 * 60_000;

const ses = new SESv2Client({});
const lambda = new LambdaClient({});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function isVerified(domainName) {
  try {
    const identity = await ses.send(new GetEmailIdentityCommand({ EmailIdentity: domainName }));
    return identity.VerifiedForSendingStatus === true;
  } catch (error) {
    if (error.name === 'NotFoundException') return false;
    throw error;
  }
}

// Both presigned URLs expect a body without a content-type header, which a Buffer body gives.
async function put(url, payload) {
  const response = await fetch(url, { method: 'PUT', body: Buffer.from(JSON.stringify(payload)) });
  if (!response.ok) throw new Error(`PUT to CloudFormation failed: ${response.status}`);
}

function answerCloudFormation(event, status, reason) {
  return put(event.ResponseURL, {
    Status: status,
    Reason: reason,
    PhysicalResourceId: `ses-verification-${event.ResourceProperties.DomainName}`,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
  });
}

function signalWaitCondition(url, status, reason) {
  return put(url, {
    Status: status,
    Reason: reason,
    UniqueId: 'ses-domain-verification',
    Data: reason,
  });
}

function startBackgroundCheck(check, functionName) {
  return lambda.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: 'Event',
      Payload: JSON.stringify({ check }),
    }),
  );
}

async function onCloudFormationEvent(event, context) {
  try {
    if (event.RequestType !== 'Delete') {
      const { DomainName: domainName, WaitHandleUrl: waitHandleUrl } = event.ResourceProperties;
      const check = { domainName, waitHandleUrl, deadline: Date.now() + MAX_WAIT_MS };
      await startBackgroundCheck(check, context.functionName);
    }
    await answerCloudFormation(event, 'SUCCESS', 'SES verification check started');
  } catch (error) {
    console.error(error);
    await answerCloudFormation(event, 'FAILED', String(error?.message ?? error));
  }
}

async function onBackgroundCheck(check, context) {
  const { domainName, waitHandleUrl, deadline } = check;
  try {
    while (context.getRemainingTimeInMillis() > HANDOVER_MARGIN_MS + POLL_MS) {
      if (await isVerified(domainName)) {
        console.log(`SES verified ${domainName}`);
        await signalWaitCondition(waitHandleUrl, 'SUCCESS', `SES verified ${domainName}`);
        return;
      }
      if (Date.now() > deadline) {
        await signalWaitCondition(
          waitHandleUrl,
          'FAILURE',
          `SES did not verify ${domainName} in time. Check its DKIM CNAME records in Route 53, then deploy again.`,
        );
        return;
      }
      console.log(`Waiting for SES to verify ${domainName}`);
      await sleep(POLL_MS);
    }
    console.log('Handing over to a new invocation');
    await startBackgroundCheck(check, context.functionName);
  } catch (error) {
    console.error(error);
    await signalWaitCondition(waitHandleUrl, 'FAILURE', String(error?.message ?? error));
  }
}

export async function handler(event, context) {
  if (event.check !== undefined) return onBackgroundCheck(event.check, context);
  return onCloudFormationEvent(event, context);
}
