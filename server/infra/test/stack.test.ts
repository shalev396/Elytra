import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';
import { CfnResource as CdkCfnResource, TagManager, Validations } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { SERVER_ROOT } from '../../scripts/paths.js';
import { buildApp } from '../lib/app.js';
import { FIXTURE_ZONE_ID, validateDomainName, validateHostedZone } from '../lib/config.js';
import {
  APP_NAME,
  OUTPUTS,
  S3_PREFIXES,
  STAGES,
  TMP_OBJECT_EXPIRATION_DAYS,
  type Stage,
} from '../lib/constants.js';

interface CfnResource {
  Type: string;
  Properties?: Record<string, unknown>;
  DependsOn?: string[];
  DeletionPolicy?: string;
}

interface DistributionConfig {
  Aliases: string[];
  DefaultCacheBehavior: Record<string, unknown>;
  CacheBehaviors: Record<string, unknown>[];
  Origins: { Id: string; DomainName: unknown }[];
}

interface CorsRule {
  AllowedMethods: string[];
  AllowedOrigins: string[];
  AllowedHeaders: string[];
  ExposedHeaders: string[];
  MaxAge: number;
}

type Statement = Record<string, unknown>;

function synth(
  stage: Stage,
  extraContext: Record<string, string> = {},
): { template: Template; resources: Record<string, CfnResource> } {
  const { app, stack } = buildApp({ context: { stage, fixture: 'true', ...extraContext } });
  // Runs cdk-nag: any unacknowledged finding throws here.
  const assembly = app.synth();
  const template = Template.fromJSON(assembly.getStackByName(stack.stackName).template as object);
  const resources = template.toJSON()['Resources'] as Record<string, CfnResource>;
  return { template, resources };
}

function distributionConfig(template: Template): DistributionConfig {
  const [distribution] = Object.values(
    template.findResources('AWS::CloudFront::Distribution'),
  ) as CfnResource[];
  return distribution?.Properties?.['DistributionConfig'] as DistributionConfig;
}

function assetsCorsRule(template: Template, domain: string): CorsRule {
  const [bucket] = Object.values(
    template.findResources('AWS::S3::Bucket', { Properties: { BucketName: `${domain}-assets` } }),
  ) as CfnResource[];
  const cors = bucket?.Properties?.['CorsConfiguration'] as { CorsRules: CorsRule[] };
  const [rule, ...others] = cors.CorsRules;
  assert.ok(rule);
  assert.deepEqual(others, []);
  return rule;
}

function httpApiCorsOrigins(template: Template): string[] {
  const [api] = Object.values(template.findResources('AWS::ApiGatewayV2::Api')) as CfnResource[];
  return (api?.Properties?.['CorsConfiguration'] as { AllowOrigins: string[] }).AllowOrigins;
}

function aliasRecordNames(resources: Record<string, CfnResource>): string[] {
  return Object.values(resources)
    .filter(
      (r) => r.Type === 'AWS::Route53::RecordSet' && r.Properties?.['AliasTarget'] !== undefined,
    )
    .map((r) => r.Properties?.['Name'] as string)
    .sort();
}

const actionsOf = (statement: Statement): string[] => [statement['Action']].flat() as string[];

/** The real CloudFront Function file, run exactly as it is uploaded. */
const spaRewrite = runInNewContext(
  `${readFileSync(join(SERVER_ROOT, 'infra/functions/spa-rewrite.js'), 'utf8')}; handler`,
) as (event: { request: { uri: string } }) => { uri: string };

for (const stage of STAGES) {
  describe(`elytra-${stage}`, () => {
    const { template, resources } = synth(stage);
    const isProd = stage === 'prod';

    it('creates one API function with two layers, and only the SES verification waiter besides', () => {
      template.resourceCountIs('AWS::Lambda::LayerVersion', 2);
      const functions = Object.values(resources).filter((r) => r.Type === 'AWS::Lambda::Function');
      const api = functions.filter((r) => r.Properties?.['Layers'] !== undefined);
      assert.equal(api.length, 1);
      assert.equal((api[0]?.Properties?.['Layers'] as unknown[]).length, 2);
      assert.equal(functions.length, 2, 'only the API function and the SES verification waiter');
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs24.x',
        Architectures: ['arm64'],
        Handler: 'index.handler',
        Layers: Match.arrayWith([Match.objectLike({ Ref: Match.anyValue() })]),
      });

      const custom = Object.values(resources).filter(
        (r) => r.Type.startsWith('Custom::') || r.Type === 'AWS::CloudFormation::CustomResource',
      );
      assert.deepEqual(
        custom.map((r) => r.Type),
        ['Custom::SesDomainVerification'],
      );
      template.resourceCountIs('AWS::CloudFormation::WaitCondition', 1);
      for (const r of Object.values(resources)) {
        assert.notEqual(r.Type, 'AWS::StepFunctions::StateMachine');
        assert.notEqual(r.Type, 'AWS::CDK::Metadata');
      }
    });

    it('routes only public and private (JWT) to the one integration', () => {
      template.resourceCountIs('AWS::ApiGatewayV2::Integration', 1);
      template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
        RouteKey: 'ANY /api/public/{proxy+}',
        AuthorizationType: 'NONE',
      });
      template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
        RouteKey: 'ANY /api/private/{proxy+}',
        AuthorizationType: 'JWT',
      });
      // Stage maintenance (sync-db, reset-db) is a direct Lambda invoke, never an HTTP route.
      const routeKeys = Object.values(template.findResources('AWS::ApiGatewayV2::Route')).map(
        (r) => (r['Properties'] as { RouteKey: string }).RouteKey,
      );
      assert.deepEqual(routeKeys.sort(), ['ANY /api/private/{proxy+}', 'ANY /api/public/{proxy+}']);
    });

    it('names the buckets after the stage domain', () => {
      template.hasResourceProperties('AWS::S3::Bucket', { BucketName: `${stage}.example.com` });
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: `${stage}.example.com-assets`,
      });
    });

    it('uses the hosted zone from context, never a lookup', () => {
      const records = Object.values(resources).filter((r) => r.Type === 'AWS::Route53::RecordSet');
      assert.ok(records.length > 0);
      for (const r of records) assert.equal(r.Properties?.['HostedZoneId'], FIXTURE_ZONE_ID);
    });

    it('keeps buckets private and served only through OAC', () => {
      template.resourceCountIs('AWS::S3::Bucket', 2);
      template.allResourcesProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        WebsiteConfiguration: Match.absent(),
      });
      template.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1);
    });

    it('rewrites SPA routes to /index.html and leaves files alone', () => {
      const rewrite = (uri: string): string => spaRewrite({ request: { uri } }).uri;
      for (const route of ['/', '/en', '/en/', '/en/legal/terms', '/en/dashboard/projects/new']) {
        assert.equal(rewrite(route), '/index.html', route);
      }
      for (const file of [
        '/index.html',
        '/robots.txt',
        '/assets/index-abc.js',
        '/icon-192.png',
        '/manifest.webmanifest',
      ]) {
        assert.equal(rewrite(file), file, file);
      }
    });

    it('runs the SPA rewrite on the default behavior only (viewer request)', () => {
      const config = distributionConfig(template);
      const associations = config.DefaultCacheBehavior['FunctionAssociations'] as {
        EventType: string;
      }[];
      assert.deepEqual(
        associations.map((a) => a.EventType),
        ['viewer-request'],
      );
      for (const behavior of config.CacheBehaviors) {
        assert.equal(behavior['FunctionAssociations'], undefined, String(behavior['PathPattern']));
      }
      template.resourceCountIs('AWS::CloudFront::Function', 1);
      template.hasResourceProperties('AWS::CloudFront::Function', {
        FunctionConfig: Match.objectLike({ Runtime: 'cloudfront-js-2.0' }),
      });
    });

    it('serves only /media/* from the assets bucket, never tmp/', () => {
      const config = distributionConfig(template);
      const assetsOrigins = config.Origins.filter((o) =>
        JSON.stringify(o.DomainName).includes('StorageAssetsBucket'),
      ).map((o) => o.Id);
      assert.equal(assetsOrigins.length, 1);
      const assetsBehaviors = config.CacheBehaviors.filter((b) =>
        assetsOrigins.includes(b['TargetOriginId'] as string),
      ).map((b) => b['PathPattern']);
      assert.deepEqual(assetsBehaviors, [`/${S3_PREFIXES.media}/*`]);
      for (const behavior of config.CacheBehaviors) {
        assert.ok(!String(behavior['PathPattern']).startsWith('/tmp'));
      }
    });

    it('lets CloudFront list the client bucket, so a missing file is a 404 (not 403)', () => {
      const cloudFrontStatements = (bucketPrefix: string): Statement[] => {
        const policy = Object.values(resources).find(
          (r) =>
            r.Type === 'AWS::S3::BucketPolicy' &&
            JSON.stringify(r.Properties?.['Bucket']).includes(bucketPrefix),
        );
        const { Statement } = policy?.Properties?.['PolicyDocument'] as { Statement: Statement[] };
        return Statement.filter(
          (st) =>
            (st['Principal'] as { Service?: unknown } | undefined)?.Service ===
            'cloudfront.amazonaws.com',
        );
      };

      // One grant, so ListBucket carries exactly the GetObject condition (this distribution only).
      const [client, ...otherClient] = cloudFrontStatements('StorageClientBucket');
      assert.ok(client);
      assert.deepEqual(otherClient, []);
      assert.equal(client['Effect'], 'Allow');
      assert.deepEqual([...actionsOf(client)].sort(), ['s3:GetObject', 's3:ListBucket']);
      const resourcesJson = JSON.stringify(client['Resource']);
      assert.match(resourcesJson, /\{"Fn::GetAtt":\["StorageClientBucket\w+","Arn"\]\}/);
      assert.match(resourcesJson, /"\/\*"/);
      assert.match(JSON.stringify(client['Condition']), /AWS:SourceArn.*EdgeDistribution/);

      // The assets bucket stays unlistable: tmp/ keys must not be discoverable.
      for (const st of cloudFrontStatements('StorageAssetsBucket')) {
        assert.ok(!actionsOf(st).includes('s3:ListBucket'));
      }
    });

    it('expires export ZIPs and staged uploads after a day, old asset versions after 30', () => {
      assert.equal(TMP_OBJECT_EXPIRATION_DAYS, 1);
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: `${stage}.example.com-assets`,
        LifecycleConfiguration: {
          Rules: Match.arrayWith([
            Match.objectLike({
              Id: 'DeleteOldVersions',
              NoncurrentVersionExpiration: { NoncurrentDays: 30 },
            }),
            Match.objectLike({
              Id: 'DeleteExportZips',
              Prefix: 'tmp/exports/',
              ExpirationInDays: 1,
            }),
            Match.objectLike({
              Id: 'DeleteStagedUploads',
              Prefix: 'tmp/staging/',
              ExpirationInDays: 1,
            }),
          ]),
        },
      });
    });

    it('allows presigned browser POSTs to the assets bucket from the stage origins only', () => {
      const rule = assetsCorsRule(template, `${stage}.example.com`);
      assert.deepEqual([...rule.AllowedMethods].sort(), ['GET', 'HEAD', 'POST']);
      assert.deepEqual(rule.AllowedOrigins, [
        'http://localhost:5173',
        `https://${stage}.example.com`,
      ]);
      assert.ok(!rule.AllowedOrigins.includes('*'));
      assert.deepEqual(rule.ExposedHeaders, ['ETag']);
      assert.equal(rule.MaxAge, 3600);
    });

    it('serves DOMAIN_NAME only while WWW_ALIAS is off', () => {
      assert.deepEqual(distributionConfig(template).Aliases, [`${stage}.example.com`]);
      assert.deepEqual(aliasRecordNames(resources), [`${stage}.example.com.`]);
      assert.ok(!JSON.stringify(template.toJSON()).includes('www.'));
    });

    it('passes DATABASE_URL only as a NoEcho parameter', () => {
      template.hasParameter('DatabaseUrl', { Type: 'String', NoEcho: true });
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: { Variables: Match.objectLike({ DATABASE_URL: { Ref: 'DatabaseUrl' } }) },
      });
    });

    it('uses fully qualified (trailing dot) record names', () => {
      for (const r of Object.values(resources).filter(
        (x) => x.Type === 'AWS::Route53::RecordSet',
      )) {
        assert.match(JSON.stringify(r.Properties?.['Name']), /\.("|"\]\]\})$/);
      }
    });

    it('creates the user pool only after SES has verified the domain', () => {
      const pool = Object.values(resources).find((r) => r.Type === 'AWS::Cognito::UserPool');
      assert.ok((pool?.DependsOn ?? []).some((d) => d.startsWith('EmailDomainVerified')));

      const [checkId, check] = Object.entries(resources).find(
        ([, r]) => r.Type === 'Custom::SesDomainVerification',
      ) ?? ['', undefined];
      const checkDeps = check?.DependsOn ?? [];
      assert.equal(checkDeps.filter((d) => d.startsWith('EmailDkimRecord')).length, 3);
      assert.ok(checkDeps.some((d) => d.startsWith('EmailEmailIdentity')));
      assert.equal(check?.Properties?.['DomainName'], `${stage}.example.com`);

      const wait = Object.values(resources).find(
        (r) => r.Type === 'AWS::CloudFormation::WaitCondition',
      );
      assert.equal(wait?.Properties?.['Timeout'], '43200');
      assert.ok((wait.DependsOn ?? []).includes(checkId), 'the wait starts after the check');
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        AllowedOAuthFlowsUserPoolClient: false,
        GenerateSecret: false,
        ExplicitAuthFlows: Match.arrayWith([
          'ALLOW_USER_PASSWORD_AUTH',
          'ALLOW_USER_SRP_AUTH',
          'ALLOW_REFRESH_TOKEN_AUTH',
        ]),
      });
    });

    it('protects prod data only in prod', () => {
      const pool = Object.values(resources).find((r) => r.Type === 'AWS::Cognito::UserPool');
      assert.equal(pool?.DeletionPolicy, isProd ? 'Retain' : 'Delete');
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        DeletionProtection: isProd ? 'ACTIVE' : 'INACTIVE',
      });
      const assets = Object.entries(resources).find(
        ([id, r]) => r.Type === 'AWS::S3::Bucket' && id.startsWith('StorageAssetsBucket'),
      );
      assert.equal(assets?.[1].DeletionPolicy, isProd ? 'Retain' : 'Delete');
    });

    it('grants least privilege (no SendRawEmail, no wildcard pools)', () => {
      const policy = JSON.stringify(template.findResources('AWS::IAM::Policy'));
      assert.ok(!policy.includes('ses:SendRawEmail'));
      assert.ok(!policy.includes('userpool/*'));
      assert.ok(policy.includes('ses:FromAddress'));
    });

    it('limits the API to media/ and tmp/ in the assets bucket', () => {
      const statements = Object.values(template.findResources('AWS::IAM::Policy')).flatMap(
        (p) =>
          (p['Properties'] as { PolicyDocument: { Statement: Statement[] } }).PolicyDocument
            .Statement,
      );
      const s3Statements = statements.filter((st) =>
        actionsOf(st).some((a) => a.startsWith('s3:')),
      );
      assert.equal(s3Statements.length, 2, 'no other S3 access');

      const objects = s3Statements.find((st) => actionsOf(st).includes('s3:GetObject'));
      assert.deepEqual([...actionsOf(objects ?? {})].sort(), [
        's3:DeleteObject',
        's3:GetObject',
        's3:PutObject',
      ]);
      const objectResources = JSON.stringify(objects?.['Resource']);
      const suffixes = [...objectResources.matchAll(/"(\/[^"]*)"/g)].map((m) => m[1]);
      assert.deepEqual(suffixes, ['/media/*', '/tmp/*']);

      const list = s3Statements.find((st) => actionsOf(st).includes('s3:ListBucket'));
      assert.deepEqual(list?.['Condition'], {
        StringLike: { 's3:prefix': ['media', 'media/*', 'tmp', 'tmp/*'] },
      });
    });

    it('exposes exactly the consumer outputs', () => {
      const outputs = Object.keys(template.toJSON()['Outputs'] as object).sort();
      assert.deepEqual(outputs, Object.values(OUTPUTS).sort());
    });
  });
}

describe('tags', () => {
  /** CloudFormation types that cannot carry tags at all. */
  const UNTAGGABLE = new Set([
    'AWS::S3::BucketPolicy',
    'AWS::Route53::RecordSet',
    'AWS::ApiGatewayV2::Integration',
    'AWS::ApiGatewayV2::Route',
    'AWS::ApiGatewayV2::Authorizer',
    'AWS::Lambda::Permission',
    'AWS::Lambda::LayerVersion',
    'AWS::CloudFront::OriginAccessControl',
    'AWS::Cognito::UserPoolClient',
    'AWS::IAM::Policy',
    'Custom::SesDomainVerification',
    'AWS::CloudFormation::WaitCondition',
    'AWS::CloudFormation::WaitConditionHandle',
  ]);

  for (const stage of STAGES) {
    it(`puts exactly Project=${APP_NAME} and Stage=${stage} on the stack and every taggable resource (${stage})`, () => {
      const { app, stack } = buildApp({ context: { stage, fixture: 'true' } });
      app.synth(); // tags are applied by aspects during synthesis
      const expected = { Project: APP_NAME, Stage: stage };
      assert.deepEqual(stack.tags.tagValues(), expected);

      for (const construct of stack.node.findAll()) {
        if (!CdkCfnResource.isCfnResource(construct)) continue;
        const type = construct.cfnResourceType;
        const tags = TagManager.of(construct);
        if (tags === undefined) {
          assert.ok(UNTAGGABLE.has(type), `${type} (${construct.node.path}) is not tagged`);
          continue;
        }
        assert.deepEqual(tags.tagValues(), expected, `${type} (${construct.node.path})`);
      }
    });
  }
});

describe('app-wide tagging', () => {
  it('tags resources added anywhere later without any tagging code of their own', async () => {
    const { Bucket } = await import('aws-cdk-lib/aws-s3');
    const { app, stack } = buildApp({ context: { stage: 'qa', fixture: 'true' } });
    const later = new Bucket(stack, 'AddedLater');
    Validations.of(later).acknowledge({ id: 'AwsSolutions-S1', reason: 'test bucket' });
    Validations.of(later).acknowledge({ id: 'AwsSolutions-S10', reason: 'test bucket' });
    app.synth();
    assert.deepEqual(TagManager.of(later.node.defaultChild as CdkCfnResource)?.tagValues(), {
      Project: APP_NAME,
      Stage: 'qa',
    });
  });
});

describe('termination protection', () => {
  for (const stage of STAGES) {
    it(`is ${stage === 'prod' ? 'on' : 'off'} for ${stage}`, () => {
      const { stack } = buildApp({ context: { stage, fixture: 'true' } });
      assert.equal(stack.terminationProtection, stage === 'prod');
    });
  }
});

describe('cdk-nag gate', () => {
  it('fails synth on an unacknowledged finding', async () => {
    const { Bucket } = await import('aws-cdk-lib/aws-s3');
    const { app, stack } = buildApp({ context: { stage: 'dev', fixture: 'true' } });
    new Bucket(stack, 'UnreviewedBucket');
    assert.throws(() => app.synth());
  });
});

describe('domain and hosted zone inputs', () => {
  const zone = { stage: 'dev' as const, domainName: 'dev.app.example.co.uk' };

  it('accepts a zone that is the domain or any parent of it', () => {
    for (const hostedZoneName of ['dev.app.example.co.uk', 'app.example.co.uk', 'example.co.uk.']) {
      assert.doesNotThrow(() => {
        validateHostedZone({ ...zone, hostedZoneId: 'Z0123456789ABC', hostedZoneName });
      });
    }
  });

  it('refuses a missing or unrelated zone', () => {
    assert.throws(
      () => validateHostedZone({ ...zone, hostedZoneId: undefined, hostedZoneName: undefined }),
      /npm run deploy:backend -- dev/,
    );
    assert.throws(
      () =>
        validateHostedZone({
          ...zone,
          hostedZoneId: 'Z0123456789ABC',
          hostedZoneName: 'example.com',
        }),
      /does not contain/,
    );
  });

  it('refuses a domain that cannot name the buckets', () => {
    assert.throws(() => {
      validateDomainName('dev', 'Not A Domain');
    }, /invalid/);
    assert.throws(() => {
      validateDomainName('dev', `${'a'.repeat(55)}.example.com`);
    }, /too long/);
  });
});

describe('www alias (WWW_ALIAS=true)', () => {
  for (const stage of STAGES) {
    const domain = `${stage}.example.com`;
    const www = `www.${domain}`;

    it(`also serves ${www} from the same distribution (${stage})`, () => {
      const { template, resources } = synth(stage, { wwwAlias: 'true' });
      template.resourceCountIs('AWS::CloudFront::Distribution', 1);
      assert.deepEqual(distributionConfig(template).Aliases, [domain, www]);
      assert.deepEqual(aliasRecordNames(resources), [`${domain}.`, `${www}.`]);
      assert.ok(Object.keys(resources).some((id) => id.startsWith('EdgeWwwAliasRecord')));

      const origins = ['http://localhost:5173', `https://${domain}`, `https://${www}`];
      assert.deepEqual(assetsCorsRule(template, domain).AllowedOrigins, origins);
      assert.deepEqual(httpApiCorsOrigins(template), origins);
    });
  }

  it('adds www to a certificate the stack creates', () => {
    synth('dev', { wwwAlias: 'true' }).template.hasResourceProperties(
      'AWS::CertificateManager::Certificate',
      { DomainName: 'dev.example.com', SubjectAlternativeNames: ['www.dev.example.com'] },
    );
  });

  it('leaves the certificate, aliases and CORS alone when off', () => {
    const { template, resources } = synth('dev', { wwwAlias: 'false' });
    template.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: 'dev.example.com',
      SubjectAlternativeNames: Match.absent(),
    });
    assert.deepEqual(distributionConfig(template).Aliases, ['dev.example.com']);
    assert.deepEqual(aliasRecordNames(resources), ['dev.example.com.']);
    assert.deepEqual(httpApiCorsOrigins(template), [
      'http://localhost:5173',
      'https://dev.example.com',
    ]);
  });
});

describe('region, certificate and WAF inputs', () => {
  const CERT =
    'arn:aws:acm:us-east-1:123456789012:certificate/11111111-2222-3333-4444-555555555555';
  const WEB_ACL =
    'arn:aws:wafv2:us-east-1:123456789012:global/webacl/elytra-staging/66666666-7777-8888-9999-000000000000';

  const templateFor = (context: Record<string, string>): Template => {
    const { app, stack } = buildApp({ context: { stage: 'dev', fixture: 'true', ...context } });
    return Template.fromJSON(app.synth().getStackByName(stack.stackName).template as object);
  };

  it('creates the certificate in the stack when deployed to us-east-1 without CERTIFICATE_ARN', () => {
    const template = templateFor({});
    template.resourceCountIs('AWS::CertificateManager::Certificate', 1);
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({ WebACLId: Match.absent() }),
    });
  });

  it('uses CERTIFICATE_ARN as-is when given, even in us-east-1', () => {
    const template = templateFor({ certificateArn: CERT });
    template.resourceCountIs('AWS::CertificateManager::Certificate', 0);
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        ViewerCertificate: Match.objectLike({ AcmCertificateArn: CERT }),
      }),
    });
  });

  it('deploys to another region with a us-east-1 CERTIFICATE_ARN', () => {
    const { app, stack } = buildApp({
      context: { stage: 'dev', fixture: 'true', region: 'eu-west-1', certificateArn: CERT },
    });
    assert.equal(stack.region, 'eu-west-1');
    const json = JSON.stringify(app.synth().getStackByName(stack.stackName).template);
    assert.ok(json.includes('.execute-api.eu-west-1.'), 'API origin must use the stack region');
    assert.ok(!json.includes('AWS::CertificateManager::Certificate'));
  });

  it('refuses another region without CERTIFICATE_ARN', () => {
    assert.throws(
      () => buildApp({ context: { stage: 'dev', fixture: 'true', region: 'eu-west-1' } }),
      /CERTIFICATE_ARN is required/,
    );
  });

  it('refuses a certificate outside us-east-1', () => {
    assert.throws(
      () =>
        buildApp({
          context: {
            stage: 'dev',
            fixture: 'true',
            certificateArn: CERT.replace('us-east-1', 'eu-west-1'),
          },
        }),
      /must be an ACM certificate in us-east-1/,
    );
  });

  it('attaches WAF_WEB_ACL_ARN to the distribution when given', () => {
    templateFor({ webAclArn: WEB_ACL }).hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({ WebACLId: WEB_ACL }),
    });
  });

  it('refuses a regional (non-CloudFront) web ACL', () => {
    assert.throws(
      () =>
        buildApp({
          context: {
            stage: 'dev',
            fixture: 'true',
            webAclArn: WEB_ACL.replace('global/', 'regional/'),
          },
        }),
      /global \(CLOUDFRONT scope\)/,
    );
  });
});
