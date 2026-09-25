import { Router } from 'express';
import { StagedUploadsController } from '../../controllers/stagedUploads.js';
import type { UploadPurpose } from '../../constants/uploadLimits.js';

const router = Router();

// ─── POST /api/private/uploads/presign ──────────────────────────────────────

export type { UploadPurpose };

export interface PresignUploadRequestBody {
  /** What the file is for; decides the size limit and the allowed types. */
  purpose: UploadPurpose;
  fileName: string;
  /** Must be allowed for the purpose; S3 only accepts the upload with exactly this Content-Type. */
  mimeType: string;
}

/**
 * A presigned POST. Send a multipart/form-data POST to `uploadUrl` with every entry of `fields`
 * (in any order) followed by the file as the last field, named `file`. No Authorization header.
 * Then pass `stagingKey` to the endpoint that consumes the upload.
 */
export interface PresignUploadResponseData {
  stagingKey: string;
  uploadUrl: string;
  fields: Record<string, string>;
  /** Seconds until the form expires. */
  expiresIn: number;
  /** Largest file S3 will accept for this purpose, in bytes. */
  maxBytes: number;
}

router.post('/presign', StagedUploadsController.presignUpload);

export { router as uploadsRouter };
