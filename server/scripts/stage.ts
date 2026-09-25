import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ListHostedZonesByNameCommand, Route53Client } from '@aws-sdk/client-route-53';
import { CONTEXT, isStage, STAGES, type Stage } from '../infra/lib/constants.js';
import { SERVER_ROOT } from './paths.js';

/**
 * Shared by the deploy scripts (`npm run deploy:backend|deploy:frontend -- <stage>`): reads the
 * stage inputs, finds the hosted zone for DOMAIN_NAME in Route 53 and runs the CDK CLI with it as
 * context. Nothing about the account, zone or domain is committed or cached.
 */

export function fail(label: string, message: string): never {
  console.error(`[${label}] ${message}`);
  process.exit(1);
}

/** Stage from argv, with server/.env.<stage> loaded (shell/CI variables always win). */
export function stageFromArgs(label: string): Stage {
  const stage = process.argv[2];
  if (!isStage(stage)) fail(label, `Usage: npm run ${label} -- <${STAGES.join('|')}>`);
  const envFile = join(SERVER_ROOT, `.env.${stage}`);
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  return stage;
}

export function requireEnv(label: string, stage: Stage, name: string): string {
  const value = (process.env[name] ?? '').trim();
  if (value === '') fail(label, `${name} is not set (shell or server/.env.${stage}).`);
  return value;
}

export interface HostedZone {
  id: string;
  name: string;
}

/**
 * The public hosted zone that owns the domain: the domain itself or its closest parent
 * (dev.app.example.co.uk → app.example.co.uk → example.co.uk → …).
 */
export async function findHostedZone(domainName: string): Promise<HostedZone> {
  const route53 = new Route53Client({ region: 'us-east-1' }); // Route 53 is global
  const labels = domainName.toLowerCase().replace(/\.$/, '').split('.');

  for (let i = 0; i < labels.length - 1; i++) {
    const candidate = `${labels.slice(i).join('.')}.`;
    const { HostedZones = [] } = await route53.send(
      new ListHostedZonesByNameCommand({ DNSName: candidate, MaxItems: 10 }),
    );
    const matches = HostedZones.filter(
      (zone) => zone.Name === candidate && zone.Config?.PrivateZone !== true,
    );
    if (matches.length > 1) {
      throw new Error(`More than one public hosted zone is named ${candidate}; keep exactly one.`);
    }
    const zone = matches[0];
    if (zone?.Id !== undefined && zone.Name !== undefined) {
      return { id: zone.Id.replace('/hostedzone/', ''), name: zone.Name.replace(/\.$/, '') };
    }
  }
  throw new Error(`No public Route 53 hosted zone contains ${domainName}. Create one first.`);
}

/** `-c` arguments that select the stage and pass the resolved hosted zone to the CDK app. */
export function cdkContext(stage: Stage, zone: HostedZone): string[] {
  return [
    '-c',
    `${CONTEXT.stage}=${stage}`,
    '-c',
    `${CONTEXT.hostedZoneId}=${zone.id}`,
    '-c',
    `${CONTEXT.hostedZoneName}=${zone.name}`,
  ];
}

export function run(
  label: string,
  step: string,
  command: string,
  args: string[],
  cwd = SERVER_ROOT,
): void {
  console.warn(`[${label}] ${step}`);
  if (!succeeds(command, args, cwd)) fail(label, `${step} failed`);
}

/** Runs a command with inherited output; true when it exits 0. */
function succeeds(command: string, args: string[], cwd: string): boolean {
  // npm is npm.cmd on Windows, which only runs through a shell.
  const shell = process.platform === 'win32' && command === 'npm';
  return spawnSync(command, args, { cwd, stdio: 'inherit', shell }).status === 0;
}

export function runNpm(label: string, step: string, cwd: string, args: string[]): void {
  run(label, step, 'npm', args, cwd);
}

const TSX = join(SERVER_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const CDK_CLI = join(SERVER_ROOT, 'node_modules', 'aws-cdk', 'bin', 'cdk');

export function runScript(label: string, step: string, script: string): void {
  run(label, step, process.execPath, [TSX, script]);
}

export function runCdk(label: string, step: string, args: string[]): void {
  run(label, step, process.execPath, [CDK_CLI, ...args]);
}
