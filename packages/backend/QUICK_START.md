# Coupon Ingestion Pipeline - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment (Optional)

```bash
cd packages/backend
echo "PORT=4000" > .env
echo "LOG_LEVEL=info" >> .env
# Defaults work fine if you skip this step
```

### 3. Start the Server

```bash
# From project root
pnpm dev:backend

# Server starts on http://localhost:4000
```

### 4. Test the System

#### Check Health

```bash
curl http://localhost:4000/api/ingestion/health
```

#### Trigger Manual Ingestion (UberEats)

```bash
curl -X POST http://localhost:4000/api/ingestion/run \
  -H "Content-Type: application/json" \
  -d '{"provider": "UberEats"}'
```

#### View Coupons

```bash
curl http://localhost:4000/api/coupons
```

#### View Metrics

```bash
curl http://localhost:4000/api/ingestion/metrics?provider=UberEats
```

## Common Tasks

### Add a New Provider

1. Create file `src/ingestion/providers/NewProvider.ts`:

```typescript
import { BaseProvider } from '../core/BaseProvider';
import { ProviderConfig, ScraperResult } from '../core/types';
import { Fetcher } from '../utils/fetcher';

export class NewProvider extends BaseProvider {
  private fetcher: Fetcher;

  constructor(config?: Partial<ProviderConfig>) {
    super({
      name: 'NewVendor',
      enabled: true,
      refreshInterval: '0 */6 * * *',
      rateLimit: { maxRequests: 10, perMilliseconds: 60000 },
      usePlaywright: false,
      timeout: 30000,
      ...config,
    });
    this.fetcher = new Fetcher();
  }

  async scrape(): Promise<ScraperResult> {
    const result = await this.fetcher.fetch('https://vendor.com/deals');

    if (!result.success || !result.$) {
      return { success: false, coupons: [], error: result.error, timestamp: new Date() };
    }

    const coupons = [];
    result.$('.deal').each((_i, elem) => {
      coupons.push({
        code: result.$(elem).find('.code').text().trim(),
        title: result.$(elem).find('.title').text().trim(),
        description: result.$(elem).find('.desc').text().trim(),
        vendor: 'NewVendor',
        discountType: 'other',
      });
    });

    return { success: true, coupons, timestamp: new Date() };
  }
}
```

2. Register in `src/ingestion/providers/index.ts`:

```typescript
import { NewProvider } from './NewProvider';

export function createDefaultProviders(): BaseProvider[] {
  return [
    new UberEatsProvider(),
    new DoorDashProvider(),
    new GrubHubProvider(),
    new NewProvider(), // Add here
  ];
}

export { NewProvider }; // Export here
```

3. Test it:

```bash
curl -X POST http://localhost:4000/api/ingestion/run \
  -H "Content-Type: application/json" \
  -d '{"provider": "NewVendor"}'
```

### Enable/Disable Providers

Providers are enabled/disabled in their constructors:

```typescript
new DoorDashProvider({ enabled: true }); // Enable
new GrubHubProvider({ enabled: false }); // Disable
```

### Change Refresh Schedule

Update the `refreshInterval` in provider config:

```typescript
new UberEatsProvider({
  refreshInterval: '0 */2 * * *', // Every 2 hours
});
```

Cron format: `minute hour day month weekday`

- `0 */4 * * *` - Every 4 hours
- `*/30 * * * *` - Every 30 minutes
- `0 0 * * *` - Daily at midnight

### View Logs

```bash
# Real-time logs
tail -f packages/backend/logs/ingestion-combined.log

# Errors only
tail -f packages/backend/logs/ingestion-error.log
```

### Query Coupons

```bash
# All coupons
curl http://localhost:4000/api/coupons

# By vendor
curl http://localhost:4000/api/coupons?vendor=UberEats

# Active only
curl http://localhost:4000/api/coupons?active=true

# Specific coupon
curl http://localhost:4000/api/coupons/<coupon-id>
```

## API Endpoints Reference

| Method | Endpoint                          | Description         |
| ------ | --------------------------------- | ------------------- |
| GET    | `/api/coupons`                    | List all coupons    |
| GET    | `/api/coupons/active`             | List active coupons |
| GET    | `/api/coupons/:id`                | Get coupon by ID    |
| GET    | `/api/ingestion/health`           | Health status       |
| GET    | `/api/ingestion/metrics`          | Performance metrics |
| GET    | `/api/ingestion/providers`        | List providers      |
| GET    | `/api/ingestion/scheduler/status` | Scheduler info      |
| POST   | `/api/ingestion/run`              | Trigger ingestion   |

## Troubleshooting

### Provider returns 0 coupons

- Check if website structure changed (update selectors)
- Try enabling Playwright: `usePlaywright: true`
- Check logs for HTTP errors

### Port already in use

```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use different port
PORT=4001 pnpm dev:backend
```

### Logs directory error

```bash
mkdir -p packages/backend/logs packages/backend/data/coupons
```

## Next Steps

- Read full documentation: [INGESTION.md](./INGESTION.md)
- Implement real scraping logic for DoorDash/GrubHub
- Connect frontend to API endpoints
- Add database for production use

## Getting Help

- Check logs in `packages/backend/logs/`
- Review [INGESTION.md](./INGESTION.md) for details
- Test with: `npx tsx test-ingestion.ts`
