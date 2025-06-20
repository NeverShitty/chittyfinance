import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { APIError } from './errorHandler';

// Common validation schemas
export const idSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number)
});

export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? Number(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(Number(val), 100) : 50),
  offset: z.string().optional().transform(val => val ? Number(val) : 0)
});

// User validation schemas
export const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  email: z.string().email('Invalid email address').max(255, 'Email cannot exceed 255 characters'),
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name cannot exceed 100 characters')
    .trim(),
  role: z.string().optional().default('user')
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// Integration validation schemas
export const createIntegrationSchema = z.object({
  serviceType: z.string()
    .min(1, 'Service type is required')
    .max(50, 'Service type cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Service type can only contain letters, numbers, underscores, and hyphens'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  description: z.string().optional().max(500, 'Description cannot exceed 500 characters'),
  credentials: z.record(z.any()).optional(),
  config: z.record(z.any()).optional()
});

export const updateIntegrationSchema = createIntegrationSchema.partial();

// Transaction validation schemas
export const createTransactionSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z.string().optional().max(1000, 'Description cannot exceed 1000 characters'),
  amount: z.number()
    .finite('Amount must be a valid number')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  type: z.enum(['income', 'expense'], { 
    errorMap: () => ({ message: 'Type must be either "income" or "expense"' })
  }),
  date: z.string().datetime('Invalid date format').optional()
});

export const updateTransactionSchema = createTransactionSchema.partial();

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z.string().optional().max(1000, 'Description cannot exceed 1000 characters'),
  dueDate: z.string().datetime('Invalid due date format').optional(),
  priority: z.enum(['urgent', 'due_soon', 'upcoming'], {
    errorMap: () => ({ message: 'Priority must be one of: urgent, due_soon, upcoming' })
  }).optional(),
  completed: z.boolean().optional().default(false)
});

export const updateTaskSchema = createTaskSchema.partial();

// Financial summary validation
export const financialSummarySchema = z.object({
  cashOnHand: z.number().finite('Cash on hand must be a valid number'),
  monthlyRevenue: z.number().finite('Monthly revenue must be a valid number'),
  monthlyExpenses: z.number().finite('Monthly expenses must be a valid number'),
  outstandingInvoices: z.number().finite('Outstanding invoices must be a valid number')
});

// AI message validation
export const createAiMessageSchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content cannot exceed 5000 characters'),
  role: z.enum(['system', 'user', 'assistant'], {
    errorMap: () => ({ message: 'Role must be one of: system, user, assistant' })
  })
});

// API key validation
export const apiKeySchema = z.object({
  apiKey: z.string()
    .min(32, 'API key must be at least 32 characters')
    .max(256, 'API key cannot exceed 256 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'API key contains invalid characters')
});

// Validation middleware factory
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new APIError(400, 'Validation failed', 'VALIDATION_ERROR', {
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      throw error;
    }
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new APIError(400, 'Invalid parameters', 'VALIDATION_ERROR', {
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      throw error;
    }
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new APIError(400, 'Invalid query parameters', 'VALIDATION_ERROR', {
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      throw error;
    }
  };
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Request sanitization middleware
export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query as Record<string, any>);
  }
  
  next();
}