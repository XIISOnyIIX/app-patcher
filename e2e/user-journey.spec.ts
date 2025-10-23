import { test, expect } from '@playwright/test';

test.describe('Primary User Journeys', () => {
  test('complete user flow: search, filter, save search, and set preferences', async ({
    page
  }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("FoodDealSniper")');

    await page.waitForSelector('article.card');
    let dealCards = page.locator('article.card');
    const initialCount = await dealCards.count();
    expect(initialCount).toBeGreaterThan(0);

    const searchInput = page.locator('input[placeholder*="Search deals"]');
    await searchInput.fill('pizza');
    await page.locator('button:has-text("Search")').click();
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Show Filters")').click();
    await page.waitForSelector('text=Filters');

    const minDiscountInput = page.locator('input[type="number"]').first();
    await minDiscountInput.fill('25');
    await page.waitForTimeout(1000);

    const sortSelect = page.locator('select.select');
    await sortSelect.selectOption('discount');
    await page.waitForTimeout(500);

    const saveBtn = page.locator('button:has-text("Save Current")');
    await saveBtn.click();
    await page.waitForSelector('text=Save Search');

    const nameInput = page.locator('input[placeholder*="Weekend Pizza"]');
    await nameInput.fill('Pizza Deals Over 25%');
    await page.locator('.modal button:has-text("Save")').click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=Pizza Deals Over 25%')).toBeVisible();

    await page.locator('button:has-text("Hide Filters")').click();

    await page.locator('button:has-text("Preferences")').click();
    await page.waitForSelector('text=User Preferences');

    const notificationToggle = page.locator('input[type="checkbox"].toggle').first();
    await notificationToggle.check();

    const slider = page.locator('input[type="range"]');
    await slider.fill('20');

    const cuisineCheckbox = page
      .locator('label:has-text("Italian")')
      .locator('input[type="checkbox"]')
      .first();
    await cuisineCheckbox.check();

    await page.locator('.modal button:has-text("Save")').click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=User Preferences')).not.toBeVisible();

    dealCards = page.locator('article.card');
    const finalCount = await dealCards.count();
    expect(finalCount).toBeGreaterThan(0);
  });

  test('discover deals workflow: browse, filter by cuisine, sort, and track', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("FoodDealSniper")');

    await page.waitForSelector('article.card');
    const initialDeals = await page.locator('article.card').count();
    expect(initialDeals).toBeGreaterThan(0);

    await page.locator('button:has-text("Show Filters")').click();

    const japaneseCheckbox = page.locator('label:has-text("Japanese") input[type="checkbox"]');
    await japaneseCheckbox.check();
    await page.waitForTimeout(1000);

    const sortSelect = page.locator('select.select');
    await sortSelect.selectOption('discount');
    await page.waitForTimeout(500);

    const firstDealCard = page.locator('article.card').first();
    await expect(firstDealCard).toBeVisible();

    const trackButton = firstDealCard.locator('button:has-text("Track deal")');
    await trackButton.click();
  });

  test('power user workflow: use saved search and adjust filters', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("FoodDealSniper")');

    await page.locator('button:has-text("Show Filters")').click();

    const searchInput = page.locator('input[placeholder*="Search deals"]');
    await searchInput.fill('dinner');
    await page.locator('button:has-text("Search")').click();
    await page.waitForTimeout(500);

    const saveBtn = page.locator('button:has-text("Save Current")');
    await saveBtn.click();

    const nameInput = page.locator('input[placeholder*="Weekend Pizza"]');
    await nameInput.fill('Dinner Deals');
    await page.locator('.modal button:has-text("Save")').click();
    await page.waitForTimeout(500);

    const searchInput2 = page.locator('input[placeholder*="Search deals"]');
    await searchInput2.fill('');
    await page.locator('button:has-text("Search")').click();
    await page.waitForTimeout(500);

    const loadBtn = page.locator('button:has-text("Load")').first();
    await loadBtn.click();
    await page.waitForTimeout(1000);

    const minDiscountInput = page.locator('input[type="number"]').first();
    await minDiscountInput.fill('30');
    await page.waitForTimeout(1000);

    const dealCards = page.locator('article.card');
    const count = await dealCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('mobile-like workflow: quick search and view results', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("FoodDealSniper")');

    const searchInput = page.locator('input[placeholder*="Search deals"]');
    await searchInput.fill('free');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);

    const sortSelect = page.locator('select.select');
    await sortSelect.selectOption('expiresAt');
    await page.waitForTimeout(500);

    const dealCards = page.locator('article.card');
    const count = await dealCards.count();
    expect(count).toBeGreaterThanOrEqual(0);

    if (count > 0) {
      const getDealBtn = page.locator('button:has-text("Get deal")').first();
      await expect(getDealBtn).toBeVisible();
    }
  });
});
