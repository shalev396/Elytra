import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct, type IDependable } from 'constructs';
import { SERVER_ROOT } from '../../../scripts/paths.js';
import type { StageConfig } from '../config.js';
import { APP_DISPLAY_NAME } from '../constants.js';
import { resourceName } from '../naming.js';

export interface AuthProps {
  readonly config: StageConfig;
  /**
   * What the user pool must wait for: Cognito rejects an SES sender that is not verified yet, so
   * the pool depends on Email's `domainVerified`, which completes once SES has verified the domain.
   */
  readonly waitFor: IDependable[];
}

const VERIFICATION_TEMPLATE = join(SERVER_ROOT, 'email-templates', 'cognito-verification.html');

export class Auth extends Construct {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthProps) {
    super(scope, id);
    const { config } = props;

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: resourceName(config.stage, 'users'),
      featurePlan: cognito.FeaturePlan.ESSENTIALS,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: false },
        fullname: { required: false, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      email: cognito.UserPoolEmail.withSES({
        fromEmail: `authenticator@${config.domainName}`,
        sesVerifiedDomain: config.domainName,
        sesRegion: Stack.of(this).region,
      }),
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
        emailSubject: `${APP_DISPLAY_NAME} — Verify your email`,
        emailBody: readFileSync(VERIFICATION_TEMPLATE, 'utf8'),
      },
      deletionProtection: config.isProd,
      removalPolicy: config.isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
    for (const dependency of props.waitFor) {
      this.userPool.node.addDependency(dependency);
    }

    this.userPoolClient = this.userPool.addClient('Client', {
      userPoolClientName: resourceName(config.stage, 'client'),
      generateSecret: false,
      disableOAuth: true,
      authFlows: { userPassword: true, userSrp: true },
      preventUserExistenceErrors: true,
      enableTokenRevocation: true,
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30),
      readAttributes: new cognito.ClientAttributes().withStandardAttributes({
        email: true,
        fullname: true,
        emailVerified: true,
      }),
      writeAttributes: new cognito.ClientAttributes().withStandardAttributes({
        email: true,
        fullname: true,
      }),
    });
  }
}
