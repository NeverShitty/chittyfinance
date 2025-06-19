import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, varchar, index, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ChittyChain Wallet Management
export const chittyWallets = pgTable("chitty_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  // Wallet identification
  address: text("address").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'personal', 'business', 'savings', 'investment'
  
  // Wallet metadata
  balance: decimal("balance", { precision: 18, scale: 8 }).default("0"),
  currency: text("currency").notNull().default("CHITTY"),
  
  // Security and access
  publicKey: text("public_key").notNull(),
  encryptedPrivateKey: text("encrypted_private_key"), // Encrypted with user password
  isHardwareWallet: boolean("is_hardware_wallet").default(false),
  hardwareWalletType: text("hardware_wallet_type"), // 'ledger', 'trezor', etc.
  
  // Status
  isActive: boolean("is_active").default(true),
  isWatchOnly: boolean("is_watch_only").default(false),
  
  // Integration settings
  autoSync: boolean("auto_sync").default(true),
  syncFrequency: integer("sync_frequency").default(300), // seconds
  lastSyncAt: timestamp("last_sync_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ChittyChain Transactions
export const chittyTransactions = pgTable("chitty_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull().references(() => chittyWallets.id),
  
  // Blockchain transaction data
  txHash: text("tx_hash").notNull().unique(),
  blockNumber: integer("block_number"),
  blockHash: text("block_hash"),
  transactionIndex: integer("transaction_index"),
  
  // Transaction details
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  fee: decimal("fee", { precision: 18, scale: 8 }).default("0"),
  gasUsed: integer("gas_used"),
  gasPrice: decimal("gas_price", { precision: 18, scale: 8 }),
  
  // Transaction metadata
  type: text("type").notNull(), // 'send', 'receive', 'swap', 'stake', 'contract_call'
  status: text("status").notNull(), // 'pending', 'confirmed', 'failed'
  confirmations: integer("confirmations").default(0),
  
  // Smart contract interaction
  contractAddress: text("contract_address"),
  contractMethod: text("contract_method"),
  inputData: text("input_data"),
  
  // Business context
  category: text("category"), // 'payment', 'investment', 'trading', 'defi'
  description: text("description"),
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // Integration with traditional finance
  linkedTransactionId: integer("linked_transaction_id"), // Link to transactions_v2
  fiatValue: decimal("fiat_value", { precision: 12, scale: 2 }),
  fiatCurrency: text("fiat_currency").default("USD"),
  exchangeRate: decimal("exchange_rate", { precision: 18, scale: 8 }),
  
  // Timestamps
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_chitty_transactions_wallet").on(table.walletId),
  index("idx_chitty_transactions_hash").on(table.txHash),
  index("idx_chitty_transactions_block").on(table.blockNumber),
]);

// ChittyChain DeFi Positions
export const defiPositions = pgTable("defi_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull().references(() => chittyWallets.id),
  
  // Protocol information
  protocol: text("protocol").notNull(), // 'chittyswap', 'chittylend', 'chittystake'
  protocolAddress: text("protocol_address").notNull(),
  positionType: text("position_type").notNull(), // 'liquidity', 'lending', 'borrowing', 'staking'
  
  // Position details
  tokenA: text("token_a"), // For LP positions
  tokenB: text("token_b"),
  amountA: decimal("amount_a", { precision: 18, scale: 8 }),
  amountB: decimal("amount_b", { precision: 18, scale: 8 }),
  
  // Single token positions
  token: text("token"),
  amount: decimal("amount", { precision: 18, scale: 8 }),
  
  // Financial metrics
  currentValue: decimal("current_value", { precision: 18, scale: 8 }),
  initialValue: decimal("initial_value", { precision: 18, scale: 8 }),
  pnl: decimal("pnl", { precision: 18, scale: 8 }).default("0"),
  apy: real("apy"), // Annual percentage yield
  
  // Rewards and earnings
  unclaimedRewards: decimal("unclaimed_rewards", { precision: 18, scale: 8 }).default("0"),
  totalRewardsClaimed: decimal("total_rewards_claimed", { precision: 18, scale: 8 }).default("0"),
  rewardToken: text("reward_token"),
  
  // Status
  isActive: boolean("is_active").default(true),
  autoCompound: boolean("auto_compound").default(false),
  
  // Timestamps
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ChittyChain NFT Holdings
export const nftHoldings = pgTable("nft_holdings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull().references(() => chittyWallets.id),
  
  // NFT identification
  tokenId: text("token_id").notNull(),
  contractAddress: text("contract_address").notNull(),
  name: text("name"),
  description: text("description"),
  
  // Metadata
  imageUrl: text("image_url"),
  animationUrl: text("animation_url"),
  attributes: jsonb("attributes").$type<Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>>().default([]),
  
  // Financial data
  purchasePrice: decimal("purchase_price", { precision: 18, scale: 8 }),
  currentFloorPrice: decimal("current_floor_price", { precision: 18, scale: 8 }),
  lastSalePrice: decimal("last_sale_price", { precision: 18, scale: 8 }),
  
  // Collection info
  collectionName: text("collection_name"),
  collectionSlug: text("collection_slug"),
  
  // Status
  isListed: boolean("is_listed").default(false),
  listingPrice: decimal("listing_price", { precision: 18, scale: 8 }),
  marketplace: text("marketplace"),
  
  acquiredAt: timestamp("acquired_at").notNull(),
  lastPriceUpdateAt: timestamp("last_price_update_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.contractAddress, table.tokenId),
  index("idx_nft_collection").on(table.collectionSlug),
]);

// ChittyChain Staking Positions
export const stakingPositions = pgTable("staking_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull().references(() => chittyWallets.id),
  
  // Staking details
  validatorAddress: text("validator_address").notNull(),
  validatorName: text("validator_name"),
  delegatedAmount: decimal("delegated_amount", { precision: 18, scale: 8 }).notNull(),
  
  // Rewards
  pendingRewards: decimal("pending_rewards", { precision: 18, scale: 8 }).default("0"),
  totalRewardsClaimed: decimal("total_rewards_claimed", { precision: 18, scale: 8 }).default("0"),
  
  // Staking parameters
  lockPeriod: integer("lock_period"), // in blocks or seconds
  unbondingPeriod: integer("unbonding_period"),
  commissionRate: real("commission_rate"),
  
  // Status
  status: text("status").notNull().default("active"), // 'active', 'unbonding', 'unstaked'
  autoRestake: boolean("auto_restake").default(true),
  
  stakingStartedAt: timestamp("staking_started_at").notNull(),
  unstakingStartedAt: timestamp("unstaking_started_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ChittyChain Trading Positions
export const tradingPositions = pgTable("trading_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull().references(() => chittyWallets.id),
  
  // Position details
  type: text("type").notNull(), // 'spot', 'margin', 'futures', 'options'
  side: text("side").notNull(), // 'long', 'short'
  baseToken: text("base_token").notNull(),
  quoteToken: text("quote_token").notNull(),
  
  // Amounts and pricing
  size: decimal("size", { precision: 18, scale: 8 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 18, scale: 8 }).notNull(),
  currentPrice: decimal("current_price", { precision: 18, scale: 8 }),
  exitPrice: decimal("exit_price", { precision: 18, scale: 8 }),
  
  // Leverage and margin (for margin/futures trading)
  leverage: real("leverage").default(1),
  margin: decimal("margin", { precision: 18, scale: 8 }),
  liquidationPrice: decimal("liquidation_price", { precision: 18, scale: 8 }),
  
  // P&L tracking
  unrealizedPnl: decimal("unrealized_pnl", { precision: 18, scale: 8 }).default("0"),
  realizedPnl: decimal("realized_pnl", { precision: 18, scale: 8 }).default("0"),
  fees: decimal("fees", { precision: 18, scale: 8 }).default("0"),
  
  // Risk management
  stopLoss: decimal("stop_loss", { precision: 18, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 18, scale: 8 }),
  
  // Status
  status: text("status").notNull(), // 'open', 'closed', 'liquidated'
  exchange: text("exchange"), // 'chittyswap', 'external_exchange'
  
  openedAt: timestamp("opened_at").notNull(),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ChittyChain Portfolio Snapshots
export const portfolioSnapshots = pgTable("portfolio_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  // Portfolio value
  totalValue: decimal("total_value", { precision: 18, scale: 8 }).notNull(),
  totalValueFiat: decimal("total_value_fiat", { precision: 12, scale: 2 }),
  fiatCurrency: text("fiat_currency").default("USD"),
  
  // Asset breakdown
  walletBalances: jsonb("wallet_balances").$type<Record<string, {
    address: string;
    balance: string;
    value: string;
    valueFiat: string;
  }>>().notNull(),
  
  defiPositionsValue: decimal("defi_positions_value", { precision: 18, scale: 8 }).default("0"),
  nftPortfolioValue: decimal("nft_portfolio_value", { precision: 18, scale: 8 }).default("0"),
  stakingValue: decimal("staking_value", { precision: 18, scale: 8 }).default("0"),
  tradingPositionsValue: decimal("trading_positions_value", { precision: 18, scale: 8 }).default("0"),
  
  // Performance metrics
  dayChange: decimal("day_change", { precision: 18, scale: 8 }).default("0"),
  dayChangePercent: real("day_change_percent").default(0),
  
  // Timestamp
  snapshotDate: timestamp("snapshot_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_portfolio_snapshots_user_date").on(table.userId, table.snapshotDate),
]);

// ChittyChain Integration Settings
export const chittyChainSettings = pgTable("chittychain_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  
  // Network settings
  defaultNetwork: text("default_network").notNull().default("mainnet"), // 'mainnet', 'testnet'
  rpcEndpoint: text("rpc_endpoint"),
  customRpcEndpoints: jsonb("custom_rpc_endpoints").$type<string[]>().default([]),
  
  // Portfolio tracking
  enablePortfolioTracking: boolean("enable_portfolio_tracking").default(true),
  snapshotFrequency: text("snapshot_frequency").default("daily"), // 'hourly', 'daily', 'weekly'
  
  // Notifications
  priceAlerts: boolean("price_alerts").default(true),
  transactionAlerts: boolean("transaction_alerts").default(true),
  defiPositionAlerts: boolean("defi_position_alerts").default(true),
  stakingRewardAlerts: boolean("staking_reward_alerts").default(true),
  
  // Trading settings
  slippageTolerance: real("slippage_tolerance").default(0.5), // percentage
  gasStrategy: text("gas_strategy").default("normal"), // 'slow', 'normal', 'fast', 'custom'
  maxGasPrice: decimal("max_gas_price", { precision: 18, scale: 8 }),
  
  // Security
  requireConfirmationForLargeTransactions: boolean("require_confirmation_large_tx").default(true),
  largeTransactionThreshold: decimal("large_transaction_threshold", { precision: 18, scale: 8 }).default("1000"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced insert schemas for ChittyChain
export const insertChittyWalletSchema = createInsertSchema(chittyWallets);
export const insertChittyTransactionSchema = createInsertSchema(chittyTransactions);
export const insertDefiPositionSchema = createInsertSchema(defiPositions);
export const insertNftHoldingSchema = createInsertSchema(nftHoldings);
export const insertStakingPositionSchema = createInsertSchema(stakingPositions);
export const insertTradingPositionSchema = createInsertSchema(tradingPositions);
export const insertPortfolioSnapshotSchema = createInsertSchema(portfolioSnapshots);
export const insertChittyChainSettingsSchema = createInsertSchema(chittyChainSettings);

// Enhanced type definitions for ChittyChain
export type ChittyWallet = typeof chittyWallets.$inferSelect;
export type InsertChittyWallet = z.infer<typeof insertChittyWalletSchema>;

export type ChittyTransaction = typeof chittyTransactions.$inferSelect;
export type InsertChittyTransaction = z.infer<typeof insertChittyTransactionSchema>;

export type DefiPosition = typeof defiPositions.$inferSelect;
export type InsertDefiPosition = z.infer<typeof insertDefiPositionSchema>;

export type NftHolding = typeof nftHoldings.$inferSelect;
export type InsertNftHolding = z.infer<typeof insertNftHoldingSchema>;

export type StakingPosition = typeof stakingPositions.$inferSelect;
export type InsertStakingPosition = z.infer<typeof insertStakingPositionSchema>;

export type TradingPosition = typeof tradingPositions.$inferSelect;
export type InsertTradingPosition = z.infer<typeof insertTradingPositionSchema>;

export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
export type InsertPortfolioSnapshot = z.infer<typeof insertPortfolioSnapshotSchema>;

export type ChittyChainSettings = typeof chittyChainSettings.$inferSelect;
export type InsertChittyChainSettings = z.infer<typeof insertChittyChainSettingsSchema>;