import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { getFinancialSummary, getIntegrations, addIntegration, updateIntegration, removeIntegration } from '../storage';
import { aggregateFinancialData } from '../lib/financialServices';
import { APIResponse, FinancialSummaryData } from '../types/api';

const router = Router();

// Apply authentication to all routes
router.use(authenticateUser);

router.get('/financial-summary', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const [summary, integrations] = await Promise.all([
    getFinancialSummary(req.user.id),
    getIntegrations(req.user.id)
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

const integrationSchema = z.object({
  service: z.string(),
  config: z.record(z.any()).optional()
});

router.get('/integrations', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const integrations = await getIntegrations(req.user.id);
  
  const response: APIResponse = {
    success: true,
    data: integrations
  };
  
  res.json(response);
}));

router.post('/integrations', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const data = integrationSchema.parse(req.body);
  const integration = await addIntegration(req.user.id, data.service, data.config);
  
  const response: APIResponse = {
    success: true,
    data: integration
  };
  
  res.status(201).json(response);
}));

router.put('/integrations/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { id } = req.params;
  const updates = req.body;
  
  const integration = await updateIntegration(parseInt(id), updates);
  
  if (!integration) {
    throw new APIError(404, 'Integration not found', 'NOT_FOUND');
  }
  
  const response: APIResponse = {
    success: true,
    data: integration
  };
  
  res.json(response);
}));

router.delete('/integrations/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { id } = req.params;
  await removeIntegration(parseInt(id));
  
  const response: APIResponse = {
    success: true,
    data: { message: 'Integration removed successfully' }
  };
  
  res.json(response);
}));

export default router;