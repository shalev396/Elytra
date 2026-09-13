import { buildApp } from '../lib/app.js';

/**
 * CDK entry. One stack per invocation:
 *   npm run deploy:backend -- <stage>       real stage: resolves the hosted zone, then runs cdk
 *   cdk synth -c stage=dev -c fixture=true  offline: tests, Infrastructure Composer
 */
buildApp();
