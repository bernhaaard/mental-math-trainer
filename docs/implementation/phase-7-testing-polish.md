# Phase 7: Testing & Polish

**Objective**: Achieve comprehensive test coverage, validate mathematical correctness, optimize performance, and finalize documentation.

**Exit Criteria**: Test coverage ≥90% for core logic; all manual validations pass; performance benchmarks met; application ready for use.

---

## Testing Strategy

### Test Organization

```
src/tests/
├── unit/
│   ├── methods/              # Test each calculation method
│   │   ├── distributive.test.ts
│   │   ├── difference-squares.test.ts
│   │   ├── near-power-10.test.ts
│   │   ├── squaring.test.ts
│   │   ├── near-100.test.ts
│   │   ├── factorization.test.ts
│   │   └── method-selector.test.ts
│   ├── validation/           # Validation system tests
│   │   └── validator.test.ts
│   └── generation/           # Problem generation tests
│       └── problem-generator.test.ts
├── integration/
│   ├── practice-flow.test.ts # Complete session flow
│   └── study-flow.test.ts    # Study mode navigation
├── fixtures/
│   ├── known-solutions.ts    # Known correct answers
│   └── test-data.ts          # Test utilities
└── setup.ts
```

---

## Comprehensive Test Suite

### Known Solutions Validation

```typescript
// src/tests/unit/known-solutions.test.ts

import { describe, it, expect } from 'vitest';
import { selectOptimalMethod } from '@/lib/core/methods/method-selector';
import { KNOWN_SOLUTIONS } from '../fixtures/known-solutions';

describe('Known Solutions Validation', () => {
  KNOWN_SOLUTIONS.forEach(({ num1, num2, answer, optimalMethod }) => {
    it(`correctly solves ${num1} × ${num2} = ${answer}`, () => {
      const result = selectOptimalMethod(num1, num2);

      // Verify solution is validated
      expect(result.optimal.solution.validated).toBe(true);
      expect(result.optimal.solution.validationErrors).toHaveLength(0);

      // Verify correct answer
      const finalStep = result.optimal.solution.steps.slice(-1)[0];
      expect(finalStep.result).toBe(answer);

      // Verify expected method (if specified)
      if (optimalMethod) {
        expect(result.optimal.method.name).toBe(optimalMethod);
      }
    });
  });
});
```

### Exhaustive Method Testing

```typescript
// src/tests/unit/exhaustive-validation.test.ts

import { describe, it, expect } from 'vitest';
import { MethodSelector } from '@/lib/core/methods/method-selector';

describe('Exhaustive Validation', () => {
  const selector = new MethodSelector();

  describe('all methods produce correct answers', () => {
    const testRanges = [
      { min: 10, max: 100, samples: 50 },
      { min: 100, max: 1000, samples: 30 },
      { min: 1000, max: 10000, samples: 20 }
    ];

    testRanges.forEach(({ min, max, samples }) => {
      it(`validates ${samples} random problems in range ${min}-${max}`, () => {
        for (let i = 0; i < samples; i++) {
          const num1 = Math.floor(Math.random() * (max - min)) + min;
          const num2 = Math.floor(Math.random() * (max - min)) + min;
          const expected = num1 * num2;

          const result = selector.selectOptimalMethod(num1, num2);

          // Optimal solution must be valid
          expect(result.optimal.solution.validated).toBe(true);
          expect(result.optimal.solution.steps.slice(-1)[0].result).toBe(expected);

          // All alternatives must also be valid
          result.alternatives.forEach(alt => {
            expect(alt.solution.validated).toBe(true);
            expect(alt.solution.steps.slice(-1)[0].result).toBe(expected);
          });
        }
      });
    });
  });

  describe('method applicability is correct', () => {
    it('difference-squares only applies to symmetric pairs', () => {
      const method = selector.getMethod('difference-squares');

      // Should apply
      expect(method?.isApplicable(47, 53)).toBe(true);  // symmetric around 50
      expect(method?.isApplicable(96, 104)).toBe(true); // symmetric around 100

      // Should not apply
      expect(method?.isApplicable(47, 54)).toBe(false); // not symmetric
      expect(method?.isApplicable(47, 100)).toBe(false); // too far apart
    });

    it('near-100 only applies when both near 100', () => {
      const method = selector.getMethod('near-100');

      // Should apply
      expect(method?.isApplicable(97, 94)).toBe(true);
      expect(method?.isApplicable(103, 98)).toBe(true);

      // Should not apply
      expect(method?.isApplicable(97, 50)).toBe(false);
      expect(method?.isApplicable(120, 80)).toBe(false); // too far from 100
    });
  });
});
```

### Edge Case Testing

```typescript
// src/tests/unit/edge-cases.test.ts

import { describe, it, expect } from 'vitest';
import { selectOptimalMethod } from '@/lib/core/methods/method-selector';
import { ProblemGenerator } from '@/lib/core/problem-generator';

describe('Edge Cases', () => {
  describe('boundary numbers', () => {
    it('handles exact power of 10 multiplication', () => {
      const result = selectOptimalMethod(100, 47);
      expect(result.optimal.solution.validated).toBe(true);
      expect(result.optimal.solution.steps.slice(-1)[0].result).toBe(4700);
    });

    it('handles single digit numbers', () => {
      const result = selectOptimalMethod(7, 8);
      expect(result.optimal.solution.validated).toBe(true);
      expect(result.optimal.solution.steps.slice(-1)[0].result).toBe(56);
    });

    it('handles large numbers at difficulty ceiling', () => {
      const result = selectOptimalMethod(999999, 999999);
      expect(result.optimal.solution.validated).toBe(true);
      expect(result.optimal.solution.steps.slice(-1)[0].result).toBe(999999 * 999999);
    });
  });

  describe('negative numbers', () => {
    it('handles one negative number', () => {
      const result = selectOptimalMethod(-47, 53);
      expect(result.optimal.solution.validated).toBe(true);
      expect(result.optimal.solution.steps.slice(-1)[0].result).toBe(-2491);
    });

    it('handles both negative numbers', () => {
      const result = selectOptimalMethod(-47, -53);
      expect(result.optimal.solution.validated).toBe(true);
      expect(result.optimal.solution.steps.slice(-1)[0].result).toBe(2491);
    });
  });

  describe('problem generation exclusions', () => {
    const generator = new ProblemGenerator();

    it('never generates multiplication by 0', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generator.generate({ difficulty: 'beginner' });
        expect(problem.num1).not.toBe(0);
        expect(problem.num2).not.toBe(0);
      }
    });

    it('never generates multiplication by 1', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generator.generate({ difficulty: 'beginner' });
        expect(problem.num1).not.toBe(1);
        expect(problem.num2).not.toBe(1);
      }
    });
  });
});
```

---

## Performance Benchmarks

```typescript
// src/tests/performance/benchmarks.test.ts

import { describe, it, expect } from 'vitest';
import { selectOptimalMethod } from '@/lib/core/methods/method-selector';

describe('Performance Benchmarks', () => {
  it('generates solutions for small numbers in < 50ms', () => {
    const start = performance.now();

    for (let i = 0; i < 100; i++) {
      const num1 = 10 + Math.floor(Math.random() * 90);
      const num2 = 10 + Math.floor(Math.random() * 90);
      selectOptimalMethod(num1, num2);
    }

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000); // 100 solutions in < 1s
    console.log(`100 small number solutions: ${elapsed.toFixed(2)}ms`);
  });

  it('generates solutions for large numbers in < 5s each', () => {
    const testCases = [
      [123456, 789012],
      [999999, 888888],
      [500000, 500000]
    ];

    testCases.forEach(([num1, num2]) => {
      const start = performance.now();
      const result = selectOptimalMethod(num1, num2);
      const elapsed = performance.now() - start;

      expect(result.optimal.solution.validated).toBe(true);
      expect(elapsed).toBeLessThan(5000);
      console.log(`${num1} × ${num2}: ${elapsed.toFixed(2)}ms`);
    });
  });
});
```

---

## Manual Validation Checklist

### Solution Accuracy

For each method, manually verify at least 3 problems:

```markdown
# Manual Validation Log

## Difference of Squares
- [ ] 47 × 53 = 2491 ✓
- [ ] 96 × 104 = 9984 ✓
- [ ] 43 × 57 = 2451 ✓

## Near-100
- [ ] 97 × 94 = 9118 ✓
- [ ] 103 × 98 = 10094 ✓
- [ ] 88 × 96 = 8448 ✓

## Squaring
- [ ] 73 × 73 = 5329 ✓
- [ ] 25 × 25 = 625 ✓
- [ ] 45 × 45 = 2025 ✓

## Near Powers of 10
- [ ] 102 × 47 = 4794 ✓
- [ ] 98 × 123 = 12054 ✓
- [ ] 1003 × 25 = 25075 ✓

## Factorization
- [ ] 25 × 48 = 1200 ✓
- [ ] 35 × 24 = 840 ✓
- [ ] 125 × 56 = 7000 ✓

## Distributive
- [ ] 47 × 89 = 4183 ✓
- [ ] 34 × 67 = 2278 ✓
- [ ] 78 × 43 = 3354 ✓
```

### UI/UX Verification

```markdown
# UI/UX Checklist

## Navigation
- [ ] Can reach all pages from home
- [ ] Keyboard shortcuts work (s, p, t, h)
- [ ] Back navigation works correctly
- [ ] Mobile hamburger menu works

## Practice Mode
- [ ] Configuration saves selections
- [ ] Problems display correctly at all sizes
- [ ] Answer input accepts numbers
- [ ] Hint button reveals hints progressively
- [ ] Skip moves to solution review
- [ ] Solution review shows all steps
- [ ] Drill-down expands/collapses
- [ ] Alternative methods display
- [ ] Progress bar updates correctly

## Study Mode
- [ ] All six methods have content
- [ ] Deep dive sections expand
- [ ] Examples show correct solutions
- [ ] Interactive exercises validate input
- [ ] Hints reveal progressively

## Statistics
- [ ] Charts render with data
- [ ] Empty state handles gracefully
- [ ] Export produces valid files
- [ ] Weak areas display when present

## Responsive Design
- [ ] Desktop (1920×1080) ✓
- [ ] Tablet (768×1024) ✓
- [ ] Mobile (375×667) ✓
```

---

## Coverage Report

Run coverage and ensure thresholds:

```bash
npm run test:coverage

# Expected output:
# --------------|---------|----------|---------|---------|
# File          | % Stmts | % Branch | % Funcs | % Lines |
# --------------|---------|----------|---------|---------|
# lib/core/     |   95.2  |   91.3   |   94.8  |   95.4  |
# lib/storage/  |   82.1  |   78.5   |   85.0  |   82.3  |
# components/   |   80.5  |   75.2   |   82.1  |   80.8  |
# --------------|---------|----------|---------|---------|
# All files     |   87.3  |   82.4   |   88.6  |   87.5  |
```

### Coverage Requirements

| Area | Minimum | Target |
|------|---------|--------|
| Core logic (lib/core/) | 90% | 95% |
| Storage (lib/storage/) | 80% | 85% |
| Components | 75% | 80% |
| Overall | 80% | 85% |

---

## Final Polish

### Accessibility

- [ ] All interactive elements have focus states
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader labels on icons
- [ ] Skip to content link present

### Performance

- [ ] Lighthouse score > 90
- [ ] First contentful paint < 1.5s
- [ ] Time to interactive < 3s
- [ ] No layout shifts

### Error Handling

- [ ] Invalid answer shows helpful message
- [ ] Network errors display gracefully
- [ ] Database errors have fallback
- [ ] No console errors in production

---

## Release Checklist

- [ ] All tests pass
- [ ] Coverage meets thresholds
- [ ] Manual validation complete
- [ ] Performance benchmarks pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Documentation complete
- [ ] README updated

---

## References

- Testing requirements: `docs/PROJECT_REQUIREMENTS.md` Section 6
- Quality standards: `docs/guides/testing-strategy.md`
- Code standards: `docs/guides/code-quality-standards.md`
