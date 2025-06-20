import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { authRateLimit } from '../middleware/security';
import { storage } from '../storage';
import { APIResponse } from '../types/api';

const router = Router();

// Apply auth rate limiting to authentication routes
router.use(authRateLimit);

router.get('/session', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const response: APIResponse = {
    success: true,
    data: {
      user: req.user?.username || 'demo'
    }
  };
  res.json(response);
}));

router.post('/logout', asyncHandler(async (req, res) => {
  // Clear session if implemented
  const response: APIResponse = {
    success: true,
    data: { message: 'Logged out successfully' }
  };
  res.json(response);
}));

export default router;