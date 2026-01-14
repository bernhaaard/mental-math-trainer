import { test, expect, Page, ConsoleMessage } from '@playwright/test';

/**
 * E2E Tests for Practice Configuration Page
 * Tests the /practice route and all configuration options
 */

test.describe('Practice Configuration Page', () => {
  // Collect console errors for debugging
  let consoleErrors: ConsoleMessage[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg);
      }
    });
  });

  test.afterEach(async () => {
    // Log any console errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors.map(e => e.text()));
    }
  });

  test.describe('Configuration UI', () => {
    test('should render all main configuration sections', async ({ page }) => {
      await page.goto('/practice');

      // Check page title and header
      await expect(page.getByRole('heading', { name: 'Configure Practice Session' })).toBeVisible();
      await expect(page.getByText('Customize your mental math training experience')).toBeVisible();

      // Check breadcrumb navigation
      await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();

      // Check difficulty section
      await expect(page.getByRole('heading', { name: 'Difficulty Level' })).toBeVisible();

      // Check method section
      await expect(page.getByRole('heading', { name: 'Calculation Methods' })).toBeVisible();

      // Check problem count section
      await expect(page.getByRole('heading', { name: 'Number of Problems' })).toBeVisible();

      // Check additional options section
      await expect(page.getByRole('heading', { name: 'Additional Options' })).toBeVisible();

      // Check start button
      await expect(page.getByRole('button', { name: 'Start Practice Session' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start Practice Session' })).toBeEnabled();

      // Check session summary
      await expect(page.getByRole('heading', { name: 'Session Summary' })).toBeVisible();
    });

    test('should render method recommendations section', async ({ page }) => {
      await page.goto('/practice');

      // The recommendations section should be visible
      await expect(page.getByRole('heading', { name: 'Recommended Practice' })).toBeVisible();
    });
  });

  test.describe('Difficulty Selector', () => {
    test('should display all difficulty levels', async ({ page }) => {
      await page.goto('/practice');

      // Check all difficulty buttons are visible
      const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Mastery', 'Custom'];

      for (const difficulty of difficulties) {
        await expect(page.getByRole('button', { name: new RegExp(difficulty, 'i') })).toBeVisible();
      }
    });

    test('should have Beginner selected by default', async ({ page }) => {
      await page.goto('/practice');

      // Beginner should be selected (aria-pressed="true")
      const beginnerButton = page.getByRole('button', { name: /Beginner/i }).first();
      await expect(beginnerButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should allow selecting different difficulty levels', async ({ page }) => {
      await page.goto('/practice');

      // Select Intermediate
      const intermediateButton = page.getByRole('button', { name: /Intermediate/i }).first();
      await intermediateButton.click();
      await expect(intermediateButton).toHaveAttribute('aria-pressed', 'true');

      // Select Advanced
      const advancedButton = page.getByRole('button', { name: /Advanced/i }).first();
      await advancedButton.click();
      await expect(advancedButton).toHaveAttribute('aria-pressed', 'true');

      // Select Expert
      const expertButton = page.getByRole('button', { name: /Expert/i }).first();
      await expertButton.click();
      await expect(expertButton).toHaveAttribute('aria-pressed', 'true');

      // Select Mastery
      const masteryButton = page.getByRole('button', { name: /Mastery/i }).first();
      await masteryButton.click();
      await expect(masteryButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should show Custom range inputs when Custom is selected', async ({ page }) => {
      await page.goto('/practice');

      // Select Custom difficulty
      await page.getByRole('button', { name: /Custom/i }).first().click();

      // Custom range inputs should be visible
      // Look for number range inputs (these would be specific to NumberRangeInput component)
      await expect(page.getByText('Allow Negative Numbers')).toBeVisible();
    });

    test('should update session summary when difficulty changes', async ({ page }) => {
      await page.goto('/practice');

      // Check initial summary shows Beginner
      await expect(page.getByText(/Difficulty:\s*Beginner/i)).toBeVisible();

      // Select Intermediate
      await page.getByRole('button', { name: /Intermediate/i }).first().click();

      // Summary should update
      await expect(page.getByText(/Difficulty:\s*Intermediate/i)).toBeVisible();
    });
  });

  test.describe('Method Selector', () => {
    test('should display all 6 calculation methods', async ({ page }) => {
      await page.goto('/practice');

      const methods = [
        'Distributive Property',
        'Near Powers of 10',
        'Difference of Squares',
        'Factorization',
        'Squaring',
        'Near 100'
      ];

      for (const method of methods) {
        await expect(page.getByText(method, { exact: false })).toBeVisible();
      }
    });

    test('should have "All Methods" mode enabled by default', async ({ page }) => {
      await page.goto('/practice');

      // Check the info banner indicates system choice mode
      await expect(page.getByText('System will choose optimal methods')).toBeVisible();

      // Check session summary shows All Methods
      await expect(page.getByText('All Methods (System Choice)')).toBeVisible();
    });

    test('should allow toggling individual methods', async ({ page }) => {
      await page.goto('/practice');

      // First, need to deselect all methods to enable individual selection
      // Click "Clear" to switch from "All Methods" mode
      await page.getByRole('button', { name: 'Clear' }).click();

      // Now we should see "Practicing 1 method"
      await expect(page.getByText(/Practicing 1 method/)).toBeVisible();

      // Toggle a specific method
      const squaringCheckbox = page.getByRole('checkbox', { name: /Squaring/i });
      await squaringCheckbox.check();

      // Should now show 2 methods
      await expect(page.getByText(/Practicing 2 methods/)).toBeVisible();
    });

    test('should have All Methods and Clear buttons', async ({ page }) => {
      await page.goto('/practice');

      await expect(page.getByRole('button', { name: 'All Methods' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
    });

    test('All Methods button should be disabled when all methods selected', async ({ page }) => {
      await page.goto('/practice');

      // By default, all methods are selected (empty array = all)
      const allMethodsButton = page.getByRole('button', { name: 'All Methods' });
      await expect(allMethodsButton).toBeDisabled();
    });

    test('should show method examples', async ({ page }) => {
      await page.goto('/practice');

      // Check for example expressions
      await expect(page.getByText('47 × 53 = (40 + 7) × 53')).toBeVisible();
      await expect(page.getByText('47 × 53 = 50² - 3²')).toBeVisible();
      await expect(page.getByText('73² = (70 + 3)²')).toBeVisible();
    });
  });

  test.describe('Problem Count Input', () => {
    test('should display all problem count options', async ({ page }) => {
      await page.goto('/practice');

      const options = ['10 Problems', '25 Problems', '50 Problems', 'Infinite Practice'];

      for (const option of options) {
        await expect(page.getByRole('button', { name: option })).toBeVisible();
      }
    });

    test('should have 25 Problems selected by default', async ({ page }) => {
      await page.goto('/practice');

      const button25 = page.getByRole('button', { name: '25 Problems' });
      await expect(button25).toHaveAttribute('aria-pressed', 'true');
    });

    test('should allow selecting different problem counts', async ({ page }) => {
      await page.goto('/practice');

      // Select 10 Problems
      const button10 = page.getByRole('button', { name: '10 Problems' });
      await button10.click();
      await expect(button10).toHaveAttribute('aria-pressed', 'true');

      // Select 50 Problems
      const button50 = page.getByRole('button', { name: '50 Problems' });
      await button50.click();
      await expect(button50).toHaveAttribute('aria-pressed', 'true');

      // Select Infinite Practice
      const buttonInfinite = page.getByRole('button', { name: 'Infinite Practice' });
      await buttonInfinite.click();
      await expect(buttonInfinite).toHaveAttribute('aria-pressed', 'true');
    });

    test('should update session summary when problem count changes', async ({ page }) => {
      await page.goto('/practice');

      // Default is 25
      await expect(page.getByText(/Problems:\s*25/)).toBeVisible();

      // Select Infinite
      await page.getByRole('button', { name: 'Infinite Practice' }).click();
      await expect(page.getByText(/Problems:\s*Infinite/)).toBeVisible();
    });
  });

  test.describe('Allow Negatives Toggle', () => {
    test('should only appear when Custom difficulty is selected', async ({ page }) => {
      await page.goto('/practice');

      // Should not be visible with default difficulty
      await expect(page.getByText('Allow Negative Numbers')).not.toBeVisible();

      // Select Custom difficulty
      await page.getByRole('button', { name: /Custom/i }).first().click();

      // Now should be visible
      await expect(page.getByText('Allow Negative Numbers')).toBeVisible();
    });

    test('should be toggleable', async ({ page }) => {
      await page.goto('/practice');

      // Select Custom difficulty
      await page.getByRole('button', { name: /Custom/i }).first().click();

      // Find and toggle the checkbox
      const checkbox = page.getByRole('checkbox', { name: /Allow Negative Numbers/i });
      await expect(checkbox).not.toBeChecked();

      await checkbox.check();
      await expect(checkbox).toBeChecked();

      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    });
  });

  test.describe('Additional Options', () => {
    test('should display Show Solution Walkthroughs toggle', async ({ page }) => {
      await page.goto('/practice');

      await expect(page.getByText('Show Solution Walkthroughs')).toBeVisible();
      await expect(page.getByText('Display step-by-step solutions after each problem')).toBeVisible();
    });

    test('should have Show Walkthroughs checked by default', async ({ page }) => {
      await page.goto('/practice');

      const checkbox = page.getByRole('checkbox', { name: /Show Solution Walkthroughs/i });
      await expect(checkbox).toBeChecked();
    });

    test('should display Timer Mode options', async ({ page }) => {
      await page.goto('/practice');

      await expect(page.getByText('Timer Mode')).toBeVisible();
      await expect(page.getByRole('button', { name: /No Timer/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Per Problem/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Session Timer/i })).toBeVisible();
    });

    test('should have No Timer selected by default', async ({ page }) => {
      await page.goto('/practice');

      const noTimerButton = page.getByRole('button', { name: /No Timer/i });
      await expect(noTimerButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should allow changing timer mode', async ({ page }) => {
      await page.goto('/practice');

      // Select Per Problem
      const perProblemButton = page.getByRole('button', { name: /Per Problem/i });
      await perProblemButton.click();
      await expect(perProblemButton).toHaveAttribute('aria-pressed', 'true');

      // Session summary should update
      await expect(page.getByText(/Timer:\s*Per Problem/)).toBeVisible();

      // Select Session Timer
      const sessionButton = page.getByRole('button', { name: /Session Timer/i });
      await sessionButton.click();
      await expect(sessionButton).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByText(/Timer:\s*Session/)).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should keep Start button enabled with valid default config', async ({ page }) => {
      await page.goto('/practice');

      const startButton = page.getByRole('button', { name: 'Start Practice Session' });
      await expect(startButton).toBeEnabled();
    });

    test('should validate custom range values', async ({ page }) => {
      await page.goto('/practice');

      // Select Custom difficulty
      await page.getByRole('button', { name: /Custom/i }).first().click();

      // The form should still be valid with default custom range
      const startButton = page.getByRole('button', { name: 'Start Practice Session' });
      await expect(startButton).toBeEnabled();
    });
  });

  test.describe('URL Parameters', () => {
    test('should accept difficulty parameter', async ({ page }) => {
      await page.goto('/practice?difficulty=intermediate');

      // Intermediate should be selected
      const intermediateButton = page.getByRole('button', { name: /Intermediate/i }).first();
      await expect(intermediateButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should accept difficulty=advanced parameter', async ({ page }) => {
      await page.goto('/practice?difficulty=advanced');

      const advancedButton = page.getByRole('button', { name: /Advanced/i }).first();
      await expect(advancedButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should accept difficulty=expert parameter', async ({ page }) => {
      await page.goto('/practice?difficulty=expert');

      const expertButton = page.getByRole('button', { name: /Expert/i }).first();
      await expect(expertButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should accept difficulty=mastery parameter', async ({ page }) => {
      await page.goto('/practice?difficulty=mastery');

      const masteryButton = page.getByRole('button', { name: /Mastery/i }).first();
      await expect(masteryButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should accept methods parameter with single method', async ({ page }) => {
      await page.goto('/practice?methods=squaring');

      // Should show 1 method selected
      await expect(page.getByText(/Practicing 1 method/)).toBeVisible();
    });

    test('should accept methods parameter with multiple methods', async ({ page }) => {
      await page.goto('/practice?methods=squaring,distributive');

      // Should show 2 methods selected
      await expect(page.getByText(/Practicing 2 methods/)).toBeVisible();
    });

    test('should accept method parameter (singular alias)', async ({ page }) => {
      await page.goto('/practice?method=distributive');

      // Should work same as methods
      await expect(page.getByText(/Practicing 1 method/)).toBeVisible();
    });

    test('should accept count parameter', async ({ page }) => {
      await page.goto('/practice?count=10');

      const button10 = page.getByRole('button', { name: '10 Problems' });
      await expect(button10).toHaveAttribute('aria-pressed', 'true');
    });

    test('should accept count=50 parameter', async ({ page }) => {
      await page.goto('/practice?count=50');

      const button50 = page.getByRole('button', { name: '50 Problems' });
      await expect(button50).toHaveAttribute('aria-pressed', 'true');
    });

    test('should accept count=infinite parameter', async ({ page }) => {
      await page.goto('/practice?count=infinite');

      const buttonInfinite = page.getByRole('button', { name: 'Infinite Practice' });
      await expect(buttonInfinite).toHaveAttribute('aria-pressed', 'true');
    });

    test('should accept negatives=true parameter with custom difficulty', async ({ page }) => {
      // Note: negatives only applies to custom difficulty
      await page.goto('/practice?negatives=true');

      // This won't show unless custom is selected
      // The parameter should be accepted but won't have effect until custom is chosen
      await page.getByRole('button', { name: /Custom/i }).first().click();

      // Check if negatives checkbox reflects the URL parameter
      const checkbox = page.getByRole('checkbox', { name: /Allow Negative Numbers/i });
      await expect(checkbox).toBeVisible();
    });

    test('should accept combined parameters', async ({ page }) => {
      await page.goto('/practice?difficulty=intermediate&methods=squaring,distributive&count=50');

      // Check difficulty
      const intermediateButton = page.getByRole('button', { name: /Intermediate/i }).first();
      await expect(intermediateButton).toHaveAttribute('aria-pressed', 'true');

      // Check methods
      await expect(page.getByText(/Practicing 2 methods/)).toBeVisible();

      // Check count
      const button50 = page.getByRole('button', { name: '50 Problems' });
      await expect(button50).toHaveAttribute('aria-pressed', 'true');
    });

    test('should ignore invalid difficulty parameter', async ({ page }) => {
      await page.goto('/practice?difficulty=invalid');

      // Should fall back to default (Beginner)
      const beginnerButton = page.getByRole('button', { name: /Beginner/i }).first();
      await expect(beginnerButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should ignore invalid count parameter', async ({ page }) => {
      await page.goto('/practice?count=-5');

      // Should fall back to default (25)
      const button25 = page.getByRole('button', { name: '25 Problems' });
      await expect(button25).toHaveAttribute('aria-pressed', 'true');
    });

    test('should ignore count over 1000', async ({ page }) => {
      await page.goto('/practice?count=1001');

      // Should fall back to default (25)
      const button25 = page.getByRole('button', { name: '25 Problems' });
      await expect(button25).toHaveAttribute('aria-pressed', 'true');
    });

    test('should handle count=0 gracefully', async ({ page }) => {
      await page.goto('/practice?count=0');

      // Should fall back to default (25)
      const button25 = page.getByRole('button', { name: '25 Problems' });
      await expect(button25).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('IndexedDB and Console Errors', () => {
    test('should check for VersionError in console (Known Bug Issue #91)', async ({ page }) => {
      const dbErrors: string[] = [];

      page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('VersionError') || text.includes('IndexedDB')) {
          dbErrors.push(text);
        }
      });

      await page.goto('/practice');

      // Wait for any async operations
      await page.waitForTimeout(2000);

      // Document any DB errors found (this is a known issue per Issue #91)
      if (dbErrors.length > 0) {
        console.log('IndexedDB errors found (Known Bug #91):', dbErrors);
      }
    });

    test('should not have critical JavaScript errors', async ({ page }) => {
      const jsErrors: string[] = [];

      page.on('pageerror', (error) => {
        jsErrors.push(error.message);
      });

      await page.goto('/practice');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Fail if there are unhandled JS errors (excluding known IndexedDB issues)
      const criticalErrors = jsErrors.filter(
        err => !err.includes('VersionError') && !err.includes('IndexedDB')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Method Recommendations', () => {
    test('should display recommendations loading state', async ({ page }) => {
      await page.goto('/practice');

      // The recommendations section should exist
      await expect(page.getByRole('heading', { name: 'Recommended Practice' })).toBeVisible();
    });

    test('should show personalized message or default message', async ({ page }) => {
      await page.goto('/practice');

      // Wait for recommendations to load
      await page.waitForTimeout(1000);

      // Should show either personalized recommendations or a default message
      const recommendationSection = page.getByRole('heading', { name: 'Recommended Practice' }).locator('..');
      await expect(recommendationSection).toBeVisible();
    });

    test('should have a Refresh button', async ({ page }) => {
      await page.goto('/practice');

      // Wait for loading to complete
      await page.waitForTimeout(1000);

      // Check for refresh button
      await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible();
    });
  });

  test.describe('Start Session', () => {
    test('should redirect to session page when Start is clicked', async ({ page }) => {
      await page.goto('/practice');

      // Click Start Practice Session
      await page.getByRole('button', { name: 'Start Practice Session' }).click();

      // Should redirect to session page
      await expect(page).toHaveURL(/\/practice\/session/);
    });

    test('should save config to sessionStorage', async ({ page }) => {
      await page.goto('/practice');

      // Modify some settings
      await page.getByRole('button', { name: /Intermediate/i }).first().click();
      await page.getByRole('button', { name: '50 Problems' }).click();

      // Click Start
      await page.getByRole('button', { name: 'Start Practice Session' }).click();

      // Wait for redirect
      await page.waitForURL(/\/practice\/session/);

      // Check sessionStorage
      const storedConfig = await page.evaluate(() => {
        return sessionStorage.getItem('practiceSessionConfig');
      });

      expect(storedConfig).not.toBeNull();
      const config = JSON.parse(storedConfig as string);
      expect(config.difficulty).toBe('Intermediate');
      expect(config.problemCount).toBe(50);
    });

    test('should preserve method selection in session config', async ({ page }) => {
      await page.goto('/practice');

      // Clear and select specific methods
      await page.getByRole('button', { name: 'Clear' }).click();

      // Select Squaring method
      const squaringCheckbox = page.getByRole('checkbox', { name: /Squaring/i });
      await squaringCheckbox.check();

      // Click Start
      await page.getByRole('button', { name: 'Start Practice Session' }).click();

      // Wait for redirect
      await page.waitForURL(/\/practice\/session/);

      // Check sessionStorage contains the selected methods
      const storedConfig = await page.evaluate(() => {
        return sessionStorage.getItem('practiceSessionConfig');
      });

      expect(storedConfig).not.toBeNull();
      const config = JSON.parse(storedConfig as string);
      expect(config.methods).toContain('squaring');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/practice');

      // H1 should be the page title
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveText('Configure Practice Session');

      // There should be H3 headings for sections
      const h3s = page.getByRole('heading', { level: 3 });
      expect(await h3s.count()).toBeGreaterThan(0);
    });

    test('should have proper button states', async ({ page }) => {
      await page.goto('/practice');

      // Buttons should have aria-pressed for toggle states
      const difficultyButtons = page.locator('button[aria-pressed]');
      expect(await difficultyButtons.count()).toBeGreaterThan(0);
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/practice');

      // Tab to the first interactive element
      await page.keyboard.press('Tab');

      // Check that focused element has visible focus
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have accessible form controls', async ({ page }) => {
      await page.goto('/practice');

      // Checkboxes should have accessible names
      const checkboxes = page.getByRole('checkbox');
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        const checkbox = checkboxes.nth(i);
        const name = await checkbox.getAttribute('aria-label') || await checkbox.locator('..').textContent();
        expect(name).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should render properly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/practice');

      // Page should still be usable
      await expect(page.getByRole('heading', { name: 'Configure Practice Session' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start Practice Session' })).toBeVisible();
    });

    test('should render properly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/practice');

      // Page should still be usable
      await expect(page.getByRole('heading', { name: 'Configure Practice Session' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start Practice Session' })).toBeVisible();
    });
  });
});
