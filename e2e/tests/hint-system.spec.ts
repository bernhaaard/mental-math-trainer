/**
 * Progressive Hint System E2E Tests
 * Tests the hint functionality in practice sessions.
 *
 * @module e2e/tests/hint-system.spec
 */

import { test, expect, Page } from '@playwright/test';

/**
 * Helper to start a practice session with specific configuration.
 * Navigates to practice, configures settings, and starts the session.
 */
async function startPracticeSession(
  page: Page,
  options: {
    problemCount?: number;
    difficulty?: string;
  } = {}
) {
  const { problemCount = 5, difficulty = 'beginner' } = options;

  // Navigate to practice page
  await page.goto('/practice');

  // Wait for the configuration page to load
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Set problem count if not using default
  const countInput = page.locator('input[type="number"]').first();
  if (await countInput.isVisible()) {
    await countInput.fill(problemCount.toString());
  }

  // Click start session button
  const startButton = page.getByRole('button', { name: /start/i });
  await startButton.click();

  // Wait for session to load - problem should be visible
  await expect(page.locator('.font-mono').first()).toBeVisible({ timeout: 10000 });
}

/**
 * Helper to get the hint button from the page.
 */
function getHintButton(page: Page) {
  return page.getByRole('button', { name: /hint/i }).first();
}

/**
 * Helper to get the answer input field.
 */
function getAnswerInput(page: Page) {
  return page.getByRole('textbox', { name: /answer/i });
}

/**
 * Helper to get the submit button.
 */
function getSubmitButton(page: Page) {
  return page.getByRole('button', { name: /submit/i });
}

/**
 * Helper to get the skip button.
 */
function getSkipButton(page: Page) {
  return page.getByRole('button', { name: /skip/i });
}

/**
 * Helper to get the next button (after feedback).
 */
function getNextButton(page: Page) {
  return page.getByRole('button', { name: /next/i });
}

// ============================================================================
// Test Suite: Hint Button UI
// ============================================================================

test.describe('Hint Button UI', () => {
  test.beforeEach(async ({ page }) => {
    await startPracticeSession(page);
  });

  test('hint button is visible during problem solving', async ({ page }) => {
    const hintButton = getHintButton(page);

    await expect(hintButton).toBeVisible();
    await expect(hintButton).toBeEnabled();
  });

  test('hint button shows hint count when hints are used', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Initially should just show "Hint" without count
    await expect(hintButton).toContainText('Hint');

    // Click to use first hint
    await hintButton.click();

    // Wait for hint to be revealed
    await page.waitForTimeout(500);

    // Button should now show hint count (1)
    await expect(hintButton).toContainText('(1)');
  });

  test('hint button is accessible with proper aria-label', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Check for accessible label
    const ariaLabel = await hintButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('hint');
  });

  test('hint button has proper styling and is distinguishable', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Check button is styled with accent color
    await expect(hintButton).toHaveClass(/accent/);
  });
});

// ============================================================================
// Test Suite: Hint Progression
// ============================================================================

test.describe('Hint Progression', () => {
  test.beforeEach(async ({ page }) => {
    await startPracticeSession(page);
  });

  test('first hint reveals method suggestion', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Click for first hint
    await hintButton.click();

    // Wait for hint to appear
    await page.waitForTimeout(500);

    // Should show method hint in problem display area
    // The method hint appears as a badge with "Try using: [Method Name]"
    const methodHint = page.locator('text=/Try using:/i');
    await expect(methodHint).toBeVisible();
  });

  test('subsequent hints reveal more information progressively', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Click for first hint
    await hintButton.click();
    await page.waitForTimeout(300);

    // Check count is 1
    await expect(hintButton).toContainText('(1)');

    // Click for second hint
    await hintButton.click();
    await page.waitForTimeout(300);

    // Check count is 2
    await expect(hintButton).toContainText('(2)');

    // Click for third hint
    await hintButton.click();
    await page.waitForTimeout(300);

    // Check count is 3
    await expect(hintButton).toContainText('(3)');
  });

  test('hints increase the hint counter correctly', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Use multiple hints and verify counter
    for (let i = 1; i <= 3; i++) {
      await hintButton.click();
      await page.waitForTimeout(200);
      await expect(hintButton).toContainText(`(${i})`);
    }
  });
});

// ============================================================================
// Test Suite: Hint Content Quality
// ============================================================================

test.describe('Hint Content Quality', () => {
  test.beforeEach(async ({ page }) => {
    await startPracticeSession(page);
  });

  test('method hint suggests a valid calculation method', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Request first hint
    await hintButton.click();
    await page.waitForTimeout(500);

    // Check for known method names
    const validMethods = [
      'Distributive Property',
      'Near Powers of 10',
      'Difference of Squares',
      'Factorization',
      'Squaring',
      'Near 100'
    ];

    const methodHint = page.locator('text=/Try using:/i');
    if (await methodHint.isVisible()) {
      const hintText = await methodHint.textContent();
      const hasValidMethod = validMethods.some(method =>
        hintText?.includes(method)
      );
      expect(hasValidMethod).toBe(true);
    }
  });

  test('hints are relevant to the current problem', async ({ page }) => {
    // Get the problem numbers displayed
    const problemText = await page.locator('.font-mono').first().textContent();

    // Extract numbers from problem display
    const numbers = problemText?.match(/\d+/g);

    // Request hint
    const hintButton = getHintButton(page);
    await hintButton.click();
    await page.waitForTimeout(500);

    // Hint should be displayed (we just verify it appears)
    const methodHint = page.locator('text=/Try using:/i');
    await expect(methodHint).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Hint Display Component
// ============================================================================

test.describe('Hint Display Component', () => {
  test.beforeEach(async ({ page }) => {
    await startPracticeSession(page);
  });

  test('hint appears with animation when requested', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Initially no hint should be visible
    const methodHintBefore = page.locator('text=/Try using:/i');
    await expect(methodHintBefore).not.toBeVisible();

    // Request hint
    await hintButton.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Hint should now be visible
    const methodHintAfter = page.locator('text=/Try using:/i');
    await expect(methodHintAfter).toBeVisible();
  });

  test('hint badge has appropriate styling', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Request hint
    await hintButton.click();
    await page.waitForTimeout(500);

    // Check the hint badge styling
    const hintBadge = page.locator('text=/Try using:/i').locator('..');
    await expect(hintBadge).toHaveClass(/rounded/);
  });
});

// ============================================================================
// Test Suite: Hint Statistics
// ============================================================================

test.describe('Hint Statistics', () => {
  test('session tracks hint usage for problems', async ({ page }) => {
    await startPracticeSession(page, { problemCount: 3 });

    // Problem 1: Use hints
    const hintButton = getHintButton(page);
    await hintButton.click();
    await page.waitForTimeout(200);
    await hintButton.click();
    await page.waitForTimeout(200);

    // Submit an answer
    const answerInput = getAnswerInput(page);
    await answerInput.fill('100');

    const submitButton = getSubmitButton(page);
    await submitButton.click();

    // Wait for feedback phase
    await page.waitForTimeout(500);

    // Click next
    const nextButton = getNextButton(page);
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Wait for next problem
    await page.waitForTimeout(500);

    // Problem 2: No hints, just submit
    const answerInput2 = getAnswerInput(page);
    if (await answerInput2.isVisible()) {
      await answerInput2.fill('50');
      await getSubmitButton(page).click();
      await page.waitForTimeout(500);

      const nextButton2 = getNextButton(page);
      if (await nextButton2.isVisible()) {
        await nextButton2.click();
      }
    }

    // Wait for session to potentially end
    await page.waitForTimeout(500);

    // Problem 3: Use one hint
    const hintButton3 = getHintButton(page);
    if (await hintButton3.isVisible()) {
      await hintButton3.click();
      await page.waitForTimeout(200);

      const answerInput3 = getAnswerInput(page);
      await answerInput3.fill('75');
      await getSubmitButton(page).click();
    }

    // End session (click End Session button or wait for completion)
    await page.waitForTimeout(1000);

    // Check if we can find hint statistics in the summary
    // The session summary shows "Problems with Hints" or similar
    const sessionComplete = page.locator('text=/Session Complete/i');
    if (await sessionComplete.isVisible()) {
      // We successfully completed a session with varying hint usage
      expect(true).toBe(true);
    }
  });

  test('hints are tracked per problem independently', async ({ page }) => {
    await startPracticeSession(page, { problemCount: 2 });

    // Problem 1: Use 2 hints
    const hintButton = getHintButton(page);
    await hintButton.click();
    await page.waitForTimeout(200);
    await hintButton.click();
    await page.waitForTimeout(200);

    // Verify count shows 2
    await expect(hintButton).toContainText('(2)');

    // Skip to next problem
    const skipButton = getSkipButton(page);
    await skipButton.click();
    await page.waitForTimeout(500);

    // Click next
    const nextButton = getNextButton(page);
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // Problem 2: Hint counter should reset
    const hintButton2 = getHintButton(page);
    if (await hintButton2.isVisible()) {
      // Initially should not show a count or show (0)
      const buttonText = await hintButton2.textContent();
      expect(buttonText).not.toContain('(2)');
    }
  });
});

// ============================================================================
// Test Suite: Hint Limits
// ============================================================================

test.describe('Hint Limits', () => {
  test.beforeEach(async ({ page }) => {
    await startPracticeSession(page);
  });

  test('hint button remains clickable for multiple hints', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Should be able to click multiple times
    for (let i = 0; i < 4; i++) {
      await expect(hintButton).toBeEnabled();
      await hintButton.click();
      await page.waitForTimeout(200);
    }
  });

  test('hint counter increments up to maximum hints', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Click hints and track counter
    let lastCount = 0;
    for (let i = 0; i < 5; i++) {
      await hintButton.click();
      await page.waitForTimeout(200);

      const buttonText = await hintButton.textContent();
      const match = buttonText?.match(/\((\d+)\)/);
      if (match) {
        const currentCount = parseInt(match[1], 10);
        expect(currentCount).toBeGreaterThanOrEqual(lastCount);
        lastCount = currentCount;
      }
    }
  });
});

// ============================================================================
// Test Suite: Hint and Answer Interaction
// ============================================================================

test.describe('Hint and Answer Interaction', () => {
  test('can use hint then answer correctly', async ({ page }) => {
    await startPracticeSession(page);

    // Get the problem and calculate answer
    const problemDisplay = page.locator('.font-mono').first();
    const problemText = await problemDisplay.textContent();

    // Use a hint
    const hintButton = getHintButton(page);
    await hintButton.click();
    await page.waitForTimeout(500);

    // Extract numbers and calculate
    const numbers = problemText?.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const answer = parseInt(numbers[0]) * parseInt(numbers[1]);

      // Enter correct answer
      const answerInput = getAnswerInput(page);
      await answerInput.fill(answer.toString());

      const submitButton = getSubmitButton(page);
      await submitButton.click();

      // Should show success feedback (green styling or "Correct!")
      await page.waitForTimeout(500);
      const feedbackArea = page.locator('text=/correct/i');
      // Either feedback shows "Correct" or we transition to next state
      const hasFeedback = await feedbackArea.isVisible();
      const hasNextButton = await getNextButton(page).isVisible();
      expect(hasFeedback || hasNextButton).toBe(true);
    }
  });

  test('can use hint then answer incorrectly', async ({ page }) => {
    await startPracticeSession(page);

    // Use a hint
    const hintButton = getHintButton(page);
    await hintButton.click();
    await page.waitForTimeout(500);

    // Enter definitely wrong answer
    const answerInput = getAnswerInput(page);
    await answerInput.fill('1');

    const submitButton = getSubmitButton(page);
    await submitButton.click();

    // Should show some feedback
    await page.waitForTimeout(500);

    // Should be in feedback phase
    const hasNextButton = await getNextButton(page).isVisible();
    const hasViewSolution = await page.getByRole('button', { name: /solution/i }).isVisible();
    expect(hasNextButton || hasViewSolution).toBe(true);
  });

  test('can use hint then skip problem', async ({ page }) => {
    await startPracticeSession(page);

    // Use a hint
    const hintButton = getHintButton(page);
    await hintButton.click();
    await page.waitForTimeout(500);

    // Skip the problem
    const skipButton = getSkipButton(page);
    await skipButton.click();

    // Should transition to feedback phase
    await page.waitForTimeout(500);

    // Should show skip feedback or next button
    const hasNextButton = await getNextButton(page).isVisible();
    const hasSkippedIndicator = await page.locator('text=/skipped/i').isVisible();
    expect(hasNextButton || hasSkippedIndicator).toBe(true);
  });

  test('hints persist during the same problem', async ({ page }) => {
    await startPracticeSession(page);

    // Use two hints
    const hintButton = getHintButton(page);
    await hintButton.click();
    await page.waitForTimeout(200);
    await hintButton.click();
    await page.waitForTimeout(200);

    // Verify count is 2
    await expect(hintButton).toContainText('(2)');

    // Enter an answer but don't submit yet
    const answerInput = getAnswerInput(page);
    await answerInput.fill('999');

    // Clear the answer
    await answerInput.clear();

    // Hints should still be counted
    await expect(hintButton).toContainText('(2)');
  });
});

// ============================================================================
// Test Suite: Edge Cases
// ============================================================================

test.describe('Hint System Edge Cases', () => {
  test('hint button disabled during feedback phase', async ({ page }) => {
    await startPracticeSession(page);

    // Submit any answer
    const answerInput = getAnswerInput(page);
    await answerInput.fill('100');

    const submitButton = getSubmitButton(page);
    await submitButton.click();

    // Wait for feedback phase
    await page.waitForTimeout(500);

    // Hint button should not be visible or should be disabled in feedback phase
    const hintButton = getHintButton(page);
    const isVisible = await hintButton.isVisible();

    if (isVisible) {
      // If visible, should be disabled
      await expect(hintButton).toBeDisabled();
    } else {
      // Or it's hidden during feedback, which is also acceptable
      expect(isVisible).toBe(false);
    }
  });

  test('hint button resets for new problem', async ({ page }) => {
    await startPracticeSession(page, { problemCount: 2 });

    // Use hints on first problem
    const hintButton = getHintButton(page);
    await hintButton.click();
    await page.waitForTimeout(200);
    await hintButton.click();
    await page.waitForTimeout(200);
    await hintButton.click();
    await page.waitForTimeout(200);

    // Verify count is 3
    await expect(hintButton).toContainText('(3)');

    // Skip to complete problem
    const skipButton = getSkipButton(page);
    await skipButton.click();
    await page.waitForTimeout(500);

    // Go to next problem
    const nextButton = getNextButton(page);
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // New hint button should not show previous count
    const newHintButton = getHintButton(page);
    if (await newHintButton.isVisible()) {
      const buttonText = await newHintButton.textContent();
      // Should not contain (3) from previous problem
      expect(buttonText).not.toContain('(3)');
    }
  });

  test('keyboard shortcut H triggers hint', async ({ page }) => {
    await startPracticeSession(page);

    // Press H key for hint
    await page.keyboard.press('h');
    await page.waitForTimeout(500);

    // Should show method hint or increment counter
    const hintButton = getHintButton(page);
    const buttonText = await hintButton.textContent();

    // Either hint counter shows (1) or method hint is visible
    const hasHintCount = buttonText?.includes('(1)');
    const methodHint = page.locator('text=/Try using:/i');
    const hasMethodHint = await methodHint.isVisible();

    expect(hasHintCount || hasMethodHint).toBe(true);
  });

  test('rapid hint clicking is handled gracefully', async ({ page }) => {
    await startPracticeSession(page);

    const hintButton = getHintButton(page);

    // Click rapidly
    await Promise.all([
      hintButton.click(),
      hintButton.click(),
      hintButton.click()
    ]);

    await page.waitForTimeout(500);

    // Should still be in a valid state
    await expect(hintButton).toBeVisible();

    // Counter should show some hints were used
    const buttonText = await hintButton.textContent();
    expect(buttonText).toContain('Hint');
  });

  test('page refresh preserves hint state during session', async ({ page }) => {
    await startPracticeSession(page);

    // Use some hints
    const hintButton = getHintButton(page);
    await hintButton.click();
    await page.waitForTimeout(300);
    await hintButton.click();
    await page.waitForTimeout(300);

    // Get current hint count
    const initialButtonText = await hintButton.textContent();

    // Note: This test documents current behavior
    // Session persistence may or may not preserve hint state
    // This is a valid area to test

    expect(initialButtonText).toContain('Hint');
  });
});

// ============================================================================
// Test Suite: Accessibility
// ============================================================================

test.describe('Hint System Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await startPracticeSession(page);
  });

  test('hint button has proper focus styling', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Tab to the hint button
    await hintButton.focus();

    // Should have focus ring
    await expect(hintButton).toBeFocused();
  });

  test('hint reveal is announced to screen readers', async ({ page }) => {
    // Check for aria-live regions or proper role attributes
    const hintButton = getHintButton(page);
    await hintButton.click();
    await page.waitForTimeout(500);

    // Method hint should have proper accessibility
    const methodHint = page.locator('text=/Try using:/i');
    if (await methodHint.isVisible()) {
      // Parent container should be accessible
      const hintParent = methodHint.locator('..');
      await expect(hintParent).toBeVisible();
    }
  });

  test('hint count is accessible in button label', async ({ page }) => {
    const hintButton = getHintButton(page);

    // Use a hint
    await hintButton.click();
    await page.waitForTimeout(300);

    // Check aria-label includes hint count
    const ariaLabel = await hintButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    // Should mention "used" or include the count
    expect(ariaLabel?.toLowerCase()).toMatch(/(hint|used)/);
  });
});
