import { type RequestHandler } from 'express';
import { User } from '../classes/index.js';
import type { AuthenticatedRequest } from '../types/express.js';
import type { MeResponseData, DeleteUserResponseData } from '../routes/user/account.js';

const getMe: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const user = await User.findById(userId);

    if (user === null) {
      res.error('User not found', 404);
      return;
    }

    const data: MeResponseData = {
      id: user.id,
      cognitoSub: user.cognitoSub,
      email: user.email ?? '',
      name: user.name ?? '',
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

const deleteAccount: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const cognitoSub = authReq.user.cognitoSub;

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

export const AccountController = {
  getMe,
  deleteAccount,
} as const;
