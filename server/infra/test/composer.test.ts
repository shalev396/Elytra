import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildApp } from '../lib/app.js';
import {
  cardRoot,
  COMPOSER_GROUPS,
  danglingReferences,
  serializeComposerTemplate,
  toComposerTemplate,
  type CfnTemplate,
} from '../lib/composer.js';
import { STAGES } from '../lib/constants.js';
import { COMPOSER_TEMPLATE } from '../../scripts/paths.js';

const synthSource = (stage: string): CfnTemplate => {
  const { app, stack } = buildApp({
    context: { stage, fixture: 'true', 'aws:cdk:enable-path-metadata': true },
  });
  return app.synth().getStackByName(stack.stackName).template as CfnTemplate;
};

type Groups = Record<string, { Label: string; Members: string[] } | undefined>;
const groupsOf = (drawing: CfnTemplate): Groups => {
  const metadata = drawing.Metadata ?? {};
  return (metadata['AWS::Composer::Groups'] ?? {}) as Groups;
};

for (const stage of STAGES) {
  describe(`composer drawing (${stage})`, () => {
    const source = synthSource(stage);
    const drawing = toComposerTemplate(source);
    const names = Object.keys(drawing.Resources);

    it('keeps every resource of the real stack with its real type', () => {
      const sourceTypes = Object.values(source.Resources)
        .map((r) => r.Type)
        .filter((t) => t !== 'AWS::CDK::Metadata')
        .sort();
      const drawingTypes = Object.values(drawing.Resources)
        .map((r) => r.Type)
        .sort();
      assert.deepEqual(drawingTypes, sourceTypes);
      for (const type of ['AWS::IAM::Role', 'AWS::IAM::Policy', 'AWS::Logs::LogGroup']) {
        assert.ok(drawingTypes.includes(type), `missing ${type}`);
      }
    });

    it('uses readable names without the top-level construct or CDK hashes', () => {
      for (const name of [
        'ClientBucket',
        'AssetsBucket',
        'EmailIdentity',
        'Distribution',
        'HttpApi',
        'PublicRoute',
        'PrivateRoute',
        'Function',
        'FunctionServiceRole',
        'ServiceRoleDefaultPolicy',
        'LogGroup',
        'UserPool',
        'UserPoolClient',
      ]) {
        assert.ok(names.includes(name), `missing ${name} in ${names.join(', ')}`);
      }
      for (const old of [
        'StorageClientBucket',
        'ComputeFunction',
        'EdgeDistribution',
        'ApiHttpApi',
      ]) {
        assert.ok(!names.includes(old), `${old} still carries its top-level construct`);
      }
      for (const name of names) {
        assert.doesNotMatch(name, /[0-9A-F]{8}$/, `hashed logical id ${name}`);
      }
      assert.equal(names.includes('DevRoute'), stage !== 'prod');
    });

    it('has no dangling references and no machine-specific content', () => {
      assert.deepEqual(danglingReferences(drawing), []);
      const json = JSON.stringify(drawing);
      assert.ok(!json.includes('aws:cdk:path'));
      assert.ok(!json.includes('BootstrapVersion'));
      assert.ok(!json.includes('\\r\\n'));
      assert.doesNotMatch(json, /[0-9a-f]{64}/);
    });

    it('boxes every card into Edge, Api, Compute, Storage and Auth by its Composer card key', () => {
      const groups = groupsOf(drawing);
      assert.deepEqual(Object.keys(groups), [...COMPOSER_GROUPS]);
      const members = Object.values(groups).flatMap((g) => g?.Members ?? []);
      assert.equal(new Set(members).size, members.length, 'a card is in two groups');
      for (const member of members) {
        assert.ok(member in drawing.Resources, `unknown group member ${member}`);
        assert.equal(cardRoot(drawing, member), member, `${member} is folded into another card`);
      }
      for (const name of names) {
        assert.ok(members.includes(cardRoot(drawing, name)), `${name} is not in any group`);
      }
      assert.deepEqual(groups['Api']?.Members, ['HttpApi']);
      const edge = groups['Edge']?.Members ?? [];
      for (const name of [
        'Distribution',
        'AliasRecord',
        'EmailIdentity',
        'DkimRecord1',
        'Certificate',
      ]) {
        assert.ok(edge.includes(name), `${name} not in Edge`);
      }
    });

    it('links the API, certificate and origin access control to the distribution', () => {
      for (const name of ['HttpApi', 'Certificate', 'OriginAccessControl']) {
        const props = JSON.stringify(drawing.Resources[name]?.Properties);
        assert.match(props, /"Ref":"Distribution"|\$\{Distribution\}/, `${name} not linked`);
      }
    });

    it('spells dotted bucket names so Composer accepts them', () => {
      for (const name of ['ClientBucket', 'AssetsBucket']) {
        assert.equal(typeof drawing.Resources[name]?.Properties?.['BucketName'], 'object');
      }
    });
  });
}

describe('committed composer drawing', () => {
  it('matches the current infrastructure (run `npm run synth:composer`)', () => {
    const expected = serializeComposerTemplate(toComposerTemplate(synthSource('dev')));
    assert.equal(readFileSync(COMPOSER_TEMPLATE, 'utf8'), expected);
  });
});
