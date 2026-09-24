import path from 'node:path';
import { isValidStagingKey, stagingKeyFor } from '../constants/s3Folders.js';
import {
  uploadLimitsFor,
  type UploadPurpose,
  type UploadPurposeLimits,
} from '../constants/uploadLimits.js';
import {
  createPresignedUpload,
  deleteFile,
  getObjectBuffer,
  headObject,
  isS3AccessDenied,
  isS3NotFound,
} from '../utils/s3Util.js';
import { normalizeMimeType, sniffImageMimeType } from '../utils/stripMetadata/index.js';

/**
 * Staged uploads: the browser POSTs the file straight to S3 (presigned, see createStagedUpload),
 * then names the staged object in a normal JSON API call, and the handler consumes it
 * (consumeStagedUpload). File bytes never pass through API Gateway or the Lambda payload.
 */

/** Lifetime of the presigned POST. Long enough for a slow connection to finish a large file. */
export const STAGED_UPLOAD_URL_TTL_SECONDS = 900;

const MAX_FILE_NAME_LENGTH = 255;

/** Canonical extension per accepted type; the first is used for new keys. */
const EXTENSIONS_BY_MIME_TYPE: Readonly<Record<string, readonly string[]>> = {
  'image/jpeg': ['.jpg', '.jpeg', '.jpe', '.jfif'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
};

export interface StagedUploadTicket {
  /** Send back to the API to commit the upload. */
  stagingKey: string;
  /** The URL to POST a multipart form to: `fields` first, then `file`. */
  uploadUrl: string;
  fields: Record<string, string>;
  expiresIn: number;
  maxBytes: number;
}

export interface StagedFile {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
}

export class StagedUploadError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'StagedUploadError';
    this.statusCode = statusCode;
  }
}

/** A StagedUploadError's own status, otherwise `fallback`. */
export function stagedUploadErrorStatus(error: unknown, fallback: number): number {
  return error instanceof StagedUploadError ? error.statusCode : fallback;
}

// ─── Pure validation ─────────────────────────────────────────────────────────

/** The limits for `purpose`; 400 when it is not a known upload purpose. */
export function limitsForPurpose(purpose: unknown): UploadPurposeLimits {
  const limits = uploadLimitsFor(purpose);
  if (limits === null) throw new StagedUploadError(400, 'Unknown upload purpose');
  return limits;
}

/** The normalized MIME type when `limits` allow it; 400 otherwise. */
export function validateMimeType(mimeType: unknown, limits: UploadPurposeLimits): string {
  const normalized = typeof mimeType === 'string' ? normalizeMimeType(mimeType) : '';
  if (!limits.mimeTypes.includes(normalized)) {
    throw new StagedUploadError(
      400,
      `Unsupported file type${normalized === '' ? '' : `: ${normalized}`}. Allowed: ${limits.mimeTypes.join(', ')}`,
    );
  }
  return normalized;
}

/**
 * The base name of a client-supplied file name, with an extension that matches `mimeType` (the
 * extension ends up in the public media key). 400 when it is missing or too long.
 */
export function normalizeFileName(fileName: unknown, mimeType: string): string {
  const raw = typeof fileName === 'string' ? fileName.trim() : '';
  const base = raw.split(/[/\\]/).pop()?.trim() ?? '';
  if (base === '' || base === '.' || base === '..') {
    throw new StagedUploadError(400, 'fileName is required');
  }
  if (base.length > MAX_FILE_NAME_LENGTH) {
    throw new StagedUploadError(
      400,
      `fileName is longer than ${String(MAX_FILE_NAME_LENGTH)} characters`,
    );
  }
  const allowed = EXTENSIONS_BY_MIME_TYPE[mimeType] ?? [];
  const ext = path.extname(base).toLowerCase();
  return allowed.includes(ext) || allowed[0] === undefined ? base : `${base}${allowed[0]}`;
}

/** Canonical extension (with the dot) for a staging key, or '' for an unmapped type. */
export function extensionFor(mimeType: string): string {
  return EXTENSIONS_BY_MIME_TYPE[mimeType]?.[0] ?? '';
}

/** 400 unless the bytes really are the declared image type. */
export function assertContentMatchesType(buffer: Buffer, mimeType: string): void {
  if (sniffImageMimeType(buffer) !== mimeType) {
    throw new StagedUploadError(400, `File content is not a valid ${mimeType} image`);
  }
}

// ─── S3 ──────────────────────────────────────────────────────────────────────

/**
 * Validates the request and issues a presigned POST for a new staging object. The key is chosen
 * by the server and lives in the caller's own staging folder; S3 enforces the size range and the
 * exact Content-Type.
 */
export async function createStagedUpload(params: {
  userId: string;
  purpose: unknown;
  fileName: unknown;
  mimeType: unknown;
}): Promise<StagedUploadTicket> {
  const limits = limitsForPurpose(params.purpose);
  const mimeType = validateMimeType(params.mimeType, limits);
  normalizeFileName(params.fileName, mimeType);

  const stagingKey = stagingKeyFor(params.userId, extensionFor(mimeType));
  const { url, fields } = await createPresignedUpload({
    s3Key: stagingKey,
    mimeType,
    maxBytes: limits.maxBytes,
    expiresInSeconds: STAGED_UPLOAD_URL_TTL_SECONDS,
  });

  return {
    stagingKey,
    uploadUrl: url,
    fields,
    expiresIn: STAGED_UPLOAD_URL_TTL_SECONDS,
    maxBytes: limits.maxBytes,
  };
}

function notFound(): StagedUploadError {
  return new StagedUploadError(404, 'Staged upload not found. Request a new upload URL.');
}

async function discard(stagingKey: string): Promise<void> {
  try {
    await deleteFile(stagingKey);
  } catch (error) {
    // The tmp/ lifecycle rule is the backstop; a failed cleanup must not mask the real error.
    console.warn(`Failed to delete staged upload ${stagingKey}:`, error);
  }
}

/**
 * Validates a staged object, reads it and deletes it. Checks run cheapest first: owner and key
 * shape (400), existence (404), size from HeadObject (413) so an oversized object never enters
 * Lambda memory, stored Content-Type (400), then the magic bytes (400). A rejected object is
 * deleted.
 *
 * Not idempotent: the staging object is deleted once it has been read, so retrying a request
 * that already succeeded gets a 404. Clients should stage the file again rather than retry.
 */
export async function consumeStagedUpload(params: {
  userId: string;
  stagingKey: unknown;
  fileName: unknown;
  purpose: UploadPurpose;
}): Promise<StagedFile> {
  const limits = limitsForPurpose(params.purpose);
  const { stagingKey } = params;
  if (typeof stagingKey !== 'string' || !isValidStagingKey(stagingKey, params.userId)) {
    throw new StagedUploadError(400, 'Invalid stagingKey');
  }

  let head: Awaited<ReturnType<typeof headObject>>;
  try {
    head = await headObject(stagingKey);
  } catch (error) {
    // HeadObject carries no s3:prefix, so the prefix-conditioned ListBucket grant may not apply
    // and S3 can answer a missing key with 403 instead of 404. The key has already passed the
    // owner check and the role may read tmp/, so a 403 here means the object isn't there.
    if (isS3AccessDenied(error)) throw notFound();
    throw error;
  }
  if (head === null) throw notFound();

  const maxMb = String(Math.floor(limits.maxBytes / (1024 * 1024)));
  if (head.size > limits.maxBytes) {
    await discard(stagingKey);
    throw new StagedUploadError(413, `File too large. Maximum is ${maxMb} MB.`);
  }

  let mimeType: string;
  let fileName: string;
  try {
    mimeType = validateMimeType(head.contentType, limits);
    fileName = normalizeFileName(params.fileName, mimeType);
  } catch (error) {
    await discard(stagingKey);
    throw error;
  }

  let buffer: Buffer;
  try {
    buffer = await getObjectBuffer(stagingKey);
  } catch (error) {
    // Deleted between HeadObject and GetObject (a concurrent consume); 403 as above.
    if (isS3NotFound(error) || isS3AccessDenied(error)) throw notFound();
    throw error;
  }

  try {
    if (buffer.length > limits.maxBytes) {
      throw new StagedUploadError(413, `File too large. Maximum is ${maxMb} MB.`);
    }
    assertContentMatchesType(buffer, mimeType);
  } finally {
    await discard(stagingKey);
  }

  return { buffer, fileName, mimeType, size: buffer.length };
}
