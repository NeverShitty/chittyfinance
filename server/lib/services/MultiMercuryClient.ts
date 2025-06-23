import { MercuryClient } from './MercuryClient';
import { BaseServiceClient, ServiceConfig } from '../base/BaseServiceClient';
import { FinancialSummaryData, Transaction } from '../../types/api';

interface MercuryAccountConfig {
  name: string;
  apiKey: string;
  accountType: 'mgmt' | 'aribia' | 'arlene' | 'studio' | 'chitty';
}

export class MultiMercuryClient extends BaseServiceClient {
  private clients: Map<string, MercuryClient> = new Map();
  private accountConfigs: MercuryAccountConfig[] = [];

  constructor(config: ServiceConfig) {
    super('Multi-Mercury', config);
    this.initializeAccounts();
  }

  private initializeAccounts(): void {
    // Initialize all Mercury accounts from environment variables
    const accountTypes: Array<MercuryAccountConfig['accountType']> = [
      'mgmt', 'aribia', 'arlene', 'studio', 'chitty'
    ];

    for (const accountType of accountTypes) {
      const envVar = `MERCURY_${accountType.toUpperCase()}_API_KEY`;
      const apiKey = process.env[envVar];
      
      if (apiKey) {
        const accountConfig: MercuryAccountConfig = {
          name: accountType,
          apiKey,
          accountType
        };

        this.accountConfigs.push(accountConfig);

        // Create individual Mercury client for this account
        const client = new MercuryClient({
          apiKey,
          baseUrl: 'https://api.mercury.com/api/v1'
        });

        this.clients.set(accountType, client);
        
        console.log(`✅ Mercury ${accountType} account configured`);
      } else {
        console.log(`⚠️  Mercury ${accountType} account not configured (missing ${envVar})`);
      }
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    // This is not used for multi-client setup
    return {};
  }

  async testConnection(): Promise<boolean> {
    if (this.clients.size === 0) {
      console.log('❌ No Mercury accounts configured');
      return false;
    }

    let allSuccessful = true;
    for (const [accountName, client] of this.clients.entries()) {
      try {
        const isConnected = await client.testConnection();
        if (isConnected) {
          console.log(`✅ Mercury ${accountName} account connection successful`);
        } else {
          console.log(`❌ Mercury ${accountName} account connection failed`);
          allSuccessful = false;
        }
      } catch (error) {
        console.log(`❌ Mercury ${accountName} account error:`, error);
        allSuccessful = false;
      }
    }

    return allSuccessful;
  }

  async getAllAccounts(): Promise<Array<{ accountType: string; accounts: any[] }>> {
    const allAccounts = [];

    for (const [accountType, client] of this.clients.entries()) {
      try {
        const accounts = await client.getAccounts();
        allAccounts.push({
          accountType,
          accounts: accounts.map(acc => ({
            ...acc,
            source: `mercury_${accountType}`
          }))
        });
      } catch (error) {
        console.error(`Error fetching accounts for ${accountType}:`, error);
        allAccounts.push({
          accountType,
          accounts: []
        });
      }
    }

    return allAccounts;
  }

  async getAllTransactions(limit = 50): Promise<Transaction[]> {
    const allTransactions: Transaction[] = [];

    for (const [accountType, client] of this.clients.entries()) {
      try {
        const transactions = await client.getTransactions(limit);
        
        // Add account type to transaction source
        const enhancedTransactions = transactions.map(tx => ({
          ...tx,
          id: `${accountType}_${tx.id}`,
          source: `mercury_${accountType}`,
          accountType
        }));

        allTransactions.push(...enhancedTransactions);
      } catch (error) {
        console.error(`Error fetching transactions for ${accountType}:`, error);
      }
    }

    // Sort by date (newest first)
    allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    return allTransactions;
  }

  async getAggregatedFinancialSummary(): Promise<Partial<FinancialSummaryData>> {
    let totalCashOnHand = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalNetIncome = 0;

    const summaryByAccount: Record<string, Partial<FinancialSummaryData>> = {};

    for (const [accountType, client] of this.clients.entries()) {
      try {
        const summary = await client.getFinancialSummary();
        summaryByAccount[accountType] = summary;

        totalCashOnHand += summary.cashOnHand || 0;
        totalRevenue += summary.totalRevenue || 0;
        totalExpenses += summary.totalExpenses || 0;
        totalNetIncome += summary.netIncome || 0;
      } catch (error) {
        console.error(`Error fetching financial summary for ${accountType}:`, error);
      }
    }

    return {
      cashOnHand: totalCashOnHand,
      totalRevenue,
      totalExpenses,
      netIncome: totalNetIncome,
      lastUpdated: new Date(),
      // Add breakdown by account
      accountBreakdown: summaryByAccount
    };
  }

  async getAccountSummary(accountType: string): Promise<Partial<FinancialSummaryData> | null> {
    const client = this.clients.get(accountType);
    if (!client) {
      console.error(`Mercury account ${accountType} not configured`);
      return null;
    }

    try {
      return await client.getFinancialSummary();
    } catch (error) {
      console.error(`Error fetching summary for ${accountType}:`, error);
      return null;
    }
  }

  getConfiguredAccounts(): string[] {
    return Array.from(this.clients.keys());
  }

  getAccountConfig(accountType: string): MercuryAccountConfig | undefined {
    return this.accountConfigs.find(config => config.accountType === accountType);
  }

  // Static IP configuration for all Mercury requests
  static getStaticIPs(): string[] {
    const staticIPs = process.env.MERCURY_STATIC_IPS;
    if (staticIPs) {
      return staticIPs.split(' ').filter(ip => ip.length > 0);
    }
    
    // Default static IPs if not configured
    return [
      '104.16.0.1', '104.17.0.1', '172.64.0.1', 
      '108.162.192.1', '141.101.64.1'
    ];
  }
}