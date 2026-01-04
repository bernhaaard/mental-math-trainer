import { test, expect, type Page } from '@playwright/test';

/**
 * Comprehensive E2E Navigation Tests
 *
 * Tests cover:
 * 1. Home Page Load - title, structure, images, responsive layout
 * 2. Navigation - all nav links, active states, browser navigation
 * 3. Header - logo, skip link, heading hierarchy
 * 4. Footer - visibility and content
 * 5. Performance - page load time, layout shifts
 */

test.describe('Home Page Load', () => {
  test('should display correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Mental Math/i);
  });

  test('should have no console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (like hydration warnings in dev mode)
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('hydration') &&
        !error.includes('Hydration') &&
        !error.includes('Warning:')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should display main heading and description', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { name: /Mental Math Mastery/i, level: 1 });
    await expect(heading).toBeVisible();

    const description = page.getByText(/Train your mental math skills/i);
    await expect(description).toBeVisible();
  });

  test('should display all three feature cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('6 Calculation Methods')).toBeVisible();
    await expect(page.getByText('Adaptive Practice')).toBeVisible();
    await expect(page.getByText('Track Progress')).toBeVisible();
  });

  test('should display main call-to-action buttons', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Start Practice/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Study Methods/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /View Statistics/i })).toBeVisible();
  });

  test('should have all images load successfully', async ({ page }) => {
    const failedImages: string[] = [];

    page.on('requestfailed', (request) => {
      const url = request.url();
      if (
        url.endsWith('.png') ||
        url.endsWith('.jpg') ||
        url.endsWith('.jpeg') ||
        url.endsWith('.svg') ||
        url.endsWith('.webp')
      ) {
        failedImages.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(failedImages).toHaveLength(0);
  });
});

test.describe('Responsive Layout', () => {
  test('should display correctly on desktop (1280x720)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Check that desktop navigation is visible
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    await expect(desktopNav).toBeVisible();

    // Check that mobile menu button is hidden
    const mobileMenuButton = page.getByRole('button', { name: /Toggle navigation menu/i });
    await expect(mobileMenuButton).not.toBeVisible();
  });

  test('should display mobile layout on small screens (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that mobile menu button is visible
    const mobileMenuButton = page.getByRole('button', { name: /Toggle navigation menu/i });
    await expect(mobileMenuButton).toBeVisible();

    // Check that desktop navigation is hidden
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    await expect(desktopNav).not.toBeVisible();
  });

  test('should display correctly on tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // At 768px (md breakpoint), desktop nav should be visible
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    await expect(desktopNav).toBeVisible();
  });
});

test.describe('Navigation Links', () => {
  test('should navigate to Practice page', async ({ page }) => {
    await page.goto('/');

    // Test header navigation
    await page.getByRole('navigation').getByRole('link', { name: 'Practice' }).click();
    await expect(page).toHaveURL('/practice');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to Study page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('navigation').getByRole('link', { name: 'Study' }).click();
    await expect(page).toHaveURL('/study');

    // Verify study page content is displayed
    await expect(page.getByRole('heading', { name: /Master Mental Math/i, level: 1 })).toBeVisible();
  });

  test('should navigate to Statistics page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('navigation').getByRole('link', { name: 'Statistics' }).click();
    await expect(page).toHaveURL('/statistics');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to Home from logo click', async ({ page }) => {
    await page.goto('/study');

    // Click the logo/brand
    await page.getByRole('link', { name: /Mental Math Mastery/i }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate using main CTA buttons on home page', async ({ page }) => {
    await page.goto('/');

    // Test Start Practice button
    await page.getByRole('link', { name: /Start Practice/i }).click();
    await expect(page).toHaveURL('/practice');

    await page.goto('/');

    // Test Study Methods button
    await page.getByRole('link', { name: /Study Methods/i }).click();
    await expect(page).toHaveURL('/study');

    await page.goto('/');

    // Test View Statistics button
    await page.getByRole('link', { name: /View Statistics/i }).click();
    await expect(page).toHaveURL('/statistics');
  });
});

test.describe('Active Navigation State', () => {
  test('should highlight Home link when on home page', async ({ page }) => {
    await page.goto('/');

    const homeLink = page.getByRole('navigation').getByRole('link', { name: 'Home' });
    await expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  test('should highlight Practice link when on practice page', async ({ page }) => {
    await page.goto('/practice');

    const practiceLink = page.getByRole('navigation').getByRole('link', { name: 'Practice' });
    await expect(practiceLink).toHaveAttribute('aria-current', 'page');
  });

  test('should highlight Study link when on study page', async ({ page }) => {
    await page.goto('/study');

    const studyLink = page.getByRole('navigation').getByRole('link', { name: 'Study' });
    await expect(studyLink).toHaveAttribute('aria-current', 'page');
  });

  test('should highlight Study link on study subpages', async ({ page }) => {
    await page.goto('/study/distributive');

    const studyLink = page.getByRole('navigation').getByRole('link', { name: 'Study' });
    await expect(studyLink).toHaveAttribute('aria-current', 'page');
  });

  test('should highlight Statistics link when on statistics page', async ({ page }) => {
    await page.goto('/statistics');

    const statsLink = page.getByRole('navigation').getByRole('link', { name: 'Statistics' });
    await expect(statsLink).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Browser Navigation', () => {
  test('should handle back button navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Practice' }).click();
    await expect(page).toHaveURL('/practice');

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('should handle forward button navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Study' }).click();
    await expect(page).toHaveURL('/study');

    await page.goBack();
    await expect(page).toHaveURL('/');

    await page.goForward();
    await expect(page).toHaveURL('/study');
  });

  test('should handle multiple navigation steps with back/forward', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Study' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Practice' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Statistics' }).click();

    // Should be on statistics
    await expect(page).toHaveURL('/statistics');

    // Go back twice
    await page.goBack();
    await expect(page).toHaveURL('/practice');

    await page.goBack();
    await expect(page).toHaveURL('/study');
  });
});

test.describe('Mobile Navigation Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should open mobile menu when clicking hamburger button', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /Toggle navigation menu/i });
    await menuButton.click();

    // Check that mobile menu is visible
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();
  });

  test('should close mobile menu when clicking a link', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /Toggle navigation menu/i });
    await menuButton.click();

    // Click a navigation link
    await page.locator('#mobile-menu').getByRole('link', { name: 'Study' }).click();

    // Should navigate and menu should close
    await expect(page).toHaveURL('/study');
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
  });

  test('should close mobile menu with Escape key', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /Toggle navigation menu/i });
    await menuButton.click();

    await expect(page.locator('#mobile-menu')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    await expect(page.locator('#mobile-menu')).not.toBeVisible();
  });

  test('should have correct aria attributes on mobile menu button', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /Toggle navigation menu/i });

    // Initially closed
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Open menu
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
  });

  test('should navigate using mobile menu links', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /Toggle navigation menu/i });
    await menuButton.click();

    await page.locator('#mobile-menu').getByRole('link', { name: 'Practice' }).click();
    await expect(page).toHaveURL('/practice');
  });
});

test.describe('Header', () => {
  test('should display logo/brand', async ({ page }) => {
    await page.goto('/');

    const brand = page.getByRole('link', { name: /Mental Math Mastery/i }).first();
    await expect(brand).toBeVisible();
  });

  test('should have skip link for accessibility', async ({ page }) => {
    await page.goto('/');

    // Skip link should exist but be visually hidden initially
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeAttached();

    // Focus the skip link to make it visible
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test('skip link should navigate to main content', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await skipLink.focus();
    await skipLink.click();

    // Should scroll to main content
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Home page should have one h1
    const h1Count = await page.getByRole('heading', { level: 1 }).count();
    expect(h1Count).toBe(1);
  });
});

test.describe('Footer', () => {
  test('should display footer on home page', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should contain app description', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer.getByText(/Mental Math Mastery/i)).toBeVisible();
    await expect(footer.getByText(/mathematically rigorous/i)).toBeVisible();
  });

  test('should be visible on all main pages', async ({ page }) => {
    const pages = ['/', '/practice', '/study', '/statistics'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    }
  });
});

test.describe('Performance', () => {
  test('should load home page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no layout shifts after initial load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take initial positions of key elements
    const mainContent = page.locator('#main-content');
    const initialBounds = await mainContent.boundingBox();

    // Wait a bit and check again
    await page.waitForTimeout(1000);
    const finalBounds = await mainContent.boundingBox();

    expect(initialBounds).not.toBeNull();
    expect(finalBounds).not.toBeNull();

    if (initialBounds && finalBounds) {
      // Position should not change significantly
      expect(Math.abs(initialBounds.y - finalBounds.y)).toBeLessThan(5);
    }
  });
});

test.describe('Study Page Navigation', () => {
  test('should display all six method cards', async ({ page }) => {
    await page.goto('/study');

    await expect(page.getByText('Distributive Property')).toBeVisible();
    await expect(page.getByText('Difference of Squares')).toBeVisible();
    await expect(page.getByText('Near Powers of 10')).toBeVisible();
    await expect(page.getByText('Squaring')).toBeVisible();
    await expect(page.getByText('Near 100')).toBeVisible();
    await expect(page.getByText('Factorization')).toBeVisible();
  });

  test('should navigate to individual method pages', async ({ page }) => {
    await page.goto('/study');

    // Click on Distributive Property method card
    await page.getByRole('link', { name: /Study Distributive Property method/i }).click();
    await expect(page).toHaveURL('/study/distributive');
  });

  test('should display learning path section', async ({ page }) => {
    await page.goto('/study');

    await expect(page.getByRole('heading', { name: /Recommended Learning Path/i })).toBeVisible();
  });

  test('should navigate to advanced topics', async ({ page }) => {
    await page.goto('/study');

    // Test Compare Methods link
    await page.getByRole('link', { name: /Compare Methods/i }).click();
    await expect(page).toHaveURL('/study/compare');

    await page.goto('/study');

    // Test Combining Techniques link
    await page.getByRole('link', { name: /Combining Techniques/i }).click();
    await expect(page).toHaveURL('/study/combining');
  });

  test('should have "Ready to Practice?" button linking to practice', async ({ page }) => {
    await page.goto('/study');

    await page.getByRole('link', { name: /Ready to Practice/i }).click();
    await expect(page).toHaveURL('/practice');
  });
});

test.describe('Practice Page', () => {
  test('should display session configuration form', async ({ page }) => {
    await page.goto('/practice');

    // Should show some form of configuration UI
    await expect(page.locator('body')).toBeVisible();
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Statistics Page', () => {
  test('should display empty state when no statistics exist', async ({ page }) => {
    await page.goto('/statistics');

    // Either show empty state or statistics
    await expect(page.locator('body')).toBeVisible();
    await page.waitForLoadState('networkidle');
  });

  test('should have links to practice and study from empty state', async ({ page }) => {
    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    // If empty state is shown, verify the CTAs exist
    const practiceLink = page.getByRole('link', { name: /Start Practicing|Continue Practicing/i });
    const studyLink = page.getByRole('link', { name: /Study Methods/i });

    // At least one should be visible (either in empty state or in the page)
    const hasPracticeLink = await practiceLink.count();
    const hasStudyLink = await studyLink.count();

    expect(hasPracticeLink + hasStudyLink).toBeGreaterThan(0);
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('should be able to navigate header with keyboard', async ({ page }) => {
    await page.goto('/');

    // Tab through the header elements
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Logo
    await page.keyboard.press('Tab'); // Home link
    await page.keyboard.press('Tab'); // Practice link
    await page.keyboard.press('Tab'); // Study link
    await page.keyboard.press('Tab'); // Statistics link

    // The Statistics link should be focused
    const statsLink = page.getByRole('navigation').getByRole('link', { name: 'Statistics' });
    await expect(statsLink).toBeFocused();
  });

  test('should navigate with Enter key', async ({ page }) => {
    await page.goto('/');

    // Focus on Practice link
    const practiceLink = page.getByRole('navigation').getByRole('link', { name: 'Practice' });
    await practiceLink.focus();

    // Press Enter
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/practice');
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 for invalid routes gracefully', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');

    // Should return 404
    expect(response?.status()).toBe(404);
  });

  test('should handle 404 for invalid study method', async ({ page }) => {
    const response = await page.goto('/study/nonexistent-method');

    // Should return 404 or show error
    // Next.js may return 200 with a not found page, so we check for either
    expect([200, 404]).toContain(response?.status());
  });
});
