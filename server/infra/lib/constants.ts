/**
 * Single source of truth for names shared by the CDK app, the deploy/composer scripts, the local
 * dev server and (by value) the GitHub workflows.
 */

export const APP_NAME = 'elytra';
export const APP_DISPLAY_NAME = 'Elytra';

/** Region used when AWS_REGION is not set. */
export const DEFAULT_REGION = 'us-east-1';

/** CloudFront only accepts ACM certificates and WAF web ACLs from this region. */
export const CLOUDFRONT_REGION = 'us-east-1';

/** The stack region: AWS_REGION when set, otherwise us-east-1. */
export function resolveRegion(): string {
  // Read untyped: this file is compiled with and without src/types/env.d.ts.
  const env: Record<string, string | undefined> = process.env;
  const region = env['AWS_REGION'];
  // Empty counts as unset (CI passes blank variables through).
  return region === undefined || region === '' ? DEFAULT_REGION : region;
}

export const STAGES = ['dev', 'qa', 'prod'] as const;
export type Stage = (typeof STAGES)[number];

export function isStage(value: unknown): value is Stage {
  return typeof value === 'string' && (STAGES as readonly string[]).includes(value);
}

export function stackName(stage: Stage): string {
  return `${APP_NAME}-${stage}`;
}

/** CDK context keys (`-c key=value`) read by config.ts and passed by scripts/stage.ts. */
export const CONTEXT = {
  stage: 'stage',
  hostedZoneId: 'hostedZoneId',
  hostedZoneName: 'hostedZoneName',
  fixture: 'fixture',
  region: 'region',
  certificateArn: 'certificateArn',
  webAclArn: 'webAclArn',
  wwwAlias: 'wwwAlias',
} as const;

/**
 * Stack outputs — one per real consumer, nothing else. The deploy scripts and the local API read
 * them with infra/lib/stack-outputs.ts.
 */
export const OUTPUTS = {
  /** Frontend deploy: upload */
  clientBucketName: 'S3ClientBucketName',
  /** Frontend deploy: cache invalidation */
  distributionId: 'CloudFrontDistributionId',
  /** Backend deploy: database schema sync invoke */
  apiFunctionName: 'ApiFunctionName',
  /** Local dev server */
  userPoolId: 'CognitoUserPoolId',
  /** Local dev server */
  userPoolClientId: 'CognitoClientId',
  /** Local dev server */
  assetsBucketName: 'S3AssetsBucketName',
} as const;

export type OutputName = keyof typeof OUTPUTS;

/**
 * The only tags, on the stack and on every resource that can carry tags (infra/lib/tags.ts). The
 * keys match the account's active cost allocation tags; the backend deploy activates them if needed.
 */
export const TAG_KEYS = { project: 'Project', stage: 'Stage' } as const;

export function stackTags(stage: Stage): Record<string, string> {
  return { [TAG_KEYS.project]: APP_NAME, [TAG_KEYS.stage]: stage };
}

/**
 * Assets bucket layout. Only `media/` is served (CloudFront `/media/*`); `tmp/` holds objects that
 * must never be public (staged browser uploads, export ZIPs) and expires after a day.
 */
export const S3_PREFIXES = {
  media: 'media',
  tmp: 'tmp',
  staging: 'tmp/staging',
  exports: 'tmp/exports',
} as const;

/** Days before a lifecycle rule deletes a staged upload or an export ZIP. */
export const TMP_OBJECT_EXPIRATION_DAYS = 1;

/**
 * Direct-invoke events `{ action }` the API function handles besides HTTP. They are reachable
 * only through lambda:InvokeFunction (CI, or anyone with AWS credentials for the account), never
 * through the HTTP API.
 */
/** Sync the database schema (every deploy, every stage). */
export const SYNC_DB_ACTION = 'sync-db';
/** Wipe the stage: database, S3 user uploads, Cognito users. Refused on prod. */
export const RESET_DB_ACTION = 'reset-db';

export const API_ACTIONS = [SYNC_DB_ACTION, RESET_DB_ACTION] as const;
export type ApiAction = (typeof API_ACTIONS)[number];

/** Name of the NoEcho CloudFormation parameter carrying DATABASE_URL. */
export const DATABASE_URL_PARAMETER = 'DatabaseUrl';
