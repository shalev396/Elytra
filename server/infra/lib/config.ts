import { existsSync } from 'node:fs';
import type { App } from 'aws-cdk-lib';
import {
  CLOUDFRONT_REGION,
  CONTEXT,
  DEFAULT_REGION,
  isStage,
  resolveRegion,
  STAGES,
  type Stage,
} from './constants.js';

/**
 * Everything the stack needs to know about a stage, from server/.env.<stage> or the environment:
 *
 *   DOMAIN_NAME       required
 *   AWS_REGION        optional, defaults to us-east-1
 *   CERTIFICATE_ARN   ACM certificate in us-east-1 for DOMAIN_NAME; optional only when the stack
 *                     region is us-east-1 (the stack then creates the certificate itself)
 *   WAF_WEB_ACL_ARN   optional existing global (CLOUDFRONT scope) web ACL to attach
 *   WWW_ALIAS         'true' also serves www.DOMAIN_NAME from the same distribution (opt-in;
 *                     CERTIFICATE_ARN, when given, must cover it too)
 *
 * The hosted zone is never configured or cached: scripts/stage.ts finds the public Route 53 zone
 * that owns DOMAIN_NAME at deploy time and passes it as `-c hostedZoneId=` / `-c hostedZoneName=`.
 * DATABASE_URL is passed at deploy time as a NoEcho parameter; the account comes from the
 * deploying credentials.
 *
 * `-c fixture=true` swaps in fake values so tests and the Infrastructure Composer drawing synth
 * without credentials, env files or built layers (`-c region=`, `-c certificateArn=`,
 * `-c webAclArn=` and `-c wwwAlias=true` override them).
 */
export interface StageConfig {
  readonly stage: Stage;
  readonly isProd: boolean;
  readonly domainName: string;
  /** Public hosted zone that owns domainName, resolved at deploy time. */
  readonly hostedZoneId: string;
  readonly hostedZoneName: string;
  readonly account: string;
  readonly region: string;
  /** Existing certificate to use; undefined means the stack creates one (us-east-1 only). */
  readonly certificateArn: string | undefined;
  /** Existing global WAF web ACL to attach; undefined means no WAF. */
  readonly webAclArn: string | undefined;
  /** `www.<domainName>`, served by the same distribution when WWW_ALIAS=true; otherwise undefined. */
  readonly wwwDomainName?: string;
  readonly fixture: boolean;
}

export const FIXTURE_ACCOUNT = '123456789012';
export const FIXTURE_ZONE_ID = 'Z0000000000000FIXTURE';
export const FIXTURE_ZONE_NAME = 'example.com';

/** Longest bucket name the stack creates from DOMAIN_NAME: `<DOMAIN_NAME>-assets`. */
export const ASSETS_BUCKET_SUFFIX = '-assets';
const MAX_BUCKET_NAME = 63;

const REGION_PATTERN = /^[a-z]{2}(-[a-z]+)+-\d$/;
const DOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
const ZONE_ID_PATTERN = /^Z[A-Z0-9]+$/;
const CERTIFICATE_ARN_PATTERN = new RegExp(
  `^arn:aws:acm:${CLOUDFRONT_REGION}:\\d{12}:certificate/[0-9a-f-]+$`,
);
const WEB_ACL_ARN_PATTERN = new RegExp(
  `^arn:aws:wafv2:${CLOUDFRONT_REGION}:\\d{12}:global/webacl/[\\w-]+/[0-9a-f-]+$`,
);

const optional = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

/**
 * DOMAIN_NAME doubles as the client bucket name (and `<DOMAIN_NAME>-assets` as the assets bucket),
 * so it must also be a valid S3 bucket name.
 */
export function validateDomainName(stage: Stage, domainName: string): void {
  if (!DOMAIN_PATTERN.test(domainName)) {
    throw new Error(
      `DOMAIN_NAME is missing or invalid for stage "${stage}" (got "${domainName}").`,
    );
  }
  if (domainName.length + ASSETS_BUCKET_SUFFIX.length > MAX_BUCKET_NAME) {
    throw new Error(
      `DOMAIN_NAME for stage "${stage}" is too long: the assets bucket "${domainName}${ASSETS_BUCKET_SUFFIX}" ` +
        `must be at most ${String(MAX_BUCKET_NAME)} characters.`,
    );
  }
}

/** The hosted zone must own DOMAIN_NAME (be the domain itself or one of its parents). */
export function validateHostedZone(input: {
  stage: Stage;
  domainName: string;
  hostedZoneId: string | undefined;
  hostedZoneName: string | undefined;
}): { hostedZoneId: string; hostedZoneName: string } {
  const { stage, domainName } = input;
  const hostedZoneId = input.hostedZoneId;
  const hostedZoneName = input.hostedZoneName?.replace(/\.$/, '').toLowerCase();

  if (hostedZoneId === undefined || hostedZoneName === undefined) {
    throw new Error(
      `No hosted zone for stage "${stage}". Run through \`npm run deploy:backend -- ${stage}\`, ` +
        `which looks up the Route 53 zone for DOMAIN_NAME.`,
    );
  }
  if (!ZONE_ID_PATTERN.test(hostedZoneId)) {
    throw new Error(`Hosted zone id "${hostedZoneId}" for stage "${stage}" is not valid.`);
  }
  if (domainName !== hostedZoneName && !domainName.endsWith(`.${hostedZoneName}`)) {
    throw new Error(
      `Hosted zone "${hostedZoneName}" does not contain DOMAIN_NAME "${domainName}" (stage "${stage}").`,
    );
  }
  return { hostedZoneId, hostedZoneName };
}

/**
 * Certificate rule: use CERTIFICATE_ARN when given (it must be in us-east-1); otherwise the stack
 * can only create one when it is itself deployed in us-east-1.
 */
export function validateEdgeInputs(input: {
  stage: Stage;
  region: string;
  certificateArn: string | undefined;
  webAclArn: string | undefined;
}): void {
  const { stage, region, certificateArn, webAclArn } = input;

  if (!REGION_PATTERN.test(region)) {
    throw new Error(`AWS_REGION "${region}" is not a valid region for stage "${stage}".`);
  }

  if (certificateArn !== undefined && !CERTIFICATE_ARN_PATTERN.test(certificateArn)) {
    throw new Error(
      `CERTIFICATE_ARN for stage "${stage}" must be an ACM certificate in ${CLOUDFRONT_REGION} ` +
        `(CloudFront requirement). Got "${certificateArn}".`,
    );
  }
  if (certificateArn === undefined && region !== CLOUDFRONT_REGION) {
    throw new Error(
      `CERTIFICATE_ARN is required for stage "${stage}": the stack is in ${region}, and CloudFront ` +
        `only accepts certificates from ${CLOUDFRONT_REGION}. Request a certificate for DOMAIN_NAME ` +
        `in ${CLOUDFRONT_REGION} and set CERTIFICATE_ARN (or deploy the stack to ${CLOUDFRONT_REGION}).`,
    );
  }

  if (webAclArn !== undefined && !WEB_ACL_ARN_PATTERN.test(webAclArn)) {
    throw new Error(
      `WAF_WEB_ACL_ARN for stage "${stage}" must be a global (CLOUDFRONT scope) web ACL in ` +
        `${CLOUDFRONT_REGION}. Got "${webAclArn}".`,
    );
  }
}

/**
 * `www.<DOMAIN_NAME>` when the alias is switched on. Opt-in rather than tied to a stage: a domain
 * like `app.example.com` would otherwise get `www.app.example.com`.
 */
export function wwwDomainNameFor(
  domainName: string,
  enabled: string | undefined,
): string | undefined {
  return enabled === 'true' ? `www.${domainName}` : undefined;
}

export function loadConfig(app: App): StageConfig {
  const context = (key: string): string | undefined => optional(app.node.tryGetContext(key));

  const stage: unknown = app.node.tryGetContext(CONTEXT.stage);
  if (!isStage(stage)) {
    throw new Error(`Pass the stage with -c stage=<${STAGES.join('|')}> (got "${String(stage)}").`);
  }

  const fixture = context(CONTEXT.fixture) === 'true';
  if (fixture) {
    const domainName = `${stage}.${FIXTURE_ZONE_NAME}`;
    const region = context(CONTEXT.region) ?? DEFAULT_REGION;
    const certificateArn = context(CONTEXT.certificateArn);
    const webAclArn = context(CONTEXT.webAclArn);
    const wwwDomainName = wwwDomainNameFor(domainName, context(CONTEXT.wwwAlias));
    validateDomainName(stage, domainName);
    validateEdgeInputs({ stage, region, certificateArn, webAclArn });
    return {
      stage,
      isProd: stage === 'prod',
      domainName,
      hostedZoneId: FIXTURE_ZONE_ID,
      hostedZoneName: FIXTURE_ZONE_NAME,
      account: FIXTURE_ACCOUNT,
      region,
      certificateArn,
      webAclArn,
      ...(wwwDomainName === undefined ? {} : { wwwDomainName }),
      fixture,
    };
  }

  const envFile = `.env.${stage}`;
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile); // never overrides variables already set (CI wins)
  }

  const domainName = (process.env['DOMAIN_NAME'] ?? '').trim().toLowerCase();
  validateDomainName(stage, domainName);

  const account = process.env['CDK_DEFAULT_ACCOUNT'] ?? '';
  if (!/^\d{12}$/.test(account)) {
    throw new Error(
      'No AWS account resolved from credentials. Configure AWS credentials and retry.',
    );
  }

  const zone = validateHostedZone({
    stage,
    domainName,
    hostedZoneId: context(CONTEXT.hostedZoneId),
    hostedZoneName: context(CONTEXT.hostedZoneName),
  });

  const region = resolveRegion();
  const certificateArn = optional(process.env['CERTIFICATE_ARN']);
  const webAclArn = optional(process.env['WAF_WEB_ACL_ARN']);
  const wwwDomainName = wwwDomainNameFor(domainName, optional(process.env['WWW_ALIAS']));
  validateEdgeInputs({ stage, region, certificateArn, webAclArn });

  return {
    stage,
    isProd: stage === 'prod',
    domainName,
    ...zone,
    account,
    region,
    certificateArn,
    webAclArn,
    ...(wwwDomainName === undefined ? {} : { wwwDomainName }),
    fixture,
  };
}
