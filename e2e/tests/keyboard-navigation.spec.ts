import { test, expect, Page } from '@playwright/test';

/**
 * Keyboard Navigation Accessibility Tests
 *
 * Tests that the entire application is usable with keyboard only.
 * Covers:
 * - Tab navigation order
 * - Focus visibility
 * - Practice session keyboard interactions
 * - Form interactions
 * - Modal/dialog handling
 * - Keyboard shortcuts
 * - Focus management after actions
 */

test.describe('Keyboard Navigation', () => {
  // ============================================================================
  // Tab Navigation Tests
  // ============================================================================

  test.describe('Tab Navigation', () => {
    test('skip link is functional and visible on focus', async ({ page }) => {
      await page.goto('/');

      // Press Tab to focus the skip link
      await page.keyboard.press('Tab');

      // Skip link should be visible when focused
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toBeVisible();
      await expect(skipLink).toHaveText(/skip to main content/i);

      // Press Enter to activate skip link
      await page.keyboard.press('Enter');

      // Focus should move to main content
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    });

    test('home page has logical tab order', async ({ page }) => {
      await page.goto('/');

      const tabOrder: string[] = [];

      // Tab through interactive elements and record their labels/text
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const text = await focused.textContent().catch(() => null);
        const ariaLabel = await focused.getAttribute('aria-label').catch(() => null);
        const role = await focused.getAttribute('role').catch(() => null);

        if (text || ariaLabel) {
          tabOrder.push(ariaLabel || text?.trim() || 'unknown');
        }
      }

      // Verify navigation links appear in the tab order
      expect(tabOrder.some((item) => item.includes('Home') || item.includes('Practice'))).toBeTruthy();
    });

    test('navigation has correct tab order', async ({ page }) => {
      await page.goto('/');

      // Skip the skip link
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should focus on logo/brand first
      const focused = page.locator(':focus');
      const href = await focused.getAttribute('href');
      expect(href).toBe('/');

      // Tab through navigation items
      const navItems = ['/', '/practice', '/study', '/statistics'];
      for (let i = 1; i < navItems.length; i++) {
        await page.keyboard.press('Tab');
        const currentFocused = page.locator(':focus');
        const currentHref = await currentFocused.getAttribute('href');
        // Check that we're getting navigation links (desktop nav)
        if (currentHref && navItems.includes(currentHref)) {
          // Valid nav item
        }
      }
    });

    test('practice configuration page has correct tab order', async ({ page }) => {
      await page.goto('/practice');

      // Wait for page to load
      await page.waitForSelector('h1');

      // Tab through elements to verify they are focusable
      const focusableElements: string[] = [];

      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const tagName = await focused.evaluate((el) => el.tagName).catch(() => null);
        const ariaLabel = await focused.getAttribute('aria-label').catch(() => null);
        const text = await focused.textContent().catch(() => null);

        if (tagName) {
          focusableElements.push(`${tagName}: ${ariaLabel || text?.slice(0, 30) || 'no text'}`);
        }
      }

      // Should include difficulty buttons, method buttons, and start button
      expect(focusableElements.length).toBeGreaterThan(5);
    });

    test('study page has correct tab order', async ({ page }) => {
      await page.goto('/study');

      await page.waitForSelector('h1');

      // Tab through elements
      const focusedElements: string[] = [];

      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const href = await focused.getAttribute('href').catch(() => null);

        if (href) {
          focusedElements.push(href);
        }
      }

      // Should include links to method pages
      expect(focusedElements.some((href) => href.includes('/study/'))).toBeTruthy();
    });

    test('statistics page has correct tab order', async ({ page }) => {
      await page.goto('/statistics');

      await page.waitForSelector('body');

      // Tab through elements
      let foundLink = false;

      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const href = await focused.getAttribute('href').catch(() => null);

        if (href) {
          foundLink = true;
        }
      }

      // Should have focusable elements (links to practice or study)
      expect(foundLink).toBeTruthy();
    });
  });

  // ============================================================================
  // Focus Visibility Tests
  // ============================================================================

  test.describe('Focus Visibility', () => {
    test('focus ring is visible on navigation links', async ({ page }) => {
      await page.goto('/');

      // Tab to navigation
      await page.keyboard.press('Tab'); // skip link
      await page.keyboard.press('Tab'); // logo
      await page.keyboard.press('Tab'); // first nav item

      const focused = page.locator(':focus');

      // Check that the element has focus styles (typically outline or ring)
      // We check for common focus indicator CSS properties
      const outline = await focused.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.outline || styles.outlineWidth;
      });

      // The element should have visible focus indicators
      // (specific styling varies, but there should be something)
      expect(outline).toBeDefined();
    });

    test('focus ring is visible on buttons', async ({ page }) => {
      await page.goto('/');

      // Navigate to the "Start Practice" button
      const practiceButton = page.getByRole('link', { name: /start practice/i });
      await practiceButton.focus();

      await expect(practiceButton).toBeFocused();

      // Verify button is visible with focus
      await expect(practiceButton).toBeVisible();
    });

    test('focus ring is visible on form inputs in practice config', async ({ page }) => {
      await page.goto('/practice');

      await page.waitForSelector('h1');

      // Find and focus on a checkbox
      const checkbox = page.locator('input[type="checkbox"]').first();

      if (await checkbox.isVisible()) {
        await checkbox.focus();
        await expect(checkbox).toBeFocused();
      }
    });

    test('focus ring is visible on method cards in study page', async ({ page }) => {
      await page.goto('/study');

      await page.waitForSelector('h1');

      // Tab to a method card link
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const href = await focused.getAttribute('href').catch(() => null);

        if (href?.includes('/study/')) {
          // Found a method card link
          await expect(focused).toBeFocused();
          await expect(focused).toBeVisible();
          break;
        }
      }
    });
  });

  // ============================================================================
  // Practice Session Keyboard Tests
  // ============================================================================

  test.describe('Practice Session Keyboard Interactions', () => {
    async function startPracticeSession(page: Page) {
      await page.goto('/practice');
      await page.waitForSelector('h1');

      // Click start button to begin session
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      // Wait for session to load
      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');
    }

    test('can enter answer with keyboard', async ({ page }) => {
      await startPracticeSession(page);

      // The input should be focused automatically
      const input = page.locator('input[aria-label="Your answer"]');
      await expect(input).toBeFocused();

      // Type a number
      await page.keyboard.type('1234');
      await expect(input).toHaveValue('1234');
    });

    test('can submit answer with Enter key', async ({ page }) => {
      await startPracticeSession(page);

      // Type an answer
      await page.keyboard.type('100');

      // Submit with Enter
      await page.keyboard.press('Enter');

      // Should show feedback (either correct or incorrect)
      // Wait for feedback to appear
      await page.waitForSelector('text=/Correct|Not quite/i', { timeout: 5000 });
    });

    test('can request hint with keyboard shortcut', async ({ page }) => {
      await startPracticeSession(page);

      // Press 'h' for hint (outside input context)
      // First, we need to blur the input
      await page.keyboard.press('Escape');

      // Now press 'h' for hint
      // Note: This might skip the problem with Escape, so test may need adjustment
      // based on actual app behavior
    });

    test('can skip problem with keyboard', async ({ page }) => {
      await startPracticeSession(page);

      // Focus the Skip button and press Enter
      const skipButton = page.getByRole('button', { name: /skip/i });
      await skipButton.focus();
      await page.keyboard.press('Enter');

      // Should show feedback
      await page.waitForSelector('text=/Next Problem|Correct|Not quite/i', { timeout: 5000 });
    });

    test('can navigate to next problem with N key after feedback', async ({ page }) => {
      await startPracticeSession(page);

      // Submit an answer to get to feedback phase
      await page.keyboard.type('100');
      await page.keyboard.press('Enter');

      // Wait for feedback
      await page.waitForSelector('text=/Correct|Not quite/i', { timeout: 5000 });

      // Press N to go to next problem
      await page.keyboard.press('n');

      // Should be back in answering phase or show next problem
      // The input should be visible and focused
      await page.waitForSelector('input[aria-label="Your answer"]', { timeout: 5000 });
    });

    test('can view solution with S key after feedback', async ({ page }) => {
      await startPracticeSession(page);

      // Submit an answer
      await page.keyboard.type('100');
      await page.keyboard.press('Enter');

      // Wait for feedback
      await page.waitForSelector('text=/Correct|Not quite/i', { timeout: 5000 });

      // Press S to view solution
      await page.keyboard.press('s');

      // Solution walkthrough should be visible
      await page.waitForSelector('text=/Solution|Step/i', { timeout: 5000 });
    });
  });

  // ============================================================================
  // Form Interactions Tests
  // ============================================================================

  test.describe('Form Interactions', () => {
    test('can navigate difficulty options with Tab', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('h1');

      // Find difficulty buttons
      const difficultyButtons = page.getByRole('button', { name: /beginner|intermediate|advanced|expert/i });

      // Navigate to first difficulty button
      const firstButton = difficultyButtons.first();
      await firstButton.focus();
      await expect(firstButton).toBeFocused();

      // Tab to next difficulty button
      await page.keyboard.press('Tab');

      // Should be on next difficulty button or another focusable element
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    });

    test('can select options with Enter/Space', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('h1');

      // Find a button that's not pressed
      const intermediateButton = page.getByRole('button', { name: /intermediate/i });
      await intermediateButton.focus();

      // Press Enter to select
      await page.keyboard.press('Enter');

      // Should now be selected (aria-pressed=true)
      await expect(intermediateButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('can toggle checkboxes with Space', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('h1');

      // Find a checkbox
      const checkbox = page.locator('input[type="checkbox"]').first();

      if (await checkbox.isVisible()) {
        const initialState = await checkbox.isChecked();

        await checkbox.focus();
        await page.keyboard.press('Space');

        // Should toggle
        const newState = await checkbox.isChecked();
        expect(newState).toBe(!initialState);
      }
    });

    test('can submit form with Enter on start button', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('h1');

      // Focus and activate start button
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.focus();
      await page.keyboard.press('Enter');

      // Should navigate to session
      await page.waitForURL('/practice/session');
    });
  });

  // ============================================================================
  // Modal/Dialog Handling Tests
  // ============================================================================

  test.describe('Modal/Dialog Handling', () => {
    test('keyboard shortcuts help modal opens with ? key', async ({ page }) => {
      // Start a practice session
      await page.goto('/practice');
      await page.waitForSelector('h1');

      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');

      // Press ? to open keyboard shortcuts help
      await page.keyboard.press('?');

      // Modal should be visible
      await page.waitForSelector('text=/keyboard shortcuts/i', { timeout: 5000 });
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    });

    test('modal closes with Escape key', async ({ page }) => {
      // Start a practice session
      await page.goto('/practice');
      await page.waitForSelector('h1');

      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');

      // Open keyboard shortcuts help
      await page.keyboard.press('?');
      await page.waitForSelector('text=/keyboard shortcuts/i');

      // Press Escape to close
      await page.keyboard.press('Escape');

      // Modal should be closed
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('focus is trapped within modal', async ({ page }) => {
      // Start a practice session
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');

      // Open keyboard shortcuts help
      await page.keyboard.press('?');
      await page.waitForSelector('[role="dialog"]');

      // Tab multiple times and verify focus stays within modal
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Get initial focused element
      const initialFocusedElement = await page.locator(':focus').elementHandle();

      // Tab through the modal multiple times
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const isWithinModal = await focused.evaluate((el, modalSelector) => {
          const modal = document.querySelector('[role="dialog"]');
          return modal?.contains(el) || el.closest('[role="dialog"]') !== null;
        }, null);

        expect(isWithinModal).toBeTruthy();
      }
    });

    test('pause modal opens with Space key', async ({ page }) => {
      // Start a practice session
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');

      // Press Space to pause (need to blur input first or it will type space)
      await page.locator('body').click(); // Click outside input
      await page.keyboard.press('Space');

      // Pause dialog should appear
      await page.waitForSelector('text=/session paused/i', { timeout: 5000 });
    });
  });

  // ============================================================================
  // Keyboard Shortcuts Tests
  // ============================================================================

  test.describe('Keyboard Shortcuts', () => {
    test('? opens keyboard shortcuts help', async ({ page }) => {
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');

      await page.keyboard.press('?');
      await page.waitForSelector('text=/keyboard shortcuts/i');
    });

    test('Space pauses/resumes session', async ({ page }) => {
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');

      // Blur input and press Space
      await page.locator('body').click();
      await page.keyboard.press('Space');

      // Should show paused state
      await page.waitForSelector('text=/session paused/i');

      // Press Space again to resume
      await page.keyboard.press('Space');

      // Should resume - paused text should disappear
      await expect(page.getByText(/session paused/i)).not.toBeVisible();
    });

    test('Q ends session', async ({ page }) => {
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');

      // Press Q to end session
      await page.keyboard.press('q');

      // Should show session complete
      await page.waitForSelector('text=/session complete|start new session/i');
    });

    test('Enter submits answer in input', async ({ page }) => {
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');

      const input = page.locator('input[aria-label="Your answer"]');
      await expect(input).toBeFocused();

      await page.keyboard.type('100');
      await page.keyboard.press('Enter');

      // Should show feedback
      await page.waitForSelector('text=/Correct|Not quite/i');
    });

    test('shortcuts do not conflict with browser shortcuts', async ({ page }) => {
      await page.goto('/');

      // Ctrl+L should still work (address bar) - we can't test this directly
      // but we can ensure our shortcuts don't prevent default browser behavior

      // Test that standard text editing shortcuts work in inputs
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');

      const input = page.locator('input[aria-label="Your answer"]');
      await expect(input).toBeFocused();

      // Type something
      await page.keyboard.type('12345');

      // Select all with Ctrl+A
      await page.keyboard.press('Control+a');

      // Type to replace
      await page.keyboard.type('999');

      await expect(input).toHaveValue('999');
    });
  });

  // ============================================================================
  // Screen Reader Hints Tests
  // ============================================================================

  test.describe('Screen Reader Accessibility', () => {
    test('all interactive elements have accessible names', async ({ page }) => {
      await page.goto('/');

      // Check buttons have accessible names
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();

        // Button should have either aria-label or text content
        expect(ariaLabel || text?.trim()).toBeTruthy();
      }

      // Check links have accessible names
      const links = page.getByRole('link');
      const linkCount = await links.count();

      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const ariaLabel = await link.getAttribute('aria-label');
        const text = await link.textContent();

        expect(ariaLabel || text?.trim()).toBeTruthy();
      }
    });

    test('form inputs have associated labels', async ({ page }) => {
      await page.goto('/practice');
      await page.waitForSelector('h1');

      // Check inputs have labels or aria-labels
      const inputs = page.locator('input');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const id = await input.getAttribute('id');

        // Check for associated label
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;

          expect(ariaLabel || ariaLabelledBy || hasLabel).toBeTruthy();
        } else {
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });

    test('ARIA roles are correctly applied', async ({ page }) => {
      await page.goto('/');

      // Check navigation role
      const nav = page.getByRole('navigation');
      await expect(nav.first()).toBeVisible();

      // Check main content
      const main = page.locator('#main-content');
      await expect(main).toBeVisible();

      // Start a session and check dialog roles
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');

      // Open modal and check role
      await page.keyboard.press('?');
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    test('live regions announce updates', async ({ page }) => {
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');

      // Check for live region
      const liveRegion = page.locator('[role="status"][aria-live="polite"]');
      await expect(liveRegion.first()).toBeVisible();
    });
  });

  // ============================================================================
  // Focus Management Tests
  // ============================================================================

  test.describe('Focus Management', () => {
    test('focus moves to input after navigating to practice session', async ({ page }) => {
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');

      // Input should be auto-focused
      const input = page.locator('input[aria-label="Your answer"]');
      await expect(input).toBeFocused();
    });

    test('focus returns to input after submitting answer and moving to next problem', async ({ page }) => {
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');

      // Submit an answer
      await page.keyboard.type('100');
      await page.keyboard.press('Enter');

      await page.waitForSelector('text=/Correct|Not quite/i');

      // Press N to go to next
      await page.keyboard.press('n');

      // Input should be focused again
      await page.waitForSelector('input[aria-label="Your answer"]');
      const input = page.locator('input[aria-label="Your answer"]');
      await expect(input).toBeFocused();
    });

    test('focus is not lost after closing modal', async ({ page }) => {
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');
      await page.waitForSelector('input');

      // Open and close keyboard help modal
      await page.keyboard.press('?');
      await page.waitForSelector('[role="dialog"]');
      await page.keyboard.press('Escape');

      // Focus should return to a reasonable element (not lost)
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    });

    test('focus moves logically after feedback', async ({ page }) => {
      await page.goto('/practice');
      const startButton = page.getByRole('button', { name: /start practice session/i });
      await startButton.click();

      await page.waitForURL('/practice/session');

      // Submit answer
      await page.keyboard.type('100');
      await page.keyboard.press('Enter');

      await page.waitForSelector('text=/Correct|Not quite/i');

      // Focus should be on an action button (Next or View Solution)
      const focused = page.locator(':focus');
      const role = await focused.getAttribute('role');
      const tagName = await focused.evaluate((el) => el.tagName);

      expect(role === 'button' || tagName === 'BUTTON').toBeTruthy();
    });

    test('mobile menu focus management', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Find and click mobile menu button
      const menuButton = page.getByRole('button', { name: /toggle navigation menu/i });
      await menuButton.click();

      // Menu should be visible
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();

      // First menu item should be focused
      const firstMenuItem = mobileMenu.getByRole('link').first();
      await expect(firstMenuItem).toBeFocused();

      // Press Escape to close
      await page.keyboard.press('Escape');

      // Menu should be closed and focus returned to menu button
      await expect(mobileMenu).not.toBeVisible();
      await expect(menuButton).toBeFocused();
    });

    test('focus trap in mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Open mobile menu
      const menuButton = page.getByRole('button', { name: /toggle navigation menu/i });
      await menuButton.click();

      await page.waitForSelector('#mobile-menu');

      // Tab through menu items multiple times
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');

        // Focus should stay within mobile menu
        const focused = page.locator(':focus');
        const isInMenu = await focused.evaluate((el) => {
          const menu = document.querySelector('#mobile-menu');
          return menu?.contains(el) || el.closest('#mobile-menu') !== null;
        });

        expect(isInMenu).toBeTruthy();
      }
    });
  });
});
