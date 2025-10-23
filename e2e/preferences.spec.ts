import { test, expect } from '@playwright/test';

test.describe('User Preferences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("FoodDealSniper")');
  });

  test('should open preferences modal', async ({ page }) => {
    await page.locator('button:has-text("Preferences")').click();
    await expect(page.locator('text=User Preferences')).toBeVisible();
  });

  test('should toggle notifications', async ({ page }) => {
    await page.locator('button:has-text("Preferences")').click();

    const notificationToggle = page.locator('input[type="checkbox"].toggle').first();
    const initialState = await notificationToggle.isChecked();

    await notificationToggle.click();

    const newState = await notificationToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should select preferred cuisines', async ({ page }) => {
    await page.locator('button:has-text("Preferences")').click();

    await page.waitForSelector('text=Preferred Cuisines');

    const cuisineCheckbox = page
      .locator('label:has-text("Italian")')
      .locator('input[type="checkbox"]')
      .first();
    await cuisineCheckbox.check();

    expect(await cuisineCheckbox.isChecked()).toBe(true);
  });

  test('should adjust discount threshold', async ({ page }) => {
    await page.locator('button:has-text("Preferences")').click();

    const slider = page.locator('input[type="range"]');
    await slider.fill('30');

    await expect(page.locator('.badge:has-text("30%")')).toBeVisible();
  });

  test('should toggle alert channels', async ({ page }) => {
    await page.locator('button:has-text("Preferences")').click();

    const emailCheckbox = page.locator('label:has-text("Email notifications") input');
    await emailCheckbox.check();

    expect(await emailCheckbox.isChecked()).toBe(true);
  });

  test('should save preferences', async ({ page }) => {
    await page.locator('button:has-text("Preferences")').click();

    const slider = page.locator('input[type="range"]');
    await slider.fill('25');

    await page.locator('.modal button:has-text("Save")').click();

    await page.waitForTimeout(500);

    await expect(page.locator('text=User Preferences')).not.toBeVisible();
  });

  test('should close preferences without saving', async ({ page }) => {
    await page.locator('button:has-text("Preferences")').click();

    await page.locator('.modal button:has-text("Cancel")').click();

    await expect(page.locator('text=User Preferences')).not.toBeVisible();
  });
});
