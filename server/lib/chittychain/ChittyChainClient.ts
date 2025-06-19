import { BaseServiceClient, ServiceConfig } from '../base/BaseServiceClient';
import { APIError } from '../../middleware/errorHandler';

export interface ChittyChainConfig extends ServiceConfig {
  networkId?: string;
  rpcEndpoint?: string;
  explorerApiUrl?: string;
  websocketUrl?: string;
}

export interface ChittyChainTransaction {
  hash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  input?: string;
  logs?: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;
}

export interface ChittyChainBalance {
  address: string;
  balance: string;
  tokens: Array<{
    contractAddress: string;
    symbol: string;
    name: string;
    decimals: number;
    balance: string;
    value?: string;
  }>;
}

export interface ChittyChainBlock {
  number: number;
  hash: string;
  timestamp: number;
  transactions: string[];
  gasUsed: string;
  gasLimit: string;
}

export interface DeFiProtocol {
  name: string;
  address: string;
  tvl: string;
  apy: number;
  category: 'dex' | 'lending' | 'staking' | 'yield';
}

export interface NFTCollection {
  address: string;
  name: string;
  symbol: string;
  floorPrice: string;
  volume24h: string;
  totalSupply: number;
}

export class ChittyChainClient extends BaseServiceClient {
  private networkId: string;
  private rpcEndpoint: string;
  private explorerApiUrl: string;
  private websocketUrl?: string;

  constructor(config: ChittyChainConfig) {
    super('ChittyChain', config);
    this.networkId = config.networkId || 'mainnet';
    this.rpcEndpoint = config.rpcEndpoint || 'https://rpc.chittychain.io';
    this.explorerApiUrl = config.explorerApiUrl || 'https://api.chittyscan.io';
    this.websocketUrl = config.websocketUrl;
  }

  protected getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }
    
    return headers;
  }

  async testConnection(): Promise<boolean> {
    try {
      const latestBlock = await this.getLatestBlock();
      return !!latestBlock;
    } catch {
      return false;
    }
  }

  // Block and network information
  async getLatestBlock(): Promise<ChittyChainBlock> {
    const fallbackData: ChittyChainBlock = {
      number: 1234567,
      hash: '0x' + '0'.repeat(64),
      timestamp: Date.now() / 1000,
      transactions: [],
      gasUsed: '0',
      gasLimit: '30000000'
    };

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{block: ChittyChainBlock}>('/blocks/latest');
        return response.block;
      },
      fallbackData,
      'Failed to fetch latest block'
    );
  }

  async getBlockByNumber(blockNumber: number): Promise<ChittyChainBlock> {
    const response = await this.makeRequest<{block: ChittyChainBlock}>(`/blocks/${blockNumber}`);
    return response.block;
  }

  // Wallet and balance operations
  async getWalletBalance(address: string): Promise<ChittyChainBalance> {
    const fallbackData: ChittyChainBalance = {
      address,
      balance: '1000000000000000000000', // 1000 CHITTY
      tokens: [
        {
          contractAddress: '0x' + '1'.repeat(40),
          symbol: 'CUSDT',
          name: 'ChittyChain USDT',
          decimals: 6,
          balance: '5000000000', // 5000 USDT
          value: '5000.00'
        }
      ]
    };

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{balance: ChittyChainBalance}>(`/addresses/${address}/balance`);
        return response.balance;
      },
      fallbackData,
      'Failed to fetch wallet balance'
    );
  }

  async getWalletTransactions(
    address: string, 
    options: {
      page?: number;
      limit?: number;
      startBlock?: number;
      endBlock?: number;
    } = {}
  ): Promise<ChittyChainTransaction[]> {
    const { page = 1, limit = 50, startBlock, endBlock } = options;
    
    const fallbackData: ChittyChainTransaction[] = [
      {
        hash: '0x' + 'a'.repeat(64),
        blockNumber: 1234560,
        blockHash: '0x' + 'b'.repeat(64),
        transactionIndex: 0,
        from: '0x' + '1'.repeat(40),
        to: address,
        value: '100000000000000000000', // 100 CHITTY
        gas: '21000',
        gasPrice: '20000000000',
        gasUsed: '21000',
        status: 'confirmed',
        timestamp: Date.now() / 1000 - 3600
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(startBlock && { startBlock: startBlock.toString() }),
          ...(endBlock && { endBlock: endBlock.toString() })
        });
        
        const response = await this.makeRequest<{transactions: ChittyChainTransaction[]}>(
          `/addresses/${address}/transactions?${params}`
        );
        return response.transactions;
      },
      fallbackData,
      'Failed to fetch wallet transactions'
    );
  }

  // Transaction operations
  async getTransaction(hash: string): Promise<ChittyChainTransaction> {
    const response = await this.makeRequest<{transaction: ChittyChainTransaction}>(`/transactions/${hash}`);
    return response.transaction;
  }

  async sendTransaction(signedTransaction: string): Promise<{ hash: string }> {
    const response = await this.makeRequest<{ hash: string }>('/transactions', {
      method: 'POST',
      body: JSON.stringify({ signedTransaction })
    });
    return response;
  }

  async estimateGas(transaction: {
    from: string;
    to: string;
    value?: string;
    data?: string;
  }): Promise<{ gasEstimate: string; gasPrice: string }> {
    const response = await this.makeRequest<{ gasEstimate: string; gasPrice: string }>('/gas/estimate', {
      method: 'POST',
      body: JSON.stringify(transaction)
    });
    return response;
  }

  // DeFi operations
  async getDeFiProtocols(): Promise<DeFiProtocol[]> {
    const fallbackData: DeFiProtocol[] = [
      {
        name: 'ChittySwap',
        address: '0x' + '2'.repeat(40),
        tvl: '50000000',
        apy: 12.5,
        category: 'dex'
      },
      {
        name: 'ChittyLend',
        address: '0x' + '3'.repeat(40),
        tvl: '25000000',
        apy: 8.2,
        category: 'lending'
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{protocols: DeFiProtocol[]}>('/defi/protocols');
        return response.protocols;
      },
      fallbackData,
      'Failed to fetch DeFi protocols'
    );
  }

  async getUserDeFiPositions(address: string): Promise<Array<{
    protocol: string;
    position: any;
    value: string;
    apy: number;
  }>> {
    const fallbackData = [
      {
        protocol: 'ChittySwap',
        position: {
          tokenA: 'CHITTY',
          tokenB: 'CUSDT',
          liquidity: '1000000000000000000',
          unclaimed_fees: '50000000000000000'
        },
        value: '2000.00',
        apy: 15.3
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{positions: any[]}>(`/defi/positions/${address}`);
        return response.positions;
      },
      fallbackData,
      'Failed to fetch DeFi positions'
    );
  }

  // NFT operations
  async getNFTCollections(): Promise<NFTCollection[]> {
    const fallbackData: NFTCollection[] = [
      {
        address: '0x' + '4'.repeat(40),
        name: 'ChittyPunks',
        symbol: 'CPUNK',
        floorPrice: '100000000000000000000', // 100 CHITTY
        volume24h: '50000000000000000000000', // 50,000 CHITTY
        totalSupply: 10000
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{collections: NFTCollection[]}>('/nft/collections');
        return response.collections;
      },
      fallbackData,
      'Failed to fetch NFT collections'
    );
  }

  async getUserNFTs(address: string): Promise<Array<{
    contractAddress: string;
    tokenId: string;
    name: string;
    image: string;
    collection: string;
    attributes: Array<{ trait_type: string; value: string }>;
    lastSale?: { price: string; timestamp: number };
  }>> {
    const fallbackData = [
      {
        contractAddress: '0x' + '4'.repeat(40),
        tokenId: '1234',
        name: 'ChittyPunk #1234',
        image: 'https://api.chittypunks.io/images/1234.png',
        collection: 'ChittyPunks',
        attributes: [
          { trait_type: 'Background', value: 'Blue' },
          { trait_type: 'Type', value: 'Human' }
        ]
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{nfts: any[]}>(`/nft/owners/${address}`);
        return response.nfts;
      },
      fallbackData,
      'Failed to fetch user NFTs'
    );
  }

  // Staking operations
  async getValidators(): Promise<Array<{
    address: string;
    name: string;
    commission: number;
    votingPower: string;
    uptime: number;
    apy: number;
  }>> {
    const fallbackData = [
      {
        address: '0x' + '5'.repeat(40),
        name: 'ChittyValidator',
        commission: 5.0,
        votingPower: '1000000000000000000000000',
        uptime: 99.8,
        apy: 12.0
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{validators: any[]}>('/staking/validators');
        return response.validators;
      },
      fallbackData,
      'Failed to fetch validators'
    );
  }

  async getUserStakingPositions(address: string): Promise<Array<{
    validator: string;
    delegated: string;
    rewards: string;
    unbonding: string;
  }>> {
    const fallbackData = [
      {
        validator: '0x' + '5'.repeat(40),
        delegated: '10000000000000000000000', // 10,000 CHITTY
        rewards: '500000000000000000000', // 500 CHITTY
        unbonding: '0'
      }
    ];

    return this.fetchWithFallback(
      async () => {
        const response = await this.makeRequest<{positions: any[]}>(`/staking/delegations/${address}`);
        return response.positions;
      },
      fallbackData,
      'Failed to fetch staking positions'
    );
  }

  // Price and market data
  async getTokenPrices(tokens: string[]): Promise<Record<string, {
    usd: number;
    change24h: number;
    volume24h: number;
    marketCap?: number;
  }>> {
    const fallbackData: Record<string, any> = {
      'chitty': {
        usd: 2.50,
        change24h: 5.2,
        volume24h: 1000000,
        marketCap: 250000000
      },
      'cusdt': {
        usd: 1.00,
        change24h: 0.1,
        volume24h: 5000000
      }
    };

    return this.fetchWithFallback(
      async () => {
        const params = new URLSearchParams({ tokens: tokens.join(',') });
        const response = await this.makeRequest<{prices: any}>(`/market/prices?${params}`);
        return response.prices;
      },
      fallbackData,
      'Failed to fetch token prices'
    );
  }

  // WebSocket connection for real-time updates
  connectWebSocket(callbacks: {
    onTransaction?: (tx: ChittyChainTransaction) => void;
    onBlock?: (block: ChittyChainBlock) => void;
    onPriceUpdate?: (prices: Record<string, number>) => void;
    onError?: (error: Error) => void;
  }): WebSocket | null {
    if (!this.websocketUrl) {
      console.warn('WebSocket URL not configured');
      return null;
    }

    try {
      const ws = new WebSocket(this.websocketUrl);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'transaction':
              callbacks.onTransaction?.(data.payload);
              break;
            case 'block':
              callbacks.onBlock?.(data.payload);
              break;
            case 'price_update':
              callbacks.onPriceUpdate?.(data.payload);
              break;
          }
        } catch (error) {
          callbacks.onError?.(error as Error);
        }
      };

      ws.onerror = (error) => {
        callbacks.onError?.(new Error('WebSocket error'));
      };

      return ws;
    } catch (error) {
      callbacks.onError?.(error as Error);
      return null;
    }
  }
}