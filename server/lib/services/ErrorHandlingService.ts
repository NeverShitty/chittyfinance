import { Response } from 'express';

export interface ServiceError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export class ErrorHandlingService {
  static createError(message: string, status: number = 500, code?: string, details?: any): ServiceError {
    const error = new Error(message) as ServiceError;
    error.status = status;
    error.code = code;
    error.details = details;
    return error;
  }

  static handleServiceError(error: unknown, res: Response, defaultMessage: string = "Internal server error") {
    console.error('Service error:', error);

    if (error instanceof Error) {
      const serviceError = error as ServiceError;
      const status = serviceError.status || 500;
      const message = status === 500 ? defaultMessage : serviceError.message;
      
      return res.status(status).json({
        success: false,
        error: {
          message,
          code: serviceError.code,
          ...(process.env.NODE_ENV === 'development' && { details: serviceError.details })
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: { message: defaultMessage }
    });
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    res: Response,
    successMessage?: string
  ): Promise<void> {
    try {
      const result = await operation();
      res.json({
        success: true,
        data: result,
        ...(successMessage && { message: successMessage })
      });
    } catch (error) {
      this.handleServiceError(error, res);
    }
  }
}

export const errorHandler = ErrorHandlingService;