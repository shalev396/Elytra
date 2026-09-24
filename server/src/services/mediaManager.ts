import { Media } from '../classes/index.js';
import { runWithConcurrency } from '../utils/concurrency.js';
import { deleteFile, uploadFile } from '../utils/s3Util.js';
import { stripImageMetadata } from '../utils/stripMetadata/index.js';

/**
 * One place for "file in S3 + Media row" bookkeeping. Goes through the Media class, so it works on
 * both database providers.
 */

const S3_DELETE_CONCURRENCY = 20;

interface MediaUploadParams {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  /** Sub-folder under `media/` (e.g. accountImageFolder(userId)). */
  folder: string;
  uploadedBy: string;
}

/** Strips metadata and uploads to `media/<folder>/`, without a Media row. */
async function uploadStrippedFile(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folder: string;
}): Promise<{ s3Key: string; s3Url: string; cloudfrontUrl: string; size: number }> {
  const clean = stripImageMetadata(params.buffer, params.mimeType);
  const result = await uploadFile({
    buffer: clean,
    fileName: params.fileName,
    mimeType: params.mimeType,
    folder: params.folder,
  });
  return { ...result, size: clean.length };
}

/**
 * Strips metadata, uploads, and creates the Media row (recording the stripped size). If the row
 * can't be created the uploaded object is removed again.
 */
export async function uploadAndCreateMedia(params: MediaUploadParams): Promise<Media> {
  const uploaded = await uploadStrippedFile(params);
  try {
    return await Media.create({
      s3Key: uploaded.s3Key,
      s3Url: uploaded.s3Url,
      cloudfrontUrl: uploaded.cloudfrontUrl,
      fileName: params.fileName,
      mimeType: params.mimeType,
      size: uploaded.size,
      uploadedBy: params.uploadedBy,
    });
  } catch (error) {
    await deleteFile(uploaded.s3Key).catch((cleanupError: unknown) => {
      console.warn(`Failed to remove orphaned upload ${uploaded.s3Key}:`, cleanupError);
    });
    throw error;
  }
}

/** Deletes a Media row and its S3 object. A missing row is a no-op. */
export async function deleteMediaById(mediaId: string): Promise<void> {
  const media = await Media.findById(mediaId);
  if (media === null) return;
  await deleteFile(media.s3Key);
  await Media.deleteById(media.id);
}

/** Deletes every Media row uploaded by `userId`, and their S3 objects. */
export async function deleteAllEntityMedia(userId: string): Promise<void> {
  const media = await Media.findByUploadedBy(userId);
  await runWithConcurrency(media, S3_DELETE_CONCURRENCY, (m) => deleteFile(m.s3Key));
  await Media.deleteByUploadedBy(userId);
}
