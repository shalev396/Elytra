import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { ASSETS_BUCKET_SUFFIX, type StageConfig } from '../config.js';
import { S3_PREFIXES, TMP_OBJECT_EXPIRATION_DAYS } from '../constants.js';

/**
 * Client (Vite build) and assets buckets, named after the stage domain: `<DOMAIN_NAME>` and
 * `<DOMAIN_NAME>-assets`. Both are fully private and only readable by CloudFront through origin
 * access control.
 *
 * Assets bucket layout:
 *   media/         user media, served by CloudFront under /media/*
 *   tmp/staging/   browser uploads (presigned POST), consumed by the API right away
 *   tmp/exports/   account export ZIPs, downloaded once through a presigned GET
 * tmp/ is never routed by CloudFront; lifecycle rules delete anything left there after a day.
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
      lifecycleRules: [
        { id: 'DeleteOldVersions', noncurrentVersionExpiration: Duration.days(30) },
        // Export ZIPs are downloaded once through a presigned URL.
        {
          id: 'DeleteExportZips',
          prefix: `${S3_PREFIXES.exports}/`,
          expiration: Duration.days(TMP_OBJECT_EXPIRATION_DAYS),
        },
        // Staged uploads are consumed immediately; this only catches abandoned ones.
        {
          id: 'DeleteStagedUploads',
          prefix: `${S3_PREFIXES.staging}/`,
          expiration: Duration.days(TMP_OBJECT_EXPIRATION_DAYS),
        },
      ],
      cors: [
        {
          // POST is the browser's presigned upload form; without it the preflight fails.
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD, s3.HttpMethods.POST],
          // Stage origins only: /media is served same-origin through CloudFront anyway.
          allowedOrigins: [
            'http://localhost:5173',
            `https://${config.domainName}`,
            ...(config.wwwDomainName === undefined ? [] : [`https://${config.wwwDomainName}`]),
          ],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3600,
        },
      ],
      removalPolicy: config.isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
  }
}
