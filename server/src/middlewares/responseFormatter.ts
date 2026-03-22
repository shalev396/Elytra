import {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
  type ErrorRequestHandler,
} from 'express';
/// <reference path="../types/express-extensions.d.ts" />

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
}

export const responseFormatter: RequestHandler = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.success = function (data: unknown, statusCode = 200): void {
    this.status(statusCode).json({
      data,
    });
  };

  res.error = function (message: string, statusCode = 500): void {
    this.status(statusCode).json({
      message,
    });
  };

  next();
};

export const errorHandler: ErrorRequestHandler = (
  error: ErrorWithStatusCode,
  _req: Request,
  res: Response,
): void => {
  console.error('Error:', error);

  const statusCode = error.statusCode ?? 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    message,
  });
};

export const notFound: RequestHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    message: 'Not found',
  });
};
