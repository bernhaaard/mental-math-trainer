# Method Implementation Example

Reference implementation using the Distributive Property method as a template.

---

## Complete Method Implementation

```typescript
// src/lib/core/methods/distributive.ts

import { BaseMethod } from './base-method';
import type { MethodName, CalculationStep, StudyContent } from '@/lib/types';

/**
 * Distributive Property / Place Value Partition Method
 *
 * Uses the algebraic identity: a(b + c) = ab + ac
 * Partitions numbers by place value for simpler sub-multiplications.
 */
export class DistributiveMethod extends BaseMethod {
  name: MethodName = 'distributive';
  displayName = 'Distributive Property / Place Value Partition';

  /**
   * This method is always applicable - it's the universal fallback.
   */
  isApplicable(_num1: number, _num2: number): boolean {
    return true;
  }

  /**
   * Calculate computational cost.
   *
   * Cost factors:
   * - Number of sub-multiplications (digits1 × digits2)
   * - Digit complexity
   * - Memory chunks needed
   */
  computeCost(num1: number, num2: number): number {
    const digits1 = this.countDigits(num1);
    const digits2 = this.countDigits(num2);

    // Sub-multiplications needed
    const subMultiplications = digits1 * digits2;

    // Complexity based on digit count
    const digitComplexity = (digits1 + digits2) * 0.8;

    // Memory chunks (cap at 7 for cognitive limit)
    const memoryChunks = Math.min(digits1 * 2, 7);

    return subMultiplications + digitComplexity + (memoryChunks * 0.5);
  }

  /**
   * Quality score (0-1, higher is better).
   * Distributive is general-purpose, so average quality.
   */
  qualityScore(_num1: number, _num2: number): number {
    return 0.3;
  }

  /**
   * Explain why this method was chosen.
   */
  protected getOptimalReason(num1: number, num2: number): string {
    const absNum1 = Math.abs(num1);
    const tens = Math.floor(absNum1 / 10) * 10;
    const ones = absNum1 % 10;

    return `Distributive property partitions ${absNum1} into ${tens} + ${ones}, ` +
           `reducing the problem to simpler multiplications.`;
  }

  /**
   * Generate the step-by-step solution.
   */
  generateSolutionSteps(num1: number, num2: number): CalculationStep[] {
    const steps: CalculationStep[] = [];

    // Handle signs
    const sign1 = num1 < 0 ? -1 : 1;
    const sign2 = num2 < 0 ? -1 : 1;
    const resultSign = sign1 * sign2;

    const absNum1 = Math.abs(num1);
    const absNum2 = Math.abs(num2);

    // Partition by place value
    const ones = absNum1 % 10;
    const tens = Math.floor(absNum1 / 10) * 10;

    // Handle single-digit case
    if (tens === 0) {
      const result = resultSign * absNum1 * absNum2;
      steps.push({
        expression: `${num1} × ${num2}`,
        result,
        explanation: `Direct multiplication: ${num1} × ${num2} = ${result}`,
        depth: 0
      });
      return steps;
    }

    // Step 1: Show the partition
    steps.push({
      expression: `${num1} × ${num2} = (${tens} + ${ones}) × ${absNum2}`,
      result: num1 * num2,
      explanation: `Partition ${absNum1} by place value: ${tens} + ${ones}`,
      depth: 0
    });

    // Step 2: Apply distributive property
    const tensProduct = tens * absNum2;
    const onesProduct = ones * absNum2;

    steps.push({
      expression: `${tens} × ${absNum2} + ${ones} × ${absNum2}`,
      result: num1 * num2,
      explanation: 'Apply distributive property: a(b + c) = ab + ac',
      depth: 0,
      subSteps: [
        {
          expression: `${tens} × ${absNum2}`,
          result: tensProduct,
          explanation: this.explainTensMultiplication(tens, absNum2, tensProduct),
          depth: 1
        },
        {
          expression: `${ones} × ${absNum2}`,
          result: onesProduct,
          explanation: `Single digit: ${ones} × ${absNum2} = ${onesProduct}`,
          depth: 1
        }
      ]
    });

    // Step 3: Add partial products
    const finalResult = resultSign * (tensProduct + onesProduct);
    const signNote = resultSign < 0 ? ' (result is negative due to sign rules)' : '';

    steps.push({
      expression: `${tensProduct} + ${onesProduct}`,
      result: finalResult,
      explanation: `Add partial products: ${tensProduct} + ${onesProduct} = ${Math.abs(finalResult)}${signNote}`,
      depth: 0
    });

    return steps;
  }

  /**
   * Helper: Explain tens multiplication clearly
   */
  private explainTensMultiplication(tens: number, other: number, result: number): string {
    const tensDigit = tens / 10;
    const intermediate = tensDigit * other;
    return `${tensDigit} × ${other} = ${intermediate}, then append 0 → ${result}`;
  }

  /**
   * Generate study mode content for this method.
   */
  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: `
The distributive property is the foundational technique for mental math.
It states that multiplication distributes over addition: a(b + c) = ab + ac.

This property is not just a trick—it's one of the defining axioms of algebra.
Every mental math technique ultimately relies on this principle.
      `.trim(),

      mathematicalFoundation: `
In abstract algebra, the distributive property is one of the axioms that
define a ring structure. For integers (ℤ, +, ×), the distributive property
ensures that multiplication is a homomorphism with respect to addition.

Algebraically: ∀ a, b, c ∈ ℤ: a(b + c) = ab + ac

In base-10, any number n can be written as:
n = d₀·10⁰ + d₁·10¹ + d₂·10² + ...

This polynomial view shows why place-value partition works.
      `.trim(),

      deepDiveContent: `
### Ring Theory Foundation

The distributive property isn't an arbitrary rule—it's a structural
requirement for any ring. The integers (ℤ, +, ×) form a ring because:
1. (ℤ, +) is an abelian group
2. (ℤ, ×) is a monoid
3. Multiplication distributes over addition

### Base-10 Polynomial View

Any integer in base-10 can be viewed as a polynomial:
347 = 3(10²) + 4(10¹) + 7(10⁰)

When multiplying, you're multiplying polynomials:
347 × 53 = [3x² + 4x + 7] × [5x + 3] where x = 10

### Cognitive Alignment

We prefer place-value partition because it aligns with how our numeral
system represents numbers, making it cognitively natural.
      `.trim(),

      whenToUse: [
        'When no other method applies efficiently',
        'For numbers without special structure',
        'As a fallback for any multiplication',
        'To teach the fundamental principle behind all methods'
      ],

      examples: [],
      interactiveExercises: []
    };
  }
}
```

---

## Base Class

```typescript
// src/lib/core/methods/base-method.ts

import type { CalculationMethod, MethodName, Solution, StudyContent, CalculationStep } from '@/lib/types';
import { SolutionValidator } from '../validator';

export abstract class BaseMethod implements CalculationMethod {
  abstract name: MethodName;
  abstract displayName: string;

  abstract isApplicable(num1: number, num2: number): boolean;
  abstract computeCost(num1: number, num2: number): number;
  abstract qualityScore(num1: number, num2: number): number;
  abstract generateSolutionSteps(num1: number, num2: number): CalculationStep[];
  abstract generateStudyContent(): StudyContent;

  protected abstract getOptimalReason(num1: number, num2: number): string;

  /**
   * Generate and validate solution.
   * This is the public API - methods implement generateSolutionSteps instead.
   */
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

    // Always validate
    const validation = SolutionValidator.validateSolution(num1, num2, solution);
    solution.validated = validation.valid;
    solution.validationErrors = validation.errors;

    if (!validation.valid) {
      throw new Error(
        `${this.displayName} generated invalid solution for ${num1} × ${num2}: ` +
        validation.errors.join('; ')
      );
    }

    return solution;
  }

  // Utility methods

  protected countDigits(n: number): number {
    return Math.abs(n).toString().length;
  }

  protected isNear(num: number, target: number, threshold: number): boolean {
    return Math.abs(num - target) <= threshold;
  }

  protected nearestPowerOf10(n: number): number {
    if (n <= 0) return 10;
    const power = Math.round(Math.log10(n));
    return Math.pow(10, power);
  }

  protected getSmallFactors(n: number): number[] {
    const factors: number[] = [];
    const absN = Math.abs(n);
    for (const f of [2, 3, 4, 5, 6, 8, 9, 10]) {
      if (absN % f === 0) factors.push(f);
    }
    return factors;
  }
}
```

---

## Test Suite for the Method

```typescript
// src/tests/unit/methods/distributive.test.ts

import { describe, it, expect } from 'vitest';
import { DistributiveMethod } from '@/lib/core/methods/distributive';

describe('DistributiveMethod', () => {
  const method = new DistributiveMethod();

  describe('isApplicable', () => {
    it('is always applicable', () => {
      expect(method.isApplicable(47, 53)).toBe(true);
      expect(method.isApplicable(1, 1)).toBe(true);
      expect(method.isApplicable(999999, 999999)).toBe(true);
      expect(method.isApplicable(-47, 53)).toBe(true);
    });
  });

  describe('generateSolution', () => {
    it('correctly solves 47 × 53 = 2491', () => {
      const solution = method.generateSolution(47, 53);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps.slice(-1)[0].result;
      expect(finalResult).toBe(2491);
    });

    it('correctly solves 23 × 87 = 2001', () => {
      const solution = method.generateSolution(23, 87);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps.slice(-1)[0].result;
      expect(finalResult).toBe(2001);
    });

    it('handles negative × positive correctly', () => {
      const solution = method.generateSolution(-47, 53);

      expect(solution.validated).toBe(true);
      expect(solution.steps.slice(-1)[0].result).toBe(-2491);
    });

    it('handles negative × negative correctly', () => {
      const solution = method.generateSolution(-47, -53);

      expect(solution.validated).toBe(true);
      expect(solution.steps.slice(-1)[0].result).toBe(2491);
    });

    it('handles single digit numbers', () => {
      const solution = method.generateSolution(7, 8);

      expect(solution.validated).toBe(true);
      expect(solution.steps.slice(-1)[0].result).toBe(56);
    });

    it('includes sub-steps for intermediate calculations', () => {
      const solution = method.generateSolution(47, 53);

      const stepWithSubs = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);
      expect(stepWithSubs).toBeDefined();
      expect(stepWithSubs!.subSteps!.length).toBeGreaterThan(0);
    });

    it('has proper step structure', () => {
      const solution = method.generateSolution(47, 53);

      expect(solution.steps.length).toBeGreaterThan(1);

      solution.steps.forEach(step => {
        expect(step.expression).toBeTruthy();
        expect(step.explanation).toBeTruthy();
        expect(typeof step.result).toBe('number');
        expect(typeof step.depth).toBe('number');
      });
    });
  });

  describe('computeCost', () => {
    it('returns higher cost for larger numbers', () => {
      const cost1 = method.computeCost(12, 23);
      const cost2 = method.computeCost(123, 456);
      const cost3 = method.computeCost(1234, 5678);

      expect(cost2).toBeGreaterThan(cost1);
      expect(cost3).toBeGreaterThan(cost2);
    });
  });

  describe('known solutions', () => {
    const knownSolutions = [
      { num1: 12, num2: 13, answer: 156 },
      { num1: 23, num2: 45, answer: 1035 },
      { num1: 47, num2: 53, answer: 2491 },
      { num1: 78, num2: 92, answer: 7176 },
      { num1: 123, num2: 456, answer: 56088 }
    ];

    knownSolutions.forEach(({ num1, num2, answer }) => {
      it(`correctly solves ${num1} × ${num2} = ${answer}`, () => {
        const solution = method.generateSolution(num1, num2);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);
        expect(solution.steps.slice(-1)[0].result).toBe(answer);
      });
    });
  });
});
```

---

## Implementation Checklist

When implementing a new method:

- [ ] Extend `BaseMethod`
- [ ] Implement all abstract methods
- [ ] Add comprehensive tests
- [ ] Test edge cases (negatives, single digits, large numbers)
- [ ] Ensure validation passes 100%
- [ ] Add to method selector
- [ ] Add study content
