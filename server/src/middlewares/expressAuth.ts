import { type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import { verifyToken } from '../utils/cognitoUtil.js';
import { getUserRepository } from '../models/index.js';
import type { AuthenticatedRequest } from '../types/express.js';

export const expressAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader === undefined || authHeader === '') {
      res.error('No authorization header provided', 401);
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.error('Invalid authorization header format. Expected: Bearer <token>', 401);
      return;
    }

    const token = authHeader.substring(7);

    if (token === '') {
      res.error('No token provided', 401);
      return;
    }

    const decoded = await verifyToken(token);

    const cognitoSub = decoded.sub;

    if (cognitoSub === undefined) {
      res.error('Invalid token: missing subject', 401);
      return;
    }

    const userRepo = await getUserRepository();
    const user = await userRepo.findByCognitoSub(cognitoSub);

    if (!user) {
      res.error('User not found', 404);
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      cognitoSub: user.cognitoSub,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.error('Authentication failed', 401);
  }
};
