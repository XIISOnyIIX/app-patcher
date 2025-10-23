import { test, expect } from '@playwright/test';

test.describe('Search and Filter Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("FoodDealSniper")');
  });

  test('should display deals on page load', async ({ page }) => {
    await page.waitForSelector('[class*="card"]', { timeout: 10000 });
    const dealCards = page.locator('article.card');
    const count = await dealCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should search for deals by text', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search deals"]');
    await searchInput.fill('sushi');
    await page.locator('button:has-text("Search")').click();

    await page.waitForTimeout(1000);

    const dealCards = page.locator('article.card');
    const count = await dealCards.count();

    if (count > 0) {
      const firstCard = dealCards.first();
      const cardText = await firstCard.textContent();
      expect(cardText?.toLowerCase()).toContain('sushi');
    }
  });

  test('should add and remove tags', async ({ page }) => {
    await page.locator('button:has-text("+ Add Tag")').click();
    await page.waitForSelector('.dropdown-content');

    const firstTag = page.locator('.dropdown-content li').first();
    await firstTag.click();

    const selectedTags = page.locator('.badge-primary');
    await expect(selectedTags).toHaveCount(1);

    await selectedTags.locator('button').click();
    await expect(selectedTags).toHaveCount(0);
  });

  test('should show and hide filters', async ({ page }) => {
    const showFiltersBtn = page.locator('button:has-text("Show Filters")');
    await showFiltersBtn.click();

    await expect(page.locator('text=Filters')).toBeVisible();

    await page.locator('button:has-text("Hide Filters")').click();
    await expect(page.locator('text=Filters')).not.toBeVisible();
  });

  test('should filter by cuisine', async ({ page }) => {
    await page.locator('button:has-text("Show Filters")').click();
    await page.waitForSelector('text=Cuisine');

    const firstCuisineCheckbox = page.locator('label:has-text("Japanese") input[type="checkbox"]');
    await firstCuisineCheckbox.check();

    await page.waitForTimeout(1000);

    const dealCards = page.locator('article.card');
    const count = await dealCards.count();

    if (count > 0) {
      const firstCard = dealCards.first();
      await expect(firstCard.locator('.badge-outline:has-text("Japanese")')).toBeVisible();
    }
  });

  test('should filter by discount range', async ({ page }) => {
    await page.locator('button:has-text("Show Filters")').click();

    const minDiscountInput = page.locator('input[type="number"]').first();
    await minDiscountInput.fill('40');

    await page.waitForTimeout(1000);

    const dealCards = page.locator('article.card');
    const count = await dealCards.count();

    if (count > 0) {
      const firstCard = dealCards.first();
      const discountBadge = firstCard.locator('.badge-primary');
      const discountText = await discountBadge.textContent();
      const discountValue = parseInt(discountText || '0');
      expect(discountValue).toBeGreaterThanOrEqual(40);
    }
  });

  test('should sort deals', async ({ page }) => {
    const sortSelect = page.locator('select.select');
    await sortSelect.selectOption('discount');

    await page.waitForTimeout(1000);

    const dealCards = page.locator('article.card');
    const count = await dealCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should toggle sort order', async ({ page }) => {
    const sortOrderBtn = page.locator('button:has-text("↓")');
    await sortOrderBtn.click();

    await expect(page.locator('button:has-text("↑")')).toBeVisible();
  });

  test('should display deal count', async ({ page }) => {
    const dealCount = page.locator('text=/\\d+ deals? found/');
    await expect(dealCount).toBeVisible();
  });

  test('should show no results message when filters match nothing', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search deals"]');
    await searchInput.fill('xyznonexistent123');
    await page.locator('button:has-text("Search")').click();

    await page.waitForTimeout(1000);

    await expect(page.locator('text=No deals found')).toBeVisible();
  });
});
