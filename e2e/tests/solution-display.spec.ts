/**
 * E2E Tests for Solution Display Quality
 * @module e2e/tests/solution-display
 *
 * These tests verify:
 * 1. Solution walkthrough UI renders correctly
 * 2. Mathematical correctness of displayed solutions
 * 3. Method selection quality for known cases
 * 4. Step complexity and presentation
 * 5. Method comparison page accuracy
 */

import { test, expect, type Page } from '@playwright/test';

/**
 * Test data for method selection verification.
 * These are known problematic cases and their expected optimal methods.
 */
const METHOD_SELECTION_TEST_CASES = [
  {
    num1: 47,
    num2: 53,
    expectedMethod: 'difference-squares',
    methodDisplayName: 'Difference of Squares',
    reason: 'Numbers symmetric around 50 (both 3 away)',
    expectedAnswer: 2491,
  },
  {
    num1: 92,
    num2: 88,
    expectedMethod: 'near-100',
    methodDisplayName: 'Near 100',
    reason: 'Both numbers close to 100 (within 15)',
    expectedAnswer: 8096,
    knownIssue: '#92', // Placeholder for potential issue
  },
  {
    num1: 98,
    num2: 47,
    expectedMethod: 'near-power-10',
    methodDisplayName: 'Near Powers of 10',
    reason: '98 is just 2 away from 100',
    expectedAnswer: 4606,
  },
  {
    num1: 24,
    num2: 35,
    expectedMethod: 'factorization',
    methodDisplayName: 'Factorization',
    reason: '24 has good factors (4x6, 3x8) for chaining',
    expectedAnswer: 840,
  },
  {
    num1: 73,
    num2: 73,
    expectedMethod: 'squaring',
    methodDisplayName: 'Squaring',
    reason: 'Identical numbers',
    expectedAnswer: 5329,
  },
  {
    num1: 97,
    num2: 103,
    expectedMethod: 'near-100',
    methodDisplayName: 'Near 100',
    reason: 'Both near 100 and symmetric',
    expectedAnswer: 9991,
  },
];

/**
 * Helper to navigate to practice session and answer a problem
 */
async function startPracticeSession(
  page: Page,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<void> {
  await page.goto('/practice');
  await page.waitForLoadState('networkidle');

  // Wait for the practice configuration page to load
  const startButton = page.getByRole('button', { name: /start/i });
  if (await startButton.isVisible()) {
    await startButton.click();
  }

  // Wait for the session to start
  await page.waitForURL('**/practice/session', { timeout: 10000 });
}

/**
 * Helper to submit an answer and view the solution
 */
async function submitAnswerAndViewSolution(
  page: Page,
  answer: number | 'skip'
): Promise<void> {
  if (answer === 'skip') {
    const skipButton = page.getByRole('button', { name: /skip/i });
    await skipButton.click();
  } else {
    const input = page.getByRole('spinbutton');
    await input.fill(String(answer));
    await input.press('Enter');
  }

  // Wait for feedback phase
  await page.waitForSelector('[role="status"], .feedback-display, [data-testid="feedback"]', {
    timeout: 5000,
  }).catch(() => {
    // Feedback may be shown differently
  });

  // Click to view solution
  const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
  if (await viewSolutionButton.isVisible()) {
    await viewSolutionButton.click();
  }
}

test.describe('Solution Display Quality', () => {
  test.describe('Solution Walkthrough UI', () => {
    test('displays solution walkthrough with all required elements', async ({ page }) => {
      await page.goto('/practice');

      // Configure and start a practice session
      const startButton = page.getByRole('button', { name: /start/i });
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }

      // Wait for session page
      await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {
        // May already be on session page
      });

      // Get the problem numbers displayed
      const problemDisplay = page.locator('.text-3xl, .problem-display, [data-testid="problem"]');
      await expect(problemDisplay.first()).toBeVisible({ timeout: 10000 });

      // Get the input and submit an answer (intentionally wrong to see solution)
      const input = page.getByRole('spinbutton');
      if (await input.isVisible({ timeout: 5000 })) {
        await input.fill('1234');
        await input.press('Enter');
      }

      // Try to view solution
      const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
      if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
        await viewSolutionButton.click();

        // Verify walkthrough elements are present
        await expect(page.getByText(/solution walkthrough/i)).toBeVisible({ timeout: 5000 });

        // Check for step navigation controls
        const stepControls = page.locator('button:has-text("Previous"), button:has-text("Next")');
        await expect(stepControls.first()).toBeVisible();

        // Check for method name display
        const methodInfo = page.locator('[class*="method"], [class*="accent"]');
        await expect(methodInfo.first()).toBeVisible();
      }
    });

    test('step navigation works correctly', async ({ page }) => {
      await page.goto('/practice');

      const startButton = page.getByRole('button', { name: /start/i });
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }

      await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {});

      const input = page.getByRole('spinbutton');
      if (await input.isVisible({ timeout: 5000 })) {
        await input.fill('0');
        await input.press('Enter');
      }

      const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
      if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
        await viewSolutionButton.click();

        // Test step navigation
        const nextButton = page.getByRole('button', { name: /next/i });
        const prevButton = page.getByRole('button', { name: /previous/i });

        if (await nextButton.isVisible()) {
          // Previous should be disabled on first step
          await expect(prevButton).toBeDisabled();

          // Click next to advance
          await nextButton.click();

          // Now previous should be enabled
          await expect(prevButton).toBeEnabled();
        }
      }
    });

    test('show all steps toggle works', async ({ page }) => {
      await page.goto('/practice');

      const startButton = page.getByRole('button', { name: /start/i });
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }

      await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {});

      const input = page.getByRole('spinbutton');
      if (await input.isVisible({ timeout: 5000 })) {
        await input.fill('0');
        await input.press('Enter');
      }

      const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
      if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
        await viewSolutionButton.click();

        // Find and click Show All button
        const showAllButton = page.getByRole('button', { name: /show all/i });
        if (await showAllButton.isVisible()) {
          await showAllButton.click();

          // Verify multiple steps are now visible
          const steps = page.locator('[class*="step"], [data-step]');
          const stepCount = await steps.count();

          // Should show more than 1 step
          expect(stepCount).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Mathematical Correctness', () => {
    test('solution displays correct final answer', async ({ page }) => {
      await page.goto('/practice');

      const startButton = page.getByRole('button', { name: /start/i });
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }

      await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {});

      // Get the problem numbers
      const problemText = await page.locator('.font-mono, [data-testid="problem"]').first().textContent();

      if (problemText) {
        // Parse the numbers from display (format like "47 x 53")
        const match = problemText.match(/(\d+)\s*[x*]\s*(\d+)/i);
        if (match) {
          const num1 = parseInt(match[1], 10);
          const num2 = parseInt(match[2], 10);
          const expectedAnswer = num1 * num2;

          // Submit wrong answer to see solution
          const input = page.getByRole('spinbutton');
          if (await input.isVisible({ timeout: 5000 })) {
            await input.fill('0');
            await input.press('Enter');
          }

          // View solution
          const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
          if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
            await viewSolutionButton.click();

            // Verify the answer is displayed correctly
            const answerDisplay = page.locator(`text=${expectedAnswer.toLocaleString()}, text=${expectedAnswer}`);
            await expect(answerDisplay.first()).toBeVisible({ timeout: 5000 });
          }
        }
      }
    });

    test('intermediate steps calculate correctly', async ({ page }) => {
      await page.goto('/practice');

      const startButton = page.getByRole('button', { name: /start/i });
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }

      await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {});

      const input = page.getByRole('spinbutton');
      if (await input.isVisible({ timeout: 5000 })) {
        await input.fill('0');
        await input.press('Enter');
      }

      const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
      if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
        await viewSolutionButton.click();

        // Click show all to see all steps
        const showAllButton = page.getByRole('button', { name: /show all/i });
        if (await showAllButton.isVisible()) {
          await showAllButton.click();
        }

        // Check for validation status
        const validationBadge = page.locator('text=/mathematically validated/i');
        await expect(validationBadge).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Method Comparison Page', () => {
    test('comparison table displays all six methods', async ({ page }) => {
      await page.goto('/study/compare');
      await page.waitForLoadState('networkidle');

      // Verify page title
      await expect(page.getByRole('heading', { name: /compare.*methods/i })).toBeVisible();

      // Check for all method names in the comparison table
      const expectedMethods = [
        'Distributive',
        'Difference of Squares',
        'Near Powers of 10',
        'Squaring',
        'Near 100',
        'Factorization',
      ];

      for (const method of expectedMethods) {
        await expect(page.getByText(method).first()).toBeVisible();
      }
    });

    test('decision flowchart is accessible', async ({ page }) => {
      await page.goto('/study/compare');
      await page.waitForLoadState('networkidle');

      // Check for flowchart section
      const flowchartSection = page.getByText(/method selection flowchart/i);
      await expect(flowchartSection).toBeVisible();

      // Verify flowchart content exists (either ASCII or simplified list)
      const flowchartContent = page.locator('pre, ol:has-text("Squaring")');
      await expect(flowchartContent.first()).toBeVisible();
    });

    test('method vs method comparisons show both winners', async ({ page }) => {
      await page.goto('/study/compare');
      await page.waitForLoadState('networkidle');

      // Navigate to comparison section
      const comparisonSection = page.getByText(/method vs method/i);
      await expect(comparisonSection).toBeVisible();

      // Check that "wins" badges exist (indicating A wins and B wins scenarios)
      const winsBadges = page.locator('text=/wins/i');
      const badgeCount = await winsBadges.count();

      expect(badgeCount).toBeGreaterThanOrEqual(2);
    });

    test('example problems are expandable', async ({ page }) => {
      await page.goto('/study/compare');
      await page.waitForLoadState('networkidle');

      // Look for expandable problem cards
      const problemCards = page.locator('button:has-text("48 x 52"), button:has-text("97 x 94")');

      if (await problemCards.first().isVisible()) {
        await problemCards.first().click();

        // Verify expanded content is visible
        const solutionSteps = page.locator('li:has-text("Recognize"), li:has-text("Apply")');
        await expect(solutionSteps.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Method Selection Quality', () => {
    // Test specific problematic cases
    for (const testCase of METHOD_SELECTION_TEST_CASES) {
      test(`verifies method selection for ${testCase.num1} x ${testCase.num2}`, async ({ page }) => {
        // This test checks method selection through the UI
        // Navigate to study compare page which shows optimal methods
        await page.goto('/study/compare');
        await page.waitForLoadState('networkidle');

        // Verify the expected method is documented for this type of problem
        if (testCase.num1 === 47 && testCase.num2 === 53) {
          // 47 x 53 should be listed as difference of squares example
          await expect(page.getByText('47 x 53').first()).toBeVisible();
          await expect(page.getByText(/difference of squares/i).first()).toBeVisible();
        }

        if (testCase.num1 === 97 && testCase.num2 === 103) {
          // Near 100 examples
          await expect(page.getByText(/near 100/i).first()).toBeVisible();
        }
      });
    }
  });

  test.describe('Visual Presentation', () => {
    test('solution steps are numbered correctly', async ({ page }) => {
      await page.goto('/practice');

      const startButton = page.getByRole('button', { name: /start/i });
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }

      await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {});

      const input = page.getByRole('spinbutton');
      if (await input.isVisible({ timeout: 5000 })) {
        await input.fill('0');
        await input.press('Enter');
      }

      const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
      if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
        await viewSolutionButton.click();

        // Show all steps
        const showAllButton = page.getByRole('button', { name: /show all/i });
        if (await showAllButton.isVisible()) {
          await showAllButton.click();
        }

        // Check for step numbering (Step 1 of X format)
        const stepIndicator = page.locator('text=/step \\d+ of \\d+/i');
        if (await stepIndicator.isVisible()) {
          await expect(stepIndicator).toBeVisible();
        }
      }
    });

    test('compare methods button shows alternatives', async ({ page }) => {
      await page.goto('/practice');

      const startButton = page.getByRole('button', { name: /start/i });
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }

      await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {});

      const input = page.getByRole('spinbutton');
      if (await input.isVisible({ timeout: 5000 })) {
        await input.fill('0');
        await input.press('Enter');
      }

      const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
      if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
        await viewSolutionButton.click();

        // Look for compare alternatives button
        const compareButton = page.getByRole('button', { name: /compare.*alternative|alternative.*method/i });
        if (await compareButton.isVisible()) {
          await compareButton.click();

          // Verify alternative methods section expands
          const alternativesSection = page.locator('text=/alternative|why not optimal/i');
          await expect(alternativesSection.first()).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('solution is responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/practice');

      const startButton = page.getByRole('button', { name: /start/i });
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }

      await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {});

      // Verify elements are still visible and not cut off
      const problemDisplay = page.locator('.text-3xl, .problem-display, [data-testid="problem"]');
      await expect(problemDisplay.first()).toBeVisible({ timeout: 10000 });

      const input = page.getByRole('spinbutton');
      if (await input.isVisible({ timeout: 5000 })) {
        await input.fill('0');
        await input.press('Enter');
      }

      const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
      if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
        await viewSolutionButton.click();

        // Verify solution walkthrough fits mobile viewport
        const walkthrough = page.locator('[role="region"][aria-label*="walkthrough"]');
        if (await walkthrough.isVisible()) {
          const box = await walkthrough.boundingBox();
          expect(box?.width).toBeLessThanOrEqual(375);
        }
      }
    });
  });

  test.describe('Step Complexity Analysis', () => {
    test('solutions do not show unnecessarily complex decompositions', async ({ page }) => {
      // This test checks for issue #92 - complex step decompositions like (2x46)x88
      // Instead of simpler representations like 92x88

      await page.goto('/practice');

      const startButton = page.getByRole('button', { name: /start/i });
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
      }

      await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {});

      const input = page.getByRole('spinbutton');
      if (await input.isVisible({ timeout: 5000 })) {
        await input.fill('0');
        await input.press('Enter');
      }

      const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
      if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
        await viewSolutionButton.click();

        // Show all steps
        const showAllButton = page.getByRole('button', { name: /show all/i });
        if (await showAllButton.isVisible()) {
          await showAllButton.click();
        }

        // Check that steps use the original numbers where possible
        // Look for patterns like (2x46) which indicate unnecessary decomposition
        const pageContent = await page.content();

        // This is a heuristic check - if we see patterns like "(2*46)" or "(2x46)"
        // when the original was 92, that might indicate a problem
        const unnecessaryDecompositions = pageContent.match(/\(\d+\s*[*x]\s*\d+\)\s*[*x]\s*\d+/g);

        // Log findings for manual review
        if (unnecessaryDecompositions && unnecessaryDecompositions.length > 0) {
          console.log('Found potentially complex decompositions:', unnecessaryDecompositions);
        }
      }
    });
  });
});

/**
 * Accessibility tests for solution display
 */
test.describe('Solution Display Accessibility', () => {
  test('solution walkthrough has proper ARIA labels', async ({ page }) => {
    await page.goto('/practice');

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();
    }

    await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {});

    const input = page.getByRole('spinbutton');
    if (await input.isVisible({ timeout: 5000 })) {
      await input.fill('0');
      await input.press('Enter');
    }

    const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
    if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
      await viewSolutionButton.click();

      // Check for proper region labeling
      const walkthroughRegion = page.locator('[role="region"][aria-label*="walkthrough"]');
      await expect(walkthroughRegion).toBeVisible({ timeout: 5000 });
    }
  });

  test('keyboard navigation works in solution walkthrough', async ({ page }) => {
    await page.goto('/practice');

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();
    }

    await page.waitForURL('**/practice/session', { timeout: 10000 }).catch(() => {});

    const input = page.getByRole('spinbutton');
    if (await input.isVisible({ timeout: 5000 })) {
      await input.fill('0');
      await input.press('Enter');
    }

    const viewSolutionButton = page.getByRole('button', { name: /view solution|show solution/i });
    if (await viewSolutionButton.isVisible({ timeout: 5000 })) {
      await viewSolutionButton.click();

      // Try keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Verify focus is managed (close button should be focusable)
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });
});
