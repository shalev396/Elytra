import { Router } from 'express';
import { AccountController } from '../../controllers/index.js';

const router = Router();

// ─── GET /api/private/me ────────────────────────────────────────────────────

export interface MeResponseData {
  id: string;
  cognitoSub: string;
  email: string;
  name: string;
  photoUrl: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

router.get('/me', AccountController.getMe);

// ─── PUT /api/private/me ────────────────────────────────────────────────────

/** A file already uploaded through POST /api/private/uploads/presign (purpose "account-photo"). */
export interface StagedFileReference {
  stagingKey: string;
  /** Original file name, kept on the Media record and used in the data export. */
  fileName: string;
}

/** JSON. At least one field must change something, or the response is 400 "No changes provided". */
export interface UpdateMeRequestBody {
  name?: string;
  /** Delete the current photo without a replacement. Ignored when `photo` is present. */
  removePhoto?: boolean;
  /** Replace the current photo with a staged upload. */
  photo?: StagedFileReference;
}

export type UpdateMeResponseData = MeResponseData;

router.put('/me', AccountController.updateMe);

// ─── POST /api/private/me/test-email ─────────────────────────────────────────

export interface TestEmailResponseData {
  message: string;
}

router.post('/me/test-email', AccountController.sendTest);

// ─── GET /api/private/me/export ──────────────────────────────────────────────

/** A presigned GET for the ZIP (user-data.csv + assets/), valid for 15 minutes. */
export interface ExportMyDataResponseData {
  downloadUrl: string;
  filename: string;
}

router.get('/me/export', AccountController.exportMyData);

// ─── DELETE /api/private/delete ─────────────────────────────────────────────

export interface DeleteUserResponseData {
  message: string;
}

router.delete('/delete', AccountController.deleteAccount);

export { router as accountRouter };
