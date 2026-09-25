import { type RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import type { PresignUploadResponseData } from '../routes/private/uploads.js';
import { createStagedUpload, stagedUploadErrorStatus } from '../services/stagedUpload.js';

const presignUpload: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const body = req.body as { purpose?: unknown; fileName?: unknown; mimeType?: unknown };

    const data: PresignUploadResponseData = await createStagedUpload({
      userId: authReq.user.id,
      purpose: body.purpose,
      fileName: body.fileName,
      mimeType: body.mimeType,
    });

    res.success(data);
  } catch (error) {
    const status = stagedUploadErrorStatus(error, 500);
    if (status >= 500) console.error('Error creating upload URL:', error);
    const message = error instanceof Error ? error.message : 'Failed to create upload URL';
    res.error(status >= 500 ? 'Failed to create upload URL' : message, status);
  }
};

export const StagedUploadsController = { presignUpload } as const;
