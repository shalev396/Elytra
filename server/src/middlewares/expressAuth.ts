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
      res.status(401).json({
        success: false,
        message: 'No authorization header provided',
      });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Expected: Bearer <token>',
      });
      return;
    }

    const token = authHeader.substring(7);

    if (token === '') {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const decoded = await verifyToken(token);

    const cognitoSub = decoded.sub;

    if (cognitoSub === undefined) {
      res.status(401).json({
        success: false,
        message: 'Invalid token: missing subject',
      });
      return;
    }

    const userRepo = await getUserRepository();
    const user = await userRepo.findByCognitoSub(cognitoSub);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      cognitoSub: user.cognitoSub,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};
