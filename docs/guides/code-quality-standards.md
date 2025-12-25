# Code Quality Standards

This guide defines the coding standards and best practices for the Mental Math Trainer.

---

## TypeScript Configuration

### Strict Mode Required

All code must compile with these settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Safety Rules

1. **Never use `any`**: Use `unknown` and narrow types instead
2. **Always type function parameters**: No implicit any
3. **Use readonly where possible**: For arrays and objects that shouldn't mutate
4. **Prefer type inference**: Let TypeScript infer when obvious
5. **Use discriminated unions**: For complex state types

```typescript
// Bad
function process(data: any) { /* ... */ }

// Good
function process(data: unknown): Result {
  if (!isValidData(data)) {
    throw new Error('Invalid data');
  }
  // data is now typed
}
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `SolutionReview.tsx` |
| Hook | camelCase with use prefix | `useSession.ts` |
| Utility | kebab-case | `method-selector.ts` |
| Type file | kebab-case | `problem.ts` |
| Test file | kebab-case.test | `validator.test.ts` |
| Constants | UPPER_SNAKE_CASE | `DIFFICULTY_RANGES` |

### Code

| Type | Convention | Example |
|------|------------|---------|
| Function | camelCase verb | `generateSolution` |
| Class | PascalCase noun | `MethodSelector` |
| Interface | PascalCase I-prefix optional | `Solution` or `ISolution` |
| Type | PascalCase | `MethodName` |
| Constant | UPPER_SNAKE_CASE | `MAX_ATTEMPTS` |
| Variable | camelCase | `currentProblem` |
| Boolean | is/has/should prefix | `isValid`, `hasError` |

---

## Function Design

### Pure Functions for Business Logic

Calculation methods should be pure functions:

```typescript
// Good: Pure function
function computeCost(num1: number, num2: number): number {
  const digits1 = countDigits(num1);
  const digits2 = countDigits(num2);
  return digits1 * digits2 * COST_FACTOR;
}

// Bad: Side effects
function computeCost(num1: number, num2: number): number {
  console.log(`Computing cost for ${num1} × ${num2}`); // Side effect
  globalCostCache[`${num1}-${num2}`] = result; // Side effect
  return result;
}
```

### Function Length

- Target: < 30 lines
- Maximum: 50 lines
- If longer, extract helper functions

### Parameters

- Maximum 3-4 parameters
- Use options object for more:

```typescript
// Instead of this
function generate(difficulty, methods, count, negatives, seed) { /* ... */ }

// Do this
interface GenerationConfig {
  difficulty: DifficultyLevel;
  methods?: MethodName[];
  count?: number;
  allowNegatives?: boolean;
}

function generate(config: GenerationConfig) { /* ... */ }
```

---

## Error Handling

### Validation Errors

Throw descriptive errors for invalid input:

```typescript
function generateSolution(num1: number, num2: number): Solution {
  if (!Number.isInteger(num1) || !Number.isInteger(num2)) {
    throw new Error('Both arguments must be integers');
  }

  if (num1 === 0 || num2 === 0) {
    throw new Error('Cannot multiply by zero');
  }

  // ... implementation
}
```

### Error Messages

Be specific and actionable:

```typescript
// Bad
throw new Error('Invalid input');

// Good
throw new Error(
  `Method ${this.name} is not applicable for ${num1} × ${num2}: ` +
  `numbers must be symmetric around a midpoint`
);
```

### Never Swallow Errors

```typescript
// Bad
try {
  doSomething();
} catch (e) {
  // Silent failure
}

// Good
try {
  doSomething();
} catch (e) {
  console.error('Operation failed:', e);
  throw e; // Or handle appropriately
}
```

---

## Code Organization

### Single Responsibility

Each file/class/function should do one thing:

```typescript
// Bad: Multiple responsibilities
class SolutionManager {
  generateSolution() { /* ... */ }
  validateSolution() { /* ... */ }
  saveSolution() { /* ... */ }
  displaySolution() { /* ... */ }
}

// Good: Separated responsibilities
class SolutionGenerator { /* ... */ }
class SolutionValidator { /* ... */ }
class SolutionStore { /* ... */ }
// Display in React component
```

### Import Order

```typescript
// 1. External packages
import { useState, useEffect } from 'react';
import { describe, it, expect } from 'vitest';

// 2. Internal absolute imports
import type { Solution, MethodName } from '@/lib/types';
import { SolutionValidator } from '@/lib/core/validator';

// 3. Relative imports
import { formatNumber } from './utils';
```

---

## Comments and Documentation

### When to Comment

1. **Complex algorithms**: Explain the why, not the what
2. **Non-obvious behavior**: Explain edge cases
3. **Workarounds**: Document why a workaround exists

```typescript
// Good: Explains why
// Using Function constructor instead of eval for security.
// We've already validated the expression contains only arithmetic.
const result = new Function(`return ${expr}`)();

// Bad: Explains what (obvious from code)
// Multiply num1 by num2
const result = num1 * num2;
```

### JSDoc for Public APIs

```typescript
/**
 * Validates that a solution is mathematically correct.
 *
 * @param num1 - First factor in the multiplication
 * @param num2 - Second factor in the multiplication
 * @param solution - The solution to validate
 * @returns Validation result with any errors found
 *
 * @example
 * const result = validateSolution(47, 53, mySolution);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 */
static validateSolution(
  num1: number,
  num2: number,
  solution: Solution
): ValidationResult {
  // ...
}
```

---

## React Best Practices

### Functional Components

Always use functional components with hooks:

```typescript
// Good
function ProblemDisplay({ problem, onSubmit }: Props) {
  const [answer, setAnswer] = useState('');
  // ...
}

// Avoid class components
```

### Props Interface

Define explicit props interface:

```typescript
interface ProblemDisplayProps {
  problem: Problem;
  attemptNumber: number;
  onSubmit: (answer: number) => void;
  onHint: () => void;
}

function ProblemDisplay({ problem, attemptNumber, onSubmit, onHint }: ProblemDisplayProps) {
  // ...
}
```

### Memoization

Use appropriately for performance:

```typescript
// Memoize expensive calculations
const cost = useMemo(
  () => computeExpensiveCost(num1, num2),
  [num1, num2]
);

// Memoize callbacks passed to children
const handleSubmit = useCallback(
  (answer: number) => onSubmit(problem.id, answer),
  [problem.id, onSubmit]
);
```

---

## Patterns to Follow

### Early Returns

Reduce nesting with early returns:

```typescript
// Bad
function validate(solution: Solution): boolean {
  if (solution.steps.length > 0) {
    if (solution.validated) {
      if (solution.validationErrors.length === 0) {
        return true;
      }
    }
  }
  return false;
}

// Good
function validate(solution: Solution): boolean {
  if (solution.steps.length === 0) return false;
  if (!solution.validated) return false;
  if (solution.validationErrors.length > 0) return false;
  return true;
}
```

### Destructuring

Use to clarify intent:

```typescript
// Instead of
const name = method.name;
const cost = method.computeCost(num1, num2);

// Do
const { name, computeCost } = method;
const cost = computeCost(num1, num2);
```

### Object Spread for Immutability

```typescript
// Update object immutably
const updated = {
  ...solution,
  validated: true,
  validationErrors: []
};

// Update array immutably
const newSteps = [...steps, newStep];
```

---

## Anti-Patterns to Avoid

1. **Magic numbers**: Use named constants
2. **Long parameter lists**: Use options objects
3. **Deep nesting**: Use early returns
4. **Mutable shared state**: Use immutable updates
5. **Implicit any**: Always type explicitly
6. **Console.log in production**: Use proper logging
7. **Unused imports/variables**: Clean up regularly
8. **Circular dependencies**: Restructure modules

---

## Code Review Checklist

- [ ] No `any` types
- [ ] All functions have return types
- [ ] Error handling is comprehensive
- [ ] No magic numbers
- [ ] Names are descriptive
- [ ] Complex logic is commented
- [ ] Tests cover the changes
- [ ] No console.log statements (unless intentional)
