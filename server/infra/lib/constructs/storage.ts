import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { ASSETS_BUCKET_SUFFIX, type StageConfig } from '../config.js';

/**
 * Client (Vite build) and assets (user media under media/) buckets, named after the stage domain:
 * `<DOMAIN_NAME>` and `<DOMAIN_NAME>-assets`. Both are fully private and only readable by
 * CloudFront through origin access control.
 *
 * No autoDeleteObjects: that adds a custom-resource Lambda. Buckets are emptied by hand before a
 * stack is deleted. Prod keeps the assets bucket if the stack goes away.
 */
export class Storage extends Construct {
  readonly clientBucket: s3.Bucket;
  readonly assetsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, config: StageConfig) {
    super(scope, id);

    const privateBucket = {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    } satisfies s3.BucketProps;

    this.clientBucket = new s3.Bucket(this, 'ClientBucket', {
      ...privateBucket,
      bucketName: config.domainName,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      ...privateBucket,
      bucketName: `${config.domainName}${ASSETS_BUCKET_SUFFIX}`,
      versioned: true,
      lifecycleRules: [{ noncurrentVersionExpiration: Duration.days(30) }],
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
      removalPolicy: config.isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
  }
}
