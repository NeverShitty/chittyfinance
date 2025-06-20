import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { APIError } from './errorHandler';
import { rateLimitConfigs } from './auth';

// Rate limiting configurations
export const generalRateLimit = rateLimit({
  windowMs: rateLimitConfigs.general.windowMs,
  max: rateLimitConfigs.general.max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    throw new APIError(429, 'Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
  }
});

export const authRateLimit = rateLimit({
  windowMs: rateLimitConfigs.auth.windowMs,
  max: rateLimitConfigs.auth.max,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    throw new APIError(429, 'Authentication rate limit exceeded', 'AUTH_RATE_LIMIT_EXCEEDED');
  }
});

export const apiRateLimit = rateLimit({
  windowMs: rateLimitConfigs.api.windowMs,
  max: rateLimitConfigs.api.max,
  message: {
    success: false,
    error: {
      code: 'API_RATE_LIMIT_EXCEEDED',
      message: 'API rate limit exceeded, please slow down'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    throw new APIError(429, 'API rate limit exceeded', 'API_RATE_LIMIT_EXCEEDED');
  }
});

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('replit.dev')) {
        return callback(null, true);
      }
    }
    
    // In production, only allow specific domains
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if it's a Replit domain
    if (origin.endsWith('.replit.dev') || origin.endsWith('.replit.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Security headers configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Vite in development
        "'unsafe-eval'", // Required for development
        "https://cdn.jsdelivr.net",
        "https://unpkg.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://api.openai.com",
        "https://api.chittychain.io",
        "https://mcp.chittychain.io",
        "wss://ws.chittychain.io"
      ],
      workerSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
});

// Request size limiting
export function requestSizeLimit(req: Request, res: Response, next: NextFunction) {
  const contentLength = parseInt(req.get('Content-Length') || '0', 10);
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  
  if (contentLength > maxSize) {
    throw new APIError(413, 'Request entity too large', 'REQUEST_TOO_LARGE');
  }
  
  next();
}

// IP-based security checks
export function ipSecurityCheck(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Block known malicious IP ranges (this is a basic example)
  const blockedIpRanges = process.env.BLOCKED_IP_RANGES?.split(',') || [];
  
  for (const range of blockedIpRanges) {
    if (clientIp.startsWith(range.trim())) {
      throw new APIError(403, 'Access denied from your IP address', 'IP_BLOCKED');
    }
  }
  
  // Log suspicious activity (many requests from same IP)
  // In a real implementation, you'd use Redis or similar for this
  const suspiciousThreshold = 1000; // requests per hour
  // Implementation would track requests per IP and block if exceeded
  
  next();
}

// HTTP method validation
export function validateHttpMethod(allowedMethods: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedMethods.includes(req.method)) {
      throw new APIError(405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
    }
    next();
  };
}

// Content type validation
export function validateContentType(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new APIError(415, 'Content-Type must be application/json', 'INVALID_CONTENT_TYPE');
    }
  }
  
  next();
}

// Security monitoring middleware
export function securityLogger(req: Request, res: Response, next: NextFunction) {
  const securityEvents = [];
  
  // Check for suspicious patterns
  const userAgent = req.get('User-Agent') || '';
  const suspiciousUA = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'ZmEu',
    'paros',
    'dirbuster'
  ];
  
  if (suspiciousUA.some(pattern => userAgent.toLowerCase().includes(pattern))) {
    securityEvents.push('suspicious_user_agent');
  }
  
  // Check for SQL injection patterns in query parameters
  const queryString = JSON.stringify(req.query).toLowerCase();
  const sqlPatterns = ['union', 'select', 'insert', 'delete', 'drop', 'exec', '--', ';'];
  
  if (sqlPatterns.some(pattern => queryString.includes(pattern))) {
    securityEvents.push('potential_sql_injection');
  }
  
  // Log security events
  if (securityEvents.length > 0) {
    console.warn('Security Event:', {
      ip: req.ip,
      userAgent,
      url: req.originalUrl,
      method: req.method,
      events: securityEvents,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
}

export default {
  generalRateLimit,
  authRateLimit,
  apiRateLimit,
  corsOptions,
  helmetConfig,
  requestSizeLimit,
  ipSecurityCheck,
  validateHttpMethod,
  validateContentType,
  securityLogger
};