# Coupon Ingestion & Monitoring Pipeline

## Overview

The coupon ingestion pipeline is a modular, extensible system for scraping, normalizing, and persisting food delivery coupons from multiple vendors. It includes rate limiting, health monitoring, scheduled refreshes, and robust error handling.

## Architecture

```
ingestion/
├── core/                    # Core types and base classes
│   ├── types.ts            # TypeScript interfaces for coupons, metrics, etc.
│   └── BaseProvider.ts     # Abstract base class for all providers
├── providers/              # Vendor-specific scrapers
│   ├── UberEatsProvider.ts # Fully implemented example
│   ├── DoorDashProvider.ts # Stub implementation
│   ├── GrubHubProvider.ts  # Stub implementation
│   └── index.ts            # Provider registry
├── scheduler/              # Job scheduling
│   └── IngestionScheduler.ts
├── storage/                # Data persistence
│   └── CouponStore.ts
├── utils/                  # Shared utilities
│   ├── logger.ts           # Winston-based logging
│   ├── RateLimiter.ts      # Token bucket rate limiter
│   ├── normalizer.ts       # Coupon normalization & deduplication
│   └── fetcher.ts          # HTTP/Playwright fetcher with fallback
├── metrics/                # Health & performance tracking
│   └── MetricsTracker.ts
└── IngestionService.ts     # Main service orchestrator
```

## Features

### 1. Modular Provider System

- Abstract `BaseProvider` class for consistent implementation
- Easy to add new vendors by extending the base class
- Per-provider configuration (rate limits, schedules, timeout)

### 2. Intelligent Fetching

- Primary HTTP fetching with Cheerio for fast HTML parsing
- Automatic fallback to Playwright for JavaScript-heavy sites
- Configurable timeouts and headers
- Respects rate limits per provider

### 3. Scheduling

- node-cron based scheduled refreshes
- Configurable cron expressions per provider
- Manual trigger support via API
- Graceful startup/shutdown

### 4. Data Normalization

- Standardized coupon format across all vendors
- Automatic code normalization (uppercase, whitespace removal)
- Intelligent discount type detection (percentage, fixed, free delivery)
- Expiration date parsing

### 5. Deduplication

- Hash-based coupon IDs (vendor + code + title)
- Prevents duplicate entries
- Updates existing coupons with fresh data

### 6. Health Monitoring

- Provider-level health status (healthy/degraded/down)
- Tracks consecutive failures
- Records last success/failure timestamps
- Overall system uptime tracking

### 7. Metrics & Logging

- Winston-based structured logging
- Per-ingestion metrics (duration, coupons found/added/updated)
- Historical metrics storage (last 100 runs per provider)
- File and console logging with levels

## API Endpoints

### Coupon Endpoints

#### GET /api/coupons

Get all coupons with optional filtering.

Query parameters:

- `vendor`: Filter by vendor (e.g., "UberEats")
- `active`: Set to "true" to get only non-expired coupons

```bash
GET /api/coupons?vendor=UberEats&active=true
```

#### GET /api/coupons/active

Get all active (non-expired) coupons.

#### GET /api/coupons/:id

Get a specific coupon by ID.

### Ingestion Endpoints

#### GET /api/ingestion/health

Get overall health status of the ingestion system.

Response:

```json
{
  "uptime": 3600000,
  "lastIngestionRun": "2024-01-01T12:00:00Z",
  "providers": {
    "UberEats": {
      "status": "healthy",
      "lastSuccess": "2024-01-01T12:00:00Z",
      "consecutiveFailures": 0
    }
  },
  "totalCoupons": 42,
  "activeCoupons": 38
}
```

#### GET /api/ingestion/metrics

Get ingestion metrics.

Query parameters:

- `provider`: Filter by provider name
- `limit`: Number of recent metrics to return (default: 10)

```bash
GET /api/ingestion/metrics?provider=UberEats&limit=5
```

#### GET /api/ingestion/scheduler/status

Get scheduler status.

Response:

```json
{
  "running": true,
  "activeTasks": 3,
  "providers": ["UberEats", "DoorDash", "GrubHub"]
}
```

#### POST /api/ingestion/run

Trigger an immediate ingestion run.

Body (optional):

```json
{
  "provider": "UberEats"
}
```

If no provider specified, runs all enabled providers.

#### GET /api/ingestion/providers

List all registered providers and their enabled status.

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=4000
LOG_LEVEL=info
RUN_INGESTION_ON_STARTUP=false
```

- `PORT`: API server port
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `RUN_INGESTION_ON_STARTUP`: Whether to run ingestion immediately on server start

### Provider Configuration

Providers are configured in their constructors. Example from UberEatsProvider:

```typescript
{
  name: 'UberEats',
  enabled: true,
  refreshInterval: '0 */4 * * *',  // Every 4 hours
  rateLimit: {
    maxRequests: 15,
    perMilliseconds: 60000  // 15 requests per minute
  },
  usePlaywright: false,
  timeout: 30000
}
```

## Adding a New Provider

1. Create a new file in `providers/`:

```typescript
import { BaseProvider } from '../core/BaseProvider';
import { ProviderConfig, ScraperResult } from '../core/types';
import { Fetcher } from '../utils/fetcher';

export class NewVendorProvider extends BaseProvider {
  private fetcher: Fetcher;

  constructor(config?: Partial<ProviderConfig>) {
    super({
      name: 'NewVendor',
      enabled: true,
      refreshInterval: '0 */6 * * *',
      rateLimit: {
        maxRequests: 10,
        perMilliseconds: 60000,
      },
      usePlaywright: false,
      timeout: 30000,
      ...config,
    });

    this.fetcher = new Fetcher();
  }

  async scrape(): Promise<ScraperResult> {
    try {
      const result = await this.fetcher.fetch('https://vendor.com/deals');

      if (!result.success || !result.$) {
        return {
          success: false,
          coupons: [],
          error: result.error,
          timestamp: new Date(),
        };
      }

      const coupons = [];
      const $ = result.$;

      $('.coupon-item').each((_i, elem) => {
        const code = $(elem).find('.code').text().trim();
        const title = $(elem).find('.title').text().trim();
        const description = $(elem).find('.description').text().trim();

        if (code) {
          coupons.push({
            code,
            title,
            description,
            vendor: 'NewVendor',
            discountType: 'other',
          });
        }
      });

      return {
        success: true,
        coupons,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        coupons: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
}
```

2. Register in `providers/index.ts`:

```typescript
import { NewVendorProvider } from './NewVendorProvider';

export function createDefaultProviders(): BaseProvider[] {
  return [
    new UberEatsProvider(),
    new DoorDashProvider(),
    new GrubHubProvider(),
    new NewVendorProvider(),
  ];
}
```

## Data Storage

Coupons are persisted to `data/coupons/coupons.json` as a JSON array. The storage layer:

- Automatically creates the directory structure
- Deduplicates coupons by ID
- Tracks creation and verification timestamps
- Provides query methods (by vendor, active status, etc.)

Example coupon structure:

```json
{
  "id": "abc123...",
  "code": "SAVE20",
  "title": "20% off your order",
  "description": "Get 20% off orders over $25",
  "vendor": "UberEats",
  "discountType": "percentage",
  "discountValue": 20,
  "minOrderValue": 25,
  "expiresAt": "2024-12-31T23:59:59Z",
  "termsUrl": "https://...",
  "scrapedAt": "2024-01-01T12:00:00Z",
  "lastVerified": "2024-01-01T12:00:00Z"
}
```

## Logging

Logs are written to:

- `logs/ingestion-combined.log` - All logs
- `logs/ingestion-error.log` - Errors only
- Console with colorized output

Log levels: debug, info, warn, error

## Rate Limiting

Each provider has its own rate limiter using a token bucket algorithm:

- Configurable max requests per time window
- Automatic throttling when limit reached
- Respects ethical scraping practices

## Error Handling

- Failed scrapes don't crash the scheduler
- Errors are logged with full context
- Health status reflects provider reliability
- Automatic retries on next scheduled run

## Development

### Install dependencies

```bash
cd /home/project
pnpm install
```

### Run in development mode

```bash
pnpm dev:backend
# Server starts on http://localhost:4000
```

### Trigger manual ingestion

```bash
curl -X POST http://localhost:4000/api/ingestion/run \
  -H "Content-Type: application/json"
```

### Check health

```bash
curl http://localhost:4000/api/ingestion/health
```

### View coupons

```bash
curl http://localhost:4000/api/coupons?active=true
```

### View logs

```bash
tail -f packages/backend/logs/ingestion-combined.log
```

## Testing Providers

To test a specific provider without waiting for the scheduler:

```bash
curl -X POST http://localhost:4000/api/ingestion/run \
  -H "Content-Type: application/json" \
  -d '{"provider": "UberEats"}'
```

Then check the logs for results:

```bash
tail -f packages/backend/logs/ingestion-combined.log
```

## Production Considerations

1. **Database Migration**: Consider moving from JSON to PostgreSQL/MongoDB for scalability
2. **Queue System**: For high-volume scraping, consider BullMQ instead of node-cron
3. **Proxy Rotation**: Add proxy support for more aggressive scraping
4. **User-Agent Rotation**: Randomize user agents to avoid detection
5. **Error Alerting**: Add Sentry or similar for error notifications
6. **Metrics Dashboard**: Build a Grafana dashboard for monitoring
7. **API Rate Limiting**: Add rate limiting to public API endpoints

## Troubleshooting

### Provider always returns 0 coupons

- Check if the website structure has changed (selectors may be outdated)
- Try enabling Playwright mode if the site is JS-heavy
- Verify the website is accessible (check logs for HTTP errors)

### High memory usage

- Playwright browsers may not be closing properly
- Check for memory leaks in scraping logic
- Consider limiting concurrent provider runs

### Scheduler not running

- Check that providers are enabled in their config
- Verify cron expressions are valid
- Check logs for initialization errors

## License

See root LICENSE file.
