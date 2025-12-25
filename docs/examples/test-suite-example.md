# Test Suite Example

Comprehensive testing patterns for calculation methods.

---

## Test Organization

```typescript
// src/tests/unit/methods/[method-name].test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { SomeMethod } from '@/lib/core/methods/some-method';
import { SolutionValidator } from '@/lib/core/validator';

describe('SomeMethod', () => {
  let method: SomeMethod;

  beforeEach(() => {
    method = new SomeMethod();
  });

  // Test categories follow...
});
```

---

## Category 1: Applicability Tests

```typescript
describe('isApplicable', () => {
  describe('positive cases', () => {
    it('applies to symmetric pairs', () => {
      expect(method.isApplicable(47, 53)).toBe(true);
    });

    it('applies when midpoint is round', () => {
      expect(method.isApplicable(45, 55)).toBe(true); // midpoint 50
    });

    it('applies at threshold boundary', () => {
      expect(method.isApplicable(30, 70)).toBe(true); // deviation = 20
    });
  });

  describe('negative cases', () => {
    it('rejects non-symmetric pairs', () => {
      expect(method.isApplicable(47, 54)).toBe(false);
    });

    it('rejects when deviation too large', () => {
      expect(method.isApplicable(20, 80)).toBe(false); // deviation = 30
    });

    it('rejects odd sum (no integer midpoint)', () => {
      expect(method.isApplicable(47, 52)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles same numbers', () => {
      expect(method.isApplicable(50, 50)).toBe(true);
    });

    it('handles negative numbers', () => {
      expect(method.isApplicable(-47, 53)).toBe(false); // or true, depending on method
    });

    it('handles zero', () => {
      expect(method.isApplicable(0, 100)).toBe(false);
    });
  });
});
```

---

## Category 2: Correctness Tests

```typescript
describe('generateSolution', () => {
  describe('basic correctness', () => {
    it('produces validated solution', () => {
      const solution = method.generateSolution(47, 53);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);
    });

    it('final answer matches direct multiplication', () => {
      const num1 = 47, num2 = 53;
      const solution = method.generateSolution(num1, num2);
      const finalResult = solution.steps.slice(-1)[0].result;

      expect(finalResult).toBe(num1 * num2);
    });

    it('all steps are valid', () => {
      const solution = method.generateSolution(47, 53);

      solution.steps.forEach(step => {
        const validation = SolutionValidator.validateStep(step);
        expect(validation.valid).toBe(true);
      });
    });
  });

  describe('step structure', () => {
    it('has multiple steps', () => {
      const solution = method.generateSolution(47, 53);
      expect(solution.steps.length).toBeGreaterThan(1);
    });

    it('each step has required properties', () => {
      const solution = method.generateSolution(47, 53);

      solution.steps.forEach(step => {
        expect(step.expression).toBeTruthy();
        expect(step.explanation).toBeTruthy();
        expect(typeof step.result).toBe('number');
        expect(typeof step.depth).toBe('number');
      });
    });

    it('includes sub-steps where appropriate', () => {
      const solution = method.generateSolution(47, 53);
      const hasSubSteps = solution.steps.some(s => s.subSteps && s.subSteps.length > 0);

      // Adjust expectation based on method
      expect(hasSubSteps).toBe(true);
    });
  });
});
```

---

## Category 3: Known Solutions Tests

```typescript
describe('known solutions', () => {
  const testCases = [
    { num1: 47, num2: 53, answer: 2491 },
    { num1: 96, num2: 104, answer: 9984 },
    { num1: 43, num2: 57, answer: 2451 },
    { num1: 88, num2: 112, answer: 9856 },
    { num1: 45, num2: 55, answer: 2475 },
  ];

  testCases.forEach(({ num1, num2, answer }) => {
    it(`correctly solves ${num1} × ${num2} = ${answer}`, () => {
      const solution = method.generateSolution(num1, num2);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);
      expect(solution.steps.slice(-1)[0].result).toBe(answer);
    });
  });
});
```

---

## Category 4: Edge Cases

```typescript
describe('edge cases', () => {
  describe('negative numbers', () => {
    it('handles first number negative', () => {
      const solution = method.generateSolution(-47, 53);

      expect(solution.validated).toBe(true);
      expect(solution.steps.slice(-1)[0].result).toBe(-2491);
    });

    it('handles second number negative', () => {
      const solution = method.generateSolution(47, -53);

      expect(solution.validated).toBe(true);
      expect(solution.steps.slice(-1)[0].result).toBe(-2491);
    });

    it('handles both negative', () => {
      const solution = method.generateSolution(-47, -53);

      expect(solution.validated).toBe(true);
      expect(solution.steps.slice(-1)[0].result).toBe(2491);
    });
  });

  describe('boundary values', () => {
    it('handles minimum applicable numbers', () => {
      // Adjust based on method's minimum
      const solution = method.generateSolution(48, 52);

      expect(solution.validated).toBe(true);
    });

    it('handles large numbers at difficulty ceiling', () => {
      const solution = method.generateSolution(499, 501);

      expect(solution.validated).toBe(true);
      expect(solution.steps.slice(-1)[0].result).toBe(499 * 501);
    });
  });

  describe('special patterns', () => {
    it('handles perfect square result', () => {
      const solution = method.generateSolution(45, 55);

      expect(solution.validated).toBe(true);
      // 45 × 55 = 50² - 5² = 2500 - 25 = 2475
      expect(solution.steps.slice(-1)[0].result).toBe(2475);
    });
  });
});
```

---

## Category 5: Cost Calculation

```typescript
describe('computeCost', () => {
  it('returns positive number', () => {
    const cost = method.computeCost(47, 53);
    expect(cost).toBeGreaterThan(0);
  });

  it('is consistent for same input', () => {
    const cost1 = method.computeCost(47, 53);
    const cost2 = method.computeCost(47, 53);
    expect(cost1).toBe(cost2);
  });

  it('varies with number properties', () => {
    // Adjust based on method's cost factors
    const easyCost = method.computeCost(45, 55);   // Round midpoint
    const harderCost = method.computeCost(47, 53); // Less round

    // Easy case should be cheaper (for this method)
    expect(easyCost).toBeLessThan(harderCost);
  });
});
```

---

## Category 6: Quality Score

```typescript
describe('qualityScore', () => {
  it('returns value between 0 and 1', () => {
    const score = method.qualityScore(47, 53);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('higher for ideal cases', () => {
    // Numbers symmetric around 100 are ideal for this method
    const idealScore = method.qualityScore(95, 105);
    const okScore = method.qualityScore(47, 53);

    expect(idealScore).toBeGreaterThan(okScore);
  });
});
```

---

## Category 7: Explanation Quality

```typescript
describe('explanation quality', () => {
  it('provides optimal reason', () => {
    const solution = method.generateSolution(47, 53);

    expect(solution.optimalReason).toBeTruthy();
    expect(solution.optimalReason.length).toBeGreaterThan(20);
  });

  it('explanations reference the actual numbers', () => {
    const solution = method.generateSolution(47, 53);

    const hasNumberReference = solution.steps.some(
      step => step.explanation.includes('47') || step.explanation.includes('53')
    );
    expect(hasNumberReference).toBe(true);
  });

  it('explanations are educational', () => {
    const solution = method.generateSolution(47, 53);

    // Check for mathematical terminology
    const hasEducationalContent = solution.steps.some(step =>
      step.explanation.includes('identity') ||
      step.explanation.includes('property') ||
      step.explanation.includes('calculate') ||
      step.explanation.includes('apply')
    );
    expect(hasEducationalContent).toBe(true);
  });
});
```

---

## Category 8: Random Exhaustive Testing

```typescript
describe('exhaustive validation', () => {
  it('validates 100 random applicable problems', () => {
    let validated = 0;

    for (let i = 0; i < 1000 && validated < 100; i++) {
      // Generate random numbers
      const midpoint = 10 + Math.floor(Math.random() * 90);
      const deviation = 1 + Math.floor(Math.random() * 20);
      const num1 = midpoint - deviation;
      const num2 = midpoint + deviation;

      if (!method.isApplicable(num1, num2)) continue;

      const solution = method.generateSolution(num1, num2);

      expect(solution.validated).toBe(true);
      expect(solution.steps.slice(-1)[0].result).toBe(num1 * num2);

      validated++;
    }

    expect(validated).toBe(100);
  });
});
```

---

## Test Utilities

```typescript
// src/tests/fixtures/test-data.ts

export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateApplicablePair(
  method: CalculationMethod,
  minRange: number,
  maxRange: number,
  maxAttempts = 100
): [number, number] | null {
  for (let i = 0; i < maxAttempts; i++) {
    const num1 = randomInRange(minRange, maxRange);
    const num2 = randomInRange(minRange, maxRange);

    if (method.isApplicable(num1, num2)) {
      return [num1, num2];
    }
  }
  return null;
}
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/tests/unit/methods/distributive.test.ts

# Run with coverage
npm run test:coverage

# Run with verbose output
npm test -- --reporter=verbose

# Run in watch mode
npm test -- --watch
```
