# Mathematical Validation Guide

This guide explains the validation system that ensures 100% mathematical correctness.

---

## Validation Philosophy

**Core Principle**: Every generated solution must be mathematically correct. A single arithmetic error is unacceptable in an educational application.

The validation system operates on three levels:

1. **Step Validation**: Each calculation step is verified independently
2. **Answer Validation**: Final answer matches direct multiplication
3. **Cross-Validation**: Multiple methods produce identical results

---

## Validation Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Solution Generation                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Step-by-Step Validation                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ For each step:                                    │   │
│  │ 1. Parse expression                               │   │
│  │ 2. Evaluate safely                                │   │
│  │ 3. Compare with claimed result                    │   │
│  │ 4. Flag discrepancies                             │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                Final Answer Validation                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ final_step.result === num1 * num2                 │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Cross-Validation                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ method1.result === method2.result === direct      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Expression Evaluation

### Secure Evaluation

The validator evaluates mathematical expressions without using dangerous `eval()`:

```typescript
static evaluateExpression(expr: string): number {
  // Remove whitespace
  const cleanExpr = expr.replace(/\s+/g, '');

  // Security: Only allow safe characters
  if (!/^[0-9+\-*/().^]+$/.test(cleanExpr)) {
    throw new Error('Expression contains invalid characters');
  }

  // Handle power notation
  const normalizedExpr = cleanExpr
    .replace(/\^/g, '**')
    .replace(/²/g, '**2')
    .replace(/³/g, '**3');

  // Safe evaluation using Function constructor
  // (isolated scope, no access to outer variables)
  const result = new Function(`return ${normalizedExpr}`)();

  if (typeof result !== 'number' || !isFinite(result)) {
    throw new Error('Invalid result');
  }

  return result;
}
```

### Supported Expressions

| Expression | Example | Evaluates To |
|------------|---------|--------------|
| Basic arithmetic | `50*50 - 3*3` | 2491 |
| Parentheses | `(50-3)*(50+3)` | 2491 |
| Power notation | `50^2 - 3^2` | 2491 |
| Unicode powers | `50² - 3²` | 2491 |
| Order of operations | `2 + 3 * 4` | 14 |

### Rejected Expressions

The validator rejects any expression containing:
- Letters (except in power notation)
- Function calls (`Math.sin`, `alert`, etc.)
- Variables or identifiers
- Non-arithmetic operators

---

## Validation Checks

### Check 1: Solution Has Steps

```typescript
if (!solution.steps || solution.steps.length === 0) {
  errors.push('Solution has no steps');
  return { valid: false, errors, warnings };
}
```

### Check 2: Final Answer Correct

```typescript
const directResult = num1 * num2;
const finalStep = solution.steps[solution.steps.length - 1];

if (finalStep.result !== directResult) {
  errors.push(
    `Final answer ${finalStep.result} does not match ` +
    `direct multiplication ${directResult}`
  );
}
```

### Check 3: Each Step Valid

```typescript
for (let i = 0; i < solution.steps.length; i++) {
  const step = solution.steps[i];
  const computed = evaluateExpression(step.expression);

  if (Math.abs(computed - step.result) > 0.001) {
    errors.push(
      `Step ${i + 1}: Expression "${step.expression}" evaluates to ` +
      `${computed} but claims result is ${step.result}`
    );
  }
}
```

### Check 4: Sub-Steps Valid

```typescript
for (const step of solution.steps) {
  if (step.subSteps) {
    for (const subStep of step.subSteps) {
      const subValidation = validateStep(subStep);
      if (!subValidation.valid) {
        errors.push(`Sub-step error: ${subValidation.errors.join(', ')}`);
      }
    }
  }
}
```

---

## Cross-Validation

When multiple methods apply to a problem, cross-validation confirms they produce identical results:

```typescript
static crossValidate(
  num1: number,
  num2: number,
  solutions: Solution[]
): boolean {
  if (solutions.length === 0) return false;

  const expectedAnswer = num1 * num2;

  return solutions.every(solution => {
    if (!solution.steps || solution.steps.length === 0) return false;
    const lastStep = solution.steps[solution.steps.length - 1];
    return lastStep.result === expectedAnswer;
  });
}
```

---

## Floating Point Considerations

### Tolerance for Comparison

JavaScript uses IEEE 754 floating point, which can introduce small errors:

```typescript
// Use tolerance for floating point comparison
if (Math.abs(computed - step.result) > 0.001) {
  // Error
}
```

### Integer Preservation

For this application, all calculations should produce integers:

```typescript
// Verify result is integer
if (!Number.isInteger(result)) {
  warnings.push('Non-integer result (possible floating point error)');
}
```

---

## Validation in Method Implementation

Every method must validate its output before returning:

```typescript
generateSolution(num1: number, num2: number): Solution {
  const steps = this.generateSolutionSteps(num1, num2);

  const solution: Solution = {
    method: this.name,
    steps,
    // ...
  };

  // ALWAYS validate
  const validation = SolutionValidator.validateSolution(num1, num2, solution);
  solution.validated = validation.valid;
  solution.validationErrors = validation.errors;

  // Throw if invalid - never return invalid solution
  if (!validation.valid) {
    throw new Error(
      `${this.displayName} generated invalid solution: ` +
      validation.errors.join('; ')
    );
  }

  return solution;
}
```

---

## Debugging Validation Failures

When validation fails, investigate systematically:

### 1. Identify the Failing Step

```typescript
const result = SolutionValidator.validateSolution(num1, num2, solution);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
  // Examine each error message for step number
}
```

### 2. Check Expression Parsing

```typescript
// Manually evaluate the expression
const step = solution.steps[failingIndex];
const computed = SolutionValidator.evaluateExpression(step.expression);
console.log(`Expression: ${step.expression}`);
console.log(`Computed: ${computed}`);
console.log(`Claimed: ${step.result}`);
```

### 3. Verify Mathematical Foundation

- Re-read the algebraic identity
- Hand-calculate the problem
- Compare step-by-step with the generated solution

### 4. Check for Edge Cases

- Negative numbers
- Large numbers (overflow?)
- Numbers that make the method inapplicable

---

## Test Coverage for Validation

Validation tests should cover:

1. **Correct solutions pass**
2. **Incorrect final answers fail**
3. **Invalid step expressions fail**
4. **Empty solutions fail**
5. **Expression injection is blocked**
6. **Cross-validation detects inconsistencies**

```typescript
describe('SolutionValidator', () => {
  it('validates correct solution', () => { /* ... */ });
  it('detects wrong final answer', () => { /* ... */ });
  it('detects invalid step', () => { /* ... */ });
  it('rejects empty solution', () => { /* ... */ });
  it('blocks malicious expressions', () => { /* ... */ });
  it('cross-validates multiple methods', () => { /* ... */ });
});
```

---

## References

- Validator implementation: `src/lib/core/validator.ts`
- Method implementations: `docs/implementation/phase-2-methods.md`
- Testing strategy: `docs/guides/testing-strategy.md`
