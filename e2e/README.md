# End-to-End Tests

This directory contains Playwright end-to-end tests for the FoodDealSniper application.

## Test Coverage

### Search and Filter (`search-and-filter.spec.ts`)

- Display deals on page load
- Search deals by text
- Add and remove tags
- Show/hide filter panel
- Filter by cuisine
- Filter by discount range
- Sort deals by different fields
- Toggle sort order
- Display deal count
- Show no results message

### Saved Searches (`saved-searches.spec.ts`)

- Save a search with filters
- Load a saved search
- Delete a saved search

### User Preferences (`preferences.spec.ts`)

- Open preferences modal
- Toggle notifications
- Select preferred cuisines
- Adjust discount threshold
- Toggle alert channels
- Save preferences
- Cancel without saving

### Live Alerts (`live-alerts.spec.ts`)

- Connect to SSE event stream
- Display toast container
- Handle new deal notifications
- Display time remaining badges
- Display discount badges

### User Journeys (`user-journey.spec.ts`)

- Complete flow: search → filter → save → preferences
- Discovery flow: browse → filter by cuisine → sort → track
- Power user flow: load saved search → adjust filters
- Quick search flow: search → sort → view results

## Running Tests

```bash
# Run all tests headless
pnpm test:e2e

# Run tests in UI mode (interactive)
pnpm test:e2e:ui

# Run specific test file
pnpm exec playwright test search-and-filter

# Run with specific browser
pnpm exec playwright test --project=chromium
```

## Test Configuration

The Playwright configuration is in `playwright.config.ts` at the project root. It automatically starts both the backend and frontend servers before running tests.

## Writing New Tests

1. Create a new `.spec.ts` file in the `e2e` directory
2. Import the test utilities: `import { test, expect } from '@playwright/test'`
3. Use `test.describe()` to group related tests
4. Use `test.beforeEach()` for common setup
5. Follow existing patterns for consistency
