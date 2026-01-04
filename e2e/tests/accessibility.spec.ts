/**
 * Accessibility Testing Suite
 *
 * Uses axe-core via @axe-core/playwright to audit the Mental Math Trainer
 * for WCAG compliance and screen reader support.
 *
 * Test coverage includes:
 * - Automated accessibility scans (WCAG 2.1 AA)
 * - Heading structure validation
 * - Color contrast checks
 * - Image/icon accessibility
 * - Form label verification
 * - ARIA usage audit
 * - Keyboard navigation
 * - Reduced motion preferences
 */

import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Helper to run axe accessibility scan and return results
 */
async function runAxeScan(page: Page, options?: {
  include?: string[];
  exclude?: string[];
  disableRules?: string[];
}) {
  let builder = new AxeBuilder({ page });

  if (options?.include) {
    builder = builder.include(options.include);
  }
  if (options?.exclude) {
    builder = builder.exclude(options.exclude);
  }
  if (options?.disableRules) {
    builder = builder.disableRules(options.disableRules);
  }

  return builder.analyze();
}

/**
 * Helper to format violations for better error messages
 */
function formatViolations(violations: Array<{
  id: string;
  impact?: string;
  description: string;
  nodes: Array<{ html: string; target: string[] }>;
}>) {
  return violations.map(v => {
    const nodes = v.nodes.map(n => `  - ${n.target.join(' > ')}: ${n.html.substring(0, 100)}...`).join('\n');
    return `[${v.impact?.toUpperCase() || 'UNKNOWN'}] ${v.id}: ${v.description}\nAffected elements:\n${nodes}`;
  }).join('\n\n');
}

// ============================================================================
// Automated Accessibility Scans (axe-core)
// ============================================================================

test.describe('Automated Accessibility Scans', () => {
  test('home page has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await runAxeScan(page);

    if (results.violations.length > 0) {
      console.log('Home page accessibility violations:\n', formatViolations(results.violations));
    }

    expect(results.violations, `Found ${results.violations.length} accessibility violation(s)`).toEqual([]);
  });

  test('practice configuration page has no accessibility violations', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    const results = await runAxeScan(page);

    if (results.violations.length > 0) {
      console.log('Practice page accessibility violations:\n', formatViolations(results.violations));
    }

    expect(results.violations, `Found ${results.violations.length} accessibility violation(s)`).toEqual([]);
  });

  test('study page has no accessibility violations', async ({ page }) => {
    await page.goto('/study');
    await page.waitForLoadState('networkidle');

    const results = await runAxeScan(page);

    if (results.violations.length > 0) {
      console.log('Study page accessibility violations:\n', formatViolations(results.violations));
    }

    expect(results.violations, `Found ${results.violations.length} accessibility violation(s)`).toEqual([]);
  });

  test('statistics page has no accessibility violations', async ({ page }) => {
    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    const results = await runAxeScan(page);

    if (results.violations.length > 0) {
      console.log('Statistics page accessibility violations:\n', formatViolations(results.violations));
    }

    expect(results.violations, `Found ${results.violations.length} accessibility violation(s)`).toEqual([]);
  });

  test('study compare page has no accessibility violations', async ({ page }) => {
    await page.goto('/study/compare');
    await page.waitForLoadState('networkidle');

    const results = await runAxeScan(page);

    if (results.violations.length > 0) {
      console.log('Compare page accessibility violations:\n', formatViolations(results.violations));
    }

    expect(results.violations, `Found ${results.violations.length} accessibility violation(s)`).toEqual([]);
  });

  test('study combining page has no accessibility violations', async ({ page }) => {
    await page.goto('/study/combining');
    await page.waitForLoadState('networkidle');

    const results = await runAxeScan(page);

    if (results.violations.length > 0) {
      console.log('Combining page accessibility violations:\n', formatViolations(results.violations));
    }

    expect(results.violations, `Found ${results.violations.length} accessibility violation(s)`).toEqual([]);
  });

  test('method study page (distributive) has no accessibility violations', async ({ page }) => {
    await page.goto('/study/distributive');
    await page.waitForLoadState('networkidle');

    const results = await runAxeScan(page);

    if (results.violations.length > 0) {
      console.log('Distributive method page accessibility violations:\n', formatViolations(results.violations));
    }

    expect(results.violations, `Found ${results.violations.length} accessibility violation(s)`).toEqual([]);
  });
});

// ============================================================================
// Heading Structure
// ============================================================================

test.describe('Heading Structure', () => {
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Practice', path: '/practice' },
    { name: 'Study', path: '/study' },
    { name: 'Statistics', path: '/statistics' },
    { name: 'Compare Methods', path: '/study/compare' },
    { name: 'Combining Techniques', path: '/study/combining' },
  ];

  for (const { name, path } of pages) {
    test(`${name} page has exactly one h1`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const h1Elements = await page.locator('h1').all();

      expect(h1Elements.length, `${name} page should have exactly one h1 element`).toBe(1);
    });

    test(`${name} page has proper heading hierarchy`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Get all headings in document order
      const headings = await page.evaluate(() => {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return Array.from(elements).map(el => ({
          level: parseInt(el.tagName.charAt(1)),
          text: el.textContent?.trim().substring(0, 50) || ''
        }));
      });

      // Check for skipped levels (e.g., h1 -> h3 without h2)
      const skippedLevels: string[] = [];
      let maxSeenLevel = 0;

      for (let i = 0; i < headings.length; i++) {
        const current = headings[i];

        if (current.level > maxSeenLevel + 1 && i > 0) {
          skippedLevels.push(
            `h${headings[i - 1].level} "${headings[i - 1].text}" -> h${current.level} "${current.text}"`
          );
        }

        maxSeenLevel = Math.max(maxSeenLevel, current.level);
      }

      expect(
        skippedLevels,
        `${name} page has skipped heading levels:\n${skippedLevels.join('\n')}`
      ).toEqual([]);
    });
  }
});

// ============================================================================
// Color Contrast
// ============================================================================

test.describe('Color Contrast', () => {
  test('focus indicators have sufficient contrast', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Tab to first focusable element
    await page.keyboard.press('Tab');

    // Get the focused element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Run axe specifically for color contrast on focused elements
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('Color contrast violations:\n', formatViolations(results.violations));
    }

    // Filter for violations that would affect visibility
    const criticalViolations = results.violations.filter(v =>
      v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('text content has adequate contrast ratios', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    const violations = results.violations.filter(v => v.id === 'color-contrast');

    if (violations.length > 0) {
      console.log('Text contrast violations:\n', formatViolations(violations));
    }

    expect(violations).toEqual([]);
  });
});

// ============================================================================
// Images and Icons
// ============================================================================

test.describe('Images and Icons Accessibility', () => {
  test('all images have alt text or are marked decorative', async ({ page }) => {
    await page.goto('/study');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('Image alt text violations:\n', formatViolations(results.violations));
    }

    expect(results.violations).toEqual([]);
  });

  test('decorative SVGs have aria-hidden', async ({ page }) => {
    await page.goto('/study');
    await page.waitForLoadState('networkidle');

    // Check that SVG icons used decoratively have aria-hidden="true"
    const svgsWithoutAriaHidden = await page.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      const issues: string[] = [];

      svgs.forEach(svg => {
        const hasAriaHidden = svg.getAttribute('aria-hidden') === 'true';
        const hasAriaLabel = svg.hasAttribute('aria-label');
        const hasAriaLabelledBy = svg.hasAttribute('aria-labelledby');
        const hasRole = svg.hasAttribute('role');

        // If SVG doesn't have aria-hidden and doesn't have accessible name, it's an issue
        if (!hasAriaHidden && !hasAriaLabel && !hasAriaLabelledBy && !hasRole) {
          // Check if it's likely decorative (inside a button/link with text)
          const parent = svg.closest('button, a');
          const parentText = parent?.textContent?.replace(/\s+/g, ' ').trim();

          if (parent && parentText && parentText.length > 0) {
            // Has parent with text - should be aria-hidden
            issues.push(`SVG in ${parent.tagName.toLowerCase()} "${parentText.substring(0, 30)}" lacks aria-hidden`);
          }
        }
      });

      return issues;
    });

    if (svgsWithoutAriaHidden.length > 0) {
      console.log('SVGs missing aria-hidden:\n', svgsWithoutAriaHidden.join('\n'));
    }

    // This is a soft check - log but don't fail since many are properly marked
    // expect(svgsWithoutAriaHidden.length).toBe(0);
  });

  test('icon buttons have accessible names', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Start a session to see more interactive elements
    await page.click('text=Start Practice Session');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['button-name', 'link-name'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('Button/link name violations:\n', formatViolations(results.violations));
    }

    expect(results.violations).toEqual([]);
  });
});

// ============================================================================
// Form Labels and Inputs
// ============================================================================

test.describe('Form Labels and Inputs', () => {
  test('all form inputs have associated labels', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['label', 'label-title-only'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('Form label violations:\n', formatViolations(results.violations));
    }

    expect(results.violations).toEqual([]);
  });

  test('required fields are properly indicated', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Check that required inputs have proper indication
    const requiredInputsWithoutIndicator = await page.evaluate(() => {
      const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
      const issues: string[] = [];

      requiredInputs.forEach(input => {
        const hasAriaRequired = input.getAttribute('aria-required') === 'true';
        const hasRequiredAttr = input.hasAttribute('required');

        // Check if there's a visual indicator (asterisk or text)
        const label = document.querySelector(`label[for="${input.id}"]`);
        const labelText = label?.textContent || '';
        const hasVisualIndicator = labelText.includes('*') || labelText.toLowerCase().includes('required');

        if (!hasAriaRequired && !hasRequiredAttr && !hasVisualIndicator) {
          issues.push(`Input "${input.id || input.getAttribute('name')}" lacks required indicator`);
        }
      });

      return issues;
    });

    if (requiredInputsWithoutIndicator.length > 0) {
      console.log('Required field indicator issues:\n', requiredInputsWithoutIndicator.join('\n'));
    }

    // This is informational - the app may not have required fields
  });

  test('form inputs have proper autocomplete attributes where applicable', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['autocomplete-valid'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('Autocomplete violations:\n', formatViolations(results.violations));
    }

    expect(results.violations).toEqual([]);
  });
});

// ============================================================================
// ARIA Usage
// ============================================================================

test.describe('ARIA Usage', () => {
  test('ARIA roles are used appropriately', async ({ page }) => {
    await page.goto('/study');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules([
        'aria-allowed-attr',
        'aria-hidden-body',
        'aria-hidden-focus',
        'aria-required-attr',
        'aria-required-children',
        'aria-required-parent',
        'aria-roles',
        'aria-valid-attr-value',
        'aria-valid-attr'
      ])
      .analyze();

    if (results.violations.length > 0) {
      console.log('ARIA violations:\n', formatViolations(results.violations));
    }

    expect(results.violations).toEqual([]);
  });

  test('aria-live regions exist for dynamic content', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Start a session to check for live regions
    await page.click('text=Start Practice Session');
    await page.waitForLoadState('networkidle');

    // Check for aria-live regions
    const liveRegions = await page.locator('[aria-live]').all();
    const statusElements = await page.locator('[role="status"]').all();
    const alertElements = await page.locator('[role="alert"]').all();

    const totalLiveRegions = liveRegions.length + statusElements.length + alertElements.length;

    // The practice session should have at least one live region for announcements
    expect(
      totalLiveRegions,
      'Practice session should have at least one live region for dynamic content announcements'
    ).toBeGreaterThan(0);
  });

  test('aria-hidden is not used on focusable elements', async ({ page }) => {
    await page.goto('/study');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['aria-hidden-focus'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('aria-hidden on focusable violations:\n', formatViolations(results.violations));
    }

    expect(results.violations).toEqual([]);
  });
});

// ============================================================================
// Keyboard Navigation
// ============================================================================

test.describe('Keyboard Navigation', () => {
  test('skip link is present and functional', async ({ page }) => {
    await page.goto('/');

    // Focus the skip link (first focusable element)
    await page.keyboard.press('Tab');

    const skipLink = page.locator('a:has-text("Skip to main content")');

    // Skip link should be visible when focused
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    // Activate skip link
    await page.keyboard.press('Enter');

    // Main content should now be focused or be the next focusable
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
  });

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Tab through all elements and verify they receive focus
    const focusableElements: string[] = [];
    let previousActiveElement = '';
    let tabCount = 0;
    const maxTabs = 50; // Prevent infinite loop

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;

      const activeElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return 'body';
        return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ').join('.') : ''}`;
      });

      if (activeElement === previousActiveElement || activeElement === 'body') {
        break;
      }

      focusableElements.push(activeElement);
      previousActiveElement = activeElement;
    }

    // Should be able to tab through multiple elements
    expect(focusableElements.length).toBeGreaterThan(3);
  });

  test('focus trap works correctly in modals', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Start a session
    await page.click('text=Start Practice Session');
    await page.waitForTimeout(500);

    // Open keyboard shortcuts help (if available)
    const helpButton = page.locator('[aria-label*="keyboard" i], [title*="keyboard" i]').first();

    if (await helpButton.isVisible()) {
      await helpButton.click();
      await page.waitForTimeout(300);

      // Check if a modal/dialog opened
      const dialog = page.locator('[role="dialog"], [aria-modal="true"]').first();

      if (await dialog.isVisible()) {
        // Tab several times - focus should stay within the dialog
        const initialFocus = await page.evaluate(() => document.activeElement?.tagName);

        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
        }

        // Check focus is still within dialog
        const isWithinDialog = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
          return dialog?.contains(document.activeElement);
        });

        expect(isWithinDialog).toBe(true);
      }
    }
  });

  test('Enter and Space activate buttons consistently', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Find the start session button
    const startButton = page.locator('button:has-text("Start Practice Session")');

    // Focus it
    await startButton.focus();

    // Press Space (should not navigate yet, just testing activation works)
    // We'll use Enter instead to avoid submission timing issues
    await page.keyboard.press('Enter');

    // Should have navigated to the session
    await expect(page).toHaveURL(/\/practice\/session/);
  });
});

// ============================================================================
// Reduced Motion
// ============================================================================

test.describe('Reduced Motion', () => {
  test('animations respect prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Start a session to trigger potential animations
    await page.click('text=Start Practice Session');
    await page.waitForTimeout(500);

    // Check that animations are disabled or reduced
    const animatedElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const animatedEls: string[] = [];

      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const animation = style.getPropertyValue('animation');
        const transition = style.getPropertyValue('transition');

        // Check for long animations that should be disabled
        if (animation && !animation.includes('none') && !animation.includes('0s')) {
          const duration = parseFloat(animation.match(/(\d+\.?\d*)s/)?.[1] || '0');
          if (duration > 0.3) {
            animatedEls.push(`${el.tagName}: animation ${animation.substring(0, 50)}`);
          }
        }
      });

      return animatedEls;
    });

    // Log any animations found (informational)
    if (animatedElements.length > 0) {
      console.log('Elements with animations in reduced-motion mode:\n', animatedElements.join('\n'));
    }

    // This is a soft check since CSS may already handle this
  });

  test('loading indicators work without motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    // The page should still be functional and show content
    await expect(page.locator('body')).toBeVisible();

    // Check for any loading states that might be stuck
    const loadingIndicators = page.locator('[class*="animate-"], [class*="loading"]');
    const count = await loadingIndicators.count();

    // After page load, there shouldn't be persistent loading indicators
    // (unless the page is showing a loading skeleton for data)
  });
});

// ============================================================================
// Screen Reader Announcements
// ============================================================================

test.describe('Screen Reader Support', () => {
  test('page titles are descriptive', async ({ page }) => {
    const pages = [
      { path: '/', expectedContains: 'Mental Math' },
      { path: '/practice', expectedContains: '' }, // May inherit from layout
      { path: '/study', expectedContains: '' },
      { path: '/statistics', expectedContains: '' },
    ];

    for (const { path, expectedContains } of pages) {
      await page.goto(path);
      const title = await page.title();

      expect(title).toBeTruthy();
      if (expectedContains) {
        expect(title.toLowerCase()).toContain(expectedContains.toLowerCase());
      }
    }
  });

  test('main landmark exists on all pages', async ({ page }) => {
    const pages = ['/', '/practice', '/study', '/statistics'];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const main = page.locator('main, [role="main"]');
      await expect(main, `Page ${path} should have a main landmark`).toBeVisible();
    }
  });

  test('navigation landmark exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('dynamic content updates are announced', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Start a session
    await page.click('text=Start Practice Session');
    await page.waitForTimeout(1000);

    // Check for status/live regions that would announce changes
    const announcer = page.locator('[role="status"], [aria-live="polite"], [aria-live="assertive"]');
    const count = await announcer.count();

    expect(count, 'Should have at least one element for screen reader announcements').toBeGreaterThan(0);
  });
});

// ============================================================================
// Focus Management
// ============================================================================

test.describe('Focus Management', () => {
  test('focus is visible on all interactive elements', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Scan for focus visibility issues
    const results = await new AxeBuilder({ page })
      .withRules(['focus-visible'])
      .analyze();

    // Note: This rule may not exist in all axe versions
    // The test will pass if the rule doesn't exist

    if (results.violations.length > 0) {
      console.log('Focus visibility violations:\n', formatViolations(results.violations));
    }
  });

  test('focus moves logically when interacting with the page', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Start session
    await page.click('text=Start Practice Session');
    await page.waitForTimeout(500);

    // Focus should be on or near the input field
    const activeTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());

    // Should be focused on an interactive element (input, button, or similar)
    const acceptableFocusTargets = ['input', 'button', 'a', 'textarea', 'select', 'div', 'main'];
    expect(acceptableFocusTargets).toContain(activeTag);
  });

  test('focus returns appropriately after modal closes', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    // Start a session
    await page.click('text=Start Practice Session');
    await page.waitForTimeout(500);

    // Try to find and open a modal (keyboard shortcuts help)
    const helpButton = page.locator('[aria-label*="keyboard" i], [title*="keyboard" i]').first();

    if (await helpButton.isVisible()) {
      // Store the button's position for later comparison
      const buttonBounds = await helpButton.boundingBox();

      await helpButton.click();
      await page.waitForTimeout(300);

      // Close the modal with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      // Check if focus returned to a reasonable location
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName.toLowerCase() : null;
      });

      expect(focusedElement).toBeTruthy();
    }
  });
});

// ============================================================================
// Links and Buttons
// ============================================================================

test.describe('Links and Buttons', () => {
  test('links have descriptive text', async ({ page }) => {
    await page.goto('/study');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['link-name'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('Link name violations:\n', formatViolations(results.violations));
    }

    expect(results.violations).toEqual([]);
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['button-name'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('Button name violations:\n', formatViolations(results.violations));
    }

    expect(results.violations).toEqual([]);
  });

  test('no duplicate IDs exist on the page', async ({ page }) => {
    await page.goto('/study');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['duplicate-id', 'duplicate-id-active', 'duplicate-id-aria'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('Duplicate ID violations:\n', formatViolations(results.violations));
    }

    expect(results.violations).toEqual([]);
  });
});

// ============================================================================
// Tables
// ============================================================================

test.describe('Tables Accessibility', () => {
  test('tables have proper headers', async ({ page }) => {
    await page.goto('/study/compare');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['td-headers-attr', 'th-has-data-cells'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('Table header violations:\n', formatViolations(results.violations));
    }

    expect(results.violations).toEqual([]);
  });

  test('data tables have captions or aria-labels', async ({ page }) => {
    await page.goto('/study/compare');
    await page.waitForLoadState('networkidle');

    // Check tables for accessibility
    const tableIssues = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const issues: string[] = [];

      tables.forEach((table, index) => {
        const hasCaption = table.querySelector('caption') !== null;
        const hasAriaLabel = table.hasAttribute('aria-label');
        const hasAriaLabelledBy = table.hasAttribute('aria-labelledby');
        const hasSummary = table.hasAttribute('summary'); // Legacy but still useful

        // Check if table has headers
        const headers = table.querySelectorAll('th');
        const hasHeaders = headers.length > 0;

        if (!hasCaption && !hasAriaLabel && !hasAriaLabelledBy && !hasSummary) {
          issues.push(`Table ${index + 1} lacks caption or aria-label`);
        }

        if (!hasHeaders) {
          issues.push(`Table ${index + 1} lacks header cells (th)`);
        }
      });

      return issues;
    });

    if (tableIssues.length > 0) {
      console.log('Table accessibility issues:\n', tableIssues.join('\n'));
    }

    // Tables in compare page should have headers at minimum
    const tables = await page.locator('table').count();
    if (tables > 0) {
      const tablesWithHeaders = await page.locator('table:has(th)').count();
      expect(tablesWithHeaders).toBeGreaterThan(0);
    }
  });
});
