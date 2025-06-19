# Chitty Services CFO Platform V2

## Overview

This is an advanced financial management platform that integrates traditional finance with ChittyChain blockchain technology. The platform serves as an AI-powered CFO assistant, providing comprehensive financial insights, transaction management, and automated financial optimization across multiple service integrations.

## System Architecture

The application follows a clean client-server architecture with TypeScript throughout:

**Frontend Architecture:**
- React SPA built with Vite for fast development and optimized builds
- Wouter for lightweight client-side routing
- TanStack Query for server state management and caching
- Tailwind CSS with shadcn/ui components for modern UI design
- Path aliases: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

**Backend Architecture:**
- Express.js server with TypeScript
- RESTful API design with `/api` prefix for all routes
- Modular route organization with separate route files
- Comprehensive error handling and API response standardization

**Database Layer:**
- PostgreSQL database with Drizzle ORM
- Schema-first approach with shared types between client and server
- Session management using connect-pg-simple for Replit Auth

## Key Components

### Authentication System
- **Primary:** Replit Auth integration with OpenID Connect
- **Fallback:** Demo user system for development
- **Session Storage:** PostgreSQL-backed sessions with 7-day TTL
- **Security:** HTTP-only cookies with secure flags

### Financial Data Aggregation
- **Universal Connector API:** Standardizes data from multiple financial services
- **Supported Integrations:** Mercury Bank, Stripe, QuickBooks, Xero, Wave Apps, Brex, Gusto, DoorLoop, PayPal
- **Caching Layer:** 5-minute cache duration for external API calls
- **Fallback Data:** Mock data in development, graceful degradation in production

### AI-Powered Features
- **OpenAI GPT-4o Integration:** Financial advice and analysis
- **ChittyMCP:** Multi-model AI assistant framework
- **Contradiction Engine:** Detects financial data inconsistencies across sources
- **Automated Recommendations:** Cost reduction, charge optimization, and financial insights

### Blockchain Integration
- **ChittyChain Client:** Custom blockchain integration for crypto finance
- **Portfolio Management:** Multi-wallet support with DeFi tracking
- **Transaction Processing:** Both traditional and blockchain transaction handling

## Data Flow

1. **Authentication Flow:**
   - User authenticates via Replit Auth
   - Session stored in PostgreSQL with user context
   - Frontend receives user data through React Query

2. **Financial Data Flow:**
   - External service APIs fetched with rate limiting
   - Data normalized through Universal Connector format
   - Cached responses served for subsequent requests
   - AI analysis performed on aggregated data

3. **Real-time Updates:**
   - WebSocket connections for blockchain data
   - Query invalidation for fresh data when needed
   - Optimistic updates for better UX

## External Dependencies

### Core Services
- **Database:** PostgreSQL (via DATABASE_URL environment variable)
- **Authentication:** Replit Auth with OpenID Connect
- **AI:** OpenAI API for GPT-4o model

### Financial Integrations
- Mercury Bank API
- Stripe API
- QuickBooks API
- Xero API
- Wave Apps API
- Brex API
- Gusto API
- DoorLoop API
- PayPal Server SDK

### Blockchain Services
- ChittyChain RPC endpoints
- ChittyChain Explorer API
- WebSocket connections for real-time blockchain data

## Deployment Strategy

**Development:**
- Replit-hosted with automatic provisioning
- Hot module replacement via Vite
- PostgreSQL database automatically provisioned
- Environment variables managed through Replit secrets

**Production:**
- Autoscale deployment target on Replit
- Build process: `npm run build` (builds both client and server)
- Production server: `npm run start`
- Static assets served from `/dist/public`
- API routes served from Express server

**Build Configuration:**
- Client built with Vite to `dist/public`
- Server bundled with esbuild to `dist/index.js`
- Shared types compiled for both environments

## Changelog

```
Changelog:
- June 19, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```