import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { ChittyChainService } from '../lib/chittychain/ChittyChainService';
import { APIResponse } from '../types/api';

const router = Router();

// Apply authentication to all routes
router.use(authenticateUser);

// Initialize ChittyChain service
const chittyChainService = new ChittyChainService({
  apiKey: process.env.CHITTYCHAIN_API_KEY,
  rpcEndpoint: process.env.CHITTYCHAIN_RPC_ENDPOINT || 'https://rpc.chittychain.io',
  explorerApiUrl: process.env.CHITTYCHAIN_EXPLORER_API || 'https://api.chittyscan.io',
  websocketUrl: process.env.CHITTYCHAIN_WS_ENDPOINT || 'wss://ws.chittychain.io'
});

// Get dashboard metrics combining traditional and blockchain data
router.get('/dashboard/metrics', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  // Mock user wallet addresses - in reality would be fetched from user settings
  const userWallets = [
    '0x1234567890123456789012345678901234567890',
    '0x0987654321098765432109876543210987654321'
  ];

  const metrics = await chittyChainService.getDashboardMetrics(userWallets);
  
  const response: APIResponse = {
    success: true,
    data: metrics
  };
  
  res.json(response);
}));

// Get portfolio summary
router.get('/portfolio/summary', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const userWallets = [
    '0x1234567890123456789012345678901234567890',
    '0x0987654321098765432109876543210987654321'
  ];

  const portfolio = await chittyChainService.getUserPortfolioSummary(userWallets);
  
  const response: APIResponse = {
    success: true,
    data: portfolio
  };
  
  res.json(response);
}));

// Get portfolio performance over time
const performanceSchema = z.object({
  days: z.number().optional().default(30),
  wallets: z.array(z.string()).optional()
});

router.get('/portfolio/performance', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const query = performanceSchema.parse(req.query);
  
  const userWallets = query.wallets || [
    '0x1234567890123456789012345678901234567890',
    '0x0987654321098765432109876543210987654321'
  ];

  const performance = await chittyChainService.getPortfolioPerformance(userWallets, query.days);
  
  const response: APIResponse = {
    success: true,
    data: {
      performance,
      period: `${query.days} days`,
      walletCount: userWallets.length
    }
  };
  
  res.json(response);
}));

// Get recent blockchain transactions
const transactionsSchema = z.object({
  limit: z.number().optional().default(50),
  wallets: z.array(z.string()).optional()
});

router.get('/transactions', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const query = transactionsSchema.parse(req.query);
  
  const userWallets = query.wallets || [
    '0x1234567890123456789012345678901234567890',
    '0x0987654321098765432109876543210987654321'
  ];

  const transactions = await chittyChainService.getRecentTransactions(userWallets, query.limit);
  
  // Process transactions for financial data integration
  const processedTransactions = await Promise.all(
    transactions.map(tx => chittyChainService.processTransactionForFinancialData(tx, userWallets))
  );
  
  const response: APIResponse = {
    success: true,
    data: {
      transactions: processedTransactions,
      count: processedTransactions.length,
      walletCount: userWallets.length
    }
  };
  
  res.json(response);
}));

// Generate AI-powered financial insights
router.get('/insights', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const userWallets = [
    '0x1234567890123456789012345678901234567890',
    '0x0987654321098765432109876543210987654321'
  ];

  const insights = await chittyChainService.generateFinancialInsights(userWallets);
  
  const response: APIResponse = {
    success: true,
    data: {
      insights,
      generatedAt: new Date().toISOString(),
      walletCount: userWallets.length
    }
  };
  
  res.json(response);
}));

// Wallet management endpoints
const walletSchema = z.object({
  address: z.string(),
  name: z.string(),
  type: z.enum(['personal', 'business', 'savings', 'investment']).optional().default('personal')
});

router.post('/wallets', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  const walletData = walletSchema.parse(req.body);
  
  // In reality, would save to database
  const wallet = {
    id: Date.now().toString(),
    userId: req.user.id,
    ...walletData,
    balance: '0',
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  const response: APIResponse = {
    success: true,
    data: wallet
  };
  
  res.status(201).json(response);
}));

router.get('/wallets', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  // Mock wallet data
  const wallets = [
    {
      id: '1',
      userId: req.user.id,
      address: '0x1234567890123456789012345678901234567890',
      name: 'Main Wallet',
      type: 'personal',
      balance: '1250.5432',
      currency: 'CHITTY',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      userId: req.user.id,
      address: '0x0987654321098765432109876543210987654321',
      name: 'Business Wallet',
      type: 'business',
      balance: '2847.1023',
      currency: 'CHITTY',
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z'
    }
  ];
  
  const response: APIResponse = {
    success: true,
    data: wallets
  };
  
  res.json(response);
}));

// DeFi positions and yield farming
router.get('/defi/positions', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  // Mock DeFi positions
  const positions = [
    {
      id: '1',
      protocol: 'ChittySwap',
      type: 'liquidity',
      tokenA: 'CHITTY',
      tokenB: 'CUSDT',
      amountA: '1000',
      amountB: '2500',
      currentValue: 5000,
      initialValue: 4800,
      pnl: 200,
      apy: 15.3,
      unclaimedRewards: '125.5',
      rewardToken: 'CHITTY',
      isActive: true,
      startDate: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      protocol: 'ChittyLend',
      type: 'lending',
      token: 'CHITTY',
      amount: '5000',
      currentValue: 5200,
      initialValue: 5000,
      pnl: 200,
      apy: 8.2,
      unclaimedRewards: '42.3',
      rewardToken: 'CHITTY',
      isActive: true,
      startDate: '2024-01-10T00:00:00Z'
    }
  ];
  
  const response: APIResponse = {
    success: true,
    data: {
      positions,
      totalValue: positions.reduce((sum, pos) => sum + pos.currentValue, 0),
      totalPnL: positions.reduce((sum, pos) => sum + pos.pnl, 0),
      averageAPY: positions.reduce((sum, pos) => sum + pos.apy, 0) / positions.length
    }
  };
  
  res.json(response);
}));

// NFT holdings
router.get('/nfts', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  // Mock NFT holdings
  const nfts = [
    {
      id: '1',
      tokenId: '1234',
      contractAddress: '0x4444444444444444444444444444444444444444',
      name: 'ChittyPunk #1234',
      description: 'A unique ChittyPunk NFT',
      imageUrl: 'https://api.chittypunks.io/images/1234.png',
      collectionName: 'ChittyPunks',
      collectionSlug: 'chittypunks',
      attributes: [
        { trait_type: 'Background', value: 'Blue' },
        { trait_type: 'Type', value: 'Human' },
        { trait_type: 'Accessory', value: 'Sunglasses' }
      ],
      purchasePrice: '100',
      currentFloorPrice: '120',
      lastSalePrice: '115',
      isListed: false,
      acquiredAt: '2024-01-05T00:00:00Z'
    }
  ];
  
  const response: APIResponse = {
    success: true,
    data: {
      nfts,
      totalValue: nfts.reduce((sum, nft) => sum + parseFloat(nft.currentFloorPrice), 0),
      collectionCount: new Set(nfts.map(nft => nft.collectionSlug)).size
    }
  };
  
  res.json(response);
}));

// Staking positions
router.get('/staking/positions', asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new APIError(401, 'User not authenticated', 'UNAUTHORIZED');
  }

  // Mock staking positions
  const positions = [
    {
      id: '1',
      validatorAddress: '0x5555555555555555555555555555555555555555',
      validatorName: 'ChittyValidator',
      delegatedAmount: '10000',
      pendingRewards: '250.5',
      totalRewardsClaimed: '1200.3',
      commissionRate: 5.0,
      lockPeriod: 86400, // 1 day in seconds
      status: 'active',
      autoRestake: true,
      stakingStartedAt: '2024-01-01T00:00:00Z'
    }
  ];
  
  const response: APIResponse = {
    success: true,
    data: {
      positions,
      totalStaked: positions.reduce((sum, pos) => sum + parseFloat(pos.delegatedAmount), 0),
      totalRewards: positions.reduce((sum, pos) => sum + parseFloat(pos.pendingRewards), 0),
      averageAPY: 12.0 // Mock APY
    }
  };
  
  res.json(response);
}));

// ChittyChain network status
router.get('/network/status', asyncHandler(async (req: AuthenticatedRequest, res) => {
  // Mock network status
  const networkStatus = {
    chainId: 'chittychain-1',
    blockHeight: 1234567,
    blockTime: 6.5, // seconds
    totalValidators: 150,
    activeValidators: 145,
    totalStaked: '50000000',
    stakingRatio: 0.68,
    inflation: 0.07,
    communityPool: '2500000',
    bondedTokens: '34000000',
    notBondedTokens: '16000000',
    lastBlockTime: new Date().toISOString()
  };
  
  const response: APIResponse = {
    success: true,
    data: networkStatus
  };
  
  res.json(response);
}));

// Connection health check
router.get('/health', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const isHealthy = await chittyChainService.testConnection();
  
  const response: APIResponse = {
    success: true,
    data: {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      network: 'ChittyChain Mainnet'
    }
  };
  
  res.json(response);
}));

export default router;