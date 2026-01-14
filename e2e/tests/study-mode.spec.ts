import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Study Mode Pages
 *
 * Tests cover:
 * 1. Study Overview page (/study)
 * 2. Individual Method pages (/study/[method])
 * 3. Method Comparison page (/study/compare)
 * 4. Combining Techniques page (/study/combining)
 * 5. Navigation and links
 * 6. Content correctness
 */

test.describe('Study Mode Overview (/study)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/study');
  });

  test('displays page title and hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Master Mental Math', level: 1 })).toBeVisible();
    await expect(page.getByText('Learn powerful calculation techniques')).toBeVisible();
  });

  test('displays quick stats', async ({ page }) => {
    await expect(page.getByText('6')).toBeVisible();
    await expect(page.getByText('Methods to Learn')).toBeVisible();
    await expect(page.getByText('Problems to Practice')).toBeVisible();
    await expect(page.getByText('Journey')).toBeVisible();
  });

  test('displays recommended learning path', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recommended Learning Path', level: 2 })).toBeVisible();

    // Verify all 6 methods appear in learning path
    await expect(page.getByText('Distributive Property')).toBeVisible();
    await expect(page.getByText('Difference of Squares')).toBeVisible();
    await expect(page.getByText('Near Powers of 10')).toBeVisible();
    await expect(page.getByText('Squaring')).toBeVisible();
    await expect(page.getByText('Near 100')).toBeVisible();
    await expect(page.getByText('Factorization')).toBeVisible();
  });

  test('displays all 6 method cards with correct information', async ({ page }) => {
    // Check each method card has display name, description, and difficulty badge
    const distributiveCard = page.locator('[aria-label="Study Distributive Property method"]');
    await expect(distributiveCard).toBeVisible();
    await expect(distributiveCard.getByText('Beginner')).toBeVisible();

    const differenceSquaresCard = page.locator('[aria-label="Study Difference of Squares method"]');
    await expect(differenceSquaresCard).toBeVisible();
    await expect(differenceSquaresCard.getByText('Intermediate')).toBeVisible();

    const nearPower10Card = page.locator('[aria-label="Study Near Powers of 10 method"]');
    await expect(nearPower10Card).toBeVisible();
    await expect(nearPower10Card.getByText('Beginner')).toBeVisible();

    const squaringCard = page.locator('[aria-label="Study Squaring method"]');
    await expect(squaringCard).toBeVisible();
    await expect(squaringCard.getByText('Intermediate')).toBeVisible();

    const near100Card = page.locator('[aria-label="Study Near 100 method"]');
    await expect(near100Card).toBeVisible();
    await expect(near100Card.getByText('Intermediate')).toBeVisible();

    const factorizationCard = page.locator('[aria-label="Study Factorization method"]');
    await expect(factorizationCard).toBeVisible();
    await expect(factorizationCard.getByText('Advanced')).toBeVisible();
  });

  test('displays advanced topics section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Advanced Topics', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Compare Methods', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Combining Techniques', level: 3 })).toBeVisible();
  });

  test('displays tips for effective learning', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tips for Effective Learning', level: 2 })).toBeVisible();
    await expect(page.getByText('Understand the math, not just the steps.')).toBeVisible();
    await expect(page.getByText('Practice pattern recognition.')).toBeVisible();
    await expect(page.getByText('Start with worked examples.')).toBeVisible();
  });

  test('has navigation to practice page', async ({ page }) => {
    const practiceButton = page.getByRole('link', { name: 'Ready to Practice?' });
    await expect(practiceButton).toBeVisible();
    await practiceButton.click();
    await expect(page).toHaveURL(/\/practice/);
  });

  test('method cards navigate to individual method pages', async ({ page }) => {
    const distributiveCard = page.locator('[aria-label="Study Distributive Property method"]');
    await distributiveCard.click();
    await expect(page).toHaveURL('/study/distributive');
  });

  test('compare methods link navigates correctly', async ({ page }) => {
    const compareLink = page.getByRole('heading', { name: 'Compare Methods' }).locator('..');
    await compareLink.click();
    await expect(page).toHaveURL('/study/compare');
  });

  test('combining techniques link navigates correctly', async ({ page }) => {
    const combiningLink = page.getByRole('heading', { name: 'Combining Techniques' }).locator('..');
    await combiningLink.click();
    await expect(page).toHaveURL('/study/combining');
  });
});

test.describe('Individual Method Pages', () => {
  const methods = [
    { slug: 'distributive', displayName: 'Distributive Property', difficulty: 'Beginner' },
    { slug: 'difference-squares', displayName: 'Difference of Squares', difficulty: 'Intermediate' },
    { slug: 'near-power-10', displayName: 'Near Powers of 10', difficulty: 'Intermediate' },
    { slug: 'squaring', displayName: 'Squaring', difficulty: 'Intermediate' },
    { slug: 'near-100', displayName: 'Near 100', difficulty: 'Intermediate' },
    { slug: 'factorization', displayName: 'Factorization', difficulty: 'Advanced' }
  ];

  for (const method of methods) {
    test.describe(`Method: ${method.displayName}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/study/${method.slug}`);
      });

      test('displays page header with correct method name', async ({ page }) => {
        await expect(page.getByRole('heading', { name: method.displayName, level: 1 })).toBeVisible();
      });

      test('displays breadcrumb navigation', async ({ page }) => {
        const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
        await expect(breadcrumb).toBeVisible();
        await expect(breadcrumb.getByRole('link', { name: 'Study' })).toBeVisible();
        await expect(breadcrumb.getByText(method.displayName)).toBeVisible();
      });

      test('displays all content tabs', async ({ page }) => {
        const tablist = page.getByRole('tablist');
        await expect(tablist).toBeVisible();

        // Check for tab buttons (use short labels on mobile, full on desktop)
        await expect(page.getByRole('tab', { name: /Introduction|Intro/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Mathematical Foundation|Foundation/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Deep Dive/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Tips|Mistakes/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Examples/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Practice/i })).toBeVisible();
      });

      test('introduction tab shows when to use and when not to use', async ({ page }) => {
        // Introduction tab should be selected by default
        const introTab = page.getByRole('tab', { name: /Introduction|Intro/i });
        await expect(introTab).toHaveAttribute('aria-selected', 'true');

        // Content should include when to use section
        await expect(page.getByRole('heading', { name: 'When to Use This Method', level: 3 })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'When NOT to Use This Method', level: 3 })).toBeVisible();
      });

      test('can switch between tabs', async ({ page }) => {
        // Click Foundation tab
        const foundationTab = page.getByRole('tab', { name: /Mathematical Foundation|Foundation/i });
        await foundationTab.click();
        await expect(foundationTab).toHaveAttribute('aria-selected', 'true');

        // Click Examples tab
        const examplesTab = page.getByRole('tab', { name: /Examples/i });
        await examplesTab.click();
        await expect(examplesTab).toHaveAttribute('aria-selected', 'true');
      });

      test('examples tab displays example problems', async ({ page }) => {
        const examplesTab = page.getByRole('tab', { name: /Examples/i });
        await examplesTab.click();

        // Should show example cards with multiplication problems
        await expect(page.getByText('Example 1')).toBeVisible();
      });

      test('practice tab has link to practice session', async ({ page }) => {
        const practiceTab = page.getByRole('tab', { name: /Practice/i });
        await practiceTab.click();

        await expect(page.getByRole('heading', { name: 'Ready to Practice?', level: 3 })).toBeVisible();
        const startButton = page.getByRole('link', { name: 'Start Practice Session' });
        await expect(startButton).toBeVisible();
      });

      test('breadcrumb link navigates back to study overview', async ({ page }) => {
        await page.getByRole('link', { name: 'Study' }).click();
        await expect(page).toHaveURL('/study');
      });

      test('displays progress indicator', async ({ page }) => {
        // Check for progress bar
        await expect(page.locator('[class*="progress"]')).toBeVisible();
      });
    });
  }

  test.describe('Method navigation (previous/next)', () => {
    test('first method (Distributive) has no previous, has next', async ({ page }) => {
      await page.goto('/study/distributive');

      // Should not have previous link
      const previousLink = page.getByText('Previous');
      await expect(previousLink).not.toBeVisible();

      // Should have next link to Difference of Squares
      await expect(page.getByText('Next')).toBeVisible();
      await expect(page.getByText('Difference of Squares')).toBeVisible();
    });

    test('last method (Factorization) has previous, no next', async ({ page }) => {
      await page.goto('/study/factorization');

      // Should have previous link
      await expect(page.getByText('Previous')).toBeVisible();
      await expect(page.getByText('Near 100')).toBeVisible();

      // Should not have next link
      const nextLink = page.locator('a:has-text("Next")');
      await expect(nextLink.getByText('Next')).not.toBeVisible();
    });

    test('middle method has both previous and next', async ({ page }) => {
      await page.goto('/study/squaring');

      await expect(page.getByText('Previous')).toBeVisible();
      await expect(page.getByText('Next')).toBeVisible();
    });

    test('can navigate through all methods using next', async ({ page }) => {
      await page.goto('/study/distributive');

      // Navigate through all methods
      const expectedOrder = [
        'difference-squares',
        'near-power-10',
        'squaring',
        'near-100',
        'factorization'
      ];

      for (const expectedSlug of expectedOrder) {
        const nextLink = page.locator('a').filter({ has: page.getByText('Next') });
        await nextLink.click();
        await expect(page).toHaveURL(`/study/${expectedSlug}`);
      }
    });

    test('All Methods link navigates back to study overview', async ({ page }) => {
      await page.goto('/study/squaring');
      await page.getByRole('link', { name: 'All Methods' }).click();
      await expect(page).toHaveURL('/study');
    });
  });
});

test.describe('Method Comparison Page (/study/compare)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/study/compare');
  });

  test('displays page header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Compare Calculation Methods', level: 1 })).toBeVisible();
  });

  test('displays breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Study' })).toBeVisible();
    await expect(breadcrumb.getByText('Compare Methods')).toBeVisible();
  });

  test('displays method comparison table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Method Comparison Table', level: 2 })).toBeVisible();

    // Check table headers
    const table = page.locator('table');
    await expect(table).toBeVisible();
    await expect(table.locator('th:has-text("Method")')).toBeVisible();
    await expect(table.locator('th:has-text("Best For")')).toBeVisible();
    await expect(table.locator('th:has-text("Complexity")')).toBeVisible();
    await expect(table.locator('th:has-text("Speed")')).toBeVisible();
    await expect(table.locator('th:has-text("Example")')).toBeVisible();
  });

  test('comparison table contains all 6 methods', async ({ page }) => {
    const table = page.locator('table');
    await expect(table.getByText('Distributive Property')).toBeVisible();
    await expect(table.getByText('Difference of Squares')).toBeVisible();
    await expect(table.getByText('Near Powers of 10')).toBeVisible();
    await expect(table.getByText('Squaring')).toBeVisible();
    await expect(table.getByText('Near 100')).toBeVisible();
    await expect(table.getByText('Factorization')).toBeVisible();
  });

  test('displays decision flowchart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Method Selection Flowchart', level: 2 })).toBeVisible();
    await expect(page.getByText('How to Use This Flowchart')).toBeVisible();
  });

  test('displays method vs method comparisons', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Method vs Method Comparisons', level: 2 })).toBeVisible();

    // Check for specific comparisons
    await expect(page.getByText('Difference of Squares vs Near 100')).toBeVisible();
    await expect(page.getByText('Distributive vs Factorization')).toBeVisible();
    await expect(page.getByText('Squaring vs Difference of Squares')).toBeVisible();
    await expect(page.getByText('Near Power of 10 vs Distributive')).toBeVisible();
  });

  test('displays same problem different methods section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Same Problem, Different Methods', level: 2 })).toBeVisible();

    // Check for expandable problem cards
    await expect(page.getByText('48 x 52')).toBeVisible();
    await expect(page.getByText('97 x 94')).toBeVisible();
    await expect(page.getByText('25 x 36')).toBeVisible();
  });

  test('problem cards are expandable', async ({ page }) => {
    const firstProblem = page.getByRole('button').filter({ has: page.getByText('48 x 52') });
    await firstProblem.click();

    // Should show solution approaches
    await expect(page.getByText('Difference of Squares (Optimal)')).toBeVisible();
    await expect(page.getByText('Distributive')).toBeVisible();
  });

  test('displays quick pattern reference', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quick Pattern Reference', level: 2 })).toBeVisible();

    // Check for pattern cards
    await expect(page.getByText('Numbers ending in 5')).toBeVisible();
    await expect(page.getByText('One number is 11')).toBeVisible();
    await expect(page.getByText('Numbers summing to 100')).toBeVisible();
  });

  test('has navigation links to combining methods and practice', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Learn to Combine Methods' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Practice with Problems' })).toBeVisible();
  });

  test('breadcrumb navigates back to study overview', async ({ page }) => {
    await page.getByRole('link', { name: 'Study' }).click();
    await expect(page).toHaveURL('/study');
  });

  test('method links in table navigate to method pages', async ({ page }) => {
    const table = page.locator('table');
    const distributiveLink = table.getByRole('link', { name: 'Distributive Property' });
    await distributiveLink.click();
    await expect(page).toHaveURL('/study/distributive');
  });
});

test.describe('Combining Techniques Page (/study/combining)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/study/combining');
  });

  test('displays page header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Combining Calculation Techniques', level: 1 })).toBeVisible();
    await expect(page.getByText('Advanced')).toBeVisible(); // Badge
  });

  test('displays breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Study' })).toBeVisible();
    await expect(breadcrumb.getByText('Combining Techniques')).toBeVisible();
  });

  test('displays when to combine methods section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'When to Combine Methods', level: 2 })).toBeVisible();

    // Check for pattern cards
    await expect(page.getByText('Large numbers with structure')).toBeVisible();
    await expect(page.getByText('Near-round with adjustment')).toBeVisible();
    await expect(page.getByText('Symmetric requiring squaring')).toBeVisible();
    await expect(page.getByText('Multi-step factorization')).toBeVisible();
  });

  test('displays common method combinations', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Common Method Combinations', level: 2 })).toBeVisible();

    // Check for combination cards
    await expect(page.getByText('Factorization + Distributive')).toBeVisible();
    await expect(page.getByText('Near Power of 10 + Simple Multiplication')).toBeVisible();
    await expect(page.getByText('Difference of Squares + Squaring')).toBeVisible();
    await expect(page.getByText('Near 100 + Cross Multiplication')).toBeVisible();
    await expect(page.getByText('Factorization + Powers of 2')).toBeVisible();
  });

  test('displays detailed worked examples', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Detailed Worked Examples', level: 2 })).toBeVisible();

    // First example should be expanded by default
    await expect(page.getByText('48 x 52')).toBeVisible();
    await expect(page.getByText('Difference of Squares + Squaring')).toBeVisible();
  });

  test('worked examples are expandable/collapsible', async ({ page }) => {
    // Find second example (125 x 32) and click to expand
    const secondExample = page.getByRole('button').filter({ has: page.getByText('125 x 32') });
    await secondExample.click();

    // Should show key insight
    await expect(page.getByText('Recognizing that 125 x 8 = 1000')).toBeVisible();
  });

  test('displays mental strategies section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mental Strategies for Combining', level: 2 })).toBeVisible();

    // Check for strategy items
    await expect(page.getByText('Always scan for patterns first')).toBeVisible();
    await expect(page.getByText('Know your anchor facts')).toBeVisible();
    await expect(page.getByText('Chain small steps')).toBeVisible();
    await expect(page.getByText('Validate intermediate results')).toBeVisible();
    await expect(page.getByText('Practice method transitions')).toBeVisible();
  });

  test('displays practice exercises section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Practice Combining Methods', level: 2 })).toBeVisible();

    // Check for exercise cards
    await expect(page.getByText('96 x 104')).toBeVisible();
    await expect(page.getByText('45 x 88')).toBeVisible();
    await expect(page.getByText('67 x 73')).toBeVisible();
  });

  test('exercise hints and answers can be toggled', async ({ page }) => {
    // Find first exercise
    const firstExercise = page.locator('div').filter({ hasText: /^96 x 104/ }).first();

    // Click show hint
    const showHintButton = page.getByRole('button', { name: 'Show Hint' }).first();
    await showHintButton.click();
    await expect(page.getByText('Both numbers are close to 100 AND symmetric around 100')).toBeVisible();

    // Click show answer
    const showAnswerButton = page.getByRole('button', { name: 'Show Answer' }).first();
    await showAnswerButton.click();
    await expect(page.getByText('9984')).toBeVisible();
  });

  test('has navigation links to compare and practice', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Compare Individual Methods' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Practice Mixed Problems' })).toBeVisible();
  });

  test('breadcrumb navigates back to study overview', async ({ page }) => {
    await page.getByRole('link', { name: 'Study' }).click();
    await expect(page).toHaveURL('/study');
  });
});

test.describe('Mathematical Correctness Verification', () => {
  test('comparison page examples are mathematically correct', async ({ page }) => {
    await page.goto('/study/compare');

    // Verify specific calculations shown in the comparison table
    // 23 x 45 = 1035 (Distributive)
    await expect(page.getByText('23 x 45')).toBeVisible();

    // 47 x 53 = 2491 (Difference of Squares)
    await expect(page.getByText('47 x 53')).toBeVisible();

    // 99 x 47 = 4653 (Near Power 10)
    await expect(page.getByText('99 x 47')).toBeVisible();

    // 47 x 47 = 2209 (Squaring)
    await expect(page.getByText('47 x 47')).toBeVisible();

    // 97 x 103 = 9991 (Near 100)
    await expect(page.getByText('97 x 103')).toBeVisible();

    // 24 x 35 = 840 (Factorization)
    await expect(page.getByText('24 x 35')).toBeVisible();
  });

  test('same problem different methods shows correct answers', async ({ page }) => {
    await page.goto('/study/compare');

    // 48 x 52 = 2496
    await expect(page.getByText('= 2496')).toBeVisible();

    // 97 x 94 = 9118
    await expect(page.getByText('= 9118')).toBeVisible();

    // 25 x 36 = 900
    await expect(page.getByText('= 900')).toBeVisible();
  });

  test('combining page worked examples are mathematically correct', async ({ page }) => {
    await page.goto('/study/combining');

    // 48 x 52 = 2496
    await expect(page.getByText('48 x 52')).toBeVisible();
    await expect(page.getByText('= 2496')).toBeVisible();

    // 125 x 32 = 4000
    await expect(page.getByText('125 x 32')).toBeVisible();
    await expect(page.getByText('= 4000')).toBeVisible();

    // 97 x 54 = 5238
    await expect(page.getByText('97 x 54')).toBeVisible();
    await expect(page.getByText('= 5238')).toBeVisible();

    // 75 x 44 = 3300
    await expect(page.getByText('75 x 44')).toBeVisible();
    await expect(page.getByText('= 3300')).toBeVisible();

    // 63 x 57 = 3591
    await expect(page.getByText('63 x 57')).toBeVisible();
    await expect(page.getByText('= 3591')).toBeVisible();
  });

  test('combining page practice exercises have correct answers', async ({ page }) => {
    await page.goto('/study/combining');

    // Show all answers
    const showAnswerButtons = page.getByRole('button', { name: 'Show Answer' });
    const count = await showAnswerButtons.count();

    for (let i = 0; i < count; i++) {
      await showAnswerButtons.nth(i).click();
    }

    // Verify correct answers
    await expect(page.getByText('Answer: 9984')).toBeVisible(); // 96 x 104
    await expect(page.getByText('Answer: 3960')).toBeVisible(); // 45 x 88
    await expect(page.getByText('Answer: 4891')).toBeVisible(); // 67 x 73
    await expect(page.getByText('Answer: 3000')).toBeVisible(); // 125 x 24
    await expect(page.getByText('Answer: 3626')).toBeVisible(); // 98 x 37
    await expect(page.getByText('Answer: 1600')).toBeVisible(); // 64 x 25
  });

  test('quick pattern reference shows correct calculations', async ({ page }) => {
    await page.goto('/study/compare');

    // 35 x 35 = 1225 (Numbers ending in 5)
    await expect(page.getByText('35 x 35')).toBeVisible();
    await expect(page.getByText('1225')).toBeVisible();

    // 11 x 47 = 517 (One number is 11)
    await expect(page.getByText('11 x 47')).toBeVisible();
    await expect(page.getByText('517')).toBeVisible();

    // 37 x 63 = 2331 (Numbers summing to 100)
    await expect(page.getByText('37 x 63')).toBeVisible();
    await expect(page.getByText('2331')).toBeVisible();

    // 25 x 48 = 1200 (Doubling/halving)
    await expect(page.getByText('25 x 48')).toBeVisible();
    await expect(page.getByText('1200')).toBeVisible();

    // 32 x 25 = 800 (Powers of 2)
    await expect(page.getByText('32 x 25')).toBeVisible();
    await expect(page.getByText('800')).toBeVisible();
  });
});

test.describe('Navigation and Link Verification', () => {
  test('all study page links work correctly', async ({ page }) => {
    await page.goto('/study');

    // Test learning path links
    const distributivePathLink = page.locator('a[href="/study/distributive"]').first();
    await expect(distributivePathLink).toBeVisible();

    // Test method card links
    for (const method of ['distributive', 'difference-squares', 'near-power-10', 'squaring', 'near-100', 'factorization']) {
      await page.goto('/study');
      await page.locator(`a[href="/study/${method}"]`).first().click();
      await expect(page).toHaveURL(`/study/${method}`);
    }
  });

  test('compare page links navigate correctly', async ({ page }) => {
    await page.goto('/study/compare');

    // Test navigation to combining
    await page.getByRole('link', { name: 'Learn to Combine Methods' }).click();
    await expect(page).toHaveURL('/study/combining');

    // Go back and test navigation to practice
    await page.goto('/study/compare');
    await page.getByRole('link', { name: 'Practice with Problems' }).click();
    await expect(page).toHaveURL(/\/practice/);
  });

  test('combining page links navigate correctly', async ({ page }) => {
    await page.goto('/study/combining');

    // Test navigation to compare
    await page.getByRole('link', { name: 'Compare Individual Methods' }).click();
    await expect(page).toHaveURL('/study/compare');

    // Go back and test navigation to practice
    await page.goto('/study/combining');
    await page.getByRole('link', { name: 'Practice Mixed Problems' }).click();
    await expect(page).toHaveURL(/\/practice/);
  });

  test('invalid method slug shows 404', async ({ page }) => {
    const response = await page.goto('/study/invalid-method');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Accessibility', () => {
  test('study overview page has correct heading hierarchy', async ({ page }) => {
    await page.goto('/study');

    // H1 should exist
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Multiple H2s for sections
    const h2s = page.getByRole('heading', { level: 2 });
    expect(await h2s.count()).toBeGreaterThanOrEqual(3);
  });

  test('method pages have proper ARIA attributes for tabs', async ({ page }) => {
    await page.goto('/study/distributive');

    // Tablist should have role
    const tablist = page.getByRole('tablist');
    await expect(tablist).toBeVisible();

    // Tabs should have proper attributes
    const firstTab = page.getByRole('tab').first();
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    await expect(firstTab).toHaveAttribute('aria-controls');
  });

  test('expandable sections have proper aria-expanded', async ({ page }) => {
    await page.goto('/study/compare');

    // Find a collapsible button
    const problemButton = page.getByRole('button').filter({ has: page.getByText('48 x 52') });
    await expect(problemButton).toHaveAttribute('aria-expanded', 'false');

    await problemButton.click();
    await expect(problemButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('navigation landmarks are present', async ({ page }) => {
    await page.goto('/study');

    // Main navigation
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('study overview displays correctly on mobile', async ({ page }) => {
    await page.goto('/study');

    // Page should be visible and scrollable
    await expect(page.getByRole('heading', { name: 'Master Mental Math', level: 1 })).toBeVisible();

    // Method cards should stack vertically
    const methodCards = page.locator('[aria-label*="Study"][aria-label*="method"]');
    expect(await methodCards.count()).toBe(6);
  });

  test('method page tabs work on mobile', async ({ page }) => {
    await page.goto('/study/distributive');

    // Tabs should still be accessible
    const examplesTab = page.getByRole('tab', { name: /Examples/i });
    await expect(examplesTab).toBeVisible();
    await examplesTab.click();
    await expect(examplesTab).toHaveAttribute('aria-selected', 'true');
  });

  test('compare page flowchart shows mobile version', async ({ page }) => {
    await page.goto('/study/compare');

    // Desktop flowchart should be hidden
    const desktopFlowchart = page.locator('.hidden.sm\\:block');
    await expect(desktopFlowchart).not.toBeVisible();

    // Mobile version should be visible
    await expect(page.getByText('Decision Order (simplified for mobile)')).toBeVisible();
  });
});
