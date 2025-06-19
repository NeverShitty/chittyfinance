import { ChittyChainClient, ChittyChainConfig } from './ChittyChainClient';
import { APIError } from '../../middleware/errorHandler';

export interface PortfolioSummary {
  totalValueUSD: number;
  totalValueCHITTY: string;
  dayChange: number;
  dayChangePercent: number;
  
  breakdown: {
    wallets: number;
    defi: number;
    nfts: number;
    staking: number;
  };
  
  topHoldings: Array<{
    symbol: string;
    name: string;
    balance: string;
    valueUSD: number;
    percentage: number;
  }>;
}

export interface DashboardMetrics {
  portfolio: PortfolioSummary;
  recentTransactions: Array<{
    hash: string;
    type: 'send' | 'receive' | 'swap' | 'stake';
    amount: string;
    token: string;
    valueUSD: number;
    timestamp: number;
    status: string;
  }>;
  
  defiEarnings: {
    totalEarned: number;
    dailyEarnings: number;
    topPositions: Array<{
      protocol: string;
      position: string;
      apy: number;
      valueUSD: number;
    }>;
  };
  
  stakingRewards: {
    totalStaked: string;
    totalRewards: string;
    pendingRewards: string;
    averageAPY: number;
  };
  
  alerts: Array<{
    type: 'price' | 'transaction' | 'defi' | 'staking';
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: number;
  }>;
}

export class ChittyChainService {
  private client: ChittyChainClient;
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private readonly PRICE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: ChittyChainConfig) {
    this.client = new ChittyChainClient(config);
  }

  async testConnection(): Promise<boolean> {
    return this.client.testConnection();
  }

  // Portfolio and financial overview
  async getUserPortfolioSummary(walletAddresses: string[]): Promise<PortfolioSummary> {
    try {
      const [balances, prices] = await Promise.all([
        Promise.all(walletAddresses.map(addr => this.client.getWalletBalance(addr))),
        this.getTokenPrices(['chitty', 'cusdt'])
      ]);

      let totalValueUSD = 0;
      let totalValueCHITTY = '0';
      const topHoldings: Array<any> = [];

      // Process wallet balances
      for (const balance of balances) {
        // Main token (CHITTY)
        const chittyBalance = parseFloat(balance.balance) / 1e18;
        const chittyValueUSD = chittyBalance * prices.chitty.usd;
        totalValueUSD += chittyValueUSD;

        topHoldings.push({
          symbol: 'CHITTY',
          name: 'ChittyChain',
          balance: chittyBalance.toFixed(4),
          valueUSD: chittyValueUSD,
          percentage: 0 // Will calculate after getting total
        });

        // Token balances
        for (const token of balance.tokens) {
          const tokenBalance = parseFloat(token.balance) / Math.pow(10, token.decimals);
          const tokenPrice = prices[token.symbol.toLowerCase()]?.usd || 0;
          const tokenValueUSD = tokenBalance * tokenPrice;
          totalValueUSD += tokenValueUSD;

          topHoldings.push({
            symbol: token.symbol,
            name: token.name,
            balance: tokenBalance.toFixed(4),
            valueUSD: tokenValueUSD,
            percentage: 0
          });
        }
      }

      // Calculate percentages
      topHoldings.forEach(holding => {
        holding.percentage = (holding.valueUSD / totalValueUSD) * 100;
      });

      // Sort by value and take top 5
      topHoldings.sort((a, b) => b.valueUSD - a.valueUSD);
      const topHoldingsFiltered = topHoldings.slice(0, 5);

      // Get DeFi and staking values
      const [defiPositions, stakingPositions] = await Promise.all([
        Promise.all(walletAddresses.map(addr => this.client.getUserDeFiPositions(addr))),
        Promise.all(walletAddresses.map(addr => this.client.getUserStakingPositions(addr)))
      ]);

      const defiValue = defiPositions.flat().reduce((sum, pos) => sum + parseFloat(pos.value), 0);
      const stakingValue = stakingPositions.flat().reduce((sum, pos) => {
        return sum + (parseFloat(pos.delegated) / 1e18 * prices.chitty.usd);
      }, 0);

      // Mock NFT value for now
      const nftValue = 5000; // Would be calculated from actual NFT holdings

      const totalWithDeFi = totalValueUSD + defiValue + stakingValue + nftValue;

      return {
        totalValueUSD: totalWithDeFi,
        totalValueCHITTY: (totalWithDeFi / prices.chitty.usd).toFixed(4),
        dayChange: totalWithDeFi * 0.025, // Mock 2.5% daily change
        dayChangePercent: 2.5,
        
        breakdown: {
          wallets: totalValueUSD,
          defi: defiValue,
          nfts: nftValue,
          staking: stakingValue
        },
        
        topHoldings: topHoldingsFiltered
      };
    } catch (error) {
      console.error('Error getting portfolio summary:', error);
      throw new APIError(500, 'Failed to get portfolio summary', 'PORTFOLIO_ERROR');
    }
  }

  async getDashboardMetrics(walletAddresses: string[]): Promise<DashboardMetrics> {
    try {
      const [portfolio, transactions, defiPositions, stakingPositions] = await Promise.all([
        this.getUserPortfolioSummary(walletAddresses),
        this.getRecentTransactions(walletAddresses, 10),
        Promise.all(walletAddresses.map(addr => this.client.getUserDeFiPositions(addr))),
        Promise.all(walletAddresses.map(addr => this.client.getUserStakingPositions(addr)))
      ]);

      const prices = await this.getTokenPrices(['chitty']);

      // Process recent transactions
      const recentTransactions = transactions.slice(0, 5).map(tx => ({
        hash: tx.hash,
        type: this.determineTransactionType(tx, walletAddresses),
        amount: (parseFloat(tx.value) / 1e18).toFixed(4),
        token: 'CHITTY',
        valueUSD: (parseFloat(tx.value) / 1e18) * prices.chitty.usd,
        timestamp: tx.timestamp,
        status: tx.status
      }));

      // Process DeFi earnings
      const flatDefiPositions = defiPositions.flat();
      const defiEarnings = {
        totalEarned: flatDefiPositions.reduce((sum, pos) => sum + parseFloat(pos.value), 0),
        dailyEarnings: flatDefiPositions.reduce((sum, pos) => sum + (parseFloat(pos.value) * pos.apy / 365 / 100), 0),
        topPositions: flatDefiPositions.slice(0, 3).map(pos => ({
          protocol: pos.protocol,
          position: `${pos.position.tokenA}/${pos.position.tokenB || 'Pool'}`,
          apy: pos.apy,
          valueUSD: parseFloat(pos.value)
        }))
      };

      // Process staking rewards
      const flatStakingPositions = stakingPositions.flat();
      const totalStaked = flatStakingPositions.reduce((sum, pos) => sum + parseFloat(pos.delegated), 0);
      const totalRewards = flatStakingPositions.reduce((sum, pos) => sum + parseFloat(pos.rewards), 0);

      const stakingRewards = {
        totalStaked: (totalStaked / 1e18).toFixed(4),
        totalRewards: (totalRewards / 1e18).toFixed(4),
        pendingRewards: (totalRewards / 1e18).toFixed(4), // Assuming all rewards are pending
        averageAPY: 12.0 // Mock value
      };

      // Generate mock alerts
      const alerts = [
        {
          type: 'price' as const,
          message: 'CHITTY price increased by 5.2% in the last 24h',
          severity: 'info' as const,
          timestamp: Date.now() - 3600000
        },
        {
          type: 'defi' as const,
          message: 'Your ChittySwap LP position earned 15.3 CHITTY in rewards',
          severity: 'info' as const,
          timestamp: Date.now() - 7200000
        }
      ];

      return {
        portfolio,
        recentTransactions,
        defiEarnings,
        stakingRewards,
        alerts
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw new APIError(500, 'Failed to get dashboard metrics', 'DASHBOARD_ERROR');
    }
  }

  // Transaction processing
  async getRecentTransactions(walletAddresses: string[], limit: number = 50) {
    const allTransactions = await Promise.all(
      walletAddresses.map(addr => this.client.getWalletTransactions(addr, { limit }))
    );

    // Flatten and sort by timestamp
    return allTransactions
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async processTransactionForFinancialData(tx: any, userWallets: string[]) {
    const prices = await this.getTokenPrices(['chitty']);
    const isIncoming = userWallets.includes(tx.to.toLowerCase());
    const amount = parseFloat(tx.value) / 1e18;
    const valueUSD = amount * prices.chitty.usd;

    return {
      id: tx.hash,
      date: new Date(tx.timestamp * 1000),
      description: this.generateTransactionDescription(tx, isIncoming),
      amount: isIncoming ? valueUSD : -valueUSD,
      type: isIncoming ? 'income' : 'expense',
      category: this.categorizeTransaction(tx),
      source: 'chittychain',
      metadata: {
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        from: tx.from,
        to: tx.to,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        chittyAmount: amount.toFixed(8)
      }
    };
  }

  // Price management
  private async getTokenPrices(tokens: string[]): Promise<Record<string, { usd: number; change24h: number }>> {
    const now = Date.now();
    const cachedPrices: Record<string, any> = {};
    const tokensToFetch: string[] = [];

    // Check cache
    for (const token of tokens) {
      const cached = this.priceCache.get(token);
      if (cached && (now - cached.timestamp) < this.PRICE_CACHE_DURATION) {
        cachedPrices[token] = { usd: cached.price, change24h: 0 };
      } else {
        tokensToFetch.push(token);
      }
    }

    // Fetch missing prices
    if (tokensToFetch.length > 0) {
      const prices = await this.client.getTokenPrices(tokensToFetch);
      
      for (const [token, data] of Object.entries(prices)) {
        this.priceCache.set(token, { price: data.usd, timestamp: now });
        cachedPrices[token] = data;
      }
    }

    return cachedPrices;
  }

  // Utility methods
  private determineTransactionType(tx: any, userWallets: string[]): 'send' | 'receive' | 'swap' | 'stake' {
    const isIncoming = userWallets.includes(tx.to.toLowerCase());
    const isOutgoing = userWallets.includes(tx.from.toLowerCase());

    if (tx.input && tx.input !== '0x') {
      // Contract interaction
      if (tx.to && this.isDeFiContract(tx.to)) {
        return 'swap';
      }
      if (tx.to && this.isStakingContract(tx.to)) {
        return 'stake';
      }
    }

    return isIncoming ? 'receive' : 'send';
  }

  private isDeFiContract(address: string): boolean {
    // Mock check for DeFi contracts
    const defiContracts = ['0x' + '2'.repeat(40), '0x' + '3'.repeat(40)];
    return defiContracts.includes(address.toLowerCase());
  }

  private isStakingContract(address: string): boolean {
    // Mock check for staking contracts
    const stakingContracts = ['0x' + '5'.repeat(40)];
    return stakingContracts.includes(address.toLowerCase());
  }

  private generateTransactionDescription(tx: any, isIncoming: boolean): string {
    if (tx.input && tx.input !== '0x') {
      if (this.isDeFiContract(tx.to)) {
        return 'DeFi Protocol Interaction';
      }
      if (this.isStakingContract(tx.to)) {
        return 'Staking Operation';
      }
      return 'Smart Contract Interaction';
    }

    return isIncoming ? 'Received CHITTY' : 'Sent CHITTY';
  }

  private categorizeTransaction(tx: any): string {
    if (tx.input && tx.input !== '0x') {
      if (this.isDeFiContract(tx.to)) {
        return 'DeFi';
      }
      if (this.isStakingContract(tx.to)) {
        return 'Staking';
      }
      return 'Smart Contract';
    }

    return 'Transfer';
  }

  // Advanced features
  async generateFinancialInsights(walletAddresses: string[]) {
    const [portfolio, transactions] = await Promise.all([
      this.getUserPortfolioSummary(walletAddresses),
      this.getRecentTransactions(walletAddresses, 100)
    ]);

    const insights = [];

    // Portfolio diversification insight
    if (portfolio.breakdown.wallets / portfolio.totalValueUSD > 0.8) {
      insights.push({
        type: 'diversification',
        title: 'Consider DeFi Opportunities',
        description: 'Over 80% of your portfolio is in wallet balances. Consider exploring DeFi protocols for potential yield.',
        impact: 'medium',
        actionable: true,
        actions: [
          {
            type: 'explore_defi',
            label: 'Explore DeFi Protocols',
            description: 'View available DeFi opportunities on ChittyChain'
          }
        ]
      });
    }

    // Transaction pattern analysis
    const recentSpending = transactions
      .filter(tx => tx.timestamp > Date.now() / 1000 - 30 * 24 * 3600) // Last 30 days
      .filter(tx => !walletAddresses.includes(tx.to.toLowerCase()))
      .reduce((sum, tx) => sum + parseFloat(tx.value) / 1e18, 0);

    if (recentSpending > portfolio.totalValueUSD * 0.1) {
      insights.push({
        type: 'spending_pattern',
        title: 'High Spending Activity',
        description: `You've spent ${recentSpending.toFixed(2)} CHITTY in the last 30 days, which is ${((recentSpending / (portfolio.totalValueUSD / 2.5)) * 100).toFixed(1)}% of your portfolio.`,
        impact: 'high',
        actionable: true,
        actions: [
          {
            type: 'set_budget',
            label: 'Set Monthly Budget',
            description: 'Create a spending budget to better manage your expenses'
          }
        ]
      });
    }

    return insights;
  }

  async getPortfolioPerformance(walletAddresses: string[], days: number = 30) {
    // Mock implementation - in reality would use historical data
    const performance: Array<{ date: string; value: number; change: number }> = [];
    const baseValue = 10000;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate mock performance data with some volatility
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily volatility
      const value = baseValue * (1 + randomChange * i / days);
      
      performance.push({
        date: date.toISOString().split('T')[0],
        value: value,
        change: i === days ? 0 : value - performance[performance.length - 1]?.value || 0
      });
    }

    return performance;
  }
}