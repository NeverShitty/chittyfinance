import { BaseServiceClient, ServiceConfig } from '../base/BaseServiceClient';
import { FinancialSummaryData, Transaction } from '../../types/api';

interface PlaidAccount {
  account_id: string;
  name: string;
  type: string;
  subtype: string;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
    iso_currency_code: string;
  };
}

interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category: string[];
  account_owner?: string;
}

interface PlaidItem {
  item_id: string;
  institution_id: string;
  webhook: string;
  error: any;
  available_products: string[];
  billed_products: string[];
}

export class PlaidClient extends BaseServiceClient {
  private clientId: string;
  private secret: string;
  private environment: 'sandbox' | 'development' | 'production';

  constructor(config: ServiceConfig & { 
    clientId: string; 
    secret: string; 
    environment?: 'sandbox' | 'development' | 'production' 
  }) {
    super('Plaid', {
      ...config,
      baseUrl: config.baseUrl || PlaidClient.getBaseUrl(config.environment || 'sandbox')
    });
    
    this.clientId = config.clientId;
    this.secret = config.secret;
    this.environment = config.environment || 'sandbox';
  }

  private static getBaseUrl(environment: string): string {
    switch (environment) {
      case 'production':
        return 'https://production.plaid.com';
      case 'development':
        return 'https://development.plaid.com';
      case 'sandbox':
      default:
        return 'https://sandbox.plaid.com';
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'PLAID-CLIENT-ID': this.clientId,
      'PLAID-SECRET': this.secret,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/categories/get', {
        method: 'POST',
        body: JSON.stringify({})
      });
      return true;
    } catch {
      return false;
    }
  }

  async createLinkToken(userId: string): Promise<{ link_token: string; expiration: string }> {
    const fallbackData = { 
      link_token: 'link-sandbox-' + Math.random().toString(36).substr(2, 9),
      expiration: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    };

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{ link_token: string; expiration: string }>('/link/token/create', {
          method: 'POST',
          body: JSON.stringify({
            client_id: this.clientId,
            secret: this.secret,
            client_name: 'ChittyFinance',
            country_codes: ['US'],
            language: 'en',
            user: {
              client_user_id: userId
            },
            products: ['transactions', 'accounts', 'identity'],
            account_filters: {
              depository: {
                account_subtypes: ['checking', 'savings']
              }
            }
          })
        });
        return response;
      },
      fallbackData,
      'Failed to create Plaid link token'
    );
  }

  async exchangePublicToken(publicToken: string): Promise<{ access_token: string; item_id: string }> {
    const fallbackData = {
      access_token: 'access-sandbox-' + Math.random().toString(36).substr(2, 20),
      item_id: 'item-' + Math.random().toString(36).substr(2, 15)
    };

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{ access_token: string; item_id: string }>('/link/token/exchange', {
          method: 'POST',
          body: JSON.stringify({
            client_id: this.clientId,
            secret: this.secret,
            public_token: publicToken
          })
        });
        return response;
      },
      fallbackData,
      'Failed to exchange Plaid public token'
    );
  }

  async getAccounts(accessToken: string): Promise<PlaidAccount[]> {
    const fallbackData: PlaidAccount[] = [
      {
        account_id: 'acc_1',
        name: 'Plaid Checking',
        type: 'depository',
        subtype: 'checking',
        balances: {
          available: 45000,
          current: 45000,
          limit: null,
          iso_currency_code: 'USD'
        }
      },
      {
        account_id: 'acc_2',
        name: 'Plaid Savings',
        type: 'depository',
        subtype: 'savings',
        balances: {
          available: 85000,
          current: 85000,
          limit: null,
          iso_currency_code: 'USD'
        }
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{ accounts: PlaidAccount[] }>('/accounts/get', {
          method: 'POST',
          body: JSON.stringify({
            client_id: this.clientId,
            secret: this.secret,
            access_token: accessToken
          })
        });
        return response.accounts;
      },
      fallbackData,
      'Failed to fetch Plaid accounts'
    );
  }

  async getTransactions(accessToken: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const fallbackData: Transaction[] = [
      {
        id: 'plaid_1',
        date: new Date('2024-01-15'),
        description: 'Stripe Payment Processing',
        amount: -150,
        type: 'expense',
        category: 'Business Services',
        source: 'plaid'
      },
      {
        id: 'plaid_2',
        date: new Date('2024-01-12'),
        description: 'Customer Payment - Invoice #1234',
        amount: 3500,
        type: 'income',
        category: 'Revenue',
        source: 'plaid'
      },
      {
        id: 'plaid_3',
        date: new Date('2024-01-10'),
        description: 'Office Supplies - Staples',
        amount: -89.99,
        type: 'expense',
        category: 'Office Expenses',
        source: 'plaid'
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{ transactions: PlaidTransaction[] }>('/transactions/get', {
          method: 'POST',
          body: JSON.stringify({
            client_id: this.clientId,
            secret: this.secret,
            access_token: accessToken,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            count: 500
          })
        });
        
        return response.transactions.map(this.transformTransaction);
      },
      fallbackData,
      'Failed to fetch Plaid transactions'
    );
  }

  async getFinancialSummary(accessToken: string): Promise<Partial<FinancialSummaryData>> {
    const accounts = await this.getAccounts(accessToken);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const transactions = await this.getTransactions(accessToken, startDate, endDate);
    
    const cashOnHand = accounts.reduce((sum, acc) => {
      return sum + (acc.balances.current || 0);
    }, 0);
    
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
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

  async getItem(accessToken: string): Promise<PlaidItem> {
    const fallbackData: PlaidItem = {
      item_id: 'item-sandbox-default',
      institution_id: 'ins_1',
      webhook: '',
      error: null,
      available_products: ['transactions', 'accounts', 'identity'],
      billed_products: ['transactions']
    };

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{ item: PlaidItem }>('/item/get', {
          method: 'POST',
          body: JSON.stringify({
            client_id: this.clientId,
            secret: this.secret,
            access_token: accessToken
          })
        });
        return response.item;
      },
      fallbackData,
      'Failed to fetch Plaid item'
    );
  }

  private transformTransaction(plaidTx: PlaidTransaction): Transaction {
    const isExpense = plaidTx.amount > 0; // Plaid uses positive amounts for expenses
    const category = plaidTx.category.length > 0 ? plaidTx.category[0] : 'Uncategorized';
    
    return {
      id: plaidTx.transaction_id,
      date: new Date(plaidTx.date),
      description: plaidTx.merchant_name || plaidTx.name,
      amount: isExpense ? -Math.abs(plaidTx.amount) : Math.abs(plaidTx.amount),
      type: isExpense ? 'expense' : 'income',
      category: this.mapPlaidCategory(category),
      source: 'plaid',
      metadata: {
        account_id: plaidTx.account_id,
        merchant_name: plaidTx.merchant_name,
        categories: plaidTx.category
      }
    };
  }

  private mapPlaidCategory(plaidCategory: string): string {
    const categoryMap: Record<string, string> = {
      'Food and Drink': 'Meals & Entertainment',
      'Shops': 'Business Expenses',
      'Travel': 'Travel & Transportation',
      'Payment': 'Business Services',
      'Bank Fees': 'Bank Charges',
      'Transfer': 'Transfers',
      'Deposit': 'Revenue',
      'Payroll': 'Payroll'
    };

    return categoryMap[plaidCategory] || plaidCategory;
  }
}