/**
 * What each kind of browser upload may contain. The presign endpoint validates `mimeType` against
 * this map, the presigned POST enforces `maxBytes` and the exact Content-Type at S3, and the
 * consumer re-checks size, stored Content-Type and magic bytes before using the object.
 *
 * Uploads go straight to S3 because anything sent through /api is capped by the Lambda payload
 * limit (6,291,556 bytes, about 4.7 MB of file after base64).
 *
 * SVG and PDF are deliberately absent: `/media/*` is served from the app's own origin, and neither
 * format can be made safe with a byte-level metadata strip.
 */

export const ACCOUNT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];

export interface UploadPurposeLimits {
  maxBytes: number;
  mimeTypes: readonly string[];
}

export const UPLOAD_PURPOSES = {
  'account-photo': { maxBytes: ACCOUNT_PHOTO_MAX_BYTES, mimeTypes: IMAGE_MIME_TYPES },
} as const satisfies Record<string, UploadPurposeLimits>;

export type UploadPurpose = keyof typeof UPLOAD_PURPOSES;

export function isUploadPurpose(value: unknown): value is UploadPurpose {
  return typeof value === 'string' && Object.hasOwn(UPLOAD_PURPOSES, value);
}

/** Limits for a purpose, or null when the purpose is unknown. */
export function uploadLimitsFor(purpose: unknown): UploadPurposeLimits | null {
  return isUploadPurpose(purpose) ? UPLOAD_PURPOSES[purpose] : null;
}
