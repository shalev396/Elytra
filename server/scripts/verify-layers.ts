import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  CODE_ENTRY_IN_LAYER,
  CODE_LAYER_DIR,
  DEPS_LAYER_DIR,
  FUNCTION_ASSET_DIR,
  LAYER_MANIFEST,
} from './paths.js';

/**
 * Proves the built layers work together before anything is deployed.
 *
 * Both layers are merged into <tmp>/opt/nodejs exactly as Lambda merges them into /opt/nodejs,
 * outside the repo so resolution can't fall back to server/node_modules. The bundle is then
 * imported with an unreachable database: every package import is linked first, so a missing
 * dependency or a bad named import fails the check, while the expected connection error passes.
 */

const SHIM_TARGET = '/opt/nodejs/app/index.mjs';
const LINK_ERRORS = [
  'ERR_MODULE_NOT_FOUND',
  'ERR_PACKAGE_PATH_NOT_EXPORTED',
  'does not provide an export named',
  'Cannot find module',
  'Cannot find package',
];
const EXPECTED_BOOT_ERRORS = ['ECONNREFUSED', 'SequelizeConnectionRefusedError'];

function fail(message: string): never {
  console.error(`[verify-layers] FAIL: ${message}`);
  process.exit(1);
}

if (!existsSync(LAYER_MANIFEST)) fail('layers not built — run `npm run build:layers` first.');

const shim = readFileSync(join(FUNCTION_ASSET_DIR, 'index.mjs'), 'utf8');
if (!shim.includes(`from '${SHIM_TARGET}'`))
  fail(`lambda/index.mjs must re-export from ${SHIM_TARGET}`);

const root = mkdtempSync(join(tmpdir(), 'elytra-layers-'));
try {
  const opt = join(root, 'opt');
  cpSync(join(DEPS_LAYER_DIR, 'nodejs'), join(opt, 'nodejs'), { recursive: true });
  cpSync(join(CODE_LAYER_DIR, 'nodejs'), join(opt, 'nodejs'), { recursive: true });

  const entry = pathToFileURL(join(opt, CODE_ENTRY_IN_LAYER)).href;
  const probe = `
    try {
      const mod = await import(${JSON.stringify(entry)});
      console.log(typeof mod.handler === 'function' ? 'HANDLER_OK' : 'HANDLER_MISSING');
    } catch (error) {
      console.log('IMPORT_ERROR ' + (error?.code ?? '') + ' ' + (error?.name ?? '') + ' ' + String(error?.message ?? error));
    }
  `;

  const run = spawnSync(process.execPath, ['--input-type=module', '-e', probe], {
    cwd: root,
    encoding: 'utf8',
    timeout: 60_000,
    env: {
      ...process.env,
      NODE_PATH: '',
      ENV: 'dev',
      AWS_REGION: 'us-east-1',
      DATABASE_URL: 'postgres://verify:verify@127.0.0.1:1/verify',
      DOMAIN_NAME: 'verify.example.com',
      S3_ASSETS_BUCKET_NAME: 'verify-assets',
      COGNITO_USER_POOL_ID: 'us-east-1_verify',
      COGNITO_CLIENT_ID: 'verify',
    },
  });

  const output = `${run.stdout}\n${run.stderr}`;
  if (run.error !== undefined) fail(`probe did not finish: ${run.error.message}`);
  if (LINK_ERRORS.some((marker) => output.includes(marker))) fail(`layer link error:\n${output}`);
  if (output.includes('HANDLER_MISSING')) fail('bundle loaded but exports no handler function');
  if (output.includes('HANDLER_OK')) {
    console.warn('[verify-layers] OK: bundle loaded and exports handler');
  } else if (EXPECTED_BOOT_ERRORS.some((marker) => output.includes(marker))) {
    console.warn(
      '[verify-layers] OK: all imports linked; stopped at the expected DB connection error',
    );
  } else {
    fail(`unexpected probe result:\n${output}`);
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}
