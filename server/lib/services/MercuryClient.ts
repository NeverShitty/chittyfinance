import { BaseServiceClient, ServiceConfig } from '../base/BaseServiceClient';
import { FinancialSummaryData, Transaction } from '../../types/api';

interface MercuryAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

interface MercuryTransaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'debit' | 'credit';
  category?: string;
}

export class MercuryClient extends BaseServiceClient {
  constructor(config: ServiceConfig) {
    super('Mercury', {
      ...config,
      baseUrl: config.baseUrl || 'https://api.mercury.com/api/v1'
    });
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest<{ accounts: MercuryAccount[] }>('/accounts');
      return true;
    } catch {
      return false;
    }
  }

  async getAccounts(): Promise<MercuryAccount[]> {
    const fallbackData: MercuryAccount[] = [
      { id: '1', name: 'Mercury Checking', balance: 50000, currency: 'USD' },
      { id: '2', name: 'Mercury Savings', balance: 100000, currency: 'USD' }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{ accounts: MercuryAccount[] }>('/accounts');
        return response.accounts;
      },
      fallbackData,
      'Failed to fetch Mercury accounts'
    );
  }

  async getTransactions(limit = 50): Promise<Transaction[]> {
    const fallbackData: Transaction[] = [
      {
        id: 'merc_1',
        date: new Date('2024-01-15'),
        description: 'AWS Services',
        amount: -2500,
        type: 'expense',
        category: 'Technology',
        source: 'mercury'
      },
      {
        id: 'merc_2',
        date: new Date('2024-01-10'),
        description: 'Client Payment - Acme Corp',
        amount: 15000,
        type: 'income',
        category: 'Revenue',
        source: 'mercury'
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{ transactions: MercuryTransaction[] }>(
          `/transactions?limit=${limit}`
        );
        
        return response.transactions.map(this.transformTransaction);
      },
      fallbackData,
      'Failed to fetch Mercury transactions'
    );
  }

  async getFinancialSummary(): Promise<Partial<FinancialSummaryData>> {
    const accounts = await this.getAccounts();
    const transactions = await this.getTransactions(100);
    
    const cashOnHand = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = transactions.filter(t => t.date >= thirtyDaysAgo);
    const totalRevenue = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      cashOnHand,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      lastUpdated: new Date()
    };
  }

  private transformTransaction(mercuryTx: MercuryTransaction): Transaction {
    return {
      id: mercuryTx.id,
      date: new Date(mercuryTx.date),
      description: mercuryTx.description,
      amount: mercuryTx.type === 'credit' ? mercuryTx.amount : -mercuryTx.amount,
      type: mercuryTx.type === 'credit' ? 'income' : 'expense',
      category: mercuryTx.category || 'Uncategorized',
      source: 'mercury'
    };
  }
}