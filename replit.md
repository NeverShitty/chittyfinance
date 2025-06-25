# ChittyFinance - AI-Powered CFO Dashboard

## Overview

ChittyFinance is a comprehensive financial management platform that serves as an AI-powered CFO assistant. The application integrates with multiple financial services (Mercury Bank, WavApps, DoorLoop) to provide real-time financial insights, automated charge management, and intelligent financial advice. Built with a modern full-stack architecture, it features a React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom theme provider with light/dark mode support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: Built-in session handling
- **API Structure**: RESTful API with structured error handling
- **Development**: Hot reload with tsx for TypeScript execution

### Build and Deployment
- **Development**: Vite dev server with Express API proxy
- **Production**: Static frontend build served by Express server
- **Platform**: Replit deployment with autoscale configuration
- **Build Process**: Vite build for frontend, esbuild for backend bundling

## Key Components

### Database Schema
- **Users**: Authentication and profile management
- **Integrations**: Third-party service connections (Mercury, WavApps, DoorLoop, GitHub)
- **Financial Summaries**: Aggregated financial data per user
- **Transactions**: Financial transaction records
- **Tasks**: AI-generated financial tasks and recommendations
- **AI Messages**: Conversation history with AI CFO assistant

### External Service Integrations
- **Mercury Bank**: Banking data and transaction fetching
- **WavApps**: Accounting software integration
- **DoorLoop**: Property management financial data
- **GitHub**: Repository and development activity tracking
- **OpenAI**: AI-powered financial advice and analysis

### Core Features
- **Financial Dashboard**: Real-time financial metrics and summaries
- **AI CFO Assistant**: OpenAI-powered financial advice and chat interface
- **Charge Automation**: Recurring charge detection and optimization recommendations
- **Service Integrations**: Multi-platform financial data aggregation
- **Task Management**: AI-generated financial tasks and action items

## Data Flow

1. **User Authentication**: Auto-login demo user system (production would use proper auth)
2. **Data Aggregation**: Background sync from connected financial services
3. **AI Processing**: Financial data analyzed by OpenAI for insights and recommendations
4. **Real-time Updates**: TanStack Query manages cache invalidation and updates
5. **Dashboard Display**: Aggregated data presented through interactive components

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Integration APIs
- Mercury Bank API (production keys configured)
- WavApps API
- DoorLoop API
- GitHub API
- OpenAI API

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Port**: 5000
- **Features**: Hot reload, Vite dev server, API proxying

### Production Build
- **Frontend**: `vite build` outputs to `dist/public`
- **Backend**: `esbuild` bundles server to `dist/index.js`
- **Deployment**: Replit autoscale with health checks

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless PostgreSQL
- **Command**: `npm run db:push` for schema updates

## Changelog

Changelog:
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.