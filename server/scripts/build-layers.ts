import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';
import {
  BUILD_ROOT,
  CODE_ENTRY_IN_LAYER,
  CODE_LAYER_DIR,
  DEPS_LAYER_DIR,
  LAYER_MANIFEST,
  SERVER_ROOT,
  type LayerManifest,
} from './paths.js';

/**
 * Builds the two Lambda layers into server/.build/layers:
 *
 *   code/nodejs/app/index.mjs   the whole API bundled by esbuild, every package left external
 *   deps/nodejs/node_modules    production dependencies from package-lock.json (npm ci --omit=dev)
 *
 * Lambda extracts both into /opt, so they merge at /opt/nodejs and Node resolves the bundle's bare
 * imports from the parent node_modules folder — no NODE_PATH tricks.
 *
 * The manifest holds content hashes CDK uses as asset hashes: the deps layer only publishes a new
 * version when production dependencies actually change.
 */

const sha256 = (data: Buffer | string): string => createHash('sha256').update(data).digest('hex');

async function buildCodeLayer(): Promise<string> {
  const outfile = join(CODE_LAYER_DIR, CODE_ENTRY_IN_LAYER);
  const result = await build({
    entryPoints: [join(SERVER_ROOT, 'src', 'lambda.ts')],
    outfile,
    bundle: true,
    packages: 'external',
    platform: 'node',
    target: 'node24',
    format: 'esm',
    minify: true,
    keepNames: true,
    sourcemap: true,
    sourcesContent: false,
    metafile: true,
    logLevel: 'warning',
  });

  const output = Object.entries(result.metafile.outputs).find(([file]) => file.endsWith('.mjs'));
  if (output?.[1].exports.includes('handler') !== true) {
    throw new Error('Code layer bundle does not export "handler".');
  }

  return sha256(readFileSync(outfile));
}

function buildDepsLayer(): string {
  const nodejsDir = join(DEPS_LAYER_DIR, 'nodejs');
  mkdirSync(nodejsDir, { recursive: true });
  for (const file of ['package.json', 'package-lock.json']) {
    copyFileSync(join(SERVER_ROOT, file), join(nodejsDir, file));
  }

  execSync('npm ci --omit=dev --ignore-scripts --no-audit --no-fund', {
    cwd: nodejsDir,
    stdio: 'inherit',
  });

  // Keep only node_modules in the layer; npm's bin shims (.cmd on Windows) are useless on Lambda.
  rmSync(join(nodejsDir, 'node_modules', '.bin'), { recursive: true, force: true });
  rmSync(join(nodejsDir, 'package.json'));
  rmSync(join(nodejsDir, 'package-lock.json'));

  return sha256(readFileSync(join(nodejsDir, 'node_modules', '.package-lock.json')));
}

function sizeMb(dir: string): string {
  const walk = (path: string): number =>
    readdirSync(path, { withFileTypes: true }).reduce((total, entry) => {
      const child = join(path, entry.name);
      return total + (entry.isDirectory() ? walk(child) : statSync(child).size);
    }, 0);
  return `${(walk(dir) / 1024 / 1024).toFixed(1)} MB`;
}

rmSync(BUILD_ROOT, { recursive: true, force: true });
mkdirSync(BUILD_ROOT, { recursive: true });

const code = await buildCodeLayer();
console.warn(
  `[build-layers] code layer ready (${String(statSync(join(CODE_LAYER_DIR, CODE_ENTRY_IN_LAYER)).size)} bytes)`,
);

const deps = buildDepsLayer();
console.warn(`[build-layers] deps layer ready (${sizeMb(DEPS_LAYER_DIR)})`);

const manifest: LayerManifest = { code, deps };
writeFileSync(LAYER_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.warn(`[build-layers] manifest written to ${LAYER_MANIFEST}`);
