import { Router } from 'express';
import authRoutes from './auth.routes';
import financialRoutes from './financial.routes';
import transactionRoutes from './transaction.routes';
import mcpRoutes from './mcp.routes';
import chittyChainRoutes from './chittychain.routes';
import integrationsRoutes from './integrations.routes';
import userRoutes from './user.routes';

const router = Router();

// Mount route modules
router.use('/', authRoutes);
router.use('/', financialRoutes);
router.use('/', transactionRoutes);
router.use('/api', integrationsRoutes);
router.use('/api', userRoutes);
router.use('/v2/mcp', mcpRoutes);
router.use('/v2/chittychain', chittyChainRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;