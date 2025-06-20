import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { errorHandler } from "./middleware/errorHandler";
import registerRoutes from "./routes";
import { setupAuth } from "./replitAuth";
import cors from "cors";
import { 
  helmetConfig, 
  corsOptions, 
  generalRateLimit, 
  requestSizeLimit, 
  ipSecurityCheck,
  validateContentType,
  securityLogger
} from "./middleware/security";
import { sanitizeRequest } from "./middleware/validation";
import { validateEnvironmentSecurity } from "./lib/crypto";

const app = express();
const server = createServer(app);

// Validate environment security on startup
const securityIssues = validateEnvironmentSecurity();
if (securityIssues.length > 0) {
  console.warn('Security Configuration Issues:');
  securityIssues.forEach(issue => console.warn(`- ${issue}`));
  
  if (process.env.NODE_ENV === 'production') {
    console.error('Cannot start in production with security issues');
    process.exit(1);
  }
}

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware (order is important)
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(generalRateLimit);
app.use(ipSecurityCheck);
app.use(requestSizeLimit);
app.use(securityLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Content validation and sanitization
app.use(validateContentType);
app.use(sanitizeRequest);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup authentication
  setupAuth(app);

  // API routes
  const httpServer = await registerRoutes(app);

  // Error handler (must be after all routes)
  app.use(errorHandler);

  // Setup vite in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();