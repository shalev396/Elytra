import { randomUUID } from 'node:crypto';
import { S3_PREFIXES } from '../../infra/lib/constants.js';

/**
 * Key layout inside the assets bucket. `media/` is public (CloudFront `/media/*`); `tmp/` is never
 * routed by CloudFront and expires after a day (lifecycle rules in infra/lib/constructs/storage.ts).
 */

/** Presigned browser uploads waiting to be consumed: `tmp/staging/<userId>/<uuid><ext>`. */
export const STAGING_PREFIX = S3_PREFIXES.staging;

/** Account export ZIPs waiting to be downloaded: `tmp/exports/<userId>/<uuid>.zip`. */
export const EXPORTS_PREFIX = S3_PREFIXES.exports;

/** A fresh, server-chosen staging key owned by `userId`. `ext` includes the dot, or is empty. */
export function stagingKeyFor(userId: string, ext: string): string {
  return `${STAGING_PREFIX}/${userId}/${randomUUID()}${ext}`;
}

/**
 * The client sends the staging key back when it commits an upload, so this is the boundary that
 * stops it naming another user's staged object, or any other object in the bucket, and having the
 * server read it. The key must sit directly in the caller's own staging folder.
 */
export function isValidStagingKey(key: string, userId: string): boolean {
  if (userId === '' || userId.includes('/')) return false;
  const ownerPrefix = `${STAGING_PREFIX}/${userId}/`;
  if (!key.startsWith(ownerPrefix)) return false;
  const rest = key.slice(ownerPrefix.length);
  return rest.length > 0 && !rest.includes('/') && !rest.includes('..') && !rest.includes('\\');
}

/** Folder under `media/` for a user's account photo (kept from the original layout). */
export function accountImageFolder(userId: string): string {
  return `users/${userId}`;
}

/** Key for a new export ZIP owned by `userId`. */
export function exportKeyFor(userId: string): string {
  return `${EXPORTS_PREFIX}/${userId}/${randomUUID()}.zip`;
}
