import { BaseServiceClient, ServiceConfig } from '../base/BaseServiceClient';
import { FinancialSummaryData, Transaction } from '../../types/api';

interface ZapierWebhook {
  id: string;
  url: string;
  event: string;
  enabled: boolean;
}

interface ZapierZap {
  id: string;
  title: string;
  status: 'on' | 'off' | 'paused';
  type: 'trigger' | 'action';
  updated: string;
}

interface ZapierTriggerData {
  event: string;
  data: Record<string, any>;
  timestamp: string;
}

export class ZapierClient extends BaseServiceClient {
  constructor(config: ServiceConfig) {
    super('Zapier', {
      ...config,
      baseUrl: config.baseUrl || 'https://hooks.zapier.com/hooks/catch'
    });
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Hook-Secret': this.config.apiKey || '',
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.sendWebhook('test', { message: 'Connection test' });
      return true;
    } catch {
      return false;
    }
  }

  async sendWebhook(event: string, data: Record<string, any>): Promise<void> {
    const fallbackData = undefined;

    return this.fetchWithFallback(
      async () => {
        await this.makeRequest('', {
          method: 'POST',
          body: JSON.stringify({
            event,
            data,
            timestamp: new Date().toISOString()
          })
        });
      },
      fallbackData,
      'Failed to send Zapier webhook'
    );
  }

  async triggerFinancialUpdate(summary: Partial<FinancialSummaryData>): Promise<void> {
    await this.sendWebhook('financial_update', {
      cashOnHand: summary.cashOnHand,
      totalRevenue: summary.totalRevenue,
      totalExpenses: summary.totalExpenses,
      netIncome: summary.netIncome,
      lastUpdated: summary.lastUpdated
    });
  }

  async triggerTransactionCreated(transaction: Transaction): Promise<void> {
    await this.sendWebhook('transaction_created', {
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      source: transaction.source
    });
  }

  async triggerLowCashAlert(currentCash: number, threshold: number): Promise<void> {
    await this.sendWebhook('low_cash_alert', {
      currentCash,
      threshold,
      message: `Cash on hand (${currentCash}) is below threshold (${threshold})`,
      timestamp: new Date().toISOString()
    });
  }

  async triggerLargeExpenseAlert(transaction: Transaction, threshold: number): Promise<void> {
    await this.sendWebhook('large_expense_alert', {
      transaction,
      threshold,
      message: `Large expense detected: ${transaction.description} (${Math.abs(transaction.amount)})`,
      timestamp: new Date().toISOString()
    });
  }

  async getZaps(): Promise<ZapierZap[]> {
    const fallbackData: ZapierZap[] = [
      {
        id: '1',
        title: 'Financial Summary to Slack',
        status: 'on',
        type: 'trigger',
        updated: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Large Expense Alert',
        status: 'on',
        type: 'trigger',
        updated: new Date().toISOString()
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{ zaps: ZapierZap[] }>('/zaps');
        return response.zaps;
      },
      fallbackData,
      'Failed to fetch Zapier zaps'
    );
  }

  async createWebhookFromTransaction(transaction: Transaction): Promise<{ success: boolean; webhookUrl?: string }> {
    const fallbackData = { success: false };

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{ webhookUrl: string }>('/webhooks', {
          method: 'POST',
          body: JSON.stringify({
            name: `Transaction Webhook - ${transaction.category}`,
            event: 'transaction_created',
            filters: {
              category: transaction.category,
              minimumAmount: Math.abs(transaction.amount)
            }
          })
        });

        return { success: true, webhookUrl: response.webhookUrl };
      },
      fallbackData,
      'Failed to create Zapier webhook'
    );
  }
}