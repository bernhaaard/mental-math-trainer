# Testing Strategy Guide

This guide defines the comprehensive testing approach for the Mental Math Trainer application.

---

## Testing Pyramid

```
                    ╔═══════════════╗
                    ║   Manual      ║  ← Spot-checks, UX validation
                    ║   Testing     ║
                    ╠═══════════════╣
                ╔═══╩═══════════════╩═══╗
                ║    Integration        ║  ← User flow tests
                ║    Tests              ║
                ╠═══════════════════════╣
            ╔═══╩═══════════════════════╩═══╗
            ║         Unit Tests            ║  ← Method tests, validation
            ║         (Foundation)          ║
            ╚═══════════════════════════════╝
```

---

## Coverage Requirements

| Category | Minimum | Target | Priority |
|----------|---------|--------|----------|
| Calculation Methods | 95% | 100% | Critical |
| Validation System | 95% | 100% | Critical |
| Method Selector | 90% | 95% | High |
| Problem Generator | 85% | 90% | High |
| Session Manager | 80% | 85% | Medium |
| Storage Layer | 75% | 80% | Medium |
| UI Components | 70% | 80% | Medium |
| **Overall** | **80%** | **85%** | - |

---

## Unit Testing

### Test Structure

Each test file should follow this structure:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ComponentName', () => {
  // Setup if needed
  beforeEach(() => {
    // Reset state
  });

  describe('methodName', () => {
    it('should handle happy path', () => {
      // Test normal operation
    });

    it('should handle edge cases', () => {
      // Test boundaries
    });

    it('should handle error cases', () => {
      // Test error conditions
    });
  });
});
```

### Test Categories

#### 1. Correctness Tests
Verify mathematical accuracy:

```typescript
it('produces correct answer', () => {
  const result = method.generateSolution(47, 53);
  const finalStep = result.steps.slice(-1)[0];
  expect(finalStep.result).toBe(47 * 53); // 2491
});
```

#### 2. Validation Tests
Verify solution validation works:

```typescript
it('validates correct solution', () => {
  const solution = method.generateSolution(47, 53);
  expect(solution.validated).toBe(true);
  expect(solution.validationErrors).toHaveLength(0);
});

it('detects incorrect answer', () => {
  const badSolution = { ...validSolution };
  badSolution.steps[badSolution.steps.length - 1].result = 9999;
  const result = SolutionValidator.validateSolution(47, 53, badSolution);
  expect(result.valid).toBe(false);
});
```

#### 3. Edge Case Tests
Test boundary conditions:

```typescript
describe('edge cases', () => {
  it('handles single digit numbers', () => { /* ... */ });
  it('handles maximum range numbers', () => { /* ... */ });
  it('handles negative numbers', () => { /* ... */ });
  it('handles identical numbers', () => { /* ... */ });
});
```

#### 4. Applicability Tests
Verify methods apply correctly:

```typescript
describe('isApplicable', () => {
  it('returns true for valid input', () => {
    expect(method.isApplicable(47, 53)).toBe(true);
  });

  it('returns false for invalid input', () => {
    expect(method.isApplicable(47, 54)).toBe(false);
  });
});
```

---

## Integration Testing

### User Flow Tests

Test complete user journeys:

```typescript
describe('Practice Session Flow', () => {
  it('completes full session', async () => {
    // Start session
    const session = sessionManager.startSession({
      difficulty: 'beginner',
      methods: [],
      problemCount: 3,
      allowNegatives: false
    });

    // Solve each problem
    for (let i = 0; i < 3; i++) {
      const problem = sessionManager.getCurrentProblem();
      const result = sessionManager.submitAnswer(problem!.correctAnswer);
      expect(result.correct).toBe(true);
      sessionManager.nextProblem();
    }

    // End session
    const completed = sessionManager.endSession();
    expect(completed.statistics.accuracy).toBe(100);
  });
});
```

### Cross-Method Validation

Verify all methods produce same answer:

```typescript
describe('Cross-Validation', () => {
  it('all methods give same answer', () => {
    const methods = selector.getAllMethods();
    const [num1, num2] = [47, 53];
    const expected = num1 * num2;

    const applicable = methods.filter(m => m.isApplicable(num1, num2));

    applicable.forEach(method => {
      const solution = method.generateSolution(num1, num2);
      const answer = solution.steps.slice(-1)[0].result;
      expect(answer).toBe(expected);
    });
  });
});
```

---

## Test Fixtures

### Known Solutions

Maintain a curated list of verified problems:

```typescript
export const KNOWN_SOLUTIONS = [
  // Difference of Squares
  { num1: 47, num2: 53, answer: 2491, optimalMethod: 'difference-squares' },
  { num1: 96, num2: 104, answer: 9984, optimalMethod: 'difference-squares' },

  // Near-100
  { num1: 97, num2: 94, answer: 9118, optimalMethod: 'near-100' },
  { num1: 103, num2: 98, answer: 10094, optimalMethod: 'near-100' },

  // Squaring
  { num1: 73, num2: 73, answer: 5329, optimalMethod: 'squaring' },
  { num1: 25, num2: 25, answer: 625, optimalMethod: 'squaring' },

  // Near Powers of 10
  { num1: 102, num2: 47, answer: 4794, optimalMethod: 'near-power-10' },
  { num1: 998, num2: 35, answer: 34930, optimalMethod: 'near-power-10' },

  // Factorization
  { num1: 25, num2: 48, answer: 1200, optimalMethod: 'factorization' },
  { num1: 125, num2: 56, answer: 7000, optimalMethod: 'factorization' },

  // Distributive (fallback)
  { num1: 47, num2: 89, answer: 4183, optimalMethod: 'distributive' },
  { num1: 34, num2: 67, answer: 2278, optimalMethod: 'distributive' },
];
```

---

## Manual Validation Protocol

### When to Perform Manual Validation

1. After implementing a new method
2. After refactoring solution generation
3. After modifying the validation system
4. Before each release

### Manual Validation Steps

1. **Generate sample problems**: At least 3 per method
2. **Work through by hand**: Calculate using the method's steps
3. **Compare with application**: Verify each step matches
4. **Check explanation quality**: Ensure explanations are clear
5. **Document results**: Record in validation log

### Validation Log Template

```markdown
## Manual Validation - [Date]

### Method: Difference of Squares

| Problem | Expected | Application | Steps Match | Explanation Clear |
|---------|----------|-------------|-------------|-------------------|
| 47×53 | 2491 | 2491 | ✓ | ✓ |
| 96×104 | 9984 | 9984 | ✓ | ✓ |
| 43×57 | 2451 | 2451 | ✓ | ✓ |

Notes: All correct, explanations clear.
```

---

## Performance Testing

### Benchmarks

```typescript
describe('Performance', () => {
  it('processes 100 beginner problems in < 1s', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      selectOptimalMethod(
        randomInRange(10, 100),
        randomInRange(10, 100)
      );
    }
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it('processes expert problems in < 5s each', () => {
    const start = performance.now();
    selectOptimalMethod(999999, 888888);
    expect(performance.now() - start).toBeLessThan(5000);
  });
});
```

---

## Continuous Integration

### CI Test Requirements

All PRs must pass:

1. `npm test` - All unit tests
2. `npm run test:coverage` - Coverage thresholds
3. `npm run lint` - No linting errors
4. `npx tsc --noEmit` - No TypeScript errors

### Coverage Check

```yaml
# In CI workflow
- name: Check Coverage
  run: |
    npm run test:coverage
    # Fail if below thresholds
```

---

## Anti-Patterns to Avoid

1. **Testing implementation, not behavior**: Test what the code does, not how
2. **Incomplete mocking**: Always mock external dependencies completely
3. **Test interdependence**: Each test should run independently
4. **Missing edge cases**: Always test boundaries and error conditions
5. **Ignoring async**: Always await async operations properly

---

## References

- Test organization: `src/tests/` directory structure
- CI configuration: `.github/workflows/ci.yml`
- Coverage configuration: `vitest.config.ts`
