import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function errorHandler(
  err: Error | APIError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Create sanitized error log (no sensitive data)
  const errorLog = {
    name: err.name,
    message: err.message,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorLog.stack = err.stack;
  }

  console.error('Error:', errorLog);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors
      }
    });
  }

  // Handle custom API errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  // Handle generic errors
  const statusCode = 'statusCode' in err ? (err as any).statusCode : 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : message
    }
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}