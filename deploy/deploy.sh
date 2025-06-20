#!/bin/bash

# ChittyFinance Production Deployment Script
# Deploys to finance.chitty.cc with 1Password secret injection

set -e

DOMAIN="finance.chitty.cc"
APP_NAME="chittyfinance"
BUILD_DIR="dist"

echo "🚀 Deploying ChittyFinance to $DOMAIN..."

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v op &> /dev/null; then
    echo "❌ 1Password CLI is required. Install with: npm install -g @1password/cli"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required"
    exit 1
fi

# Verify 1Password authentication
if ! op account list &> /dev/null; then
    echo "❌ Please sign in to 1Password CLI first"
    exit 1
fi

# Verify 1Password vault exists
if ! op vault get "ChittyFinance-Prod" &> /dev/null; then
    echo "❌ 1Password vault 'ChittyFinance-Prod' not found"
    echo "Run: ./deploy/setup-1password.sh"
    exit 1
fi

echo "✅ Prerequisites verified"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf $BUILD_DIR
rm -f .env

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run type checking
echo "🔍 Running type checks..."
npm run check

# Inject secrets from 1Password
echo "🔐 Injecting secrets from 1Password..."
op inject -i .env.production.template -o .env

# Validate environment configuration
echo "🛡️ Validating security configuration..."
node -e "
const { validateEnvironmentSecurity } = require('./dist/server/lib/crypto.js');
const issues = validateEnvironmentSecurity();
if (issues.length > 0) {
  console.error('❌ Security validation failed:');
  issues.forEach(issue => console.error('  -', issue));
  process.exit(1);
}
console.log('✅ Security validation passed');
"

# Build application
echo "🔨 Building application..."
npm run build

# Database migration (if needed)
echo "💾 Running database migrations..."
npm run db:push

# Verify build
if [ ! -f "$BUILD_DIR/index.js" ]; then
    echo "❌ Build failed - server bundle not found"
    exit 1
fi

if [ ! -d "$BUILD_DIR/public" ]; then
    echo "❌ Build failed - client bundle not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Security scan (basic)
echo "🛡️ Running security checks..."

# Check for sensitive data in build
if grep -r "demo-key\|test-key\|localhost" $BUILD_DIR/ &> /dev/null; then
    echo "⚠️ Warning: Potential sensitive data found in build"
fi

# Check file permissions
chmod 600 .env
echo "✅ Environment file permissions secured"

# Test application startup
echo "🧪 Testing application startup..."
timeout 30s npm start &
APP_PID=$!
sleep 10

# Check if app is responding
if curl -f -s "http://localhost:5000/api/health" > /dev/null; then
    echo "✅ Application startup test passed"
else
    echo "❌ Application startup test failed"
    kill $APP_PID 2>/dev/null || true
    exit 1
fi

kill $APP_PID 2>/dev/null || true
sleep 2

# Deploy to production (this would be platform-specific)
echo "🌐 Deploying to production..."

# Example for different platforms:
if command -v replit &> /dev/null; then
    # Replit deployment
    echo "🔄 Deploying to Replit..."
    # Configure custom domain in Replit console
    echo "Configure custom domain finance.chitty.cc in Replit console"
    
elif command -v vercel &> /dev/null; then
    # Vercel deployment
    echo "🔄 Deploying to Vercel..."
    vercel --prod --env .env
    vercel domains add finance.chitty.cc
    
elif command -v heroku &> /dev/null; then
    # Heroku deployment
    echo "🔄 Deploying to Heroku..."
    heroku create $APP_NAME
    
    # Set environment variables from 1Password
    while IFS='=' read -r key value; do
        if [[ $key =~ ^[A-Z_]+$ ]] && [[ ! $key =~ ^# ]]; then
            heroku config:set "$key=$value" --app $APP_NAME
        fi
    done < .env
    
    git push heroku main
    heroku domains:add $DOMAIN --app $APP_NAME
    
elif command -v docker &> /dev/null; then
    # Docker deployment
    echo "🔄 Building Docker image..."
    docker build -t $APP_NAME:latest .
    echo "Deploy the Docker image to your container platform"
    
else
    echo "🔄 Build ready for manual deployment"
    echo "Deploy the contents of ./$BUILD_DIR/ to your server"
fi

# Clean up
echo "🧹 Cleaning up..."
rm -f .env  # Remove environment file for security

# Post-deployment verification
echo "🔍 Verifying deployment..."
sleep 30  # Wait for deployment to propagate

if curl -f -s "https://$DOMAIN/api/health" > /dev/null; then
    echo "✅ Deployment verification passed"
    echo "🎉 ChittyFinance successfully deployed to https://$DOMAIN"
else
    echo "⚠️ Deployment verification failed - manual check required"
    echo "Check https://$DOMAIN manually"
fi

echo ""
echo "📋 Post-deployment checklist:"
echo "1. ✅ Application deployed to https://$DOMAIN"
echo "2. 🔍 Verify SSL certificate is valid"
echo "3. 🛡️ Test authentication flow"
echo "4. 📊 Set up monitoring and alerting"
echo "5. 🔄 Configure backup strategy"
echo "6. 📖 Update DNS records if needed"
echo ""
echo "🎯 Deployment complete!"