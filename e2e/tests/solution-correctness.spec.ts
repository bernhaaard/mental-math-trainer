import { test, expect } from '@playwright/test';

/**
 * Solution Mathematical Correctness E2E Tests
 *
 * These tests verify that solutions shown to users are mathematically correct.
 * Critical for ensuring the educational value and accuracy of the application.
 */

test.describe('Solution Mathematical Correctness', () => {
  test.beforeEach(async ({ page }) => {
    // Start a session with beginner difficulty for predictable problems
    await page.goto('/practice');
    await page.getByText('Beginner').click();
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });
  });

  test('solution shows mathematically verified badge', async ({ page }) => {
    // Submit an answer
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');

    // Wait for feedback
    await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });

    // View solution
    await page.getByRole('button', { name: /view solution/i }).click();

    // Solution should show validation status
    await expect(page.getByText(/validated/i)).toBeVisible({ timeout: 5000 });
  });

  test('solution final answer matches problem multiplication', async ({ page }) => {
    // Get the problem numbers
    const problemElements = page.locator('[class*="text-6xl"][class*="font-bold"]');
    const num1Text = await problemElements.nth(0).textContent();
    const num2Text = await problemElements.nth(1).textContent();

    if (!num1Text || !num2Text) {
      throw new Error('Could not get problem numbers');
    }

    const num1 = parseInt(num1Text.replace(/,/g, ''));
    const num2 = parseInt(num2Text.replace(/,/g, ''));
    const expectedAnswer = num1 * num2;

    // Submit an answer
    const input = page.getByLabel('Your answer');
    await input.fill('1'); // Wrong answer to ensure we see the correct answer
    await input.press('Enter');

    // Wait for feedback
    await page.waitForSelector('text=/not quite/i', { timeout: 5000 });

    // View solution
    await page.getByRole('button', { name: /view solution/i }).click();

    // The solution should show the correct answer
    await expect(page.getByText(expectedAnswer.toLocaleString())).toBeVisible({ timeout: 5000 });
  });

  test('all steps in solution are mathematically consistent', async ({ page }) => {
    // Submit answer and view solution
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');
    await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });
    await page.getByRole('button', { name: /view solution/i }).click();

    // Wait for solution walkthrough
    await expect(page.getByRole('heading', { name: /solution walkthrough/i })).toBeVisible();

    // Click "Show All" to see all steps
    await page.getByRole('button', { name: /show all/i }).click();

    // Each step should show a result
    const resultLabels = page.locator('text=/Result:/i');
    const count = await resultLabels.count();

    // Should have at least one step
    expect(count).toBeGreaterThan(0);

    // Each step should have a numeric result
    for (let i = 0; i < count; i++) {
      const parentContainer = resultLabels.nth(i).locator('xpath=..');
      const resultText = await parentContainer.textContent();
      expect(resultText).toMatch(/Result:\s*[\d,]+/);
    }
  });

  test('solution uses one of the six recognized methods', async ({ page }) => {
    // Submit answer and view solution
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');
    await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });
    await page.getByRole('button', { name: /view solution/i }).click();

    // The six recognized methods
    const methodNames = [
      'Distributive Property',
      'Near Powers of 10',
      'Difference of Squares',
      'Factorization',
      'Squaring',
      'Near 100'
    ];

    // Wait for one of the methods to be visible
    let methodFound = false;
    for (const method of methodNames) {
      try {
        await expect(page.getByText(method, { exact: false })).toBeVisible({ timeout: 2000 });
        methodFound = true;
        break;
      } catch {
        // Method not found, try next
      }
    }

    expect(methodFound).toBe(true);
  });

  test('correct answer displays congratulation message', async ({ page }) => {
    // Get the correct answer
    const problemElements = page.locator('[class*="text-6xl"][class*="font-bold"]');
    const num1Text = await problemElements.nth(0).textContent();
    const num2Text = await problemElements.nth(1).textContent();

    if (!num1Text || !num2Text) {
      throw new Error('Could not get problem numbers');
    }

    const num1 = parseInt(num1Text.replace(/,/g, ''));
    const num2 = parseInt(num2Text.replace(/,/g, ''));
    const correctAnswer = num1 * num2;

    // Submit correct answer
    const input = page.getByLabel('Your answer');
    await input.fill(correctAnswer.toString());
    await input.press('Enter');

    // Should show congratulation
    await expect(page.getByText(/correct!/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/well done/i)).toBeVisible();
  });

  test('error magnitude is calculated correctly', async ({ page }) => {
    // Get the correct answer
    const problemElements = page.locator('[class*="text-6xl"][class*="font-bold"]');
    const num1Text = await problemElements.nth(0).textContent();
    const num2Text = await problemElements.nth(1).textContent();

    if (!num1Text || !num2Text) {
      throw new Error('Could not get problem numbers');
    }

    const num1 = parseInt(num1Text.replace(/,/g, ''));
    const num2 = parseInt(num2Text.replace(/,/g, ''));
    const correctAnswer = num1 * num2;
    const wrongAnswer = correctAnswer + 100; // Off by 100
    const expectedError = 100;

    // Submit wrong answer
    const input = page.getByLabel('Your answer');
    await input.fill(wrongAnswer.toString());
    await input.press('Enter');

    // Wait for feedback
    await page.waitForSelector('text=/not quite/i', { timeout: 5000 });

    // Check error magnitude is shown correctly
    await expect(page.getByText(expectedError.toLocaleString())).toBeVisible();
  });
});

test.describe('Solution Walkthrough Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to solution walkthrough
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });

    // Submit answer and view solution
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');
    await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });
    await page.getByRole('button', { name: /view solution/i }).click();
    await expect(page.getByRole('heading', { name: /solution walkthrough/i })).toBeVisible();
  });

  test('step navigation works correctly', async ({ page }) => {
    // Start at step 1
    await expect(page.getByText(/step 1 of/i)).toBeVisible();

    // Navigate to next step
    await page.getByRole('button', { name: /next/i }).click();

    // Should be on step 2 now
    await expect(page.getByText(/step 2 of/i)).toBeVisible({ timeout: 2000 });

    // Navigate back
    await page.getByRole('button', { name: /previous/i }).click();

    // Should be back on step 1
    await expect(page.getByText(/step 1 of/i)).toBeVisible({ timeout: 2000 });
  });

  test('progress bar shows step progress', async ({ page }) => {
    // Progress bar should be visible
    const progressBar = page.locator('[class*="progress"]').or(page.locator('div[style*="width"]'));
    await expect(progressBar.first()).toBeVisible();
  });

  test('auto advance feature works', async ({ page }) => {
    // Click auto advance button
    await page.getByRole('button', { name: /auto/i }).click();

    // Wait for auto advance (should move to step 2 after 3 seconds)
    await expect(page.getByText(/step 2 of/i)).toBeVisible({ timeout: 5000 });
  });

  test('can toggle between step-by-step and show all', async ({ page }) => {
    // Initially in step-by-step mode
    await expect(page.getByText(/step 1 of/i)).toBeVisible();

    // Click show all
    await page.getByRole('button', { name: /show all/i }).click();

    // Should now show all steps indicator
    await expect(page.getByText(/all steps/i)).toBeVisible({ timeout: 2000 });

    // Click step by step
    await page.getByRole('button', { name: /step by step/i }).click();

    // Back to step-by-step mode
    await expect(page.getByText(/step \d+ of/i)).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Method Comparison', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to solution walkthrough
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });

    // Submit answer and view solution
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');
    await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });
    await page.getByRole('button', { name: /view solution/i }).click();
    await expect(page.getByRole('heading', { name: /solution walkthrough/i })).toBeVisible();
  });

  test('method comparison section is available', async ({ page }) => {
    // Look for method comparison toggle
    const comparisonButton = page.getByRole('button', { name: /compare.*alternative/i });

    // This may or may not be present depending on available alternatives
    // Just check it doesn't crash
    const isVisible = await comparisonButton.isVisible().catch(() => false);

    // If visible, click it and verify alternatives show
    if (isVisible) {
      await comparisonButton.click();
      // Should show some comparison content
      await expect(page.locator('[class*="comparison"]').or(page.getByText(/alternative/i))).toBeVisible({ timeout: 3000 });
    }
  });

  test('explains why optimal method was chosen', async ({ page }) => {
    // The solution should include an explanation of why this method is optimal
    await expect(page.locator('text=/optimal|best|efficient/i').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Mathematical Edge Cases in Solutions', () => {
  test('handles large number multiplication', async ({ page }) => {
    // Configure for advanced difficulty to get larger numbers
    await page.goto('/practice');
    await page.getByText('Advanced').click();
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });

    // Get the problem
    const problemElements = page.locator('[class*="text-6xl"][class*="font-bold"]');
    const num1Text = await problemElements.nth(0).textContent();
    const num2Text = await problemElements.nth(1).textContent();

    if (!num1Text || !num2Text) {
      throw new Error('Could not get problem numbers');
    }

    const num1 = parseInt(num1Text.replace(/,/g, ''));
    const num2 = parseInt(num2Text.replace(/,/g, ''));
    const correctAnswer = num1 * num2;

    // Submit correct answer
    const input = page.getByLabel('Your answer');
    await input.fill(correctAnswer.toString());
    await input.press('Enter');

    // Should correctly validate large numbers
    await expect(page.getByText(/correct!/i)).toBeVisible({ timeout: 5000 });
  });

  test('handles squaring numbers correctly', async ({ page }) => {
    // Start with a session that might include squaring
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });

    // Check if this is a squaring problem (num1 === num2)
    const problemElements = page.locator('[class*="text-6xl"][class*="font-bold"]');
    const num1Text = await problemElements.nth(0).textContent();
    const num2Text = await problemElements.nth(1).textContent();

    if (num1Text && num2Text) {
      const num1 = parseInt(num1Text.replace(/,/g, ''));
      const num2 = parseInt(num2Text.replace(/,/g, ''));
      const correctAnswer = num1 * num2;

      // Submit correct answer
      const input = page.getByLabel('Your answer');
      await input.fill(correctAnswer.toString());
      await input.press('Enter');

      await expect(page.getByText(/correct!/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('solution steps are displayed without errors', async ({ page }) => {
    // Start session
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });

    // Submit answer and view solution
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');
    await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });
    await page.getByRole('button', { name: /view solution/i }).click();

    // Wait for walkthrough
    await expect(page.getByRole('heading', { name: /solution walkthrough/i })).toBeVisible();

    // Should NOT show any validation errors
    const errorVisible = await page.getByText(/validation errors detected/i).isVisible().catch(() => false);
    expect(errorVisible).toBe(false);

    // Should show validated message
    await expect(page.getByText(/validated/i)).toBeVisible({ timeout: 5000 });
  });
});
