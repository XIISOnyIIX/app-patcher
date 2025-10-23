import { test, expect } from '@playwright/test';

test.describe('Saved Searches', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("FoodDealSniper")');
  });

  test('should save a search', async ({ page }) => {
    await page.locator('button:has-text("Show Filters")').click();
    await page.waitForSelector('text=Saved Searches');

    const searchInput = page.locator('input[placeholder*="Search deals"]');
    await searchInput.fill('pizza');
    await page.locator('button:has-text("Search")').click();

    await page.waitForTimeout(500);

    const saveBtn = page.locator('button:has-text("Save Current")');
    await saveBtn.click();

    await expect(page.locator('text=Save Search')).toBeVisible();

    const nameInput = page.locator('input[placeholder*="Weekend Pizza"]');
    await nameInput.fill('My Pizza Search');

    await page.locator('.modal button:has-text("Save")').click();

    await page.waitForTimeout(500);

    await expect(page.locator('text=My Pizza Search')).toBeVisible();
  });

  test('should load a saved search', async ({ page }) => {
    await page.locator('button:has-text("Show Filters")').click();

    const saveBtn = page.locator('button:has-text("Save Current")');
    await saveBtn.click();

    const nameInput = page.locator('input[placeholder*="Weekend Pizza"]');
    await nameInput.fill('Test Search');
    await page.locator('.modal button:has-text("Save")').click();

    await page.waitForTimeout(500);

    const loadBtn = page.locator('button:has-text("Load")').first();
    await loadBtn.click();

    await page.waitForTimeout(1000);

    await expect(page.locator('article.card').first()).toBeVisible();
  });

  test('should delete a saved search', async ({ page }) => {
    await page.locator('button:has-text("Show Filters")').click();

    const saveBtn = page.locator('button:has-text("Save Current")');
    await saveBtn.click();

    const nameInput = page.locator('input[placeholder*="Weekend Pizza"]');
    await nameInput.fill('To Delete');
    await page.locator('.modal button:has-text("Save")').click();

    await page.waitForTimeout(500);

    const deleteBtn = page.locator('button:has-text("Delete")').first();
    await deleteBtn.click();

    await page.waitForTimeout(500);

    await expect(page.locator('text=To Delete')).not.toBeVisible();
  });
});
