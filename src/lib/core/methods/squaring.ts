/**
 * Squaring Method - Special case when multiplying a number by itself
 * @module core/methods/squaring
 *
 * Uses the identity (a ± b)² = a² ± 2ab + b²
 *
 * Example: 47² = (50 - 3)² = 2500 - 300 + 9 = 2209
 * Example: 73² = (70 + 3)² = 4900 + 420 + 9 = 5329
 */

import { BaseMethod } from './base-method';
import { MethodName, type Solution, type CalculationStep, type StudyContent } from '../../types';
import { SolutionValidator } from '../validator';

/**
 * Squaring calculation method.
 *
 * Optimized for when both multiplicands are the same number.
 * Uses algebraic identities to simplify mental calculation.
 */
export class SquaringMethod extends BaseMethod {
  name = MethodName.Squaring;
  displayName = 'Squaring';

  /**
   * Determines if this method is applicable.
   * Only applies when both numbers are identical.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns true if num1 equals num2
   */
  isApplicable(num1: number, num2: number): boolean {
    return num1 === num2;
  }

  /**
   * Compute cognitive cost for squaring.
   * Cost depends on distance from nearest round number.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand (must equal num1)
   * @returns Cost score (lower is better)
   */
  computeCost(num1: number, num2: number): number {
    if (num1 !== num2) return Infinity;

    const n = Math.abs(num1);
    const nearestTen = Math.round(n / 10) * 10;
    const diff = Math.abs(n - nearestTen);

    // Lower cost for numbers close to round numbers
    return diff * 0.5 + this.countDigits(n);
  }

  /**
   * Compute quality score for squaring.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand (must equal num1)
   * @returns Quality score from 0-1 (higher is better)
   */
  qualityScore(num1: number, num2: number): number {
    if (num1 !== num2) return 0;

    const n = Math.abs(num1);
    const nearestTen = Math.round(n / 10) * 10;
    const diff = Math.abs(n - nearestTen);

    // High quality for numbers near round values
    if (diff <= 3) return 0.9;
    if (diff <= 5) return 0.8;
    return 0.7;
  }

  /**
   * Generate step-by-step solution for squaring.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand (must equal num1)
   * @returns Complete validated solution
   */
  generateSolution(num1: number, num2: number): Solution {
    if (num1 !== num2) {
      throw new Error('Squaring method requires num1 === num2');
    }

    const n = Math.abs(num1);
    const finalResult = num1 * num2;
    const steps: CalculationStep[] = [];

    // Find best representation: (a ± b)²
    const nearestTen = Math.round(n / 10) * 10;
    const diff = n - nearestTen;
    const a = nearestTen;
    const b = Math.abs(diff);
    const useAdditive = diff >= 0;

    // Step 1: Recognize squaring opportunity
    steps.push({
      expression: `${num1} * ${num2}`,
      result: finalResult,
      explanation: `Recognize this is ${n}² (squaring)`,
      depth: 0
    });

    // Step 2: Rewrite using (a ± b)²
    if (useAdditive) {
      steps.push({
        expression: `(${a} + ${b}) * (${a} + ${b})`,
        result: finalResult,
        explanation: `Rewrite ${n} as ${a} + ${b}`,
        depth: 0
      });
    } else {
      steps.push({
        expression: `(${a} - ${b}) * (${a} - ${b})`,
        result: finalResult,
        explanation: `Rewrite ${n} as ${a} - ${b}`,
        depth: 0
      });
    }

    // Step 3: Apply the algebraic identity
    const aSquared = a * a;
    const twoAB = 2 * a * b;
    const bSquared = b * b;

    if (useAdditive) {
      steps.push({
        expression: `${a} * ${a} + 2 * ${a} * ${b} + ${b} * ${b}`,
        result: finalResult,
        explanation: `Apply (a + b)² = a² + 2ab + b²`,
        depth: 0,
        subSteps: [
          {
            expression: `${a} * ${a}`,
            result: aSquared,
            explanation: `${a}² = ${aSquared}`,
            depth: 1
          },
          {
            expression: `2 * ${a} * ${b}`,
            result: twoAB,
            explanation: `2 * ${a} * ${b} = ${twoAB}`,
            depth: 1
          },
          {
            expression: `${b} * ${b}`,
            result: bSquared,
            explanation: `${b}² = ${bSquared}`,
            depth: 1
          }
        ]
      });

      // Step 4: Sum the components
      steps.push({
        expression: `${aSquared} + ${twoAB} + ${bSquared}`,
        result: finalResult,
        explanation: `Add: ${aSquared} + ${twoAB} + ${bSquared} = ${finalResult}`,
        depth: 0
      });
    } else {
      steps.push({
        expression: `${a} * ${a} - 2 * ${a} * ${b} + ${b} * ${b}`,
        result: finalResult,
        explanation: `Apply (a - b)² = a² - 2ab + b²`,
        depth: 0,
        subSteps: [
          {
            expression: `${a} * ${a}`,
            result: aSquared,
            explanation: `${a}² = ${aSquared}`,
            depth: 1
          },
          {
            expression: `2 * ${a} * ${b}`,
            result: twoAB,
            explanation: `2 * ${a} * ${b} = ${twoAB}`,
            depth: 1
          },
          {
            expression: `${b} * ${b}`,
            result: bSquared,
            explanation: `${b}² = ${bSquared}`,
            depth: 1
          }
        ]
      });

      // Step 4: Calculate result
      steps.push({
        expression: `${aSquared} - ${twoAB} + ${bSquared}`,
        result: finalResult,
        explanation: `Calculate: ${aSquared} - ${twoAB} + ${bSquared} = ${finalResult}`,
        depth: 0
      });
    }

    const solution: Solution = {
      method: this.name,
      optimalReason: `${n}² can be computed using (${a} ${useAdditive ? '+' : '-'} ${b})² formula`,
      steps,
      alternatives: [],
      validated: false,
      validationErrors: []
    };

    // Validate the solution
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
   *
   * @returns Complete study content
   */
  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: `
The Squaring method applies when you're multiplying a number by itself.
Using the algebraic identity (a +/- b)^2 = a^2 +/- 2ab + b^2, we can break
any square into simpler components.

Example: 47^2
- Write 47 as (50 - 3)
- Apply: (50 - 3)^2 = 50^2 - 2(50)(3) + 3^2
- Calculate: 2500 - 300 + 9 = 2209

The key insight: 50^2 is trivial (2500), 2 x 50 x 3 = 300 is easy,
and 3^2 = 9 you should have memorized. Three simple operations instead
of one complex multiplication.
      `.trim(),
      mathematicalFoundation: `
The key identities are:

(a + b)^2 = a^2 + 2ab + b^2
(a - b)^2 = a^2 - 2ab + b^2

### Proof by Expansion

(a + b)^2 = (a + b)(a + b)
          = a(a + b) + b(a + b)
          = a^2 + ab + ab + b^2
          = a^2 + 2ab + b^2

(a - b)^2 = (a - b)(a - b)
          = a(a - b) - b(a - b)
          = a^2 - ab - ab + b^2
          = a^2 - 2ab + b^2

### Strategic Decomposition

By choosing 'a' to be a round number (like 50, 100):
- a^2 becomes trivial: 50^2 = 2500, 100^2 = 10000
- 2ab is easy because 'a' has trailing zeros: 2 x 50 x 3 = 300
- b^2 is small if b is the distance from the round number

### The Three Terms

For n = a + b where a is round:
1. a^2: Just square the round number (instant)
2. 2ab: Double a, multiply by b, or equivalently, double b, multiply by a
3. b^2: Small square, should be memorized
      `.trim(),
      deepDiveContent: `
### Choosing a and b

The goal is to express your number n as a +/- b where:
- a is a "nice" number to square (multiple of 10)
- b is as small as possible (ideally 1-5)

### Examples

- 47 = 50 - 3 (use subtractive form)
- 52 = 50 + 2 (use additive form)
- 73 = 70 + 3 (use additive form)
- 98 = 100 - 2 (use subtractive form)
- 106 = 100 + 6 (use additive form)

### Memorize These Squares

Essential squares for quick calculation:

**Small squares (1-10):**
1^2 = 1, 2^2 = 4, 3^2 = 9, 4^2 = 16, 5^2 = 25
6^2 = 36, 7^2 = 49, 8^2 = 64, 9^2 = 81, 10^2 = 100

**Multiples of 5:**
5^2 = 25, 15^2 = 225, 25^2 = 625, 35^2 = 1225
45^2 = 2025, 55^2 = 3025, 65^2 = 4225, 75^2 = 5625

**Multiples of 10:**
10^2 = 100, 20^2 = 400, 30^2 = 900, 40^2 = 1600
50^2 = 2500, 60^2 = 3600, 70^2 = 4900, 80^2 = 6400
90^2 = 8100, 100^2 = 10000

### Pattern for Squaring Numbers Ending in 5

For any number ending in 5 (like 35, 65, 85):
- Take the tens digit (call it t)
- Multiply t by (t+1)
- Append 25

Example: 35^2
- t = 3
- 3 x 4 = 12
- Answer: 1225

Example: 85^2
- t = 8
- 8 x 9 = 72
- Answer: 7225

### Connection to Difference of Squares

Squaring is related to difference of squares. If you need to square
a number like 47, you could also compute 50 x 44 + 9 = 2200 + 9 = 2209
using difference of squares plus adjustment.

Both methods rely on algebraic identities—choose whichever feels natural.
      `.trim(),
      whenToUse: [
        'When multiplying a number by itself (n x n)',
        'When the number is close to a round value (within 5 of a multiple of 10)',
        'For numbers ending in 5 (use the special pattern)',
        'When you have memorized squares 1-10 and key multiples of 5 and 10',
        'For quick estimation (just compute a^2 and ignore the small correction)'
      ],
      whenNotToUse: [
        'When multiplying two different numbers (use other methods)',
        'When the number is not close to any convenient round number',
        'When you have not yet memorized small squares (practice those first)',
        'When another method is more direct for specific cases'
      ],
      commonMistakes: [
        'Forgetting the 2 in the 2ab term (computing ab instead of 2ab)',
        'Getting the sign wrong in the 2ab term (minus for subtractive, plus for additive)',
        'Forgetting that b^2 is always ADDED (even in the subtractive form: a^2 - 2ab + b^2)',
        'Not memorizing small squares, leading to errors in the b^2 term',
        'Choosing an inconvenient round number (pick the nearest multiple of 10)',
        'Arithmetic errors when combining the three terms—calculate carefully'
      ],
      practiceStrategies: [
        'Memorize squares 1-10 until they are instant (flash card drill)',
        'Memorize squares of multiples of 10 up to 100 (100, 400, 900, 1600, ...)',
        'Practice the "ends in 5" pattern until it is automatic',
        'Start with numbers near 50 (47, 48, 52, 53) where 50^2 = 2500 is the base',
        'Work through examples step by step before trying to do them mentally',
        'Build speed gradually: first accuracy, then speed'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Distributive, MethodName.DifferenceSquares],
      nextMethods: []
    };
  }
}
