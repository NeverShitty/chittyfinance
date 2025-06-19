export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ServiceIntegration {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  lastSync?: Date;
  config?: Record<string, any>;
}

export interface FinancialSummaryData {
  cashOnHand: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  burnRate: number;
  runway: number;
  accountsReceivable: number;
  accountsPayable: number;
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: Date;
  signature?: string;
}