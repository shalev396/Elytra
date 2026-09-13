import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Absolute paths shared by the layer build, layer verification and the CDK compute construct. */
export const SERVER_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const BUILD_ROOT = join(SERVER_ROOT, '.build', 'layers');
export const CODE_LAYER_DIR = join(BUILD_ROOT, 'code');
export const DEPS_LAYER_DIR = join(BUILD_ROOT, 'deps');
export const LAYER_MANIFEST = join(BUILD_ROOT, 'manifest.json');
export const FUNCTION_ASSET_DIR = join(SERVER_ROOT, 'lambda');
export const CLIENT_ROOT = join(SERVER_ROOT, '..', 'client');
export const CLIENT_DIST = join(CLIENT_ROOT, 'dist');

/** Committed Infrastructure Composer drawing (scripts/composer-template.ts). */
export const COMPOSER_TEMPLATE = join(SERVER_ROOT, 'infra', 'composer', 'template.json');

/** Where the bundled app lands inside the code layer (mounted at /opt/nodejs/app/index.mjs). */
export const CODE_ENTRY_IN_LAYER = join('nodejs', 'app', 'index.mjs');

export interface LayerManifest {
  code: string;
  deps: string;
}
