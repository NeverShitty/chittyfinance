# ChittyFinance Production Deployment

Secure deployment of ChittyFinance to finance.chitty.cc using 1Password for secret management.

## 🚀 Quick Start

```bash
# 1. Set up 1Password secrets
./deploy/setup-1password.sh

# 2. Update secrets with real values
op item edit "Database" --vault="ChittyFinance-Prod" DATABASE_URL="your-real-database-url"
op item edit "Auth" --vault="ChittyFinance-Prod" REPL_ID="your-real-repl-id"
op item edit "API-Keys" --vault="ChittyFinance-Prod" OPENAI_API_KEY="your-real-openai-key"

# 3. Deploy
./deploy/deploy.sh

# 4. Verify deployment
./deploy/health-check.sh
```

## 📋 Prerequisites

- [1Password CLI](https://developer.1password.com/docs/cli/get-started/) installed and authenticated
- Node.js 18+ and npm
- Access to production database
- Valid API keys for OpenAI, ChittyChain, etc.
- Domain finance.chitty.cc configured

## 🔐 Secret Management

All sensitive configuration is managed through 1Password:

### Vault Structure: `ChittyFinance-Prod`

- **Security**: Encryption keys and session secrets
- **Database**: Production database connection
- **Auth**: Replit authentication configuration
- **API-Keys**: External service API keys
- **Monitoring**: Error tracking and analytics

### Updating Secrets

```bash
# Update individual secrets
op item edit "Security" --vault="ChittyFinance-Prod" ENCRYPTION_KEY="new-key"

# View current configuration (masked)
op item get "API-Keys" --vault="ChittyFinance-Prod"

# Generate new encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🛡️ Security Features

- **AES-256-GCM encryption** for stored credentials
- **bcrypt password hashing** with 12 salt rounds
- **Rate limiting** (100 req/15min general, 5 req/15min auth)
- **CORS protection** with domain whitelisting
- **Security headers** via Helmet.js
- **Input validation** and sanitization
- **Request size limits** (10MB max)
- **IP-based security** checks

## 🔍 Health Monitoring

The deployment includes comprehensive health checks:

```bash
# Manual health check
./deploy/health-check.sh

# API health endpoint
curl https://finance.chitty.cc/api/health
```

### Monitored Metrics

- SSL certificate validity
- Security header presence
- API endpoint responsiveness
- Database connectivity
- Response time performance
- Rate limiting effectiveness

## 🏗️ Deployment Platforms

The deployment script supports multiple platforms:

### Replit (Recommended)
- Automatic builds and deployments
- Built-in custom domain support
- Configure domain in Replit console

### Vercel
```bash
vercel --prod --env .env
vercel domains add finance.chitty.cc
```

### Heroku
```bash
heroku create chittyfinance
git push heroku main
heroku domains:add finance.chitty.cc
```

### Docker
```bash
docker build -t chittyfinance:latest .
# Deploy to your container platform
```

## 🔧 Configuration

### Environment Variables

All environment variables are injected from 1Password using the template:
- `.env.production.template` - 1Password injection template
- Generated `.env` file (temporary, auto-deleted)

### Domain Configuration

The application is configured for:
- **Primary Domain**: finance.chitty.cc
- **CORS Origins**: finance.chitty.cc, chitty.cc
- **SSL**: Required (HSTS enforced)

## 🚨 Troubleshooting

### Common Issues

1. **1Password Authentication Failed**
   ```bash
   op signin
   ```

2. **Vault Not Found**
   ```bash
   ./deploy/setup-1password.sh
   ```

3. **Database Connection Failed**
   - Verify DATABASE_URL in 1Password
   - Check database server accessibility
   - Confirm SSL requirements

4. **API Keys Invalid**
   - Update keys in 1Password vault
   - Verify key permissions and quotas

5. **SSL Certificate Issues**
   - Check domain DNS configuration
   - Verify certificate installation
   - Wait for certificate propagation

### Debug Mode

Run deployment with verbose output:
```bash
set -x
./deploy/deploy.sh
```

## 📊 Post-Deployment

After successful deployment:

1. **Verify SSL**: https://www.ssllabs.com/ssltest/
2. **Test Authentication**: Login flow end-to-end
3. **Monitor Performance**: Set up alerts for response times
4. **Security Scan**: Run security analysis tools
5. **Backup Strategy**: Configure database backups
6. **Update Documentation**: Record any customizations

## 🔄 Updates and Maintenance

### Rolling Updates
```bash
# Update code and redeploy
git pull origin main
./deploy/deploy.sh
```

### Secret Rotation
```bash
# Rotate encryption key
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
op item edit "Security" --vault="ChittyFinance-Prod" ENCRYPTION_KEY="$NEW_KEY"
./deploy/deploy.sh
```

### Emergency Rollback
- Keep previous build artifacts
- Use platform-specific rollback mechanisms
- Update 1Password secrets if needed

## 📞 Support

For deployment issues:
1. Check deployment logs
2. Run health checks
3. Verify 1Password configuration
4. Contact platform support if needed

---

🔐 **Security First**: All secrets are managed through 1Password - never commit sensitive data to version control.