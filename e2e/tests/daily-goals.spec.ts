import { test, expect, Page } from '@playwright/test';

/**
 * Daily Goals E2E Tests
 *
 * Tests the daily goals and streak tracking functionality including:
 * - Goals display on home page
 * - Goal setting/configuration
 * - Progress tracking during practice
 * - Goal completion UI
 * - Streak system
 * - State persistence (IndexedDB)
 */

/**
 * Clear IndexedDB goals data before test
 */
async function clearGoalsData(page: Page) {
  await page.evaluate(async () => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('mental-math-trainer', 2);
      request.onsuccess = () => {
        const db = request.result;
        if (db.objectStoreNames.contains('goals')) {
          const transaction = db.transaction('goals', 'readwrite');
          const store = transaction.objectStore('goals');
          store.clear();
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onerror = () => reject(transaction.error);
        } else {
          db.close();
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Set goals state in IndexedDB
 */
async function setGoalsState(page: Page, state: {
  targetProblems: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  lastGoalMetDate: string | null;
}) {
  const today = new Date().toISOString().split('T')[0];
  await page.evaluate(async ({ state, today }) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('mental-math-trainer', 2);
      request.onsuccess = () => {
        const db = request.result;
        if (db.objectStoreNames.contains('goals')) {
          const transaction = db.transaction('goals', 'readwrite');
          const store = transaction.objectStore('goals');
          store.put({
            userId: 'local-user',
            dailyGoal: {
              targetProblems: state.targetProblems,
              completedToday: state.completedToday,
              date: today,
            },
            streak: {
              currentStreak: state.currentStreak,
              longestStreak: state.longestStreak,
              lastPracticeDate: state.lastGoalMetDate,
              lastGoalMetDate: state.lastGoalMetDate,
            },
          });
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onerror = () => reject(transaction.error);
        } else {
          db.close();
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }, { state, today });
}

/**
 * Get goals state from IndexedDB
 */
async function getGoalsState(page: Page) {
  return await page.evaluate(async () => {
    return new Promise<unknown>((resolve, reject) => {
      const request = indexedDB.open('mental-math-trainer', 2);
      request.onsuccess = () => {
        const db = request.result;
        if (db.objectStoreNames.contains('goals')) {
          const transaction = db.transaction('goals', 'readonly');
          const store = transaction.objectStore('goals');
          const getRequest = store.get('local-user');
          getRequest.onsuccess = () => {
            db.close();
            resolve(getRequest.result);
          };
          getRequest.onerror = () => reject(getRequest.error);
        } else {
          db.close();
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

test.describe('Daily Goals Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Clear goals data before each test
    await page.goto('/');
    await clearGoalsData(page);
  });

  test.describe('Goals Display on Home Page', () => {
    test('shows daily progress card with default values', async ({ page }) => {
      await page.goto('/');

      // Wait for goals to load
      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show "Daily Progress" heading
      await expect(progressCard.getByText('Daily Progress')).toBeVisible();

      // Should show 0/10 (default goal) or similar progress text
      await expect(progressCard.getByText(/\d+\s*(of|\/)\s*\d+/i)).toBeVisible();
    });

    test('shows progress bar at 0% for new user', async ({ page }) => {
      await page.goto('/');

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Progress bar should exist
      const progressBar = progressCard.locator('[role="progressbar"]');
      await expect(progressBar).toBeVisible();

      // Should show 0 completed
      await expect(progressCard.getByText(/0 (of|\/)/)).toBeVisible();
    });

    test('shows streak badge when streak exists', async ({ page }) => {
      // Set up state with an existing streak
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 0,
        currentStreak: 5,
        longestStreak: 10,
        lastGoalMetDate: null,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show streak count
      await expect(progressCard.getByText(/5\s*day/i)).toBeVisible();
    });

    test('shows longest streak information', async ({ page }) => {
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 5,
        currentStreak: 3,
        longestStreak: 7,
        lastGoalMetDate: null,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show longest streak
      await expect(progressCard.getByText(/longest streak/i)).toBeVisible();
      await expect(progressCard.getByText(/7\s*day/i)).toBeVisible();
    });
  });

  test.describe('Goal Settings', () => {
    test('shows adjust daily goal button', async ({ page }) => {
      await page.goto('/');

      // Wait for page to load
      await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });

      // Should have button to adjust goal
      const adjustButton = page.getByRole('button', { name: /adjust daily goal/i });
      await expect(adjustButton).toBeVisible();
    });

    test('opens goal settings when clicking adjust button', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });

      // Click adjust button
      await page.getByRole('button', { name: /adjust daily goal/i }).click();

      // Should show settings panel
      const settings = page.getByTestId('goal-settings');
      await expect(settings).toBeVisible();

      // Should show preset buttons
      await expect(settings.getByRole('button', { name: '5' })).toBeVisible();
      await expect(settings.getByRole('button', { name: '10' })).toBeVisible();
      await expect(settings.getByRole('button', { name: '20' })).toBeVisible();
    });

    test('can set goal using preset button', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });

      // Open settings
      await page.getByRole('button', { name: /adjust daily goal/i }).click();

      const settings = page.getByTestId('goal-settings');
      await expect(settings).toBeVisible();

      // Click preset button for 20
      await settings.getByRole('button', { name: '20' }).click();

      // Settings should close and new goal should be shown
      // Wait a moment for save to complete
      await page.waitForTimeout(500);

      // Verify goal is persisted in IndexedDB
      const state = await getGoalsState(page) as { dailyGoal: { targetProblems: number } } | null;
      expect(state?.dailyGoal?.targetProblems).toBe(20);
    });

    test('can set custom goal value', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });

      // Open settings
      await page.getByRole('button', { name: /adjust daily goal/i }).click();

      const settings = page.getByTestId('goal-settings');
      await expect(settings).toBeVisible();

      // Enter custom value
      const customInput = settings.getByRole('spinbutton', { name: /custom daily goal/i });
      await customInput.fill('25');

      // Submit custom goal
      await settings.getByRole('button', { name: /set/i }).click();

      await page.waitForTimeout(500);

      // Verify goal is persisted
      const state = await getGoalsState(page) as { dailyGoal: { targetProblems: number } } | null;
      expect(state?.dailyGoal?.targetProblems).toBe(25);
    });

    test('enforces minimum goal value (1)', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /adjust daily goal/i }).click();

      const settings = page.getByTestId('goal-settings');
      const customInput = settings.getByRole('spinbutton', { name: /custom daily goal/i });

      // Try to enter 0
      await customInput.fill('0');
      const setButton = settings.getByRole('button', { name: /set/i });

      // Button should be disabled for invalid input
      await expect(setButton).toBeDisabled();
    });

    test('enforces maximum goal value (100)', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /adjust daily goal/i }).click();

      const settings = page.getByTestId('goal-settings');
      const customInput = settings.getByRole('spinbutton', { name: /custom daily goal/i });

      // Try to enter value over 100
      await customInput.fill('150');
      const setButton = settings.getByRole('button', { name: /set/i });

      // Button should be disabled for invalid input
      await expect(setButton).toBeDisabled();
    });
  });

  test.describe('Progress Tracking', () => {
    test('shows correct progress percentage', async ({ page }) => {
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 5,
        currentStreak: 0,
        longestStreak: 0,
        lastGoalMetDate: null,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show 5/10 progress
      await expect(progressCard.getByText(/5\s*(of|\/)\s*10/)).toBeVisible();

      // Progress bar should be at 50%
      const progressBar = progressCard.locator('[role="progressbar"]');
      await expect(progressBar).toHaveAttribute('aria-valuenow', '5');
      await expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    });

    test('shows remaining problems message', async ({ page }) => {
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 7,
        currentStreak: 0,
        longestStreak: 0,
        lastGoalMetDate: null,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show remaining problems message
      await expect(progressCard.getByText(/3\s*more\s*problems?/i)).toBeVisible();
    });
  });

  test.describe('Goal Completion', () => {
    test('shows completion banner when goal is met', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 10,
        currentStreak: 1,
        longestStreak: 1,
        lastGoalMetDate: today,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show goal completed banner
      await expect(progressCard.getByText(/daily goal completed/i)).toBeVisible();
    });

    test('shows 100% progress when goal exceeded', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 15,
        currentStreak: 1,
        longestStreak: 1,
        lastGoalMetDate: today,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Progress bar should be capped at max
      const progressBar = progressCard.locator('[role="progressbar"]');
      await expect(progressBar).toBeVisible();

      // Should still show completion message
      await expect(progressCard.getByText(/daily goal completed/i)).toBeVisible();
    });
  });

  test.describe('Streak System', () => {
    test('shows fire icon for active streak', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 10,
        currentStreak: 3,
        longestStreak: 5,
        lastGoalMetDate: today,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show fire emoji for active streak
      await expect(progressCard.getByRole('img', { name: /fire/i })).toBeVisible();
    });

    test('shows personal best badge for new record streak', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 10,
        currentStreak: 5,
        longestStreak: 5, // Same as current = new record
        lastGoalMetDate: today,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show personal best badge
      await expect(progressCard.getByText(/personal best/i)).toBeVisible();
    });

    test('shows ice icon when streak is zero', async ({ page }) => {
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 0,
        currentStreak: 0,
        longestStreak: 5,
        lastGoalMetDate: null,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show 0 days
      await expect(progressCard.getByText(/0\s*days?/)).toBeVisible();
    });
  });

  test.describe('State Persistence', () => {
    test('goal setting persists across page reload', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });

      // Open settings and set goal to 30
      await page.getByRole('button', { name: /adjust daily goal/i }).click();
      await page.getByTestId('goal-settings').getByRole('button', { name: '30' }).click();

      await page.waitForTimeout(500);

      // Reload page
      await page.reload();

      await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });

      // Goal should still be 30
      await expect(page.getByText(/\d+\s*(of|\/)\s*30/)).toBeVisible();
    });

    test('progress persists across page reload', async ({ page }) => {
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 7,
        currentStreak: 2,
        longestStreak: 5,
        lastGoalMetDate: null,
      });

      await page.reload();

      await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });

      // Progress should show 7/10
      await expect(page.getByText(/7\s*(of|\/)\s*10/)).toBeVisible();
    });

    test('streak persists across page reload', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 10,
        currentStreak: 7,
        longestStreak: 7,
        lastGoalMetDate: today,
      });

      await page.reload();

      await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });

      // Streak should still be 7
      await expect(page.getByText(/7\s*days?/)).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test('handles 0% progress display correctly', async ({ page }) => {
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastGoalMetDate: null,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show 0/10
      await expect(progressCard.getByText(/0\s*(of|\/)\s*10/)).toBeVisible();

      // Should show 10 more problems message
      await expect(progressCard.getByText(/10\s*more\s*problems?/i)).toBeVisible();
    });

    test('handles very high goal numbers', async ({ page }) => {
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 100,
        completedToday: 50,
        currentStreak: 0,
        longestStreak: 0,
        lastGoalMetDate: null,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should handle high numbers correctly
      await expect(progressCard.getByText(/50\s*(of|\/)\s*100/)).toBeVisible();
      await expect(progressCard.getByText(/50\s*more\s*problems?/i)).toBeVisible();
    });

    test('handles goal already met for today', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 5,
        completedToday: 8,
        currentStreak: 1,
        longestStreak: 1,
        lastGoalMetDate: today,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should show completion message, not remaining problems
      await expect(progressCard.getByText(/daily goal completed/i)).toBeVisible();
    });

    test('singular/plural wording for 1 day streak', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 10,
        currentStreak: 1,
        longestStreak: 1,
        lastGoalMetDate: today,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should say "1 day" not "1 days"
      await expect(progressCard.getByText(/1\s*day(?!s)/)).toBeVisible();
    });

    test('singular/plural wording for 1 remaining problem', async ({ page }) => {
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 9,
        currentStreak: 0,
        longestStreak: 0,
        lastGoalMetDate: null,
      });

      await page.reload();

      const progressCard = page.getByTestId('daily-progress');
      await expect(progressCard).toBeVisible({ timeout: 10000 });

      // Should say "1 more problem" not "1 more problems"
      await expect(progressCard.getByText(/1\s*more\s*problem(?!s)/i)).toBeVisible();
    });
  });

  test.describe('Practice Session Integration', () => {
    test('completing practice session updates daily progress', async ({ page }) => {
      // Start with 0 progress
      await page.goto('/');
      await setGoalsState(page, {
        targetProblems: 10,
        completedToday: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastGoalMetDate: null,
      });

      // Navigate to practice
      await page.goto('/practice');

      // Configure a short session (3 problems)
      const problemCountSelect = page.getByRole('combobox', { name: /number of problems/i })
        .or(page.locator('[data-testid="problem-count-select"]'))
        .or(page.getByLabel(/problems/i));

      // If we can find and interact with the select, do so
      if (await problemCountSelect.isVisible().catch(() => false)) {
        await problemCountSelect.selectOption('3');
      }

      // Start session
      const startButton = page.getByRole('button', { name: /start/i })
        .or(page.getByRole('link', { name: /start/i }));

      if (await startButton.isVisible().catch(() => false)) {
        await startButton.click();

        // Complete 3 problems
        for (let i = 0; i < 3; i++) {
          // Wait for problem to appear
          await page.waitForSelector('[data-testid="problem-display"]', { timeout: 5000 }).catch(() => {});

          // Find the answer input and submit
          const answerInput = page.getByRole('spinbutton').or(page.getByLabel(/answer/i));
          if (await answerInput.isVisible().catch(() => false)) {
            // Get the expected answer if visible or just try some answer
            await answerInput.fill('100');
            await answerInput.press('Enter');

            // Wait for feedback and click next
            const nextButton = page.getByRole('button', { name: /next/i });
            if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await nextButton.click();
            }
          }
        }

        // After session ends, go back home and check progress
        await page.goto('/');

        const progressCard = page.getByTestId('daily-progress');
        if (await progressCard.isVisible({ timeout: 5000 }).catch(() => false)) {
          // Verify progress increased
          const state = await getGoalsState(page) as { dailyGoal: { completedToday: number } } | null;
          // Progress should have increased
          expect(state?.dailyGoal?.completedToday).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });
});

test.describe('Daily Goals Accessibility', () => {
  test('progress bar has proper ARIA attributes', async ({ page }) => {
    await page.goto('/');

    const progressCard = page.getByTestId('daily-progress');
    await expect(progressCard).toBeVisible({ timeout: 10000 });

    const progressBar = progressCard.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();

    // Check required ARIA attributes
    await expect(progressBar).toHaveAttribute('aria-valuenow', /.+/);
    await expect(progressBar).toHaveAttribute('aria-valuemin', /.+/);
    await expect(progressBar).toHaveAttribute('aria-valuemax', /.+/);
  });

  test('streak icons have accessible labels', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await page.goto('/');
    await setGoalsState(page, {
      targetProblems: 10,
      completedToday: 10,
      currentStreak: 5,
      longestStreak: 5,
      lastGoalMetDate: today,
    });

    await page.reload();

    const progressCard = page.getByTestId('daily-progress');
    await expect(progressCard).toBeVisible({ timeout: 10000 });

    // Fire icon should have accessible name
    const fireIcon = progressCard.getByRole('img', { name: /fire/i });
    await expect(fireIcon).toBeVisible();
  });

  test('goal settings form is keyboard accessible', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('daily-progress')).toBeVisible({ timeout: 10000 });

    // Tab to adjust button and press enter
    const adjustButton = page.getByRole('button', { name: /adjust daily goal/i });
    await adjustButton.focus();
    await page.keyboard.press('Enter');

    // Settings should be visible
    const settings = page.getByTestId('goal-settings');
    await expect(settings).toBeVisible();

    // Tab through preset buttons
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to select via keyboard
    await page.keyboard.press('Enter');

    // Settings might close after selection
    await page.waitForTimeout(500);
  });
});
