import { app } from './app';

/**
 * Document title for a routed page: `{segment} | {app.name}`, e.g. "Login | Elytra".
 * Use it for every PageMetadata title so the site name lives in one place (data/app.ts).
 */
export function pageTitle(segment: string): string {
  return `${segment} | ${app.name}`;
}
