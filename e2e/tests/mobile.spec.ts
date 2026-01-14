import { test, expect, Page } from '@playwright/test';

/**
 * Mobile Testing Suite
 *
 * Comprehensive mobile testing for Mental Math Mastery app.
 * Tests cover viewport responsiveness, touch interactions, mobile-specific
 * functionality, and accessibility on mobile devices.
 */

// Custom viewport configurations for testing
const viewports = {
  iPhoneSE: { width: 375, height: 667 },
  iPhone13: { width: 390, height: 844 },
  iPad: { width: 768, height: 1024 },
  AndroidPhone: { width: 360, height: 640 },
  iPhoneSELandscape: { width: 667, height: 375 },
  iPhone13Landscape: { width: 844, height: 390 },
  iPadLandscape: { width: 1024, height: 768 },
};

// Minimum touch target size per WCAG guidelines
const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Helper function to check if elements meet minimum touch target size.
 * Exported for potential reuse in other test files.
 */
export async function checkTouchTargetSize(
  page: Page,
  selector: string
): Promise<{ valid: boolean; elements: Array<{ text: string; width: number; height: number }> }> {
  const elements = await page.locator(selector).all();
  const invalidElements: Array<{ text: string; width: number; height: number }> = [];

  for (const element of elements) {
    const box = await element.boundingBox();
    if (box) {
      if (box.width < MIN_TOUCH_TARGET_SIZE || box.height < MIN_TOUCH_TARGET_SIZE) {
        const text = await element.textContent();
        invalidElements.push({
          text: text?.trim() || 'unknown',
          width: Math.round(box.width),
          height: Math.round(box.height),
        });
      }
    }
  }

  return { valid: invalidElements.length === 0, elements: invalidElements };
}

/**
 * Helper to check for horizontal scrolling issues
 */
async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
}

// ============================================================================
// Test Suite: Mobile Viewport Responsiveness
// ============================================================================

test.describe('Mobile Viewport Responsiveness', () => {
  test.describe('iPhone SE (375x667)', () => {
    test.use({ viewport: viewports.iPhoneSE });

    test('home page renders correctly', async ({ page }) => {
      await page.goto('/');

      // Check page loads
      await expect(page).toHaveTitle(/Mental Math/i);

      // Check no horizontal scrolling
      const hasHScroll = await hasHorizontalScroll(page);
      expect(hasHScroll).toBe(false);

      // Check main heading is visible
      await expect(page.getByRole('heading', { name: /Mental Math Mastery/i })).toBeVisible();

      // Check navigation buttons are visible and not cut off
      await expect(page.getByRole('link', { name: /Start Practice/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Study Methods/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /View Statistics/i })).toBeVisible();
    });

    test('practice config page renders correctly', async ({ page }) => {
      await page.goto('/practice');

      // Page should load without horizontal scroll
      const hasHScroll = await hasHorizontalScroll(page);
      expect(hasHScroll).toBe(false);

      // Key elements should be visible
      await expect(page.getByRole('heading', { name: /Configure Practice Session/i })).toBeVisible();

      // Start button should be visible
      await expect(page.getByRole('button', { name: /Start Practice Session/i })).toBeVisible();
    });

    test('study page renders correctly', async ({ page }) => {
      await page.goto('/study');

      const hasHScroll = await hasHorizontalScroll(page);
      expect(hasHScroll).toBe(false);

      await expect(page.getByRole('heading', { name: /Master Mental Math/i })).toBeVisible();

      // Method cards should be visible
      await expect(page.getByText(/Distributive Property/i).first()).toBeVisible();
    });

    test('statistics page renders correctly', async ({ page }) => {
      await page.goto('/statistics');

      const hasHScroll = await hasHorizontalScroll(page);
      expect(hasHScroll).toBe(false);

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('iPhone 13 (390x844)', () => {
    test.use({ viewport: viewports.iPhone13 });

    test('home page responsive layout', async ({ page }) => {
      await page.goto('/');

      const hasHScroll = await hasHorizontalScroll(page);
      expect(hasHScroll).toBe(false);

      // Feature cards should stack vertically on mobile
      const featureCards = page.locator('.rounded-lg.border.bg-card.p-6');
      await expect(featureCards.first()).toBeVisible();
    });

    test('study page method grid adapts', async ({ page }) => {
      await page.goto('/study');

      const hasHScroll = await hasHorizontalScroll(page);
      expect(hasHScroll).toBe(false);

      // Cards should be visible and not overlapping
      const methodCards = page.locator('[aria-label*="Study"]');
      const cardCount = await methodCards.count();
      expect(cardCount).toBeGreaterThan(0);
    });
  });

  test.describe('iPad (768x1024)', () => {
    test.use({ viewport: viewports.iPad });

    test('home page uses tablet layout', async ({ page }) => {
      await page.goto('/');

      const hasHScroll = await hasHorizontalScroll(page);
      expect(hasHScroll).toBe(false);

      // Desktop nav should still be hidden on iPad in portrait
      // (768px is the md breakpoint, so mobile menu should show)
      const mobileMenuButton = page.getByLabel(/Toggle navigation menu/i);
      await expect(mobileMenuButton).toBeVisible();
    });

    test('practice config has proper grid layout', async ({ page }) => {
      await page.goto('/practice');

      const hasHScroll = await hasHorizontalScroll(page);
      expect(hasHScroll).toBe(false);

      // Problem count buttons should be in grid
      const problemCountSection = page.locator('text=Number of Problems').locator('..');
      await expect(problemCountSection).toBeVisible();
    });
  });

  test.describe('Android Phone (360x640)', () => {
    test.use({ viewport: viewports.AndroidPhone });

    test('small screen renders without horizontal scroll', async ({ page }) => {
      await page.goto('/');

      const hasHScroll = await hasHorizontalScroll(page);
      expect(hasHScroll).toBe(false);

      // Text should be readable
      const heading = page.getByRole('heading', { name: /Mental Math Mastery/i });
      await expect(heading).toBeVisible();
    });

    test('navigation is accessible on small screens', async ({ page }) => {
      await page.goto('/');

      // Mobile menu button should be visible
      const menuButton = page.getByLabel(/Toggle navigation menu/i);
      await expect(menuButton).toBeVisible();

      // Desktop nav should be hidden
      const desktopNav = page.locator('nav.hidden.md\\:flex');
      await expect(desktopNav).toBeHidden();
    });
  });
});

// ============================================================================
// Test Suite: Mobile Navigation (Hamburger Menu)
// ============================================================================

test.describe('Mobile Navigation', () => {
  test.use({ viewport: viewports.iPhoneSE });

  test('hamburger menu opens and closes', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByLabel(/Toggle navigation menu/i);
    await expect(menuButton).toBeVisible();

    // Menu should be closed initially
    const mobileNav = page.locator('#mobile-menu');
    await expect(mobileNav).toBeHidden();

    // Open menu
    await menuButton.tap();
    await expect(mobileNav).toBeVisible();

    // Close menu
    await menuButton.tap();
    await expect(mobileNav).toBeHidden();
  });

  test('mobile menu navigation links work', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByLabel(/Toggle navigation menu/i);
    await menuButton.tap();

    // Navigate to Practice
    await page.getByRole('link', { name: 'Practice' }).tap();
    await expect(page).toHaveURL(/\/practice/);

    // Menu should close after navigation
    const mobileNav = page.locator('#mobile-menu');
    await expect(mobileNav).toBeHidden();
  });

  test('escape key closes mobile menu', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByLabel(/Toggle navigation menu/i);
    await menuButton.tap();

    const mobileNav = page.locator('#mobile-menu');
    await expect(mobileNav).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(mobileNav).toBeHidden();

    // Focus should return to menu button
    await expect(menuButton).toBeFocused();
  });

  test('mobile menu has focus trap', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByLabel(/Toggle navigation menu/i);
    await menuButton.tap();

    // Tab through menu items
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should cycle back to first item (focus trap)
    const homeLink = page.locator('#mobile-menu').getByRole('link', { name: 'Home' });
    await expect(homeLink).toBeFocused();
  });

  test('mobile menu button is touch-sized', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByLabel(/Toggle navigation menu/i);
    const box = await menuButton.boundingBox();

    expect(box).not.toBeNull();
    if (box) {
      // Menu button should meet minimum touch target size
      expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
    }
  });
});

// ============================================================================
// Test Suite: Touch Target Sizes
// ============================================================================

test.describe('Touch Target Sizes', () => {
  test.use({ viewport: viewports.iPhoneSE });

  test('home page navigation links meet minimum size', async ({ page }) => {
    await page.goto('/');

    // Check main CTA buttons
    const startPractice = page.getByRole('link', { name: /Start Practice/i });
    const box = await startPractice.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
    }
  });

  test('practice config buttons meet minimum size', async ({ page }) => {
    await page.goto('/practice');

    // Check start button
    const startButton = page.getByRole('button', { name: /Start Practice Session/i });
    const box = await startButton.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
    }

    // Check difficulty buttons
    const difficultyButtons = page.locator('[aria-pressed]');
    const count = await difficultyButtons.count();
    for (let i = 0; i < count; i++) {
      const buttonBox = await difficultyButtons.nth(i).boundingBox();
      if (buttonBox) {
        // Buttons should be at least touch-target size
        expect(buttonBox.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
      }
    }
  });

  test('answer input clear button meets minimum size', async ({ page }) => {
    // Set up session config
    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).click();

    // Wait for session to load
    await page.waitForURL(/\/practice\/session/);
    await page.waitForSelector('input[aria-label="Your answer"]');

    // Type something to show clear button
    await page.fill('input[aria-label="Your answer"]', '123');

    const clearButton = page.getByLabel(/Clear input/i);
    const box = await clearButton.boundingBox();

    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
      expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
    }
  });

  test('session action buttons meet minimum size', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await page.waitForURL(/\/practice\/session/);
    await page.waitForSelector('input[aria-label="Your answer"]');

    // Check submit button
    const submitButton = page.getByLabel(/Submit answer/i);
    const submitBox = await submitButton.boundingBox();
    expect(submitBox).not.toBeNull();
    if (submitBox) {
      expect(submitBox.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
    }

    // Check hint button
    const hintButton = page.getByLabel(/Request hint/i);
    const hintBox = await hintButton.boundingBox();
    expect(hintBox).not.toBeNull();
    if (hintBox) {
      expect(hintBox.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
    }

    // Check skip button
    const skipButton = page.getByLabel(/Skip this problem/i);
    const skipBox = await skipButton.boundingBox();
    expect(skipBox).not.toBeNull();
    if (skipBox) {
      expect(skipBox.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
    }
  });
});

// ============================================================================
// Test Suite: Number Input on Mobile
// ============================================================================

test.describe('Number Input on Mobile', () => {
  test.use({ viewport: viewports.iPhoneSE });

  test('input has numeric keyboard hint', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await page.waitForURL(/\/practice\/session/);

    const input = page.locator('input[aria-label="Your answer"]');
    await expect(input).toBeVisible();

    // Check inputMode is numeric for mobile keyboards
    await expect(input).toHaveAttribute('inputMode', 'numeric');
    await expect(input).toHaveAttribute('enterKeyHint', 'send');
  });

  test('input accepts numeric values only', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await page.waitForURL(/\/practice\/session/);

    const input = page.locator('input[aria-label="Your answer"]');

    // Type valid number
    await input.fill('123');
    await expect(input).toHaveValue('123');

    // Clear and try negative
    await input.fill('-456');
    await expect(input).toHaveValue('-456');

    // Clear and try invalid (should not accept letters)
    await input.fill('');
    await input.type('abc');
    await expect(input).toHaveValue('');
  });

  test('submit button is easily accessible on mobile', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await page.waitForURL(/\/practice\/session/);

    const input = page.locator('input[aria-label="Your answer"]');
    await input.fill('100');

    // Submit button should be visible and tappable
    const submitButton = page.getByLabel(/Submit answer/i);
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    // Check it's in the viewport
    const box = await submitButton.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const viewportHeight = viewports.iPhoneSE.height;
      expect(box.y + box.height).toBeLessThanOrEqual(viewportHeight);
    }
  });

  test('input scrolls into view on focus', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await page.waitForURL(/\/practice\/session/);

    const input = page.locator('input[aria-label="Your answer"]');
    await input.focus();

    // Wait for scroll animation
    await page.waitForTimeout(400);

    // Input should be visible after focus
    await expect(input).toBeInViewport();
  });
});

// ============================================================================
// Test Suite: Orientation Changes
// ============================================================================

test.describe('Orientation Changes', () => {
  test('home page adapts to landscape', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize(viewports.iPhoneSE);
    await page.goto('/');

    let hasHScroll = await hasHorizontalScroll(page);
    expect(hasHScroll).toBe(false);

    // Switch to landscape
    await page.setViewportSize(viewports.iPhoneSELandscape);
    await page.waitForTimeout(100);

    hasHScroll = await hasHorizontalScroll(page);
    expect(hasHScroll).toBe(false);

    // Content should still be visible
    await expect(page.getByRole('heading', { name: /Mental Math Mastery/i })).toBeVisible();
  });

  test('practice session works in landscape', async ({ page }) => {
    await page.setViewportSize(viewports.iPhoneSELandscape);
    await page.goto('/practice');

    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await page.waitForURL(/\/practice\/session/);

    // Check no horizontal scroll
    const hasHScroll = await hasHorizontalScroll(page);
    expect(hasHScroll).toBe(false);

    // Input and buttons should be accessible
    const input = page.locator('input[aria-label="Your answer"]');
    await expect(input).toBeVisible();

    const submitButton = page.getByLabel(/Submit answer/i);
    await expect(submitButton).toBeVisible();
  });

  test('iPad landscape shows desktop navigation', async ({ page }) => {
    await page.setViewportSize(viewports.iPadLandscape);
    await page.goto('/');

    // At 1024px width, desktop nav should be visible (md breakpoint is 768px)
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    await expect(desktopNav).toBeVisible();

    // Mobile menu button should be hidden
    const mobileMenuButton = page.getByLabel(/Toggle navigation menu/i);
    await expect(mobileMenuButton).toBeHidden();
  });

  test('study page grid adapts to orientation', async ({ page }) => {
    // Portrait
    await page.setViewportSize(viewports.iPhone13);
    await page.goto('/study');

    let hasHScroll = await hasHorizontalScroll(page);
    expect(hasHScroll).toBe(false);

    // Landscape
    await page.setViewportSize(viewports.iPhone13Landscape);
    await page.waitForTimeout(100);

    hasHScroll = await hasHorizontalScroll(page);
    expect(hasHScroll).toBe(false);

    // Method cards should remain visible
    await expect(page.getByText(/Distributive Property/i).first()).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Touch Interactions
// ============================================================================

test.describe('Touch Interactions', () => {
  test.use({ viewport: viewports.iPhoneSE });

  test('tap works on navigation links', async ({ page }) => {
    await page.goto('/');

    // Use tap instead of click for mobile simulation
    await page.getByRole('link', { name: /Start Practice/i }).tap();
    await expect(page).toHaveURL(/\/practice/);
  });

  test('tap works on study method cards', async ({ page }) => {
    await page.goto('/study');

    // Find and tap a method card
    const distributiveCard = page.getByLabel(/Study Distributive Property method/i);
    await distributiveCard.tap();

    await expect(page).toHaveURL(/\/study\/distributive/);
  });

  test('no hover-only functionality on mobile', async ({ page }) => {
    await page.goto('/');

    // Buttons should be functional without hover
    const startButton = page.getByRole('link', { name: /Start Practice/i });

    // Should be enabled and clickable without any hover action
    await expect(startButton).toBeEnabled();

    // Direct tap should work
    await startButton.tap();
    await expect(page).toHaveURL(/\/practice/);
  });

  test('practice session controls respond to tap', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).tap();
    await page.waitForURL(/\/practice\/session/);

    // Fill answer
    const input = page.locator('input[aria-label="Your answer"]');
    await input.fill('100');

    // Tap submit
    const submitButton = page.getByLabel(/Submit answer/i);
    await submitButton.tap();

    // Should show feedback
    await expect(page.locator('text=/correct|incorrect/i').first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// Test Suite: Mobile Performance
// ============================================================================

test.describe('Mobile Performance', () => {
  test.use({
    viewport: viewports.iPhoneSE,
  });

  test('home page loads quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds on mobile
    expect(loadTime).toBeLessThan(5000);
  });

  test('practice session loads within acceptable time', async ({ page }) => {
    await page.goto('/practice');

    const startTime = Date.now();
    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await page.waitForURL(/\/practice\/session/);
    await page.waitForSelector('input[aria-label="Your answer"]');
    const loadTime = Date.now() - startTime;

    // Session should initialize within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('no layout shifts during interaction', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await page.waitForURL(/\/practice\/session/);

    // Get initial position of input
    const input = page.locator('input[aria-label="Your answer"]');
    const initialBox = await input.boundingBox();

    // Interact with input
    await input.fill('123');

    // Wait a moment
    await page.waitForTimeout(200);

    // Position should not have changed significantly
    const newBox = await input.boundingBox();

    if (initialBox && newBox) {
      expect(Math.abs(newBox.y - initialBox.y)).toBeLessThan(10);
    }
  });
});

// ============================================================================
// Test Suite: Responsive Text
// ============================================================================

test.describe('Responsive Text', () => {
  test.use({ viewport: viewports.AndroidPhone });

  test('text is readable on small screens', async ({ page }) => {
    await page.goto('/');

    // Main heading should be visible
    const heading = page.getByRole('heading', { name: /Mental Math Mastery/i });
    await expect(heading).toBeVisible();

    // Description text should be visible
    const description = page.getByText(/Train your mental math skills/i);
    await expect(description).toBeVisible();
  });

  test('problem numbers are readable in practice session', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await page.waitForURL(/\/practice\/session/);

    // The problem display should be visible
    // Check for the problem number display (format: num1 x num2)
    await expect(page.locator('.font-mono').first()).toBeVisible();
  });

  test('input placeholder is visible', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('button', { name: /Start Practice Session/i }).click();
    await page.waitForURL(/\/practice\/session/);

    const input = page.locator('input[aria-label="Your answer"]');
    await expect(input).toHaveAttribute('placeholder', 'Enter your answer');
  });
});

// ============================================================================
// Test Suite: Spacing and Layout
// ============================================================================

test.describe('Spacing and Layout', () => {
  test.use({ viewport: viewports.iPhoneSE });

  test('interactive elements have adequate spacing', async ({ page }) => {
    await page.goto('/practice');

    // Get all buttons in problem count section
    const problemCountButtons = page.locator('.grid-cols-2 button');
    const count = await problemCountButtons.count();

    for (let i = 0; i < count - 1; i++) {
      const currentBox = await problemCountButtons.nth(i).boundingBox();
      const nextBox = await problemCountButtons.nth(i + 1).boundingBox();

      if (currentBox && nextBox) {
        // There should be some gap between buttons
        const gap = nextBox.x - (currentBox.x + currentBox.width);
        // Gap should be at least 8px (typical spacing)
        expect(gap).toBeGreaterThanOrEqual(8);
      }
    }
  });

  test('cards have proper padding on mobile', async ({ page }) => {
    await page.goto('/study');

    // Method cards should have content visible
    const cards = page.locator('[aria-label*="Study"]');
    const firstCard = cards.first();

    await expect(firstCard).toBeVisible();

    // Content should be fully visible (not cut off)
    const methodName = page.getByText('Distributive Property').first();
    await expect(methodName).toBeVisible();
  });

  test('footer is accessible at bottom of page', async ({ page }) => {
    await page.goto('/');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Footer should be visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/Mental Math Mastery/)).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Accessibility on Mobile
// ============================================================================

test.describe('Accessibility on Mobile', () => {
  test.use({ viewport: viewports.iPhoneSE });

  test('skip link is accessible on mobile', async ({ page }) => {
    await page.goto('/');

    // Tab to focus skip link
    await page.keyboard.press('Tab');

    // Skip link should become visible when focused
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeVisible();
  });

  test('focus indicators are visible on mobile', async ({ page }) => {
    await page.goto('/');

    // Focus a link
    const startButton = page.getByRole('link', { name: /Start Practice/i });
    await startButton.focus();

    // Focus ring should be applied (via Tailwind focus:ring classes)
    // We can't easily test CSS computed styles, but we can verify focus works
    await expect(startButton).toBeFocused();
  });

  test('mobile menu announces state changes', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByLabel(/Toggle navigation menu/i);

    // aria-expanded should be false initially
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Open menu
    await menuButton.tap();

    // aria-expanded should be true
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('breadcrumbs work on practice pages', async ({ page }) => {
    await page.goto('/practice');

    // Breadcrumb should be visible
    const breadcrumb = page.getByRole('navigation', { name: /Breadcrumb/i });
    await expect(breadcrumb).toBeVisible();

    // Home link should work
    await page.getByRole('link', { name: 'Home' }).tap();
    await expect(page).toHaveURL('/');
  });
});
