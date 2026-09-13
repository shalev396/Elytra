import { createHash } from 'node:crypto';
import { join } from 'node:path';
import {
  CfnWaitCondition,
  CfnWaitConditionHandle,
  CustomResource,
  Duration,
  RemovalPolicy,
  Stack,
} from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as ses from 'aws-cdk-lib/aws-ses';
import { Construct } from 'constructs';
import { SERVER_ROOT } from '../../../scripts/paths.js';
import type { StageConfig } from '../config.js';
import { resourceName } from '../naming.js';

export interface EmailProps {
  readonly config: StageConfig;
  readonly zone: route53.IHostedZone;
}

const VERIFICATION_FUNCTION_DIR = join(
  SERVER_ROOT,
  'infra',
  'functions',
  'ses-domain-verification',
);

/** CloudFormation's maximum: how long a deploy waits for SES to verify a new domain. */
const WAIT_TIMEOUT = Duration.hours(12);

/**
 * SES domain identity for DOMAIN_NAME (Cognito verification mail and the app's noreply@ mail),
 * published through three DKIM CNAMEs, and `domainVerified`: a WaitCondition that completes only
 * once SES has verified those records.
 *
 * Cognito refuses to create a user pool whose SES sender is not verified yet, and SES verifies a
 * new domain some time after its DKIM records appear (44 minutes has been seen). The user pool
 * depends on `domainVerified`, so every deploy — the first one included — waits for SES (up to
 * 12 hours) instead of failing. A small function (infra/functions/ses-domain-verification) polls
 * SES and signals the WaitCondition. Later deploys do not wait again unless the domain changes.
 *
 * Record names MUST end with a dot: the DKIM names are unresolved tokens, and without the dot
 * CDK appends the zone name a second time.
 */
export class Email extends Construct {
  readonly identity: ses.EmailIdentity;
  readonly dkimRecords: route53.CnameRecord[];
  readonly domainVerified: CfnWaitCondition;

  constructor(scope: Construct, id: string, props: EmailProps) {
    super(scope, id);
    const { config } = props;
    const { region, account } = Stack.of(this);

    this.identity = new ses.EmailIdentity(this, 'EmailIdentity', {
      identity: ses.Identity.domain(config.domainName),
      dkimIdentity: ses.DkimIdentity.easyDkim(ses.EasyDkimSigningKeyLength.RSA_2048_BIT),
    });

    this.dkimRecords = this.identity.dkimRecords.map(
      (record, index) =>
        new route53.CnameRecord(this, `DkimRecord${String(index + 1)}`, {
          zone: props.zone,
          recordName: `${record.name}.`,
          domainName: record.value,
          ttl: Duration.minutes(5),
        }),
    );

    const functionName = resourceName(config.stage, 'ses-verification');
    const verifier = new lambda.Function(this, 'VerificationFunction', {
      functionName,
      description: 'Deploy-time wait until SES has verified DOMAIN_NAME',
      runtime: lambda.Runtime.NODEJS_24_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(VERIFICATION_FUNCTION_DIR),
      memorySize: 256,
      timeout: Duration.minutes(15),
      logGroup: new logs.LogGroup(this, 'VerificationLogGroup', {
        logGroupName: `/aws/lambda/${functionName}`,
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
    });
    verifier.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:GetEmailIdentity'],
        resources: [`arn:aws:ses:${region}:${account}:identity/${config.domainName}`],
      }),
    );
    // Hands a long wait over to a fresh invocation of itself (name-based ARN: no circular reference).
    verifier.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: [`arn:aws:lambda:${region}:${account}:function:${functionName}`],
      }),
    );

    // Logical IDs carry a hash of the domain: changing DOMAIN_NAME later creates a new wait for the
    // new identity instead of reusing the one that was already signalled.
    const domainKey = createHash('sha256').update(config.domainName).digest('hex').slice(0, 8);
    const waitHandle = new CfnWaitConditionHandle(this, `VerificationWaitHandle${domainKey}`);

    const startCheck = new CustomResource(this, 'VerificationCheck', {
      serviceToken: verifier.functionArn,
      resourceType: 'Custom::SesDomainVerification',
      properties: { DomainName: config.domainName, WaitHandleUrl: waitHandle.ref },
      serviceTimeout: Duration.minutes(5),
    });
    startCheck.node.addDependency(this.identity, ...this.dkimRecords);

    this.domainVerified = new CfnWaitCondition(this, `DomainVerified${domainKey}`, {
      handle: waitHandle.ref,
      timeout: String(WAIT_TIMEOUT.toSeconds()),
      count: 1,
    });
    this.domainVerified.node.addDependency(startCheck);
  }
}
