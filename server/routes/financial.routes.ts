import { Router } from 'express';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateUser, AuthenticatedRequest, checkResourceOwnership } from '../middleware/auth';
import { validateBody, validateParams, createIntegrationSchema, updateIntegrationSchema, idSchema } from '../middleware/validation';
import { apiRateLimit } from '../middleware/security';
import { storage } from '../storage';
import { aggregateFinancialData } from '../lib/financialServices';
import { APIResponse, FinancialSummaryData } from '../types/api';

const router = Router();

// Apply rate limiting and authentication to all routes
router.use(apiRateLimit);
router.use(authenticateUser);

router.get('/financial-summary', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const [summary, integrations] = await Promise.all([
    storage.getFinancialSummary(req.user.id),
    storage.getIntegrations(req.user.id)
  ]);

  let aggregatedData: FinancialSummaryData;
  
  if (integrations.length > 0) {
    aggregatedData = await aggregateFinancialData(integrations);
  } else if (summary) {
    aggregatedData = {
      cashOnHand: summary.cashOnHand,
      totalRevenue: summary.totalRevenue,
      totalExpenses: summary.totalExpenses,
      netIncome: summary.totalRevenue - summary.totalExpenses,
      profitMargin: summary.totalRevenue > 0 
        ? ((summary.totalRevenue - summary.totalExpenses) / summary.totalRevenue) * 100 
        : 0,
      burnRate: summary.totalExpenses / 30,
      runway: summary.cashOnHand / (summary.totalExpenses / 30),
      accountsReceivable: 25000,
      accountsPayable: 15000,
      lastUpdated: new Date()
    };
  } else {
    aggregatedData = {
      cashOnHand: 150000,
      totalRevenue: 45000,
      totalExpenses: 32000,
      netIncome: 13000,
      profitMargin: 28.89,
      burnRate: 1067,
      runway: 140.6,
      accountsReceivable: 25000,
      accountsPayable: 15000,
      lastUpdated: new Date()
    };
  }

  const response: APIResponse<FinancialSummaryData> = {
    success: true,
    data: aggregatedData
  };
  
  res.json(response);
}));

router.get('/integrations', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  // Use secure method that doesn't expose credentials
  const integrations = await storage.getIntegrationsForAPI(req.user.id);
  
  const response: APIResponse = {
    success: true,
    data: integrations
  };
  
  res.json(response);
}));

router.post('/integrations', 
  validateBody(createIntegrationSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
    }

    const integrationData = {
      ...req.body,
      userId: req.user.id
    };
    
    const integration = await storage.createIntegration(integrationData);
    
    // Remove credentials from response
    const { credentials, ...safeIntegration } = integration;
    
    const response: APIResponse = {
      success: true,
      data: safeIntegration
    };
    
    res.status(201).json(response);
  })
);

router.put('/integrations/:id',
  validateParams(idSchema),
  validateBody(updateIntegrationSchema),
  checkResourceOwnership('integration'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    
    const integration = await storage.updateIntegration(id, req.body);
    
    if (!integration) {
      throw new APIError(404, 'Integration not found', 'NOT_FOUND');
    }
    
    // Remove credentials from response
    const { credentials, ...safeIntegration } = integration;
    
    const response: APIResponse = {
      success: true,
      data: safeIntegration
    };
    
    res.json(response);
  })
);

router.delete('/integrations/:id',
  validateParams(idSchema),
  checkResourceOwnership('integration'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    await storage.deleteIntegration(id);
    
    const response: APIResponse = {
      success: true,
      data: { message: 'Integration removed successfully' }
    };
    
    res.json(response);
  })
);

export default router;