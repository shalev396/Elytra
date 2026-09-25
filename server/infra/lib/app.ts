import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { App, Validations, type AppProps } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { SERVER_ROOT } from '../../scripts/paths.js';
import { loadConfig } from './config.js';
import { stackName } from './constants.js';
import { ElytraStack } from './elytra-stack.js';
import { applyNagSuppressions } from './nag.js';
import { tagApp } from './tags.js';

/**
 * Feature flags from cdk.json. The CDK CLI passes them to the app itself; in-process synths (tests,
 * the Composer drawing) would otherwise use CDK's defaults and produce a different template.
 * Context given on the command line or in `props` still wins.
 */
function cdkJsonContext(): Record<string, unknown> {
  const cdkJson = JSON.parse(readFileSync(join(SERVER_ROOT, 'cdk.json'), 'utf8')) as {
    context?: Record<string, unknown>;
  };
  return cdkJson.context ?? {};
}

/** Builds the app exactly as the CLI does (bin/app.ts) so tests exercise the same wiring. */
export function buildApp(props?: AppProps): { app: App; stack: ElytraStack } {
  const app = new App({ ...props, context: { ...cdkJsonContext(), ...props?.context } });
  const config = loadConfig(app);
  const stack = new ElytraStack(app, stackName(config.stage), { config });

  tagApp(app, config.stage);
  applyNagSuppressions(stack, config);
  Validations.of(app).addPlugins(new AwsSolutionsChecks(app));

  return { app, stack };
}
