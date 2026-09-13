import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CfnResource as CdkCfnResource, TagManager, Validations } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { buildApp } from '../lib/app.js';
import { FIXTURE_ZONE_ID, validateDomainName, validateHostedZone } from '../lib/config.js';
import { APP_NAME, OUTPUTS, STAGES, type Stage } from '../lib/constants.js';

interface CfnResource {
  Type: string;
  Properties?: Record<string, unknown>;
  DependsOn?: string[];
  DeletionPolicy?: string;
}

function synth(stage: Stage): { template: Template; resources: Record<string, CfnResource> } {
  const { app, stack } = buildApp({ context: { stage, fixture: 'true' } });
  // Runs cdk-nag: any unacknowledged finding throws here.
  const assembly = app.synth();
  const template = Template.fromJSON(assembly.getStackByName(stack.stackName).template as object);
  const resources = template.toJSON()['Resources'] as Record<string, CfnResource>;
  return { template, resources };
}

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

    it('routes public, private (JWT) and dev (non-prod only) to the one integration', () => {
      template.resourceCountIs('AWS::ApiGatewayV2::Integration', 1);
      template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
        RouteKey: 'ANY /api/public/{proxy+}',
        AuthorizationType: 'NONE',
      });
      template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
        RouteKey: 'ANY /api/private/{proxy+}',
        AuthorizationType: 'JWT',
      });
      const devRoutes = template.findResources('AWS::ApiGatewayV2::Route', {
        Properties: { RouteKey: 'ANY /api/dev/{proxy+}' },
      });
      assert.equal(Object.keys(devRoutes).length, isProd ? 0 : 1);
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
