import { type RequestHandler } from 'express';
import { User, Media } from '../classes/index.js';
import type { AuthenticatedRequest } from '../types/express.js';
import type {
  MeResponseData,
  DeleteUserResponseData,
  UpdateMeRequestBody,
  UpdateMeResponseData,
  ExportMyDataResponseData,
} from '../routes/private/account.js';
import { accountImageFolder } from '../constants/s3Folders.js';
import { consumeStagedUpload, stagedUploadErrorStatus } from '../services/stagedUpload.js';
import {
  deleteAllEntityMedia,
  deleteMediaById,
  uploadAndCreateMedia,
} from '../services/mediaManager.js';
import { getPresignedDownloadUrl, uploadExportZip } from '../utils/s3Util.js';
import { createUserExportZip } from '../utils/exportZipUtil.js';
import { sendEmail, escapeHtml } from '../utils/sesUtil.js';
import { environment } from '../config/environment.js';

async function resolvePhotoUrl(photoId: string | null): Promise<string | null> {
  if (photoId === null) return null;
  const media = await Media.findById(photoId);
  if (media === null) return null;
  return media.cloudfrontUrl;
}

const getMe: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const user = await User.findById(userId);

    if (user === null) {
      res.error('User not found', 404);
      return;
    }

    const photoUrl = await resolvePhotoUrl(user.photoId);

    const data: MeResponseData = toMeResponse(user, photoUrl);

    res.success(data);
  } catch (error) {
    console.error('Error fetching user account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch account data';
    res.error(errorMessage, 500);
  }
};

/** Lifetime of the export download link. */
const EXPORT_URL_TTL_SECONDS = 900;

function toMeResponse(user: User, photoUrl: string | null): MeResponseData {
  return {
    id: user.id,
    cognitoSub: user.cognitoSub,
    email: user.email ?? '',
    name: user.name ?? '',
    photoUrl,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/** The body as UpdateMeRequestBody, or an error message for a 400. */
function parseUpdateMeBody(body: unknown): UpdateMeRequestBody | string {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return 'Request body must be a JSON object';
  }
  const { name, removePhoto, photo } = body as Record<string, unknown>;
  if (name !== undefined && typeof name !== 'string') return 'name must be a string';
  if (removePhoto !== undefined && typeof removePhoto !== 'boolean') {
    return 'removePhoto must be a boolean';
  }
  if (photo !== undefined) {
    if (typeof photo !== 'object' || photo === null || Array.isArray(photo)) {
      return 'photo must be an object with stagingKey and fileName';
    }
    const { stagingKey, fileName } = photo as Record<string, unknown>;
    if (typeof stagingKey !== 'string' || typeof fileName !== 'string') {
      return 'photo must be an object with stagingKey and fileName';
    }
    return {
      ...(name === undefined ? {} : { name }),
      ...(removePhoto === undefined ? {} : { removePhoto }),
      photo: { stagingKey, fileName },
    };
  }
  return {
    ...(name === undefined ? {} : { name }),
    ...(removePhoto === undefined ? {} : { removePhoto }),
  };
}

/**
 * PUT /me. A new photo is consumed, stripped, uploaded and recorded first; the user is updated
 * next; the old photo is deleted last. A rejected upload (400/404/413) therefore leaves the
 * current photo untouched.
 */
const updateMe: RequestHandler = async (req, res): Promise<void> => {
  let newPhoto: Media | null = null;
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const body = parseUpdateMeBody(req.body);
    if (typeof body === 'string') {
      res.error(body, 400);
      return;
    }

    const user = await User.findById(userId);
    if (user === null) {
      res.error('User not found', 404);
      return;
    }

    const updateData: { name?: string; photoId?: string | null } = {};

    if (body.name !== undefined && body.name !== user.name) {
      updateData.name = body.name;
    }

    if (body.photo !== undefined) {
      const staged = await consumeStagedUpload({
        userId,
        stagingKey: body.photo.stagingKey,
        fileName: body.photo.fileName,
        purpose: 'account-photo',
      });
      newPhoto = await uploadAndCreateMedia({
        ...staged,
        folder: accountImageFolder(userId),
        uploadedBy: userId,
      });
      updateData.photoId = newPhoto.id;
    } else if (body.removePhoto === true) {
      updateData.photoId = null;
    }

    if (Object.keys(updateData).length === 0) {
      res.error('No changes provided', 400);
      return;
    }

    const updatedUser = await User.updateProfile(userId, updateData);
    newPhoto = null; // committed: no longer ours to roll back

    const oldPhotoId = user.photoId;
    if (oldPhotoId !== null && 'photoId' in updateData && updateData.photoId !== oldPhotoId) {
      await deleteMediaById(oldPhotoId).catch((error: unknown) => {
        console.warn(`Failed to delete replaced photo ${oldPhotoId}:`, error);
      });
    }

    const photoUrl = await resolvePhotoUrl(updatedUser.photoId);
    const data: UpdateMeResponseData = toMeResponse(updatedUser, photoUrl);
    res.success(data);
  } catch (error) {
    if (newPhoto !== null) {
      const orphanId = newPhoto.id;
      await deleteMediaById(orphanId).catch((cleanupError: unknown) => {
        console.warn(`Failed to remove uncommitted photo ${orphanId}:`, cleanupError);
      });
    }
    const status = stagedUploadErrorStatus(error, 500);
    if (status >= 500) console.error('Error updating user account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update account';
    res.error(errorMessage, status);
  }
};

const deleteAccount: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const cognitoSub = authReq.user.cognitoSub;

    await deleteAllEntityMedia(userId);

    await User.deleteAccount(userId, cognitoSub);

    const data: DeleteUserResponseData = {
      message: 'All user data has been permanently deleted',
    };

    res.success(data);
  } catch (error) {
    console.error('Error deleting user account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete user account';
    const statusCode = errorMessage === 'User not found' ? 404 : 500;
    res.error(errorMessage, statusCode);
  }
};

const sendTest: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const user = await User.findById(userId);
    if (user === null) {
      res.error('User not found', 404);
      return;
    }

    if (user.email === null || user.email === '') {
      res.error('No email address on this account', 400);
      return;
    }

    const domain = environment.domainName;
    const name = user.name ?? user.email;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #1a1a1a;">${escapeHtml(domain)} — Test Email</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>This is a test email sent from your account on <strong>${escapeHtml(domain)}</strong> to confirm that email delivery is working correctly.</p>
        <table style="border-collapse: collapse; margin: 16px 0; width: 100%;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(user.email)}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Domain</td><td style="padding: 8px;">${escapeHtml(domain)}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">This is an automated message from ${escapeHtml(domain)}. Please do not reply.</p>
      </body>
      </html>
    `.trim();

    const textBody = [
      `Hi ${name},`,
      '',
      `This is a test email sent from your account on ${domain} to confirm that email delivery is working correctly.`,
      '',
      `Name: ${name}`,
      `Email: ${user.email}`,
      `Domain: ${domain}`,
      '',
    ].join('\n');

    await sendEmail({
      to: user.email,
      subject: `${domain} — Test Email`,
      htmlBody,
      textBody,
    });

    res.success({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send test email';
    res.error(errorMessage, 500);
  }
};

const exportMyData: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const user = await User.findById(userId);
    if (user === null) {
      res.error('User not found', 404);
      return;
    }

    const media = await Media.findByUploadedBy(userId);
    const photoUrl = await resolvePhotoUrl(user.photoId);

    const zipBuffer = await createUserExportZip(user, media, photoUrl);

    const filename = `user-export-${String(Date.now())}.zip`;
    const s3Key = await uploadExportZip({ userId, buffer: zipBuffer, filename });
    const downloadUrl = await getPresignedDownloadUrl(s3Key, EXPORT_URL_TTL_SECONDS);

    const data: ExportMyDataResponseData = { downloadUrl, filename };
    res.success(data);
  } catch (error) {
    console.error('Error exporting user data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to export data';
    res.error(errorMessage, 500);
  }
};

export const AccountController = {
  getMe,
  updateMe,
  deleteAccount,
  sendTest,
  exportMyData,
} as const;
