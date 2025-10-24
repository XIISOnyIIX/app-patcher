# Seed Data Fixtures

This directory contains JSON fixtures for seeding the FoodDealSniper application with test data.

## Available Fixtures

### deals.json

Sample food deals from various vendors and cuisines. Includes:

- 15 diverse deals
- Multiple cuisines (Japanese, Italian, Mexican, Chinese, American)
- Various discount percentages (15% - 100%)
- Different tags and categories

### user-preferences.json

Sample user preference configurations for testing notification and filtering features:

- 3 different user profiles
- Various notification channel preferences
- Different cuisine preferences
- Varying discount thresholds

## Using Fixtures

### Backend Implementation

The backend automatically seeds deals on startup in `data-store.ts`. To load fixtures instead:

```typescript
import dealsFixture from '../../fixtures/deals.json';
import preferencesFixture from '../../fixtures/user-preferences.json';

// In data-store.ts
private seedDeals() {
  this.deals = dealsFixture.map(deal => ({
    ...deal,
    expiresAt: new Date(deal.expiresAt),
    createdAt: new Date(deal.createdAt),
  }));
}

private seedPreferences() {
  preferencesFixture.forEach(pref => {
    this.preferences.set(pref.userId, pref);
  });
}
```

### Manual Loading

You can also load fixtures manually via API:

```bash
# Load deals
curl -X POST http://localhost:4000/api/seed/deals \
  -H "Content-Type: application/json" \
  -d @fixtures/deals.json

# Load preferences
curl -X POST http://localhost:4000/api/seed/preferences \
  -H "Content-Type: application/json" \
  -d @fixtures/user-preferences.json
```

### E2E Testing

Fixtures are useful for consistent E2E test data:

```typescript
// In Playwright tests
import { test, expect } from '@playwright/test';
import deals from '../fixtures/deals.json';

test.beforeEach(async ({ request }) => {
  // Seed data before each test
  await request.post('http://localhost:4000/api/seed/deals', {
    data: deals,
  });
});
```

## Creating New Fixtures

When adding new fixtures:

1. Follow the existing JSON structure
2. Use ISO 8601 format for dates
3. Ensure IDs are unique
4. Add documentation to this README

## Fixture Structure

### Deal Object

```json
{
  "id": "string (unique)",
  "title": "string",
  "description": "string",
  "cuisine": "string",
  "vendor": "string",
  "discount": "number (0-100)",
  "expiresAt": "ISO 8601 date string",
  "tags": ["array", "of", "strings"],
  "createdAt": "ISO 8601 date string"
}
```

### User Preferences Object

```json
{
  "userId": "string (unique)",
  "notificationsEnabled": "boolean",
  "preferredCuisines": ["array", "of", "strings"],
  "minDiscountThreshold": "number (0-100)",
  "alertChannels": {
    "email": "boolean",
    "push": "boolean",
    "inApp": "boolean"
  }
}
```

## Production Use

**Warning:** These fixtures are for development and testing only. Do not use in production!

For production:

1. Use a proper database
2. Implement data migration scripts
3. Use environment-specific seed data
4. Follow data privacy regulations
