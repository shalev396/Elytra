import { Router } from 'express';
import multer from 'multer';
import { AccountController } from '../../controllers/index.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  },
});

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

export interface UpdateMeRequestBody {
  name?: string;
  /** Send 'true' to delete the current photo without uploading a replacement */
  removePhoto?: string;
}

export type UpdateMeResponseData = MeResponseData;

router.put('/me', upload.single('photo'), AccountController.updateMe);

// ─── POST /api/private/me/test-email ─────────────────────────────────────────

export interface TestEmailResponseData {
  message: string;
}

router.post('/me/test-email', AccountController.sendTest);

// ─── GET /api/private/me/export ──────────────────────────────────────────────
// Returns binary ZIP (application/zip) with Content-Disposition: attachment

router.get('/me/export', AccountController.exportMyData);

// ─── DELETE /api/private/delete ─────────────────────────────────────────────

export interface DeleteUserResponseData {
  message: string;
}

router.delete('/delete', AccountController.deleteAccount);

export { router as accountRouter };
