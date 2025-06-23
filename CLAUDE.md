# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is ChittyFinance - an advanced financial management platform integrating traditional finance with ChittyChain blockchain technology. Features comprehensive AI-powered financial analysis, DeFi portfolio management, and multi-chain transaction tracking.

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
- **Banking**: Mercury Bank, Plaid (bank account linking)
- **Payments**: Stripe, PayPal  
- **Accounting**: QuickBooks, Xero, WavApps
- **Expense Management**: Brex
- **Payroll**: Gusto
- **Property Management**: DoorLoop
- **Development**: GitHub
- **Automation**: Zapier (webhook triggers and 5000+ app integrations)

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
- `/api/integrations`: Service integration management
  - `GET /api/integrations`: List all user integrations
  - `POST /api/integrations/zapier/connect`: Connect Zapier webhook
  - `POST /api/integrations/zapier/webhook`: Send Zapier webhook
  - `POST /api/integrations/plaid/connect`: Connect Plaid integration
  - `POST /api/integrations/plaid/exchange-token`: Exchange Plaid public token
  - `GET /api/integrations/plaid/accounts`: Get linked bank accounts
  - `GET /api/integrations/plaid/transactions`: Get bank transactions
  - `DELETE /api/integrations/{serviceType}`: Disconnect integration
- `/api/transactions`: Transaction data

### Universal Connector API
- `/api/universal-connector`: Public endpoint (no auth required)
- `/api/universal-connector/secured`: Authenticated endpoint (requires Replit Auth)

Returns standardized financial data structure:
- Financial summaries with key metrics (cash flow, runway, burn rate)
- Transactions from all connected services
- Recurring charges with optimization suggestions
- Payroll information and connected services status

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

### Security Configuration (Required)
- `ENCRYPTION_KEY`: 64 hex characters (32 bytes) for credential encryption
- `SESSION_SECRET`: At least 32 characters for session security
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `BLOCKED_IP_RANGES`: Comma-separated IP ranges to block (optional)

### Core Infrastructure
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: For basic AI assistant functionality

### Authentication (Replit Auth)
- `REPL_ID`: Your Replit application ID
- `ISSUER_URL`: OAuth issuer URL (default: https://replit.com/oidc)
- `REPLIT_DOMAINS`: Comma-separated list of allowed domains

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

### Production Deployment
- `PRODUCTION_DOMAIN`: finance.chitty.cc
- Secret management via 1Password vault: `ChittyFinance-Prod`

## Development Workflow

1. Run `npm run dev` to start the development server
2. The client will be available at http://localhost:5000
3. API endpoints are accessible at http://localhost:5000/api/*
4. Database changes should be made in `shared/schema.ts` (V1) or `shared/schema-v2.ts`/`shared/chittychain-schema.ts` (V2) then run `npm run db:push`
5. Type checking with `npm run check` before committing

## Production Deployment

### Deployment Commands
```bash
# Set up 1Password secrets (first time only)
./deploy/setup-1password.sh

# Deploy to production
./deploy/deploy.sh

# Verify deployment health
./deploy/health-check.sh
```

### Deployment Platforms
- **Primary**: Replit (with custom domain finance.chitty.cc)
- **Alternative**: Vercel, Heroku, Docker
- **Health Check**: `/api/health` endpoint for monitoring

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

## Key File Locations

### Server Architecture
- Main server entry: `server/index.ts` - Express server with middleware setup
- Route registration: `server/routes/index.ts` - Central routing configuration
- Authentication: `server/replitAuth.ts` - Replit authentication setup
- Error handling: `server/middleware/errorHandler.ts` - Centralized error handling

### Client Architecture  
- Main app entry: `client/src/main.tsx` and `client/src/App.tsx`
- Routing: Uses Wouter for client-side routing
- State management: TanStack Query for server state, React Context for user state
- UI components: Shadcn/ui components in `client/src/components/ui/`

### Configuration Files
- `vite.config.ts`: Vite build configuration with path aliases
- `drizzle.config.ts`: Database migration configuration
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.ts`: Tailwind CSS configuration

## Database Management

### Schema Structure
- **V1 Schema** (`shared/schema.ts`): Core tables for users, integrations, transactions, AI messages
- **V2 Schema** (`shared/schema-v2.ts`): Enhanced features with budgets, goals, invoices, reports
- **ChittyChain Schema** (`shared/chittychain-schema.ts`): Blockchain-specific tables for wallets, DeFi, NFTs

### Database Operations
- Use `npm run db:push` to apply schema changes
- Database URL must be set in `DATABASE_URL` environment variable
- All schemas use Drizzle ORM with PostgreSQL

## Service Integration Pattern

All external service integrations extend `BaseServiceClient` (`server/lib/base/BaseServiceClient.ts`):
- Consistent error handling and retry logic
- Fallback data when services are unavailable
- Standardized authentication headers
- Built-in connection testing

## Authentication & Security

- Uses Replit Auth for user authentication
- Sessions stored in PostgreSQL (`sessions` table)
- Middleware in `server/middleware/auth.ts` handles session validation
- User context provided via React Context (`client/src/contexts/UserContext.tsx`)

## Port Configuration

The application **ALWAYS** runs on port 5000:
- Development server: `http://localhost:5000`
- Production server: `http://localhost:5000`
- API endpoints: `http://localhost:5000/api/*`

## Security Requirements

### Production Deployment Checklist
1. **Environment Variables**: All required security variables must be set
2. **HTTPS Only**: Application must run behind HTTPS in production
3. **Secrets Management**: Never commit API keys or sensitive data to version control
4. **Access Control**: Verify all routes have proper authentication and authorization
5. **Rate Limiting**: Ensure rate limits are appropriate for your traffic patterns
6. **Monitoring**: Set up security monitoring and alerting

### Security Features Implemented
- **Authentication**: Replit Auth with session validation and expiry
- **Authorization**: Resource ownership validation prevents IDOR attacks
- **Encryption**: AES-256-GCM encryption for sensitive credentials
- **Password Security**: bcrypt hashing with salt rounds = 12
- **Rate Limiting**: Tiered limits (general, auth, API) with IP-based tracking
- **Input Validation**: Comprehensive Zod schemas with sanitization
- **Security Headers**: Helmet.js with CSP, HSTS, and XSS protection
- **CORS**: Configurable cross-origin policy with domain whitelisting
- **Request Limits**: 10MB max request size with content-type validation
- **Error Handling**: Sanitized error responses (no sensitive data exposure)
- **Security Monitoring**: Suspicious activity detection and logging

## GitHub Actions Workflows

### Available Workflows
- **CI/CD Pipeline** (`.github/workflows/ci.yml`): Automated testing, building, and quality checks
- **Production Deployment** (`.github/workflows/deploy.yml`): Automated deployment to Replit with Vercel fallback
- **Security Scanning** (`.github/workflows/security.yml`): Comprehensive security analysis and vulnerability detection

### Workflow Triggers
- **CI/CD**: Runs on push to main/develop branches and pull requests
- **Deployment**: Runs on push to main branch or version tags
- **Security**: Runs on push, pull requests, daily schedule, and manual trigger

### Required Secrets
Configure these secrets in GitHub repository settings:
- `OP_SERVICE_ACCOUNT_TOKEN`: 1Password service account token
- `REPLIT_TOKEN`: Replit authentication token
- `REPL_ID`: Replit application ID
- `VERCEL_TOKEN`: Vercel deployment token (backup)
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `TEST_DATABASE_URL`: Test database connection string
- `TEST_SESSION_SECRET`: Test session secret key
- `TEST_ENCRYPTION_KEY`: Test encryption key (64 hex characters)

### Deployment Process
1. Code pushed to main branch triggers deployment workflow
2. Builds application and runs tests
3. Configures 1Password secrets for production
4. Deploys to Replit with custom domain (finance.chitty.cc)
5. Runs health checks and creates rollback on failure
6. Falls back to Vercel deployment if Replit fails

## Important Reminders

- NEVER create files unless absolutely necessary for achieving the goal
- ALWAYS prefer editing existing files over creating new ones
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- Run `npm run check` for TypeScript validation before committing changes
- **SECURITY**: Never disable security middleware without explicit approval
- **ENVIRONMENT**: Use `.env.example` as template for environment setup