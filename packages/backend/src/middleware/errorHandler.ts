import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn({ err, path: req.path }, 'Operational error');
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    logger.warn({ err, path: req.path }, 'Validation error');
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.issues,
    });
  }

  logger.error({ err, path: req.path }, 'Unhandled error');
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
