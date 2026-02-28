import { type RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';

const getDashboard: RequestHandler = (_req, res): void => {
  const authReq = _req as AuthenticatedRequest;
  const userId = authReq.user.id;

  res.success({
    userId,
    message: 'Dashboard data placeholder',
  });
};

export const DashboardController = {
  getDashboard,
} as const;
