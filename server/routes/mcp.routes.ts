import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { ChittyMCP } from '../lib/chittychain/ChittyMCP';
import { APIResponse } from '../types/api';

const router = Router();

// Apply authentication to all routes
router.use(authenticateUser);

// Initialize ChittyMCP client
const mcpClient = new ChittyMCP({
  apiKey: process.env.CHITTY_MCP_API_KEY,
  mcpEndpoint: process.env.CHITTY_MCP_ENDPOINT || 'https://mcp.chittychain.io/api',
  apiVersion: 'v1'
});

// Get available AI assistants
router.get('/assistants', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const assistants = await mcpClient.listAssistants();
  
  const response: APIResponse = {
    success: true,
    data: assistants
  };
  
  res.json(response);
}));

// Get specific assistant details
router.get('/assistants/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const assistant = await mcpClient.getAssistant(id);
  
  if (!assistant) {
    throw new APIError(404, 'Assistant not found', 'ASSISTANT_NOT_FOUND');
  }
  
  const response: APIResponse = {
    success: true,
    data: assistant
  };
  
  res.json(response);
}));

// Chat with an AI assistant
const chatSchema = z.object({
  assistantId: z.string(),
  message: z.string(),
  conversationId: z.string().optional(),
  context: z.record(z.any()).optional()
});

router.post('/chat', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { assistantId, message, conversationId, context } = chatSchema.parse(req.body);
  
  // Add user context to the request
  const enhancedContext = {
    ...context,
    userId: req.user.id,
    username: req.user.username,
    timestamp: Date.now()
  };

  const result = await mcpClient.chat(assistantId, message, enhancedContext, conversationId);
  
  const response: APIResponse = {
    success: true,
    data: result
  };
  
  res.json(response);
}));

// Analyze transactions with ChittyBookkeeper
const analyzeTransactionsSchema = z.object({
  assistantId: z.string().optional().default('chittybookkeeper'),
  analysisType: z.enum(['categorization', 'anomaly', 'tax', 'trends']).optional().default('categorization'),
  transactions: z.array(z.any()).optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional()
});

router.post('/analyze/transactions', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { assistantId, analysisType, transactions, dateRange } = analyzeTransactionsSchema.parse(req.body);
  
  // If no transactions provided, fetch recent transactions
  let transactionData = transactions;
  if (!transactionData) {
    // Mock fetching transactions from database
    transactionData = [
      {
        id: '1',
        title: 'AWS Services',
        amount: -2500,
        category: 'Technology',
        date: '2024-01-15',
        merchant: 'Amazon Web Services'
      },
      {
        id: '2',
        title: 'Client Payment',
        amount: 15000,
        category: 'Revenue',
        date: '2024-01-10',
        merchant: 'Acme Corp'
      }
    ];
  }

  const analysis = await mcpClient.analyzeTransactions(transactionData, analysisType);
  
  const response: APIResponse = {
    success: true,
    data: {
      analysis,
      assistantId,
      analysisType,
      transactionCount: transactionData.length
    }
  };
  
  res.json(response);
}));

// Analyze DeFi positions with ChittyTrader
const analyzeDeFiSchema = z.object({
  assistantId: z.string().optional().default('chittytrader'),
  analysisType: z.enum(['yield', 'risk', 'optimization']).optional().default('yield'),
  positions: z.array(z.any()).optional()
});

router.post('/analyze/defi', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { assistantId, analysisType, positions } = analyzeDeFiSchema.parse(req.body);
  
  // Mock DeFi positions if none provided
  const positionData = positions || [
    {
      protocol: 'ChittySwap',
      type: 'liquidity',
      tokenA: 'CHITTY',
      tokenB: 'USDT',
      value: 25000,
      apy: 8.2
    }
  ];

  const analysis = await mcpClient.analyzeDeFiPositions(positionData, analysisType);
  
  const response: APIResponse = {
    success: true,
    data: {
      ...analysis,
      assistantId,
      analysisType,
      positionCount: positionData.length
    }
  };
  
  res.json(response);
}));

// Compliance check with ChittyAuditor
const complianceSchema = z.object({
  assistantId: z.string().optional().default('chittyauditor'),
  transactions: z.array(z.any()).optional(),
  regulations: z.array(z.string()).optional().default(['AML', 'KYC', 'FATCA'])
});

router.post('/compliance/check', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { assistantId, transactions, regulations } = complianceSchema.parse(req.body);
  
  // Mock transactions if none provided
  const transactionData = transactions || [];

  const complianceResult = await mcpClient.performComplianceCheck(transactionData, regulations);
  
  const response: APIResponse = {
    success: true,
    data: {
      ...complianceResult,
      assistantId,
      regulations,
      transactionCount: transactionData.length,
      checkDate: new Date().toISOString()
    }
  };
  
  res.json(response);
}));

// Tax analysis with ChittyTax
const taxAnalysisSchema = z.object({
  assistantId: z.string().optional().default('chittytax'),
  transactions: z.array(z.any()).optional(),
  taxYear: z.string().optional().default('2024'),
  jurisdiction: z.string().optional().default('US')
});

router.post('/tax/analyze', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { assistantId, transactions, taxYear, jurisdiction } = taxAnalysisSchema.parse(req.body);
  
  // Mock transactions if none provided
  const transactionData = transactions || [];

  const taxAnalysis = await mcpClient.analyzeTaxImplications(transactionData, taxYear, jurisdiction);
  
  const response: APIResponse = {
    success: true,
    data: {
      ...taxAnalysis,
      assistantId,
      taxYear,
      jurisdiction,
      transactionCount: transactionData.length,
      analysisDate: new Date().toISOString()
    }
  };
  
  res.json(response);
}));

// Financial planning with ChittyPlanner
const planningSchema = z.object({
  assistantId: z.string().optional().default('chittyplanner'),
  goals: z.array(z.object({
    type: z.string(),
    target: z.number(),
    timeline: z.string(),
    priority: z.enum(['low', 'medium', 'high'])
  })),
  currentFinances: z.record(z.any()).optional()
});

router.post('/planning/create', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { assistantId, goals, currentFinances } = planningSchema.parse(req.body);
  
  // Mock current finances if none provided
  const financeData = currentFinances || {
    income: 85000,
    expenses: 55000,
    savings: 25000,
    investments: 75000,
    debt: 15000
  };

  const financialPlan = await mcpClient.createFinancialPlan(goals, financeData);
  
  const response: APIResponse = {
    success: true,
    data: {
      ...financialPlan,
      assistantId,
      goalCount: goals.length,
      planDate: new Date().toISOString()
    }
  };
  
  res.json(response);
}));

// Generate financial report with ChittyBookkeeper
const reportSchema = z.object({
  assistantId: z.string().optional().default('chittybookkeeper'),
  reportType: z.enum(['monthly', 'quarterly', 'annual', 'custom']),
  format: z.enum(['summary', 'detailed', 'executive']).optional().default('summary'),
  data: z.record(z.any()).optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional()
});

router.post('/reports/generate', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { assistantId, reportType, format, data, dateRange } = reportSchema.parse(req.body);
  
  // Mock financial data if none provided
  const financialData = data || {
    revenue: 125000,
    expenses: 89000,
    netIncome: 36000,
    cashFlow: 42000,
    transactions: 156
  };

  const report = await mcpClient.generateFinancialReport(financialData, reportType, format);
  
  const response: APIResponse = {
    success: true,
    data: {
      ...report,
      assistantId,
      reportType,
      format,
      dateRange,
      generatedAt: new Date().toISOString()
    }
  };
  
  res.json(response);
}));

// Get conversation history
router.get('/conversations/:assistantId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { assistantId } = req.params;
  
  // Mock conversation data - in reality would fetch from database
  const conversations = [
    {
      id: 'conv_1',
      assistantId,
      title: 'Monthly Financial Review',
      messages: [],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }
  ];
  
  const response: APIResponse = {
    success: true,
    data: conversations
  };
  
  res.json(response);
}));

// Get specific conversation
router.get('/conversation/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const { id } = req.params;
  
  // Mock conversation data
  const conversation = {
    id,
    assistantId: 'chittybookkeeper',
    title: 'Financial Analysis Session',
    messages: [
      {
        id: 'msg_1',
        role: 'system',
        content: 'Hello! I\'m ChittyBookkeeper, ready to help with your financial analysis.',
        timestamp: Date.now() - 3600000
      }
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  };
  
  const response: APIResponse = {
    success: true,
    data: conversation
  };
  
  res.json(response);
}));

// MCP Health Check
router.get('/health', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const isHealthy = await mcpClient.testConnection();
  
  const response: APIResponse = {
    success: true,
    data: {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      assistants: (await mcpClient.listAssistants()).length
    }
  };
  
  res.json(response);
}));

export default router;