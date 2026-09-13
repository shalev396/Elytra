import { CfnOutput, CfnParameter, Stack, type StackProps } from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';
import type { StageConfig } from './config.js';
import { APP_DISPLAY_NAME, DATABASE_URL_PARAMETER, OUTPUTS } from './constants.js';
import { Api } from './constructs/api.js';
import { Auth } from './constructs/auth.js';
import { Compute } from './constructs/compute.js';
import { Edge } from './constructs/edge.js';
import { Email } from './constructs/email.js';
import { Storage } from './constructs/storage.js';

export interface ElytraStackProps extends StackProps {
  readonly config: StageConfig;
}

/**
 * One independent stack per stage. Wiring and deploy order only — no business logic.
 *
 * Order (enforced by references and explicit dependencies):
 *   Storage, Email (identity + DKIM), Api (HttpApi only)
 *     → Edge (certificate → distribution → alias record)
 *       → Auth (user pool waits for DKIM + distribution + alias, giving SES time to verify)
 *         → Compute (one function, two layers) → Api routes
 */
export class ElytraStack extends Stack {
  constructor(scope: Construct, id: string, props: ElytraStackProps) {
    const { config } = props;
    super(scope, id, {
      ...props,
      env: { account: config.account, region: config.region },
      description: `${APP_DISPLAY_NAME} (${config.stage}): CloudFront, S3, HTTP API + Lambda, Cognito, SES`,
      terminationProtection: config.isProd,
      analyticsReporting: false,
      // Tags: applied app-wide by tags.ts, never per stack or resource.
    });

    const databaseUrl = new CfnParameter(this, DATABASE_URL_PARAMETER, {
      type: 'String',
      noEcho: true,
      minLength: 1,
      description:
        'DATABASE_URL connection string. Passed at deploy time; never stored in the template.',
    });

    // Resolved at deploy time (scripts/stage.ts), so nothing is looked up or cached in cdk.context.json.
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: config.hostedZoneId,
      zoneName: config.hostedZoneName,
    });

    const storage = new Storage(this, 'Storage', config);
    const email = new Email(this, 'Email', { config, zone });
    const api = new Api(this, 'Api', config);

    const edge = new Edge(this, 'Edge', {
      config,
      zone,
      clientBucket: storage.clientBucket,
      assetsBucket: storage.assetsBucket,
      httpApi: api.httpApi,
    });

    const auth = new Auth(this, 'Auth', {
      config,
      waitFor: [email.domainVerified],
    });

    const compute = new Compute(this, 'Compute', {
      config,
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
      assetsBucket: storage.assetsBucket,
      databaseUrl: databaseUrl.valueAsString,
    });

    api.addRoutes({
      handler: compute.function,
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
    });

    // Stack-scope outputs keep their logical IDs exactly equal to the keys consumers read.
    new CfnOutput(this, OUTPUTS.clientBucketName, { value: storage.clientBucket.bucketName });
    new CfnOutput(this, OUTPUTS.distributionId, { value: edge.distribution.distributionId });
    new CfnOutput(this, OUTPUTS.apiFunctionName, { value: compute.function.functionName });
    new CfnOutput(this, OUTPUTS.userPoolId, { value: auth.userPool.userPoolId });
    new CfnOutput(this, OUTPUTS.userPoolClientId, { value: auth.userPoolClient.userPoolClientId });
    new CfnOutput(this, OUTPUTS.assetsBucketName, { value: storage.assetsBucket.bucketName });
  }
}
