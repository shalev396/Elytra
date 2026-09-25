import { APP_NAME, type Stage } from './constants.js';

/** Physical resource name: elytra-<stage>-<base>. */
export function resourceName(stage: Stage, base: string): string {
  return `${APP_NAME}-${stage}-${base}`;
}
