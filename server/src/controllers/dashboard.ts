import { type RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import type { DashboardResponseData } from '../routes/user/dashboard.js';

const getDashboard: RequestHandler = (_req, res): void => {
  const authReq = _req as AuthenticatedRequest;
  const userId = authReq.user.id;

  const data: DashboardResponseData = {
    userId,
    message: 'Dashboard data placeholder',
  };

  res.success(data);
};

export const DashboardController = {
  getDashboard,
} as const;
