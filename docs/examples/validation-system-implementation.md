# Validation System Implementation Example

Complete reference implementation for the SolutionValidator class.

---

## Full Implementation

```typescript
// src/lib/core/validator.ts

import type { Solution, ValidationResult, CalculationStep } from '@/lib/types';

/**
 * Validates that solutions are mathematically correct.
 * This is the cornerstone of the entire application.
 */
export class SolutionValidator {
  /**
   * Primary validation: Checks if solution produces correct answer
   */
  static validateSolution(
    num1: number,
    num2: number,
    solution: Solution
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check 1: Solution has steps
    if (!solution.steps || solution.steps.length === 0) {
      errors.push('Solution has no steps');
      return { valid: false, errors, warnings };
    }

    // Check 2: Final answer matches direct multiplication
    const directResult = num1 * num2;
    const finalStep = solution.steps[solution.steps.length - 1];

    if (finalStep.result !== directResult) {
      errors.push(
        `Final answer ${finalStep.result} does not match ` +
        `direct multiplication ${directResult}`
      );
    }

    // Check 3: Every step is mathematically valid
    for (let i = 0; i < solution.steps.length; i++) {
      const step = solution.steps[i];
      const stepValidation = this.validateStep(step);
      if (!stepValidation.valid) {
        errors.push(`Step ${i + 1}: ${stepValidation.errors.join(', ')}`);
      }
      warnings.push(...stepValidation.warnings.map(w => `Step ${i + 1}: ${w}`));
    }

    // Check 4: Validate sub-steps recursively
    for (const step of solution.steps) {
      if (step.subSteps) {
        for (let j = 0; j < step.subSteps.length; j++) {
          const subStep = step.subSteps[j];
          const subValidation = this.validateStep(subStep);
          if (!subValidation.valid) {
            errors.push(`Sub-step ${j + 1}: ${subValidation.errors.join(', ')}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates a single calculation step
   */
  static validateStep(step: CalculationStep): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const computed = this.evaluateExpression(step.expression);

      // Use floating point tolerance for comparison
      if (Math.abs(computed - step.result) > 0.001) {
        errors.push(
          `Expression "${step.expression}" evaluates to ${computed} ` +
          `but step claims result is ${step.result}`
        );
      }
    } catch (error) {
      errors.push(
        `Failed to evaluate expression "${step.expression}": ` +
        `${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    if (!step.explanation || step.explanation.trim().length === 0) {
      warnings.push('Step has no explanation');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Safely evaluates a mathematical expression.
   * SECURITY: Only allows arithmetic operations.
   */
  static evaluateExpression(expr: string): number {
    // Remove whitespace
    const cleanExpr = expr.replace(/\s+/g, '');

    // Security: Validate expression contains only safe characters
    if (!/^[0-9+\-*/().^²³]+$/.test(cleanExpr)) {
      throw new Error('Expression contains invalid characters');
    }

    // Handle power notation
    const normalizedExpr = cleanExpr
      .replace(/\^/g, '**')
      .replace(/²/g, '**2')
      .replace(/³/g, '**3');

    try {
      // Function constructor creates isolated scope
      const result = new Function(`return ${normalizedExpr}`)() as unknown;

      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result');
      }

      return result;
    } catch {
      throw new Error(`Failed to evaluate: ${expr}`);
    }
  }

  /**
   * Cross-validates that multiple methods produce same answer
   */
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
}
```

---

## Complete Test Suite

```typescript
// src/tests/unit/validation/validator.test.ts

import { describe, it, expect } from 'vitest';
import { SolutionValidator } from '@/lib/core/validator';
import type { Solution, CalculationStep, MethodName } from '@/lib/types';

// Helper to create mock solutions
function createSolution(steps: Partial<CalculationStep>[]): Solution {
  return {
    method: 'distributive' as MethodName,
    optimalReason: 'Test solution',
    steps: steps.map((s, i) => ({
      expression: s.expression ?? `step${i}`,
      result: s.result ?? 0,
      explanation: s.explanation ?? 'Test step',
      depth: s.depth ?? 0,
      subSteps: s.subSteps
    })),
    alternatives: [],
    validated: false,
    validationErrors: []
  };
}

describe('SolutionValidator', () => {
  describe('validateSolution', () => {
    describe('valid solutions', () => {
      it('validates correct difference of squares solution', () => {
        const solution = createSolution([
          { expression: '(50-3)*(50+3)', result: 2491, explanation: 'Apply identity' },
          { expression: '50*50-3*3', result: 2491, explanation: 'Expand' },
          { expression: '2500-9', result: 2491, explanation: 'Calculate' }
        ]);

        const result = SolutionValidator.validateSolution(47, 53, solution);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('validates correct distributive solution', () => {
        const solution = createSolution([
          { expression: '(40+7)*53', result: 2491, explanation: 'Partition' },
          { expression: '40*53+7*53', result: 2491, explanation: 'Distribute' },
          { expression: '2120+371', result: 2491, explanation: 'Add' }
        ]);

        const result = SolutionValidator.validateSolution(47, 53, solution);
        expect(result.valid).toBe(true);
      });

      it('validates solution with sub-steps', () => {
        const solution = createSolution([
          {
            expression: '40*53+7*53',
            result: 2491,
            explanation: 'Distribute',
            subSteps: [
              { expression: '40*53', result: 2120, explanation: 'First part', depth: 1 },
              { expression: '7*53', result: 371, explanation: 'Second part', depth: 1 }
            ]
          }
        ]);

        const result = SolutionValidator.validateSolution(47, 53, solution);
        expect(result.valid).toBe(true);
      });
    });

    describe('invalid solutions', () => {
      it('rejects solution with wrong final answer', () => {
        const solution = createSolution([
          { expression: '47*53', result: 2500, explanation: 'Wrong!' }
        ]);

        const result = SolutionValidator.validateSolution(47, 53, solution);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.stringContaining('does not match')
        );
      });

      it('rejects solution with invalid step', () => {
        const solution = createSolution([
          { expression: '2+2', result: 5, explanation: 'Wrong math' },
          { expression: '47*53', result: 2491, explanation: 'Final' }
        ]);

        const result = SolutionValidator.validateSolution(47, 53, solution);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('Step 1'))).toBe(true);
      });

      it('rejects empty solution', () => {
        const solution = createSolution([]);

        const result = SolutionValidator.validateSolution(47, 53, solution);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('no steps');
      });

      it('rejects solution with invalid sub-step', () => {
        const solution = createSolution([
          {
            expression: '2120+371',
            result: 2491,
            explanation: 'Add',
            subSteps: [
              { expression: '40*53', result: 9999, explanation: 'Wrong!', depth: 1 }
            ]
          }
        ]);

        const result = SolutionValidator.validateSolution(47, 53, solution);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('Sub-step'))).toBe(true);
      });
    });

    describe('warnings', () => {
      it('warns about missing explanations', () => {
        const solution = createSolution([
          { expression: '47*53', result: 2491, explanation: '' }
        ]);

        const result = SolutionValidator.validateSolution(47, 53, solution);
        expect(result.valid).toBe(true);
        expect(result.warnings.some(w => w.includes('no explanation'))).toBe(true);
      });
    });
  });

  describe('evaluateExpression', () => {
    describe('basic operations', () => {
      it('evaluates addition', () => {
        expect(SolutionValidator.evaluateExpression('2+3')).toBe(5);
        expect(SolutionValidator.evaluateExpression('100+200')).toBe(300);
      });

      it('evaluates subtraction', () => {
        expect(SolutionValidator.evaluateExpression('10-3')).toBe(7);
        expect(SolutionValidator.evaluateExpression('2500-9')).toBe(2491);
      });

      it('evaluates multiplication', () => {
        expect(SolutionValidator.evaluateExpression('7*8')).toBe(56);
        expect(SolutionValidator.evaluateExpression('47*53')).toBe(2491);
      });

      it('evaluates division', () => {
        expect(SolutionValidator.evaluateExpression('20/4')).toBe(5);
        expect(SolutionValidator.evaluateExpression('100/5')).toBe(20);
      });
    });

    describe('complex expressions', () => {
      it('handles parentheses', () => {
        expect(SolutionValidator.evaluateExpression('(50-3)*(50+3)')).toBe(2491);
        expect(SolutionValidator.evaluateExpression('(2+3)*4')).toBe(20);
        expect(SolutionValidator.evaluateExpression('2+(3*4)')).toBe(14);
      });

      it('respects order of operations', () => {
        expect(SolutionValidator.evaluateExpression('2+3*4')).toBe(14);
        expect(SolutionValidator.evaluateExpression('50*50-3*3')).toBe(2491);
      });

      it('handles power notation with ^', () => {
        expect(SolutionValidator.evaluateExpression('5^2')).toBe(25);
        expect(SolutionValidator.evaluateExpression('2^10')).toBe(1024);
      });

      it('handles unicode power notation', () => {
        expect(SolutionValidator.evaluateExpression('5²')).toBe(25);
        expect(SolutionValidator.evaluateExpression('2³')).toBe(8);
      });

      it('handles whitespace', () => {
        expect(SolutionValidator.evaluateExpression('50 * 50 - 3 * 3')).toBe(2491);
        expect(SolutionValidator.evaluateExpression('  47  *  53  ')).toBe(2491);
      });
    });

    describe('security', () => {
      it('rejects expressions with letters', () => {
        expect(() => SolutionValidator.evaluateExpression('alert(1)')).toThrow();
        expect(() => SolutionValidator.evaluateExpression('Math.random()')).toThrow();
        expect(() => SolutionValidator.evaluateExpression('process.exit()')).toThrow();
      });

      it('rejects expressions with special characters', () => {
        expect(() => SolutionValidator.evaluateExpression('1;2')).toThrow();
        expect(() => SolutionValidator.evaluateExpression('1,2')).toThrow();
        expect(() => SolutionValidator.evaluateExpression('`1`')).toThrow();
      });
    });
  });

  describe('crossValidate', () => {
    it('returns true when all solutions match', () => {
      const solutions = [
        createSolution([{ expression: '47*53', result: 2491, explanation: '' }]),
        createSolution([{ expression: '50^2-3^2', result: 2491, explanation: '' }])
      ];

      expect(SolutionValidator.crossValidate(47, 53, solutions)).toBe(true);
    });

    it('returns false when solutions disagree', () => {
      const solutions = [
        createSolution([{ expression: '47*53', result: 2491, explanation: '' }]),
        createSolution([{ expression: 'wrong', result: 9999, explanation: '' }])
      ];

      expect(SolutionValidator.crossValidate(47, 53, solutions)).toBe(false);
    });

    it('returns false for empty array', () => {
      expect(SolutionValidator.crossValidate(47, 53, [])).toBe(false);
    });

    it('returns false for solution with no steps', () => {
      const solutions = [createSolution([])];
      expect(SolutionValidator.crossValidate(47, 53, solutions)).toBe(false);
    });
  });
});
```

---

## Usage Pattern

```typescript
// In method implementation
class SomeMethod extends BaseMethod {
  generateSolution(num1: number, num2: number): Solution {
    const steps = this.generateSolutionSteps(num1, num2);

    const solution: Solution = {
      method: this.name,
      optimalReason: this.getOptimalReason(num1, num2),
      steps,
      alternatives: [],
      validated: false,
      validationErrors: []
    };

    // ALWAYS validate
    const validation = SolutionValidator.validateSolution(num1, num2, solution);
    solution.validated = validation.valid;
    solution.validationErrors = validation.errors;

    if (!validation.valid) {
      // Never return invalid solution
      throw new Error(`Invalid solution: ${validation.errors.join('; ')}`);
    }

    return solution;
  }
}
```
