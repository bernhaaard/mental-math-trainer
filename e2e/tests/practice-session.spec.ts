import { test, expect } from '@playwright/test';

/**
 * Practice Session Flow E2E Tests
 *
 * Tests the complete practice session workflow including:
 * - Session configuration
 * - Problem display
 * - Answer input
 * - Feedback system
 * - Hint system
 * - Solution walkthrough
 * - Session progress and completion
 * - Keyboard navigation
 * - Edge cases
 */

test.describe('Practice Session Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
  });

  test('displays configuration page with all options', async ({ page }) => {
    // Check page title and header
    await expect(page.getByRole('heading', { name: /configure practice session/i })).toBeVisible();

    // Check difficulty selector
    await expect(page.getByText('Beginner')).toBeVisible();
    await expect(page.getByText('Intermediate')).toBeVisible();
    await expect(page.getByText('Advanced')).toBeVisible();

    // Check problem count options
    await expect(page.getByText('10 Problems')).toBeVisible();
    await expect(page.getByText('25 Problems')).toBeVisible();
    await expect(page.getByText('50 Problems')).toBeVisible();
    await expect(page.getByText('Infinite Practice')).toBeVisible();

    // Check start button
    await expect(page.getByRole('button', { name: /start practice session/i })).toBeVisible();
  });

  test('allows selecting different difficulty levels', async ({ page }) => {
    // Click on Intermediate difficulty
    await page.getByText('Intermediate').click();

    // Verify it is selected (should have selected styling)
    const intermediateButton = page.getByText('Intermediate');
    await expect(intermediateButton).toBeVisible();

    // Click on Advanced
    await page.getByText('Advanced').click();

    // Verify the button press state
    const advancedButton = page.getByText('Advanced');
    await expect(advancedButton).toBeVisible();
  });

  test('allows selecting problem count', async ({ page }) => {
    // Click on 10 Problems
    await page.getByText('10 Problems').click();

    // Verify selection
    await expect(page.getByText('10 Problems')).toBeVisible();

    // Click on Infinite Practice
    await page.getByText('Infinite Practice').click();

    // Verify selection
    await expect(page.getByText('Infinite Practice')).toBeVisible();
  });

  test('shows session summary with configuration', async ({ page }) => {
    // Configuration summary should be visible
    await expect(page.getByText(/session summary/i)).toBeVisible();

    // Check that summary contains expected fields
    await expect(page.getByText(/difficulty:/i)).toBeVisible();
    await expect(page.getByText(/methods:/i)).toBeVisible();
    await expect(page.getByText(/problems:/i)).toBeVisible();
  });

  test('starts session and redirects to session page', async ({ page }) => {
    // Click start session
    await page.getByRole('button', { name: /start practice session/i }).click();

    // Wait for navigation to session page
    await page.waitForURL('/practice/session', { timeout: 10000 });

    // Verify we're on the session page
    expect(page.url()).toContain('/practice/session');
  });

  test('supports URL parameters for pre-configuration', async ({ page }) => {
    // Navigate with URL parameters
    await page.goto('/practice?difficulty=intermediate&count=10');

    // The configuration should reflect URL params (this tests deep linking)
    await expect(page.getByText(/10 Problems/)).toBeVisible();
  });
});

test.describe('Problem Display', () => {
  test.beforeEach(async ({ page }) => {
    // Start a session with minimal configuration
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
  });

  test('renders multiplication problem correctly', async ({ page }) => {
    // Wait for problem to load
    await page.waitForSelector('[role="main"]', { timeout: 10000 });

    // Check for the multiplication symbol
    await expect(page.locator('text=/×/')).toBeVisible();

    // Check for the equals sign and question mark
    await expect(page.locator('text=/=/')).toBeVisible();
    await expect(page.locator('text=?')).toBeVisible();
  });

  test('shows problem number indicator', async ({ page }) => {
    // Wait for problem to load
    await page.waitForSelector('[role="main"]', { timeout: 10000 });

    // Check for problem counter (e.g., "Problem 1 of 10")
    await expect(page.getByText(/problem 1/i)).toBeVisible();
  });

  test('displays session timer', async ({ page }) => {
    // Wait for problem to load
    await page.waitForSelector('[role="main"]', { timeout: 10000 });

    // Check for timer display (format: MM:SS or similar)
    const timer = page.locator('[class*="font-mono"]').first();
    await expect(timer).toBeVisible();
  });

  test('shows difficulty badge', async ({ page }) => {
    // Wait for problem to load
    await page.waitForSelector('[role="main"]', { timeout: 10000 });

    // Difficulty badge should be visible
    const difficultyBadge = page.locator('[class*="rounded-full"][class*="uppercase"]');
    await expect(difficultyBadge).toBeVisible();
  });
});

test.describe('Answer Input', () => {
  test.beforeEach(async ({ page }) => {
    // Start a session
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });
  });

  test('accepts numeric input', async ({ page }) => {
    const input = page.getByLabel('Your answer');

    // Type a number
    await input.fill('123');

    // Verify the input value
    await expect(input).toHaveValue('123');
  });

  test('allows negative numbers', async ({ page }) => {
    const input = page.getByLabel('Your answer');

    // Type a negative number
    await input.fill('-456');

    // Verify the input value
    await expect(input).toHaveValue('-456');
  });

  test('rejects non-numeric input', async ({ page }) => {
    const input = page.getByLabel('Your answer');

    // Try to type letters
    await input.fill('abc');

    // Input should remain empty or only contain valid characters
    const value = await input.inputValue();
    expect(value).toBe('');
  });

  test('submits answer with Enter key', async ({ page }) => {
    const input = page.getByLabel('Your answer');

    // Get the problem numbers to calculate correct answer
    const problemText = await page.locator('[class*="text-6xl"][class*="font-bold"]').allTextContents();
    const num1 = parseInt(problemText[0].replace(/,/g, ''));
    const num2 = parseInt(problemText[1].replace(/,/g, ''));
    const correctAnswer = num1 * num2;

    // Type correct answer and press Enter
    await input.fill(correctAnswer.toString());
    await input.press('Enter');

    // Should show feedback (correct or incorrect message)
    await expect(page.locator('[class*="feedback"]').or(page.getByText(/correct/i)).or(page.getByText(/not quite/i))).toBeVisible({ timeout: 5000 });
  });

  test('submits answer with button click', async ({ page }) => {
    const input = page.getByLabel('Your answer');

    // Type some answer
    await input.fill('100');

    // Click submit button
    await page.getByRole('button', { name: /submit answer/i }).click();

    // Should transition to feedback phase
    await expect(page.getByText(/correct/i).or(page.getByText(/not quite/i))).toBeVisible({ timeout: 5000 });
  });

  test('clears input with clear button', async ({ page }) => {
    const input = page.getByLabel('Your answer');

    // Type something
    await input.fill('999');
    await expect(input).toHaveValue('999');

    // Click clear button
    await page.getByRole('button', { name: /clear input/i }).click();

    // Input should be empty
    await expect(input).toHaveValue('');
  });

  test('skip button moves to next problem', async ({ page }) => {
    // Click skip button
    await page.getByRole('button', { name: /skip/i }).click();

    // Should show feedback for skipped problem
    await expect(page.getByText(/correct/i).or(page.getByText(/not quite/i))).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Feedback System', () => {
  test.beforeEach(async ({ page }) => {
    // Start a session
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });
  });

  test('shows positive feedback for correct answer', async ({ page }) => {
    // Get the correct answer from the problem
    const problemText = await page.locator('[class*="text-6xl"][class*="font-bold"]').allTextContents();
    const num1 = parseInt(problemText[0].replace(/,/g, ''));
    const num2 = parseInt(problemText[1].replace(/,/g, ''));
    const correctAnswer = num1 * num2;

    // Submit correct answer
    const input = page.getByLabel('Your answer');
    await input.fill(correctAnswer.toString());
    await input.press('Enter');

    // Should show "Correct!" feedback
    await expect(page.getByText(/correct!/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/well done/i)).toBeVisible();
  });

  test('shows feedback for incorrect answer with correct answer', async ({ page }) => {
    // Submit a definitely wrong answer
    const input = page.getByLabel('Your answer');
    await input.fill('1');
    await input.press('Enter');

    // Should show "Not quite" or similar feedback
    await expect(page.getByText(/not quite/i).or(page.getByText(/incorrect/i))).toBeVisible({ timeout: 5000 });

    // Should show the correct answer
    await expect(page.getByText(/correct answer:/i)).toBeVisible();
  });

  test('shows error magnitude for incorrect answer', async ({ page }) => {
    // Submit wrong answer
    const input = page.getByLabel('Your answer');
    await input.fill('1');
    await input.press('Enter');

    // Should show how far off the answer was
    await expect(page.getByText(/you were off by:/i)).toBeVisible({ timeout: 5000 });
  });

  test('shows time taken after answering', async ({ page }) => {
    // Wait a moment before answering
    await page.waitForTimeout(1000);

    // Submit an answer
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');

    // Should show time taken
    await expect(page.getByText(/time taken:/i)).toBeVisible({ timeout: 5000 });
  });

  test('provides view solution button', async ({ page }) => {
    // Submit an answer
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');

    // View solution button should be visible
    await expect(page.getByRole('button', { name: /view solution/i })).toBeVisible({ timeout: 5000 });
  });

  test('provides next problem button', async ({ page }) => {
    // Submit an answer
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');

    // Next problem button should be visible
    await expect(page.getByRole('button', { name: /next problem/i })).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Hint System', () => {
  test.beforeEach(async ({ page }) => {
    // Start a session
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });
  });

  test('hint button is available during answering', async ({ page }) => {
    // Hint button should be visible
    await expect(page.getByRole('button', { name: /hint/i })).toBeVisible();
  });

  test('requesting hint shows method recommendation', async ({ page }) => {
    // Click hint button
    await page.getByRole('button', { name: /hint/i }).click();

    // Should show a method hint (e.g., "Try using: Distributive Property")
    await expect(page.getByText(/try using:/i)).toBeVisible({ timeout: 5000 });
  });

  test('hint counter increments after requesting hint', async ({ page }) => {
    // Click hint button
    await page.getByRole('button', { name: /hint/i }).click();

    // Should show hint count (1)
    await expect(page.getByText(/\(1\)/)).toBeVisible();

    // Click again
    await page.getByRole('button', { name: /hint/i }).click();

    // Should show hint count (2)
    await expect(page.getByText(/\(2\)/)).toBeVisible();
  });

  test('hint can be requested with keyboard shortcut H', async ({ page }) => {
    // Press H for hint
    await page.keyboard.press('h');

    // Should show method hint
    await expect(page.getByText(/try using:/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Solution Walkthrough', () => {
  test.beforeEach(async ({ page }) => {
    // Start a session and submit an answer to get to feedback
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });

    // Submit an answer
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');

    // Wait for feedback to appear
    await page.waitForSelector('[role="button"]:has-text("View Solution")', { timeout: 5000 });
  });

  test('opens solution walkthrough when clicking view solution', async ({ page }) => {
    // Click view solution
    await page.getByRole('button', { name: /view solution/i }).click();

    // Walkthrough should be visible
    await expect(page.getByRole('heading', { name: /solution walkthrough/i })).toBeVisible({ timeout: 5000 });
  });

  test('displays calculation steps', async ({ page }) => {
    // Click view solution
    await page.getByRole('button', { name: /view solution/i }).click();

    // Should show calculation steps section
    await expect(page.getByText(/calculation steps/i)).toBeVisible({ timeout: 5000 });

    // Should show step navigation
    await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible();
  });

  test('allows navigating through steps', async ({ page }) => {
    // Click view solution
    await page.getByRole('button', { name: /view solution/i }).click();
    await expect(page.getByRole('heading', { name: /solution walkthrough/i })).toBeVisible();

    // Click next button
    await page.getByRole('button', { name: /next/i }).click();

    // Step indicator should change
    await expect(page.getByText(/step 2 of/i)).toBeVisible({ timeout: 2000 });
  });

  test('shows method name and explanation', async ({ page }) => {
    // Click view solution
    await page.getByRole('button', { name: /view solution/i }).click();

    // Should show method name (one of the 6 methods)
    const methodNames = [
      /distributive property/i,
      /near powers of 10/i,
      /difference of squares/i,
      /factorization/i,
      /squaring/i,
      /near 100/i
    ];

    const methodVisible = await Promise.race(
      methodNames.map(async (name) => {
        try {
          await expect(page.getByText(name).first()).toBeVisible({ timeout: 3000 });
          return true;
        } catch {
          return false;
        }
      })
    );
    expect(methodVisible).toBe(true);
  });

  test('can toggle show all steps mode', async ({ page }) => {
    // Click view solution
    await page.getByRole('button', { name: /view solution/i }).click();

    // Click "Show All" button
    await page.getByRole('button', { name: /show all/i }).click();

    // Should show "All Steps" or "Step by Step" toggle
    await expect(page.getByText(/all steps/i).or(page.getByText(/step by step/i))).toBeVisible();
  });

  test('can close walkthrough and proceed to next problem', async ({ page }) => {
    // Click view solution
    await page.getByRole('button', { name: /view solution/i }).click();
    await expect(page.getByRole('heading', { name: /solution walkthrough/i })).toBeVisible();

    // Close walkthrough
    await page.getByRole('button', { name: /close/i }).click();

    // Should be ready for next problem (back to answering phase)
    await expect(page.getByLabel('Your answer')).toBeVisible({ timeout: 5000 });
  });

  test('displays validation status for solutions', async ({ page }) => {
    // Click view solution
    await page.getByRole('button', { name: /view solution/i }).click();

    // Should show validation status (mathematically validated message)
    await expect(page.getByText(/validated/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Session Progress', () => {
  test.beforeEach(async ({ page }) => {
    // Start a session with 5 problems
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });
  });

  test('progress bar shows completed problems', async ({ page }) => {
    // Should show progress indicator
    await expect(page.getByText(/completed/i).or(page.getByText(/0 \/ 10/i))).toBeVisible();
  });

  test('progress updates after completing a problem', async ({ page }) => {
    // Complete first problem
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');

    // Wait for feedback
    await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });

    // Click next problem
    await page.getByRole('button', { name: /next problem/i }).click();

    // Progress should show 1 completed
    await expect(page.getByText(/1 \/ 10/i).or(page.getByText(/problem 2/i))).toBeVisible({ timeout: 5000 });
  });

  test('session can be paused and resumed', async ({ page }) => {
    // Click pause button
    await page.getByRole('button', { name: /pause/i }).click();

    // Pause overlay should appear
    await expect(page.getByText(/session paused/i)).toBeVisible({ timeout: 2000 });

    // Click resume
    await page.getByRole('button', { name: /resume session/i }).click();

    // Should be back to normal session
    await expect(page.getByLabel('Your answer')).toBeVisible({ timeout: 2000 });
  });

  test('end session button ends the session early', async ({ page }) => {
    // Click end session
    await page.getByRole('button', { name: /end session/i }).click();

    // Should show session complete
    await expect(page.getByText(/session complete/i)).toBeVisible({ timeout: 5000 });
  });

  test('completing all problems shows session summary', async ({ page }) => {
    // Complete 10 problems quickly
    for (let i = 0; i < 10; i++) {
      // Wait for input
      await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });

      // Submit answer
      const input = page.getByLabel('Your answer');
      await input.fill('1');
      await input.press('Enter');

      // Wait for feedback
      await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });

      // If not the last problem, click next
      if (i < 9) {
        await page.getByRole('button', { name: /next problem/i }).click();
      }
    }

    // Session should be complete
    await expect(page.getByText(/session complete/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Start a session
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });
  });

  test('question mark key opens keyboard shortcuts help', async ({ page }) => {
    // Press ? key
    await page.keyboard.press('?');

    // Shortcuts modal should appear
    await expect(page.getByText(/keyboard shortcuts/i)).toBeVisible({ timeout: 2000 });
  });

  test('escape key closes modals', async ({ page }) => {
    // Open shortcuts help
    await page.keyboard.press('?');
    await expect(page.getByText(/keyboard shortcuts/i)).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.getByText(/keyboard shortcuts/i)).not.toBeVisible({ timeout: 2000 });
  });

  test('space bar pauses session', async ({ page }) => {
    // Make sure we're not in the input
    await page.keyboard.press('Escape');

    // Press space to pause
    await page.keyboard.press(' ');

    // Session should be paused
    await expect(page.getByText(/session paused/i)).toBeVisible({ timeout: 2000 });

    // Press space again to resume
    await page.keyboard.press(' ');

    // Should be back to normal
    await expect(page.getByLabel('Your answer')).toBeVisible({ timeout: 2000 });
  });

  test('Q key ends session', async ({ page }) => {
    // Press Q to end session
    await page.keyboard.press('q');

    // Session should end
    await expect(page.getByText(/session complete/i)).toBeVisible({ timeout: 5000 });
  });

  test('N key moves to next problem after feedback', async ({ page }) => {
    // Submit answer
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');

    // Wait for feedback
    await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });

    // Press N for next
    await page.keyboard.press('n');

    // Should move to next problem
    await expect(page.getByLabel('Your answer')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/problem 2/i)).toBeVisible();
  });

  test('S key opens solution after feedback', async ({ page }) => {
    // Submit answer
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');

    // Wait for feedback
    await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });

    // Press S for solution
    await page.keyboard.press('s');

    // Walkthrough should open
    await expect(page.getByRole('heading', { name: /solution walkthrough/i })).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Start a session
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });
  });

  test('handles very large numbers correctly', async ({ page }) => {
    const input = page.getByLabel('Your answer');

    // Type a very large number
    await input.fill('999999999');

    // Should accept the input
    await expect(input).toHaveValue('999999999');

    // Submit it
    await input.press('Enter');

    // Should show feedback without crashing
    await expect(page.getByText(/correct|not quite/i)).toBeVisible({ timeout: 5000 });
  });

  test('handles zero as answer', async ({ page }) => {
    const input = page.getByLabel('Your answer');

    // Type zero
    await input.fill('0');
    await expect(input).toHaveValue('0');

    // Submit it
    await input.press('Enter');

    // Should handle gracefully
    await expect(page.getByText(/correct|not quite/i)).toBeVisible({ timeout: 5000 });
  });

  test('handles rapid answer submission', async ({ page }) => {
    // Submit multiple answers rapidly
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });
      const input = page.getByLabel('Your answer');
      await input.fill((i + 1).toString());
      await input.press('Enter');

      // Wait for feedback
      await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });

      // Click next
      await page.getByRole('button', { name: /next problem/i }).click();
    }

    // Should still be functional
    await expect(page.getByText(/problem 4/i)).toBeVisible({ timeout: 5000 });
  });

  test('empty input does not submit', async ({ page }) => {
    const input = page.getByLabel('Your answer');

    // Ensure input is empty
    await input.fill('');

    // Try to submit
    await input.press('Enter');

    // Should still be on the same problem (no feedback shown)
    await expect(page.getByLabel('Your answer')).toBeVisible();
    await expect(page.getByText(/problem 1/i)).toBeVisible();
  });

  test('handles page refresh during session', async ({ page }) => {
    // Submit one answer
    const input = page.getByLabel('Your answer');
    await input.fill('100');
    await input.press('Enter');
    await page.waitForSelector('text=/correct|not quite/i', { timeout: 5000 });
    await page.getByRole('button', { name: /next problem/i }).click();

    // Refresh the page
    await page.reload();

    // Session state should be preserved or gracefully handle the refresh
    // Either shows the session or redirects to configuration
    await expect(
      page.getByLabel('Your answer').or(page.getByRole('button', { name: /start practice session/i }))
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Start a session
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });
  });

  test('input has proper label', async ({ page }) => {
    // Input should have aria-label
    await expect(page.getByLabel('Your answer')).toBeVisible();
  });

  test('buttons have accessible names', async ({ page }) => {
    // Check main action buttons
    await expect(page.getByRole('button', { name: /submit answer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /skip/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /hint/i })).toBeVisible();
  });

  test('session has main content landmark', async ({ page }) => {
    // Check for main role
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('breadcrumb navigation is present', async ({ page }) => {
    // Check for breadcrumb
    await expect(page.getByRole('navigation', { name: /breadcrumb/i })).toBeVisible();
  });

  test('screen reader announcements exist', async ({ page }) => {
    // Check for sr-only announcement area
    const srAnnouncement = page.locator('[role="status"][aria-live="polite"]');
    await expect(srAnnouncement.first()).toBeAttached();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test.beforeEach(async ({ page }) => {
    // Start a session
    await page.goto('/practice');
    await page.getByText('10 Problems').click();
    await page.getByRole('button', { name: /start practice session/i }).click();
    await page.waitForURL('/practice/session', { timeout: 10000 });
    await page.waitForSelector('[aria-label="Your answer"]', { timeout: 10000 });
  });

  test('problem displays correctly on mobile', async ({ page }) => {
    // Problem should be visible
    await expect(page.locator('text=/×/')).toBeVisible();

    // Input should be visible and usable
    await expect(page.getByLabel('Your answer')).toBeVisible();
  });

  test('buttons are accessible on mobile', async ({ page }) => {
    // Action buttons should be visible
    await expect(page.getByRole('button', { name: /submit answer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /skip/i })).toBeVisible();
  });

  test('input is usable with numeric keyboard', async ({ page }) => {
    const input = page.getByLabel('Your answer');

    // Check inputMode is numeric
    await expect(input).toHaveAttribute('inputMode', 'numeric');
  });
});
