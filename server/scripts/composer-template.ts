import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildApp } from '../infra/lib/app.js';
import {
  danglingReferences,
  serializeComposerTemplate,
  toComposerTemplate,
  type CfnTemplate,
} from '../infra/lib/composer.js';
import { CONTEXT } from '../infra/lib/constants.js';
import { COMPOSER_TEMPLATE } from './paths.js';

/**
 * npm run synth:composer
 *
 * Synthesizes the dev stack with fixture values (no credentials, env files or built layers
 * needed) and writes the Infrastructure Composer drawing to server/infra/composer/template.json.
 * The file is committed; the pre-commit hook re-runs this and stages it, and CI fails if it is stale.
 * Open it in VS Code with "Open with Infrastructure Composer".
 */

const { app, stack } = buildApp({
  // Path metadata names and groups the resources; the CDK CLI enables it, in-process synth must opt in.
  context: {
    [CONTEXT.stage]: 'dev',
    [CONTEXT.fixture]: 'true',
    'aws:cdk:enable-path-metadata': true,
  },
});
const source = app.synth().getStackByName(stack.stackName).template as CfnTemplate;
const drawing = toComposerTemplate(source);

const dangling = danglingReferences(drawing);
if (dangling.length > 0) {
  console.error(`[composer] dangling references: ${dangling.join(', ')}`);
  process.exit(1);
}

const content = serializeComposerTemplate(drawing);
let previous: string | undefined;
try {
  previous = readFileSync(COMPOSER_TEMPLATE, 'utf8');
} catch {
  previous = undefined;
}

if (previous === content) {
  console.warn(`[composer] up to date: ${COMPOSER_TEMPLATE}`);
} else {
  mkdirSync(dirname(COMPOSER_TEMPLATE), { recursive: true });
  writeFileSync(COMPOSER_TEMPLATE, content);
  console.warn(
    `[composer] ${String(Object.keys(drawing.Resources).length)} resources → ${COMPOSER_TEMPLATE}`,
  );
}
