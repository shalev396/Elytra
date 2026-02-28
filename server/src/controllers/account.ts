import { type RequestHandler } from 'express';
import { User, Media } from '../classes/index.js';
import type { AuthenticatedRequest } from '../types/express.js';
import type {
  MeResponseData,
  DeleteUserResponseData,
  UpdateMeResponseData,
} from '../routes/user/account.js';
import { uploadFile, deleteFile } from '../utils/s3Util.js';
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

    const data: MeResponseData = {
      id: user.id,
      cognitoSub: user.cognitoSub,
      email: user.email ?? '',
      name: user.name ?? '',
      photoUrl,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.success(data);
  } catch (error) {
    console.error('Error fetching user account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch account data';
    res.error(errorMessage, 500);
  }
};

const updateMe: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const user = await User.findById(userId);
    if (user === null) {
      res.error('User not found', 404);
      return;
    }

    const { name, removePhoto } = req.body as { name?: string; removePhoto?: string };
    const file = req.file;

    const updateData: { name?: string; photoId?: string | null } = {};

    if (name !== undefined && name !== user.name) {
      updateData.name = name;
    }

    if (file || removePhoto === 'true') {
      if (user.photoId !== null) {
        const oldMedia = await Media.findById(user.photoId);
        if (oldMedia !== null) {
          await deleteFile(oldMedia.s3Key);
          await Media.deleteById(oldMedia.id);
        }
      }

      if (file) {
        const { s3Key, s3Url, cloudfrontUrl } = await uploadFile({
          buffer: file.buffer,
          fileName: file.originalname,
          mimeType: file.mimetype,
          folder: `users/${userId}`,
        });

        const media = await Media.create({
          s3Key,
          s3Url,
          cloudfrontUrl,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          uploadedBy: userId,
        });

        updateData.photoId = media.id;
      } else {
        updateData.photoId = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      res.error('No changes provided', 400);
      return;
    }

    const updatedUser = await User.updateProfile(userId, updateData);
    const photoUrl = await resolvePhotoUrl(updatedUser.photoId);

    const data: UpdateMeResponseData = {
      id: updatedUser.id,
      cognitoSub: updatedUser.cognitoSub,
      email: updatedUser.email ?? '',
      name: updatedUser.name ?? '',
      photoUrl,
      lastLoginAt: updatedUser.lastLoginAt ?? null,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    res.success(data);
  } catch (error) {
    console.error('Error updating user account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update account';
    res.error(errorMessage, 500);
  }
};

const deleteAccount: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const cognitoSub = authReq.user.cognitoSub;

    const userMedia = await Media.findByUploadedBy(userId);

    await Promise.all(userMedia.map((media) => deleteFile(media.s3Key)));
    await Media.deleteByUploadedBy(userId);

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

export const AccountController = {
  getMe,
  updateMe,
  deleteAccount,
  sendTest,
} as const;
