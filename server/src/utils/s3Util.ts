import { randomUUID } from 'node:crypto';
import path from 'node:path';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { environment } from '../config/environment.js';
import { S3_PREFIXES } from '../../infra/lib/constants.js';
import { exportKeyFor } from '../constants/s3Folders.js';

/**
 * All uploaded files are stored under this prefix so they match
 * the CloudFront CacheBehavior `PathPattern: '/media/*'` that
 * routes to the assets S3 bucket.
 */
const MEDIA_PREFIX = S3_PREFIXES.media;

/**
 * Page size for every ListObjectsV2 call. The AWS SDK's XML deserializer has used fast-xml-parser,
 * which caps entity expansion at 1000; a full 1000-key page can exceed it and break list and
 * reset. Smaller pages stay well under the cap whatever parser the SDK ships.
 */
const LIST_OBJECTS_MAX_KEYS = 250;

const s3Client = new S3Client({ region: environment.awsRegion });

interface UploadFileParams {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  /** Sub-folder under the enforced `media/` prefix (e.g. "users/{uid}") */
  folder: string;
}

interface UploadFileResult {
  /** S3 object key path — used internally for SDK operations like delete */
  s3Key: string;
  /** Full S3 bucket URL for this file */
  s3Url: string;
  /** Full CloudFront distribution URL — what the frontend fetches */
  cloudfrontUrl: string;
}

/**
 * Uploads a file to the S3 assets bucket under the `media/` prefix
 * (matching the CloudFront `/media/*` cache behavior) and returns
 * all three references.
 *
 * @example
 * const { s3Key, s3Url, cloudfrontUrl } = await uploadFile({
 *   buffer: fileBuffer,
 *   fileName: 'photo.jpg',
 *   mimeType: 'image/jpeg',
 *   folder: `users/${userId}`,
 * });
 * // s3Key        => "media/users/abc-123/d4e5f6.jpg"
 * // s3Url        => "https://my-bucket.s3.us-east-1.amazonaws.com/media/users/abc-123/d4e5f6.jpg"
 * // cloudfrontUrl => "https://example.com/media/users/abc-123/d4e5f6.jpg"
 */
export async function uploadFile(params: UploadFileParams): Promise<UploadFileResult> {
  const bucket = environment.s3AssetsBucketName;
  const region = environment.awsRegion;
  const domain = environment.domainName;
  const ext = path.extname(params.fileName) || '';
  const uniqueName = `${randomUUID()}${ext}`;
  const s3Key = `${MEDIA_PREFIX}/${params.folder}/${uniqueName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: params.buffer,
      ContentType: params.mimeType,
    }),
  );

  const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
  const cloudfrontUrl = `https://${domain}/${s3Key}`;

  return { s3Key, s3Url, cloudfrontUrl };
}

/**
 * Deletes a file from the S3 assets bucket by its key.
 */
export async function deleteFile(s3Key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: environment.s3AssetsBucketName,
      Key: s3Key,
    }),
  );
}

/**
 * Fetches a file from the S3 assets bucket and returns its contents as a Buffer.
 */
export async function getObjectBuffer(s3Key: string): Promise<Buffer> {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: environment.s3AssetsBucketName,
      Key: s3Key,
    }),
  );
  const chunks: Uint8Array[] = [];
  const stream = response.Body;
  if (!stream) throw new Error(`Empty response for S3 key: ${s3Key}`);
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** True for the SDK's "object does not exist" errors (HeadObject: NotFound, GetObject: NoSuchKey). */
export function isS3NotFound(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { name, $metadata } = error as { name?: unknown; $metadata?: { httpStatusCode?: number } };
  return name === 'NotFound' || name === 'NoSuchKey' || $metadata?.httpStatusCode === 404;
}

/** True for S3's 403 (AccessDenied / Forbidden). */
export function isS3AccessDenied(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { name, $metadata } = error as { name?: unknown; $metadata?: { httpStatusCode?: number } };
  return name === 'AccessDenied' || name === 'Forbidden' || $metadata?.httpStatusCode === 403;
}

/**
 * Size and stored Content-Type of an object without downloading it, or null when it does not
 * exist. A 404 needs `s3:ListBucket` on the prefix; without it S3 answers 403, which is rethrown.
 */
export async function headObject(
  s3Key: string,
): Promise<{ size: number; contentType: string | null } | null> {
  try {
    const response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: environment.s3AssetsBucketName,
        Key: s3Key,
      }),
    );
    return { size: response.ContentLength ?? 0, contentType: response.ContentType ?? null };
  } catch (error) {
    if (isS3NotFound(error)) return null;
    throw error;
  }
}

export interface PresignedUpload {
  /** The bucket URL the browser POSTs a multipart form to. */
  url: string;
  /** Form fields to send before the `file` field, verbatim. */
  fields: Record<string, string>;
}

/**
 * A presigned POST for one object. Unlike a presigned PUT, the policy is enforced by S3 itself:
 * the body must be 1..maxBytes long and the Content-Type must equal `mimeType` exactly, so an
 * oversized or re-typed upload is rejected before it is ever stored.
 *
 * The policy is signed with the caller's credentials; on Lambda those are temporary role
 * credentials, so the form can stop working before `expiresInSeconds` if they expire first.
 */
export async function createPresignedUpload(params: {
  s3Key: string;
  mimeType: string;
  maxBytes: number;
  expiresInSeconds: number;
}): Promise<PresignedUpload> {
  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: environment.s3AssetsBucketName,
    Key: params.s3Key,
    Conditions: [
      ['content-length-range', 1, params.maxBytes],
      ['eq', '$Content-Type', params.mimeType],
    ],
    Fields: { 'Content-Type': params.mimeType },
    Expires: params.expiresInSeconds,
  });
  return { url, fields };
}

/**
 * Returns a presigned GET URL for downloading an S3 object.
 */
export async function getPresignedDownloadUrl(
  s3Key: string,
  expiresInSeconds: number,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: environment.s3AssetsBucketName,
    Key: s3Key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Stores an account export ZIP under `tmp/exports/<userId>/` (never served by CloudFront; a
 * lifecycle rule deletes it after a day) and returns its key. The Content-Disposition keeps the
 * file name when the browser downloads it cross-origin through a presigned URL.
 */
export async function uploadExportZip(params: {
  userId: string;
  buffer: Buffer;
  filename: string;
}): Promise<string> {
  const s3Key = exportKeyFor(params.userId);
  const safeName = params.filename.replace(/["\\\r\n]/g, '_');

  await s3Client.send(
    new PutObjectCommand({
      Bucket: environment.s3AssetsBucketName,
      Key: s3Key,
      Body: params.buffer,
      ContentType: 'application/zip',
      ContentDisposition: `attachment; filename="${safeName}"`,
    }),
  );

  return s3Key;
}

/**
 * Lists all object keys under the given prefix in the assets bucket.
 */
export async function listObjectsInPrefix(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: environment.s3AssetsBucketName,
        Prefix: prefix,
        MaxKeys: LIST_OBJECTS_MAX_KEYS,
        ContinuationToken: continuationToken,
      }),
    );
    const contents = response.Contents ?? [];
    for (const obj of contents) {
      const key = obj.Key;
      if (typeof key === 'string' && key.length > 0) {
        keys.push(key);
      }
    }
    continuationToken = response.NextContinuationToken;
  } while (continuationToken !== undefined);
  return keys;
}

/**
 * Deletes all user uploads under `media/`. Used by the dev reset endpoint. Staged uploads and
 * export ZIPs under `tmp/` are left alone: they expire by lifecycle rule within a day.
 */
export async function clearUserUploadedAssets(): Promise<void> {
  const keys = await listObjectsInPrefix(`${MEDIA_PREFIX}/`);
  if (keys.length === 0) return;

  const BATCH_SIZE = 1000;
  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE);
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: environment.s3AssetsBucketName,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    );
  }
}
