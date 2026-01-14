import { test, expect, Page, ConsoleMessage } from '@playwright/test';

/**
 * Error Handling & Edge Cases E2E Tests
 *
 * This test suite stress-tests the Mental Math Trainer application for:
 * - Invalid inputs
 * - Empty states
 * - Boundary values
 * - Race conditions
 * - Browser edge cases
 * - Session interruption scenarios
 * - Console error monitoring
 */

// ============================================================================
// Test Fixtures & Helpers
// ============================================================================

/**
 * Collects console errors during test execution
 */
class ConsoleCollector {
  errors: string[] = [];
  warnings: string[] = [];

  attach(page: Page): void {
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        this.errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        this.warnings.push(msg.text());
      }
    });

    page.on('pageerror', (error: Error) => {
      this.errors.push(error.message);
    });
  }

  hasErrors(): boolean {
    // Filter out expected/benign errors
    const significantErrors = this.errors.filter(err =>
      !err.includes('Failed to load resource') && // Network timing issues
      !err.includes('favicon.ico') && // Missing favicon
      !err.includes('[React DevTools]') // DevTools extension
    );
    return significantErrors.length > 0;
  }

  getErrors(): string[] {
    return this.errors;
  }

  getWarnings(): string[] {
    return this.warnings;
  }
}

/**
 * Sets up a practice session with a specified configuration
 */
async function setupPracticeSession(page: Page, options: {
  problemCount?: number | 'infinite';
  methods?: string[];
} = {}): Promise<void> {
  const { problemCount = 10 } = options;

  await page.goto('/practice');

  // Wait for the configuration page to load
  await expect(page.getByRole('heading', { name: /Configure Practice Session/i })).toBeVisible();

  // Select problem count
  if (problemCount !== 'infinite') {
    const countButton = page.getByRole('button', { name: new RegExp(`${problemCount} Problems`) });
    if (await countButton.isVisible()) {
      await countButton.click();
    }
  } else {
    await page.getByRole('button', { name: /Infinite Practice/i }).click();
  }

  // Start the session
  await page.getByRole('button', { name: /Start Practice Session/i }).click();

  // Wait for session to start
  await expect(page.getByRole('main', { name: /Practice session/i })).toBeVisible({ timeout: 10000 });
}

/**
 * Gets the answer input element
 */
async function getAnswerInput(page: Page) {
  return page.getByRole('textbox', { name: /Your answer/i });
}

// ============================================================================
// Test Suite: Invalid Inputs
// ============================================================================

test.describe('Invalid Inputs', () => {
  test.describe.configure({ mode: 'serial' });

  test('should reject non-numeric input (letters)', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    const input = await getAnswerInput(page);
    await input.fill('abc');

    // Input should be empty or contain only the last valid state
    const value = await input.inputValue();
    expect(value).toBe('');

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should reject special characters', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    const input = await getAnswerInput(page);

    // Try various special characters
    await input.fill('!@#$%^&*()');
    expect(await input.inputValue()).toBe('');

    await input.fill('12.34');
    expect(await input.inputValue()).toBe('1234');

    await input.fill('1,234');
    expect(await input.inputValue()).toBe('1234');

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle very large numbers gracefully', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    const input = await getAnswerInput(page);

    // Enter an extremely large number
    await input.fill('999999999999999999999');
    await page.getByRole('button', { name: /Submit Answer/i }).click();

    // Should show feedback (incorrect answer) without crashing
    await expect(page.getByText(/incorrect|correct/i)).toBeVisible({ timeout: 5000 });

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle negative numbers correctly', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    const input = await getAnswerInput(page);

    // Enter negative number
    await input.fill('-');
    expect(await input.inputValue()).toBe('-');

    await input.fill('-123');
    expect(await input.inputValue()).toBe('-123');

    // Submit should work
    await page.getByRole('button', { name: /Submit Answer/i }).click();
    await expect(page.getByText(/incorrect|correct/i)).toBeVisible({ timeout: 5000 });

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle pasted invalid content', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    const input = await getAnswerInput(page);

    // Simulate paste event with invalid content
    await input.focus();
    await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="Your answer"]') as HTMLInputElement;
      if (input) {
        input.value = 'pasted text 123';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Wait a moment for React to process
    await page.waitForTimeout(100);

    // The input validation should have cleaned the input
    const value = await input.inputValue();
    // Either empty or only numeric part
    expect(value === '' || /^-?\d*$/.test(value)).toBe(true);

    expect(consoleCollector.hasErrors()).toBe(false);
  });
});

// ============================================================================
// Test Suite: Empty States
// ============================================================================

test.describe('Empty States', () => {
  test('should not submit empty answer', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    const submitButton = page.getByRole('button', { name: /Submit Answer/i });

    // Button should be disabled when input is empty
    await expect(submitButton).toBeDisabled();

    // Try clicking anyway
    await submitButton.click({ force: true });

    // Should still be on answering phase (not feedback)
    await expect(page.getByRole('textbox', { name: /Your answer/i })).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle statistics page with no data', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    // Clear IndexedDB before test
    await page.goto('/');
    await page.evaluate(async () => {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    });

    await page.goto('/statistics');

    // Should show empty state
    await expect(page.getByText(/No Statistics Yet/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link', { name: /Start Practicing/i })).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle direct navigation to session without config', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    // Clear session storage
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
    });

    // Try to navigate directly to session page
    await page.goto('/practice/session');

    // Should redirect to practice configuration
    await expect(page).toHaveURL(/\/practice$/);
    await expect(page.getByRole('heading', { name: /Configure Practice Session/i })).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });
});

// ============================================================================
// Test Suite: Boundary Values
// ============================================================================

test.describe('Boundary Values', () => {
  test('should handle minimum problem count (10)', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/practice');

    // Select 10 problems
    await page.getByRole('button', { name: /10 Problems/i }).click();
    await page.getByRole('button', { name: /Start Practice Session/i }).click();

    // Session should start
    await expect(page.getByRole('main', { name: /Practice session/i })).toBeVisible({ timeout: 10000 });

    // Progress should show "0 / 10 completed"
    await expect(page.getByText(/0 \/ 10 completed/i)).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle infinite practice mode', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/practice');

    // Select infinite practice
    await page.getByRole('button', { name: /Infinite Practice/i }).click();
    await page.getByRole('button', { name: /Start Practice Session/i }).click();

    // Session should start
    await expect(page.getByRole('main', { name: /Practice session/i })).toBeVisible({ timeout: 10000 });

    // Should not show "/ X completed" for infinite mode
    await expect(page.getByText(/\/ \d+ completed/i)).not.toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle very fast answer submission', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    const input = await getAnswerInput(page);
    await input.fill('42');
    await page.getByRole('button', { name: /Submit Answer/i }).click();

    // Even with instant submission, should show feedback
    await expect(page.getByText(/incorrect|correct/i)).toBeVisible({ timeout: 5000 });

    expect(consoleCollector.hasErrors()).toBe(false);
  });
});

// ============================================================================
// Test Suite: Race Conditions
// ============================================================================

test.describe('Race Conditions', () => {
  test('should handle rapid button clicks', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    const input = await getAnswerInput(page);
    await input.fill('123');

    const submitButton = page.getByRole('button', { name: /Submit Answer/i });

    // Rapidly click submit multiple times
    await Promise.all([
      submitButton.click(),
      submitButton.click(),
      submitButton.click(),
    ]);

    // Should be in feedback phase, not crashed
    await expect(page.getByText(/incorrect|correct/i)).toBeVisible({ timeout: 5000 });

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle double-submit via Enter key', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    const input = await getAnswerInput(page);
    await input.fill('123');

    // Double-press Enter quickly
    await input.press('Enter');
    await input.press('Enter');

    // Should be in feedback phase
    await expect(page.getByText(/incorrect|correct/i)).toBeVisible({ timeout: 5000 });

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle quick navigation between pages', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/');

    // Rapidly navigate between pages
    const navPromises = [
      page.getByRole('link', { name: /Practice/i }).first().click(),
      page.waitForTimeout(50),
      page.getByRole('link', { name: /Study/i }).first().click(),
      page.waitForTimeout(50),
      page.getByRole('link', { name: /Statistics/i }).first().click(),
    ];

    await Promise.allSettled(navPromises);

    // Wait for navigation to settle
    await page.waitForTimeout(500);

    // Page should be stable (not crashed)
    await expect(page.locator('body')).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle skip button during answer submission', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    const input = await getAnswerInput(page);
    await input.fill('123');

    const submitButton = page.getByRole('button', { name: /Submit Answer/i });
    const skipButton = page.getByRole('button', { name: /Skip/i });

    // Click both buttons simultaneously
    await Promise.all([
      submitButton.click(),
      skipButton.click(),
    ]);

    // Should be in feedback phase (one action should have won)
    await expect(page.getByText(/incorrect|correct|skipped/i)).toBeVisible({ timeout: 5000 });

    expect(consoleCollector.hasErrors()).toBe(false);
  });
});

// ============================================================================
// Test Suite: Browser Edge Cases
// ============================================================================

test.describe('Browser Edge Cases', () => {
  test('should handle browser back during session', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).click();

    // Wait for session to load
    await expect(page.getByRole('main', { name: /Practice session/i })).toBeVisible({ timeout: 10000 });

    // Go back
    await page.goBack();

    // Should be on practice config or home
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url.includes('/practice') || url.endsWith('/')).toBe(true);

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle page refresh during session', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    // Answer one problem
    const input = await getAnswerInput(page);
    await input.fill('42');
    await page.getByRole('button', { name: /Submit Answer/i }).click();
    await expect(page.getByText(/incorrect|correct/i)).toBeVisible({ timeout: 5000 });

    // Click next
    await page.getByRole('button', { name: /Next Problem/i }).click();
    await expect(page.getByRole('textbox', { name: /Your answer/i })).toBeVisible({ timeout: 5000 });

    // Refresh the page
    await page.reload();

    // Session state should be restored (Issue #37 feature)
    await expect(page.getByRole('main', { name: /Practice session/i })).toBeVisible({ timeout: 10000 });

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle forward/back navigation after session', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    // Start from home
    await page.goto('/');
    await page.getByRole('link', { name: /Practice/i }).first().click();

    await expect(page.getByRole('heading', { name: /Configure Practice Session/i })).toBeVisible();

    // Start session
    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await expect(page.getByRole('main', { name: /Practice session/i })).toBeVisible({ timeout: 10000 });

    // End session
    await page.getByRole('button', { name: /End Session/i }).click();
    await expect(page.getByText(/Session Complete/i)).toBeVisible();

    // Go back multiple times
    await page.goBack();
    await page.waitForTimeout(300);
    await page.goBack();
    await page.waitForTimeout(300);

    // Should not crash
    await expect(page.locator('body')).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });
});

// ============================================================================
// Test Suite: Session Interruption
// ============================================================================

test.describe('Session Interruption', () => {
  test('should handle session config loss gracefully', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    // Clear session config while on session page
    await page.evaluate(() => {
      sessionStorage.removeItem('practiceSessionConfig');
    });

    // Try to navigate to next problem (should handle missing config)
    const input = await getAnswerInput(page);
    await input.fill('42');
    await page.getByRole('button', { name: /Submit Answer/i }).click();

    // Should still work or gracefully redirect
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle pause and resume correctly', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    // Pause the session
    await page.getByRole('button', { name: /Pause session/i }).click();

    // Should show paused dialog
    await expect(page.getByText(/Session Paused/i)).toBeVisible();

    // Resume
    await page.getByRole('button', { name: /Resume Session/i }).click();

    // Should be back to answering
    await expect(page.getByRole('textbox', { name: /Your answer/i })).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle End Session button', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    // Answer at least one problem
    const input = await getAnswerInput(page);
    await input.fill('42');
    await page.getByRole('button', { name: /Submit Answer/i }).click();
    await expect(page.getByText(/incorrect|correct/i)).toBeVisible({ timeout: 5000 });

    // Click next
    await page.getByRole('button', { name: /Next Problem/i }).click();

    // End session early
    await page.getByRole('button', { name: /End Session/i }).click();

    // Should show session complete
    await expect(page.getByText(/Session Complete/i)).toBeVisible();
    await expect(page.getByText(/1 problems?/i)).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });
});

// ============================================================================
// Test Suite: Keyboard Shortcuts
// ============================================================================

test.describe('Keyboard Shortcuts', () => {
  test('should handle keyboard shortcut help modal', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    // Press ? to open help
    await page.keyboard.press('?');

    // Should show keyboard shortcuts modal
    await expect(page.getByText(/Keyboard Shortcuts/i)).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Modal should be closed
    await expect(page.getByText(/Keyboard Shortcuts/i)).not.toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle Space key for pause during answering', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    // Focus outside input first
    await page.getByRole('button', { name: /Pause session/i }).focus();

    // Press space to pause
    await page.keyboard.press('Space');

    // Should show pause dialog
    await expect(page.getByText(/Session Paused/i)).toBeVisible();

    // Press space to resume
    await page.keyboard.press('Space');

    // Should resume
    await expect(page.getByRole('textbox', { name: /Your answer/i })).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });
});

// ============================================================================
// Test Suite: Console Error Monitoring
// ============================================================================

test.describe('Console Error Monitoring', () => {
  test('should have no console errors on home page', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should have no console errors on practice page', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should have no console errors on study page', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/study');
    await page.waitForLoadState('networkidle');

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should have no console errors on statistics page', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should have no console errors during full practice flow', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    // Full practice flow
    await page.goto('/practice');
    await page.getByRole('button', { name: /10 Problems/i }).click();
    await page.getByRole('button', { name: /Start Practice Session/i }).click();

    await expect(page.getByRole('main', { name: /Practice session/i })).toBeVisible({ timeout: 10000 });

    // Complete one problem
    const input = await getAnswerInput(page);
    await input.fill('42');
    await page.getByRole('button', { name: /Submit Answer/i }).click();

    await expect(page.getByText(/incorrect|correct/i)).toBeVisible({ timeout: 5000 });

    // View solution
    await page.getByRole('button', { name: /View Solution/i }).click();
    await page.waitForTimeout(500);

    // End session
    await page.getByRole('button', { name: /End Session|Close/i }).first().click();

    expect(consoleCollector.hasErrors()).toBe(false);

    // Log any warnings for review
    const warnings = consoleCollector.getWarnings();
    if (warnings.length > 0) {
      console.log('Warnings encountered:', warnings);
    }
  });
});

// ============================================================================
// Test Suite: Accessibility During Error States
// ============================================================================

test.describe('Accessibility During Error States', () => {
  test('should announce error feedback to screen readers', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    // Submit wrong answer
    const input = await getAnswerInput(page);
    await input.fill('0'); // Almost certainly wrong
    await page.getByRole('button', { name: /Submit Answer/i }).click();

    // Wait for feedback
    await expect(page.getByText(/incorrect|correct/i)).toBeVisible({ timeout: 5000 });

    // Check for aria-live regions
    const liveRegions = await page.locator('[aria-live]').count();
    expect(liveRegions).toBeGreaterThan(0);

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should maintain focus management during session phases', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await setupPracticeSession(page);

    // Check input has focus
    const input = await getAnswerInput(page);
    await expect(input).toBeFocused();

    // Submit answer
    await input.fill('42');
    await page.keyboard.press('Enter');

    // Wait for feedback phase
    await expect(page.getByText(/incorrect|correct/i)).toBeVisible({ timeout: 5000 });

    // Next button should be focusable
    const nextButton = page.getByRole('button', { name: /Next Problem/i });
    await expect(nextButton).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });
});

// ============================================================================
// Test Suite: Study Page Edge Cases
// ============================================================================

test.describe('Study Page Edge Cases', () => {
  test('should handle invalid method route', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    // Navigate to non-existent method
    await page.goto('/study/invalid-method');

    // Should handle gracefully (404 or redirect)
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();

    // Note: This may show a 404 or redirect - either is acceptable
  });

  test('should handle method comparison page', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/study/compare');
    await page.waitForLoadState('networkidle');

    // Should load without errors
    await expect(page.locator('body')).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });
});

// ============================================================================
// Test Suite: URL Parameter Edge Cases
// ============================================================================

test.describe('URL Parameter Edge Cases', () => {
  test('should handle invalid difficulty parameter', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/practice?difficulty=invalid');

    // Should still load config page
    await expect(page.getByRole('heading', { name: /Configure Practice Session/i })).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle invalid method parameter', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/practice?methods=invalid-method');

    // Should still load config page
    await expect(page.getByRole('heading', { name: /Configure Practice Session/i })).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle invalid count parameter', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/practice?count=-5');

    // Should still load config page with default count
    await expect(page.getByRole('heading', { name: /Configure Practice Session/i })).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });

  test('should handle valid URL parameters', async ({ page }) => {
    const consoleCollector = new ConsoleCollector();
    consoleCollector.attach(page);

    await page.goto('/practice?difficulty=intermediate&methods=distributive,squaring&count=10');

    // Should load config page with parameters applied
    await expect(page.getByRole('heading', { name: /Configure Practice Session/i })).toBeVisible();

    expect(consoleCollector.hasErrors()).toBe(false);
  });
});
