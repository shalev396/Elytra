import { join } from 'node:path';
import type * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SERVER_ROOT } from '../../../scripts/paths.js';
import type { StageConfig } from '../config.js';
import { APP_DISPLAY_NAME } from '../constants.js';
import { resourceName } from '../naming.js';

export interface EdgeProps {
  readonly config: StageConfig;
  readonly zone: route53.IHostedZone;
  readonly clientBucket: s3.IBucket;
  readonly assetsBucket: s3.IBucket;
  readonly httpApi: apigwv2.IHttpApi;
}

/**
 * Everything on DOMAIN_NAME: certificate, CloudFront distribution and the DNS alias.
 *
 * Certificate: CERTIFICATE_ARN when given (always us-east-1), otherwise created here — config.ts
 * only allows that when the stack itself is in us-east-1. WAF: WAF_WEB_ACL_ARN when given.
 *
 *   /*        → client bucket (OAC) + SPA rewrite function
 *   /api/*    → HTTP API, never cached
 *   /media/*  → assets bucket (OAC)
 *
 * No errorResponses: they apply distribution-wide and would mask API 403/404 responses.
 */
export class Edge extends Construct {
  readonly distribution: cloudfront.Distribution;
  readonly aliasRecord: route53.ARecord;

  constructor(scope: Construct, id: string, props: EdgeProps) {
    super(scope, id);
    const { config } = props;

    const certificate =
      config.certificateArn === undefined
        ? new acm.Certificate(this, 'Certificate', {
            domainName: config.domainName,
            validation: acm.CertificateValidation.fromDns(props.zone),
          })
        : acm.Certificate.fromCertificateArn(this, 'Certificate', config.certificateArn);

    const originAccessControl = new cloudfront.S3OriginAccessControl(this, 'OriginAccessControl', {
      signing: cloudfront.Signing.SIGV4_ALWAYS,
    });

    const spaRewrite = new cloudfront.Function(this, 'SpaRewrite', {
      functionName: resourceName(config.stage, 'spa-rewrite'),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromFile({
        filePath: join(SERVER_ROOT, 'infra', 'functions', 'spa-rewrite.js'),
      }),
    });

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `${APP_DISPLAY_NAME} ${config.stage}`,
      domainNames: [config.domainName],
      certificate,
      ...(config.webAclArn === undefined ? {} : { webAclId: config.webAclArn }),
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(props.clientBucket, {
          originAccessControl,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        functionAssociations: [
          { function: spaRewrite, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
        ],
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(
            `${props.httpApi.apiId}.execute-api.${Stack.of(this).region}.${Stack.of(this).urlSuffix}`,
            {
              protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
            },
          ),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
        '/media/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(props.assetsBucket, {
            originAccessControl,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
          responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        },
      },
    });

    this.aliasRecord = new route53.ARecord(this, 'AliasRecord', {
      zone: props.zone,
      recordName: `${config.domainName}.`,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
    });
  }
}
