# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Chitty Services CFO Platform V2 - an advanced financial management platform integrating traditional finance with ChittyChain blockchain technology. Features comprehensive AI-powered financial analysis, DeFi portfolio management, and multi-chain transaction tracking.

## Essential Commands

```bash
# Development
npm run dev              # Start development server (port 5000)

# Build & Production
npm run build           # Build both client and server
npm start              # Run production server

# Database
npm run db:push        # Push database schema changes with Drizzle

# Type Checking
npm run check          # Run TypeScript type checking
```

## Architecture Overview

The codebase follows a clean client-server architecture with shared types:

- **Client** (`/client`): React SPA with Vite, using Wouter for routing and TanStack Query for server state
- **Server** (`/server`): Express API with TypeScript, Drizzle ORM for PostgreSQL
- **Shared** (`/shared`): Database schema and TypeScript types shared between client and server

Key architectural decisions:
- Path aliases: `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- All API routes are prefixed with `/api`
- Authentication uses Replit Auth with session storage
- Financial data is aggregated from multiple sources into standardized formats

## Core Services & Integrations

### Traditional Finance Integrations
- **Banking**: Mercury Bank
- **Payments**: Stripe, PayPal  
- **Accounting**: QuickBooks, Xero, WavApps
- **Expense Management**: Brex
- **Payroll**: Gusto
- **Property Management**: DoorLoop
- **Development**: GitHub

### ChittyChain Blockchain Integration
- **ChittyChain Client**: `server/lib/chittychain/ChittyChainClient.ts`
- **Portfolio Service**: `server/lib/chittychain/ChittyChainService.ts`
- **Wallet Management**: Multi-wallet support with real-time balance tracking
- **DeFi Protocols**: ChittySwap, ChittyLend, ChittyStake integration
- **NFT Holdings**: Collection tracking and floor price monitoring
- **Staking Rewards**: Validator delegation and reward claiming
- **Real-time Updates**: WebSocket integration for live blockchain data

### AI-Powered Financial Intelligence (ChittyMCP)
- **ChittyBookkeeper**: Financial analysis, bookkeeping, tax preparation
- **ChittyTrader**: DeFi analysis, trading strategies, yield optimization  
- **ChittyAuditor**: Compliance checking, risk assessment, fraud detection
- **ChittyTax**: Tax planning, crypto taxation, deduction optimization
- **ChittyPlanner**: Financial planning, retirement advice, goal setting

Each integration uses the BaseServiceClient pattern with standardized error handling and fallback data.

## AI Assistant Architecture

The AI CFO Assistant (`server/lib/openai.ts`) provides:
- Financial advice and insights
- Cost reduction plans
- Interactive chat with context awareness
- Message history stored in `ai_messages` table

## Database Schema

Main tables (defined in `shared/schema.ts`):
- `users`: User accounts with Replit authentication
- `integrations`: Connected service configurations
- `financial_summaries`: Aggregated financial metrics
- `transactions`: Financial transaction records
- `ai_messages`: AI assistant conversation history
- `sessions`: Authentication session storage

## API Endpoints

### V1 API Routes (Legacy)
- `/api/session`: Authentication status
- `/api/financial-summary`: Aggregated financial data
- `/api/integrations/*`: Service integration management
- `/api/transactions`: Transaction data

### V2 API Routes (Enhanced)
- `/api/v2/mcp/*`: ChittyMCP AI assistant endpoints
  - `/api/v2/mcp/assistants`: List all AI specialists
  - `/api/v2/mcp/chat`: Chat with specific AI assistant
  - `/api/v2/mcp/analyze/*`: Financial analysis endpoints
  - `/api/v2/mcp/reports/generate`: AI-generated financial reports
  
- `/api/v2/chittychain/*`: Blockchain integration endpoints
  - `/api/v2/chittychain/dashboard/metrics`: Combined traditional + blockchain dashboard
  - `/api/v2/chittychain/portfolio/*`: Portfolio management and performance
  - `/api/v2/chittychain/transactions`: Blockchain transaction history
  - `/api/v2/chittychain/defi/positions`: DeFi protocol positions
  - `/api/v2/chittychain/staking/positions`: Staking and delegation info
  - `/api/v2/chittychain/nfts`: NFT holdings and valuations
  - `/api/v2/chittychain/wallets`: Wallet management

## Component Structure

### V1 Components (Legacy)
- `components/ui/`: Shadcn/ui base components
- `components/dashboard/`: Dashboard-specific components  
- `components/layout/`: App layout components
- `pages/`: Route-level page components (Dashboard, Settings, Login)
- `hooks/`: Custom React hooks (useAuth)

### V2 Components (Enhanced)
- `components/common/`: Reusable components (ListCard)
- `contexts/`: React contexts (UserContext)
- `pages/`: Enhanced V2 pages
  - `DashboardV2.tsx`: Advanced dashboard with real-time blockchain data
  - `TransactionsV2.tsx`: Comprehensive transaction filtering and search
  - `AIAssistantV2.tsx`: Multi-specialist AI chat interface
- `hooks/`: Enhanced hooks with ChittyChain integration

## Testing

Currently no test framework is configured. When adding tests, check with the user for preferred testing approach.

## Environment Variables

### Core Infrastructure
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: For basic AI assistant functionality

### ChittyChain Integration
- `CHITTYCHAIN_API_KEY`: ChittyChain blockchain API access
- `CHITTYCHAIN_RPC_ENDPOINT`: ChittyChain RPC node URL (default: https://rpc.chittychain.io)
- `CHITTYCHAIN_EXPLORER_API`: Block explorer API URL (default: https://api.chittyscan.io)
- `CHITTYCHAIN_WS_ENDPOINT`: WebSocket URL for real-time updates (default: wss://ws.chittychain.io)

### ChittyMCP AI Platform
- `CHITTY_MCP_API_KEY`: ChittyMCP API authentication
- `CHITTY_MCP_ENDPOINT`: ChittyMCP service endpoint (default: https://mcp.chittychain.io/api)

### Traditional Finance APIs
- Integration-specific API keys for Mercury, Stripe, QuickBooks, etc.

## Development Workflow

1. Run `npm run dev` to start the development server
2. The client will be available at http://localhost:5000
3. API endpoints are accessible at http://localhost:5000/api/*
4. Database changes should be made in `shared/schema.ts` (V1) or `shared/schema-v2.ts`/`shared/chittychain-schema.ts` (V2) then run `npm run db:push`
5. Type checking with `npm run check` before committing

## V2 Architecture Notes

### ChittyMCP Integration
- All AI assistants use fallback responses when MCP service is unavailable
- ChittyBookkeeper specializes in traditional financial analysis
- ChittyTrader focuses on DeFi and blockchain investments
- ChittyAuditor handles compliance and risk management
- Each assistant maintains conversation context and provides actionable insights

### ChittyChain Blockchain Features
- Real-time portfolio tracking across multiple wallets
- DeFi protocol integration with yield farming analytics
- NFT collection monitoring with floor price tracking
- Staking rewards management and validator selection
- Cross-chain transaction categorization and tax reporting

### Enhanced Database Schema
- V2 transactions support advanced metadata, AI categorization, and recurring pattern detection
- Separate schemas for blockchain-specific data (wallets, DeFi positions, NFT holdings)
- Portfolio snapshots for historical performance tracking
- Comprehensive audit trails for compliance requirements