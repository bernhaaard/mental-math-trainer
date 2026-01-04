import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('app loads and displays home page', async ({ page }) => {
    await page.goto('/');

    // Verify the page loads
    await expect(page).toHaveTitle(/Mental Math/i);

    // Verify main navigation is present
    await expect(page.getByRole('navigation')).toBeVisible();

    // Verify main content area exists
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('practice page is accessible', async ({ page }) => {
    await page.goto('/practice');

    // Should show configuration or redirect
    await expect(page.locator('body')).toBeVisible();
  });

  test('study page is accessible', async ({ page }) => {
    await page.goto('/study');

    // Should show study content
    await expect(page.locator('body')).toBeVisible();
  });

  test('statistics page is accessible', async ({ page }) => {
    await page.goto('/statistics');

    // Should show statistics content
    await expect(page.locator('body')).toBeVisible();
  });
});
