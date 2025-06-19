import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { getTransactions } from '../storage';
import { APIResponse, PaginatedResponse, Transaction } from '../types/api';

const router = Router();

// Apply authentication to all routes
router.use(authenticateUser);

const transactionQuerySchema = z.object({
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional()
});

router.get('/transactions', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const query = transactionQuerySchema.parse(req.query);
  const limit = query.limit || 50;
  const offset = query.offset || 0;

  // Get transactions from storage
  const transactions = await getTransactions(req.user.id, limit, offset);
  
  // Transform to API format
  const apiTransactions: Transaction[] = transactions.map(t => ({
    id: t.id.toString(),
    date: new Date(t.date),
    description: t.description,
    amount: t.amount,
    type: t.amount > 0 ? 'income' : 'expense',
    category: t.category || 'Uncategorized',
    source: t.source || 'manual',
    metadata: {}
  }));

  // Apply filters if provided
  let filteredTransactions = apiTransactions;
  
  if (query.type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === query.type);
  }
  
  if (query.category) {
    filteredTransactions = filteredTransactions.filter(t => 
      t.category.toLowerCase().includes(query.category!.toLowerCase())
    );
  }
  
  if (query.startDate) {
    const startDate = new Date(query.startDate);
    filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
  }
  
  if (query.endDate) {
    const endDate = new Date(query.endDate);
    filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
  }

  const response: PaginatedResponse<Transaction[]> = {
    success: true,
    data: filteredTransactions,
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total: filteredTransactions.length,
      totalPages: Math.ceil(filteredTransactions.length / limit)
    }
  };
  
  res.json(response);
}));

router.get('/transactions/summary', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const transactions = await getTransactions(req.user.id, 1000, 0);
  
  const summary = {
    totalTransactions: transactions.length,
    totalIncome: transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    categoryCounts: transactions.reduce((acc, t) => {
      const category = t.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    monthlyTrend: getMonthlyTrend(transactions)
  };

  const response: APIResponse = {
    success: true,
    data: summary
  };
  
  res.json(response);
}));

function getMonthlyTrend(transactions: any[]) {
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }
    
    if (t.amount > 0) {
      monthlyData[monthKey].income += t.amount;
    } else {
      monthlyData[monthKey].expenses += Math.abs(t.amount);
    }
  });
  
  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ...data,
      net: data.income - data.expenses
    }));
}

export default router;