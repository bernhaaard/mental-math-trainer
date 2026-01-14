/**
 * Multiply by 111 Method
 * @module core/methods/multiply-by-111
 *
 * This method applies when multiplying any number by 111.
 *
 * Formula: n x 111 = n x 100 + n x 10 + n
 *
 * For single digits, this creates a "repdigit" (repeating digit):
 * Example: 5 x 111 = 555
 *
 * For larger numbers, we break it down:
 * Example: 23 x 111 = 2300 + 230 + 23 = 2553
 *
 * Cognitive Cost: ~2.0 (must handle carries for n > 9)
 */

import { BaseMethod } from './base-method';
import { MethodName, type Solution, type CalculationStep, type StudyContent } from '../../types';
import { SolutionValidator } from '../validator';

/**
 * Multiply by 111 method.
 *
 * Optimal when one of the factors is exactly 111.
 */
export class MultiplyBy111Method extends BaseMethod {
  name = MethodName.MultiplyBy111;
  displayName = 'Multiply by 111';

  /**
   * Determines if this method is applicable.
   * Applicable when one of the numbers is exactly 111.
   */
  isApplicable(num1: number, num2: number): boolean {
    return Math.abs(num1) === 111 || Math.abs(num2) === 111;
  }

  /**
   * Compute cognitive cost for this method.
   * Cost depends on the size of the other number and whether carries are needed.
   */
  computeCost(num1: number, num2: number): number {
    const other = Math.abs(num1) === 111 ? Math.abs(num2) : Math.abs(num1);

    // For single digits (1-9), this is very simple - creates a repdigit
    if (other >= 1 && other <= 9) {
      return 1.0;
    }

    // For 2-digit numbers, carries are needed
    const digits = this.countDigits(other);

    // Base cost of 2.0 for 2+ digit numbers due to addition with carries
    // Add complexity for more digits
    return 2.0 + (digits - 2) * 0.5;
  }

  /**
   * Compute quality score.
   */
  qualityScore(num1: number, num2: number): number {
    if (!this.isApplicable(num1, num2)) {
      return 0;
    }

    const other = Math.abs(num1) === 111 ? Math.abs(num2) : Math.abs(num1);

    // Highest quality for single digits (creates elegant repdigit)
    if (other >= 1 && other <= 9) {
      return 0.98;
    }

    // High quality for 2-digit numbers
    if (other >= 10 && other < 100) {
      return 0.92;
    }

    // Good quality for larger numbers
    return 0.85;
  }

  /**
   * Generate step-by-step solution using the multiply-by-111 method.
   *
   * Steps:
   * 1. n x 100 = result1
   * 2. n x 10 = result2
   * 3. result1 + result2 = partial
   * 4. partial + n = final
   */
  generateSolution(num1: number, num2: number): Solution {
    const is111First = Math.abs(num1) === 111;
    const oneEleven = is111First ? num1 : num2;
    const other = is111First ? num2 : num1;

    const absOther = Math.abs(other);
    const abs111 = Math.abs(oneEleven);

    const sign = (num1 < 0 ? -1 : 1) * (num2 < 0 ? -1 : 1);
    const absResult = absOther * abs111;
    const finalResult = sign * absResult;

    const steps: CalculationStep[] = [];

    // For single digit numbers, explain the repdigit pattern
    if (absOther >= 1 && absOther <= 9) {
      steps.push({
        expression: `${num1} * ${num2}`,
        result: finalResult,
        explanation: `Single digit times 111 creates a "repdigit" (the digit repeated 3 times)`,
        depth: 0
      });

      steps.push({
        expression: `${absOther} * 111`,
        result: absResult,
        explanation: `${absOther} x 111 = ${absOther}${absOther}${absOther} (the digit ${absOther} repeated three times)`,
        depth: 0
      });
    } else {
      // For larger numbers, use the n x 100 + n x 10 + n approach
      steps.push({
        expression: `${num1} * ${num2}`,
        result: finalResult,
        explanation: `Multiplying by 111 = multiplying by 100 + 10 + 1 (since 111 = 100 + 10 + 1)`,
        depth: 0
      });

      // Step 1: n x 100
      const times100 = absOther * 100;
      steps.push({
        expression: `${absOther} * 100`,
        result: times100,
        explanation: `Multiply by 100: ${absOther} x 100 = ${times100}`,
        depth: 0
      });

      // Step 2: n x 10
      const times10 = absOther * 10;
      steps.push({
        expression: `${absOther} * 10`,
        result: times10,
        explanation: `Multiply by 10: ${absOther} x 10 = ${times10}`,
        depth: 0
      });

      // Step 3: Add times100 + times10
      const partial = times100 + times10;
      steps.push({
        expression: `${times100} + ${times10}`,
        result: partial,
        explanation: `Add the first two products: ${times100} + ${times10} = ${partial}`,
        depth: 0
      });

      // Step 4: Add partial + absOther
      steps.push({
        expression: `${partial} + ${absOther}`,
        result: absResult,
        explanation: `Add the original number: ${partial} + ${absOther} = ${absResult}`,
        depth: 0
      });
    }

    // Apply sign if negative
    if (sign < 0) {
      steps.push({
        expression: `-${absResult}`,
        result: finalResult,
        explanation: `Apply negative sign: -${absResult} = ${finalResult}`,
        depth: 0
      });
    }

    const solution: Solution = {
      method: this.name,
      optimalReason: absOther >= 1 && absOther <= 9
        ? `Single digit times 111 creates the elegant repdigit pattern`
        : `Multiplying by 111 uses n x 100 + n x 10 + n`,
      steps,
      alternatives: [],
      validated: false,
      validationErrors: []
    };

    const validation = SolutionValidator.validateSolution(num1, num2, solution);
    solution.validated = validation.valid;
    solution.validationErrors = validation.errors;

    if (!validation.valid) {
      throw new Error(`Generated invalid solution: ${validation.errors.join('; ')}`);
    }

    return solution;
  }

  /**
   * Generate educational study content.
   */
  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: `
Multiplying by 111 is a delightful mental math trick!

For single digits (1-9), the pattern is magical:
- 5 x 111 = 555
- 7 x 111 = 777
- 9 x 111 = 999

The digit simply repeats three times, creating what mathematicians call a "repdigit."

For larger numbers, we use the fact that 111 = 100 + 10 + 1:
n x 111 = n x 100 + n x 10 + n

Example: 23 x 111
- 23 x 100 = 2300
- 23 x 10 = 230
- 23 x 1 = 23
- 2300 + 230 + 23 = 2553
      `.trim(),
      mathematicalFoundation: `
### Algebraic Foundation

111 can be written as 100 + 10 + 1, which gives us the distributive property:

n x 111 = n x (100 + 10 + 1)
        = n x 100 + n x 10 + n x 1
        = 100n + 10n + n

### Single Digit Pattern (Repdigits)

For a single digit d (1-9):
d x 111 = d x 100 + d x 10 + d
        = 100d + 10d + d

This creates the number with d in hundreds, tens, and ones place: ddd

Example: 5 x 111 = 500 + 50 + 5 = 555

### Why 111 is Special

111 = 3 x 37

This is why 111/3 = 37 and 111/37 = 3.

Also: 111 = 1 + 10 + 100 = (10^3 - 1) / 9
      `.trim(),
      deepDiveContent: `
### Quick Reference Table

**Single Digits (Repdigits):**
| n | n x 111 |
|---|---------|
| 1 | 111 |
| 2 | 222 |
| 3 | 333 |
| 4 | 444 |
| 5 | 555 |
| 6 | 666 |
| 7 | 777 |
| 8 | 888 |
| 9 | 999 |

**Two-Digit Examples:**
| n | n x 100 | n x 10 | n | Total |
|---|---------|--------|---|-------|
| 12 | 1200 | 120 | 12 | 1332 |
| 23 | 2300 | 230 | 23 | 2553 |
| 45 | 4500 | 450 | 45 | 4995 |
| 99 | 9900 | 990 | 99 | 10989 |

### Mental Shortcut for Two-Digit Numbers

For a two-digit number ab (tens=a, ones=b):
ab x 111 produces a pattern where you:
1. Add digits progressively from right to left
2. Handle carries as needed

Example: 45 x 111 = 4995
- Think: 4|4+5|4+5|5 = 4|9|9|5 (with potential carries)
      `.trim(),
      whenToUse: [
        'When one of the factors is exactly 111',
        'For single digits - instant repdigit pattern',
        'For any number when you can easily compute n x 100, n x 10, and add'
      ],
      whenNotToUse: [
        'When neither factor is 111',
        'When the other number is very large (consider factorization instead)'
      ],
      commonMistakes: [
        'Forgetting to add all three components (n x 100 + n x 10 + n)',
        'Carry errors when adding the three products',
        'Confusing with multiply-by-11 (which has a different pattern)'
      ],
      practiceStrategies: [
        'Start with single digits to internalize the repdigit pattern',
        'Practice 2-digit numbers to build addition fluency',
        'Verify by checking: the result should be roughly n x 100 + some change'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Distributive],
      nextMethods: []
    };
  }
}
