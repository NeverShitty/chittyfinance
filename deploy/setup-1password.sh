#!/bin/bash

# ChittyFinance 1Password Setup Script
# Creates secure vaults and items for production deployment

set -e

echo "🔐 Setting up 1Password for ChittyFinance Production Deployment..."

# Check if 1Password CLI is installed
if ! command -v op &> /dev/null; then
    echo "❌ 1Password CLI is not installed. Please install it first:"
    echo "npm install -g @1password/cli"
    exit 1
fi

# Check if user is signed in
if ! op account list &> /dev/null; then
    echo "❌ Please sign in to 1Password CLI first:"
    echo "op account add --address <your-account>.1password.com --email <your-email>"
    echo "op signin"
    exit 1
fi

echo "✅ 1Password CLI is ready"

# Create vault for ChittyFinance production secrets
VAULT_NAME="ChittyFinance-Prod"
echo "📁 Creating vault: $VAULT_NAME"

if op vault get "$VAULT_NAME" &> /dev/null; then
    echo "✅ Vault '$VAULT_NAME' already exists"
else
    op vault create "$VAULT_NAME" --description "Production secrets for ChittyFinance at finance.chitty.cc"
    echo "✅ Created vault: $VAULT_NAME"
fi

# Generate secure encryption key
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

echo "🔑 Creating security secrets..."

# Create Security item
op item create \
    --vault="$VAULT_NAME" \
    --category=password \
    --title="Security" \
    --field="label=ENCRYPTION_KEY,type=concealed,value=$ENCRYPTION_KEY" \
    --field="label=SESSION_SECRET,type=concealed,value=$SESSION_SECRET" \
    --notes="Critical security keys for ChittyFinance encryption and sessions"

echo "✅ Created Security secrets"

# Create Database item
echo "💾 Creating database configuration..."
op item create \
    --vault="$VAULT_NAME" \
    --category=database \
    --title="Database" \
    --field="label=DATABASE_URL,type=concealed,value=postgresql://user:password@host:5432/chittyfinance_prod" \
    --notes="Production database connection string. Update with actual credentials."

echo "✅ Created Database configuration (update with real credentials)"

# Create Auth item
echo "🔐 Creating authentication configuration..."
op item create \
    --vault="$VAULT_NAME" \
    --category=password \
    --title="Auth" \
    --field="label=REPL_ID,type=text,value=your-repl-id" \
    --notes="Replit authentication configuration for finance.chitty.cc"

echo "✅ Created Auth configuration (update with real Repl ID)"

# Create API Keys item
echo "🔑 Creating API keys configuration..."
op item create \
    --vault="$VAULT_NAME" \
    --category=api_credential \
    --title="API-Keys" \
    --field="label=OPENAI_API_KEY,type=concealed,value=your-openai-api-key" \
    --field="label=CHITTYCHAIN_API_KEY,type=concealed,value=your-chittychain-api-key" \
    --field="label=CHITTY_MCP_API_KEY,type=concealed,value=your-chitty-mcp-api-key" \
    --notes="API keys for external services. Update with real keys."

echo "✅ Created API Keys configuration (update with real keys)"

# Create Monitoring item
echo "📊 Creating monitoring configuration..."
op item create \
    --vault="$VAULT_NAME" \
    --category=password \
    --title="Monitoring" \
    --field="label=SENTRY_DSN,type=concealed,value=https://your-sentry-dsn@sentry.io/project-id" \
    --notes="Monitoring and error tracking configuration"

echo "✅ Created Monitoring configuration (update with real Sentry DSN)"

echo ""
echo "🎉 1Password setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update the created items with your actual credentials:"
echo "   op item edit 'Database' --vault='$VAULT_NAME' DATABASE_URL='your-real-database-url'"
echo "   op item edit 'Auth' --vault='$VAULT_NAME' REPL_ID='your-real-repl-id'"
echo "   op item edit 'API-Keys' --vault='$VAULT_NAME' OPENAI_API_KEY='your-real-openai-key'"
echo ""
echo "2. Deploy with secrets injection:"
echo "   ./deploy/deploy.sh"
echo ""
echo "3. Verify deployment:"
echo "   curl https://finance.chitty.cc/api/health"
echo ""