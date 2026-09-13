import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AssetHashType, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import type * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import {
  CODE_LAYER_DIR,
  DEPS_LAYER_DIR,
  FUNCTION_ASSET_DIR,
  LAYER_MANIFEST,
  SERVER_ROOT,
  type LayerManifest,
} from '../../../scripts/paths.js';
import type { StageConfig } from '../config.js';
import { resourceName } from '../naming.js';

export interface ComputeProps {
  readonly config: StageConfig;
  readonly userPool: cognito.IUserPool;
  readonly userPoolClient: cognito.IUserPoolClient;
  readonly assetsBucket: s3.IBucket;
  /** Token for the NoEcho DatabaseUrl parameter. */
  readonly databaseUrl: string;
}

const RUNTIME = lambda.Runtime.NODEJS_24_X;
const ARCHITECTURE = lambda.Architecture.ARM_64;
const FIXTURE_LAYER_DIR = join(SERVER_ROOT, 'infra', 'fixtures', 'layer');

/**
 * The whole API: one dependencies layer, one codebase layer, one function.
 *
 * - dependencies layer: production node_modules (large, changes rarely)
 * - codebase layer:     the esbuild bundle of src/ (tiny, changes every commit)
 * - function asset:     lambda/index.mjs, a one-line re-export (a handler cannot live in a layer)
 *
 * Both layers are built by scripts/build-layers.ts; their content hashes come from its manifest.
 */
export class Compute extends Construct {
  readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: ComputeProps) {
    super(scope, id);
    const { config } = props;
    const { region, account } = Stack.of(this);

    const layerCode = loadLayerCode(config.fixture);

    const dependenciesLayer = new lambda.LayerVersion(this, 'DependenciesLayer', {
      layerVersionName: resourceName(config.stage, 'dependencies'),
      description: 'Production node_modules for the API',
      code: layerCode.deps,
      compatibleRuntimes: [RUNTIME],
      compatibleArchitectures: [ARCHITECTURE],
    });

    const codebaseLayer = new lambda.LayerVersion(this, 'CodebaseLayer', {
      layerVersionName: resourceName(config.stage, 'codebase'),
      description: 'Bundled API code (src/)',
      code: layerCode.code,
      compatibleRuntimes: [RUNTIME],
      compatibleArchitectures: [ARCHITECTURE],
    });

    const functionName = resourceName(config.stage, 'api');

    // Explicit log group: sets retention without CDK's LogRetention helper Lambda.
    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${functionName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.function = new lambda.Function(this, 'Function', {
      functionName,
      description: 'Elytra API (/api/public, /api/private, /api/dev) and CI sync-db',
      runtime: RUNTIME,
      architecture: ARCHITECTURE,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(FUNCTION_ASSET_DIR),
      layers: [dependenciesLayer, codebaseLayer],
      memorySize: 1024,
      // HTTP API caps requests at 30s; the extra headroom is for the direct sync-db invoke.
      timeout: Duration.seconds(60),
      logGroup,
      environment: {
        ENV: config.stage,
        DOMAIN_NAME: config.domainName,
        DATABASE_URL: props.databaseUrl,
        S3_ASSETS_BUCKET_NAME: props.assetsBucket.bucketName,
        COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        COGNITO_CLIENT_ID: props.userPoolClient.userPoolClientId,
        NODE_OPTIONS: '--enable-source-maps',
      },
    });

    // Account deletion + dev reset.
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:AdminDeleteUser', 'cognito-idp:ListUsers'],
        resources: [props.userPool.userPoolArn],
      }),
    );

    // User media lives under media/ in the assets bucket.
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
        resources: [props.assetsBucket.arnForObjects('media/*')],
      }),
    );
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:ListBucket'],
        resources: [props.assetsBucket.bucketArn],
        conditions: { StringLike: { 's3:prefix': ['media', 'media/*'] } },
      }),
    );

    // App mail is always sent as noreply@DOMAIN_NAME.
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail'],
        resources: [`arn:aws:ses:${region}:${account}:identity/*`],
        conditions: { StringEquals: { 'ses:FromAddress': `noreply@${config.domainName}` } },
      }),
    );
  }
}

function loadLayerCode(fixture: boolean): { code: lambda.Code; deps: lambda.Code } {
  if (fixture) {
    return {
      code: lambda.Code.fromAsset(FIXTURE_LAYER_DIR),
      deps: lambda.Code.fromAsset(FIXTURE_LAYER_DIR),
    };
  }

  if (!existsSync(LAYER_MANIFEST)) {
    throw new Error('Lambda layers are not built. Run `npm run build:layers` first.');
  }
  const manifest = JSON.parse(readFileSync(LAYER_MANIFEST, 'utf8')) as LayerManifest;

  return {
    code: lambda.Code.fromAsset(CODE_LAYER_DIR, {
      assetHash: manifest.code,
      assetHashType: AssetHashType.CUSTOM,
    }),
    deps: lambda.Code.fromAsset(DEPS_LAYER_DIR, {
      assetHash: manifest.deps,
      assetHashType: AssetHashType.CUSTOM,
    }),
  };
}
