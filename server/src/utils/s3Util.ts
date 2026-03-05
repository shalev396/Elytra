import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../config/environment.js';
import path from 'path';

/**
 * All uploaded files are stored under this prefix so they match
 * the CloudFront CacheBehavior `PathPattern: '/media/*'` that
 * routes to the assets S3 bucket.
 */
const MEDIA_PREFIX = 'media';

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
  const uniqueName = `${uuidv4()}${ext}`;
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
 * Deletes all objects under the media prefix (user uploads and exports).
 * Used by the dev reset endpoint to clear user-uploaded assets.
 */
export async function clearUserUploadedAssets(): Promise<void> {
  const keys = await listObjectsInPrefix(MEDIA_PREFIX);
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
