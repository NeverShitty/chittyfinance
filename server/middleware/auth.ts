import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import crypto from 'crypto';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface SessionData {
  userId: number;
  username: string;
  email: string;
  expires: number;
  csrfToken: string;
}

// CSRF token generation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Secure session validation
export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Check for session authentication
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      // Replit Auth session exists
      const sessionUser = req.user as any;
      
      if (sessionUser.claims && sessionUser.claims.email) {
        // Get user from database based on session email
        const user = await storage.getUserByEmail(sessionUser.claims.email);
        
        if (!user) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User account not found'
            }
          });
        }
        
        // Check session expiry
        const now = Math.floor(Date.now() / 1000);
        if (sessionUser.expires_at && now > sessionUser.expires_at) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'SESSION_EXPIRED',
              message: 'Session has expired'
            }
          });
        }
        
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email
        };
        
        return next();
      }
    }
    
    // Fallback to demo user for development (only in development)
    if (process.env.NODE_ENV === 'development') {
      const demoUser = await storage.getUserByUsername('demo');
      
      if (demoUser) {
        req.user = {
          id: demoUser.id,
          username: demoUser.username,
          email: demoUser.email
        };
        return next();
      }
    }
    
    // No valid authentication found
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed'
      }
    });
  }
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
  next();
}

// Authorization middleware to check resource ownership
export async function checkResourceOwnership(resourceType: 'integration' | 'transaction' | 'task') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      const { id } = req.params;
      const resourceId = parseInt(id);

      if (isNaN(resourceId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid resource ID'
          }
        });
      }

      let resource: any;
      
      switch (resourceType) {
        case 'integration':
          resource = await storage.getIntegration(resourceId);
          break;
        case 'transaction':
          resource = await storage.getTransaction(resourceId);
          break;
        case 'task':
          resource = await storage.getTask(resourceId);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_RESOURCE_TYPE',
              message: 'Invalid resource type'
            }
          });
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`
          }
        });
      }

      // Check if the resource belongs to the authenticated user
      if (resource.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: You do not own this resource'
          }
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Authorization check failed'
        }
      });
    }
  };
}

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

export const rateLimitConfigs = {
  general: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
  auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 auth attempts per 15 minutes
  api: { windowMs: 60 * 1000, max: 30 } // 30 API calls per minute
};