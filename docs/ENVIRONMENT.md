# Environment Variables & Secrets Management

This document provides comprehensive guidance on managing environment variables and secrets for the FoodDealSniper application.

## Table of Contents

- [Overview](#overview)
- [Environment Files](#environment-files)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Secrets Management](#secrets-management)
- [Deployment Environments](#deployment-environments)
- [Security Best Practices](#security-best-practices)

## Overview

FoodDealSniper uses environment variables to configure different aspects of the application, including server settings, scraper configuration, notification services, and security credentials.

## Environment Files

### Development

Copy the example environment file and configure for local development:

```bash
cp .env.example .env
```

Edit `.env` with your local configuration values.

### Production

**Never commit `.env` files to version control!** The `.gitignore` file is configured to exclude these files.

For production deployments, use one of the following methods:

1. **Environment Variables** - Set directly in your hosting platform
2. **Secret Management Service** - Use AWS Secrets Manager, Azure Key Vault, or similar
3. **Docker Secrets** - When using Docker Swarm
4. **Kubernetes Secrets** - When deploying to Kubernetes

## Required Variables

### Application Core

```bash
# Node environment
NODE_ENV=production|development|test

# Server port
PORT=4000

# CORS origins (comma-separated for multiple origins)
CORS_ORIGIN=https://yourdomain.com
```

### Frontend

```bash
# Frontend port for development
FRONTEND_PORT=5173

# API URL for frontend to connect to backend
VITE_API_URL=https://api.yourdomain.com
```

## Optional Variables

### Scraper Configuration

#### Rate Limiting

Protect target websites and avoid IP bans:

```bash
# Maximum requests per period
SCRAPER_RATE_LIMIT_REQUESTS=10

# Rate limit period (milliseconds)
SCRAPER_RATE_LIMIT_PERIOD_MS=60000
```

**Recommended Settings by Site Type:**

- Small sites: 5-10 requests/minute
- Medium sites: 10-30 requests/minute
- Large sites: 30-60 requests/minute

#### Proxy Configuration

For production scraping, use rotating proxies:

```bash
# Enable proxy usage
SCRAPER_PROXY_ENABLED=true

# Single proxy URL
SCRAPER_PROXY_URL=http://proxy-server:8080

# Or multiple proxies (comma-separated)
SCRAPER_PROXY_LIST=http://proxy1:8080,http://proxy2:8080,http://proxy3:8080
```

**Proxy Provider Recommendations:**

- [Bright Data](https://brightdata.com/)
- [Oxylabs](https://oxylabs.io/)
- [ScraperAPI](https://www.scraperapi.com/)
- [Smartproxy](https://smartproxy.com/)

#### Request Configuration

```bash
# Custom user agent
SCRAPER_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36

# Request timeout (milliseconds)
SCRAPER_TIMEOUT_MS=30000

# Retry configuration
SCRAPER_MAX_RETRIES=3
SCRAPER_RETRY_DELAY_MS=1000
```

#### Scheduling

```bash
# Cron expression for automatic scraping
# Examples:
#   0 * * * *     - Every hour
#   */30 * * * *  - Every 30 minutes
#   0 0 * * *     - Daily at midnight
#   0 9-17 * * 1-5 - Every hour from 9am-5pm, Mon-Fri
SCRAPER_SCHEDULE=0 * * * *

# Enable/disable automatic scraping
SCRAPER_AUTO_RUN=true

# Targets to scrape (comma-separated)
SCRAPER_TARGETS=vendor1,vendor2,vendor3
```

### Data Storage

```bash
# Local filesystem storage directory
DATA_DIR=/app/data

# Database (for future use)
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_POOL_SIZE=10
DATABASE_SSL=true
```

### Notification Services

#### Email

```bash
EMAIL_ENABLED=true
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
EMAIL_FROM_ADDRESS=noreply@fooddealsniper.com
```

**Gmail Setup:**

1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password for `EMAIL_SMTP_PASSWORD`

#### Push Notifications

```bash
PUSH_ENABLED=true
PUSH_VAPID_PUBLIC_KEY=<your-public-key>
PUSH_VAPID_PRIVATE_KEY=<your-private-key>
PUSH_VAPID_SUBJECT=mailto:admin@fooddealsniper.com
```

Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

### Logging

```bash
# Log level: error, warn, info, debug, trace
LOG_LEVEL=info

# Log format: json (for production) or pretty (for development)
LOG_FORMAT=json
```

### Security

```bash
# JWT secret for authentication (generate with: openssl rand -base64 64)
JWT_SECRET=<random-string-at-least-32-chars>

# Session secret (generate with: openssl rand -base64 64)
SESSION_SECRET=<random-string-at-least-32-chars>

# API rate limiting
API_RATE_LIMIT_REQUESTS=100
API_RATE_LIMIT_PERIOD_MS=60000
```

### Monitoring

```bash
# Sentry error tracking
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_TRACKING_ID=UA-XXXXX-X
```

## Secrets Management

### Development

For local development, use the `.env` file:

```bash
cp .env.example .env
# Edit .env with your local values
```

### Production

#### Option 1: Platform Environment Variables

Most hosting platforms provide environment variable management:

**Heroku:**

```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=4000
```

**AWS Elastic Beanstalk:**

- Use the EB Console → Configuration → Software → Environment properties

**DigitalOcean App Platform:**

- Use the App Settings → App-Level Environment Variables

**Vercel/Netlify:**

- Use the dashboard Environment Variables section

#### Option 2: Docker Secrets

For Docker Swarm:

```bash
# Create secrets
echo "my-secret-value" | docker secret create db_password -

# Reference in docker-compose.yml
services:
  backend:
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```

#### Option 3: Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: fooddealsniper-secrets
type: Opaque
stringData:
  database-url: postgresql://user:password@host:5432/db
  jwt-secret: your-secret-key
```

```yaml
# In your deployment
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: fooddealsniper-secrets
        key: database-url
```

#### Option 4: Cloud Secret Management

**AWS Secrets Manager:**

```bash
aws secretsmanager create-secret \
  --name fooddealsniper/prod/database-url \
  --secret-string "postgresql://user:password@host:5432/db"
```

**Azure Key Vault:**

```bash
az keyvault secret set \
  --vault-name fooddealsniper-vault \
  --name database-url \
  --value "postgresql://user:password@host:5432/db"
```

**Google Cloud Secret Manager:**

```bash
echo -n "postgresql://user:password@host:5432/db" | \
  gcloud secrets create database-url --data-file=-
```

## Deployment Environments

### Development

```bash
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
LOG_FORMAT=pretty
SCRAPER_AUTO_RUN=false
```

### Staging

```bash
NODE_ENV=staging
PORT=4000
CORS_ORIGIN=https://staging.yourdomain.com
LOG_LEVEL=info
LOG_FORMAT=json
SCRAPER_RATE_LIMIT_REQUESTS=10
SCRAPER_AUTO_RUN=true
```

### Production

```bash
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
LOG_FORMAT=json
SCRAPER_RATE_LIMIT_REQUESTS=10
SCRAPER_PROXY_ENABLED=true
SCRAPER_AUTO_RUN=true
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Security Best Practices

### 1. Never Commit Secrets

Ensure `.env` files are in `.gitignore`:

```gitignore
.env
.env.local
.env.production
.env.*.local
```

### 2. Use Strong Secrets

Generate strong random secrets:

```bash
# Generate a 64-character secret
openssl rand -base64 64

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 3. Rotate Secrets Regularly

- Rotate API keys and tokens every 90 days
- Rotate database passwords every 6 months
- Update VAPID keys if compromised

### 4. Principle of Least Privilege

- Each service should only have access to secrets it needs
- Use separate credentials for different environments
- Implement role-based access control (RBAC)

### 5. Audit and Monitor

- Log access to sensitive configuration
- Monitor for unusual API usage patterns
- Set up alerts for failed authentication attempts

### 6. Encrypt in Transit and at Rest

- Use HTTPS/TLS for all external communications
- Encrypt database connections
- Use encrypted storage for secrets

### 7. Use Environment-Specific Values

Never share secrets between environments:

- Development: Mock or test credentials
- Staging: Separate staging credentials
- Production: Unique production credentials

## Validation

The application validates required environment variables on startup. Missing or invalid values will cause the application to fail fast with descriptive error messages.

To validate your configuration:

```bash
# Development
pnpm dev:backend

# Production
NODE_ENV=production node packages/backend/dist/index.js
```

## Troubleshooting

### Common Issues

**1. CORS errors:**

- Ensure `CORS_ORIGIN` includes your frontend URL
- Multiple origins: `CORS_ORIGIN=https://domain1.com,https://domain2.com`

**2. Scraper being blocked:**

- Reduce `SCRAPER_RATE_LIMIT_REQUESTS`
- Increase `SCRAPER_RATE_LIMIT_PERIOD_MS`
- Enable and configure proxies

**3. Email notifications not working:**

- Verify SMTP credentials
- Check firewall rules for SMTP ports
- For Gmail, use an app password

**4. Variables not loading:**

- Ensure `.env` is in the correct directory
- Check file permissions
- Verify no syntax errors in `.env` file

## Additional Resources

- [dotenv documentation](https://github.com/motdotla/dotenv)
- [12-Factor App: Config](https://12factor.net/config)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_CheatSheet.html)
