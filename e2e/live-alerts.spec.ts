import { test, expect } from '@playwright/test';

test.describe('Live Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("FoodDealSniper")');
  });

  test('should connect to event stream', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    const hasConnectionLog = consoleLogs.some((log) => log.includes('Connected to live alerts'));
    expect(hasConnectionLog).toBe(true);
  });

  test('should display toast container', async ({ page }) => {
    await expect(page.locator('.Toastify')).toBeAttached();
  });

  test('should handle new deal notifications', async ({ page }) => {
    await page.evaluate(() => {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'new-deal') {
          console.log('Received new deal notification');
        }
      });
    });

    await page.waitForTimeout(2000);
  });

  test('deal cards should be clickable', async ({ page }) => {
    await page.waitForSelector('article.card');

    const trackButton = page.locator('button:has-text("Track deal")').first();
    await expect(trackButton).toBeVisible();
    await trackButton.click();
  });

  test('should display time remaining badges', async ({ page }) => {
    await page.waitForSelector('article.card');

    const badges = page.locator('.badge-accent, .badge-warning');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display discount badges', async ({ page }) => {
    await page.waitForSelector('article.card');

    const discountBadges = page.locator('.badge-primary:has-text("% OFF")');
    const count = await discountBadges.count();
    expect(count).toBeGreaterThan(0);
  });
});
