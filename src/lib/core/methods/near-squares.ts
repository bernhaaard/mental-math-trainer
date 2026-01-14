/**
 * Near Squares calculation method.
 * @module core/methods/near-squares
 *
 * Implements the formula: n x (n + k) = n^2 + k * n
 *
 * This method leverages known squares to simplify multiplication when
 * one number is close to another. By recognizing that the product can
 * be expressed as the square of the smaller number plus an adjustment,
 * we reduce the problem to squaring and simple multiplication.
 *
 * Example: 12 x 14 = 12^2 + 2*12 = 144 + 24 = 168
 * Example: 25 x 27 = 25^2 + 2*25 = 625 + 50 = 675
 * Example: 50 x 53 = 50^2 + 3*50 = 2500 + 150 = 2650
 */

import { BaseMethod } from './base-method';
import { MethodName, type Solution, type CalculationStep, type StudyContent } from '../../types';
import { SolutionValidator } from '../validator';

/**
 * Known "nice" squares that are easy to recall.
 * These are squares that end in 0, 25, or are from small numbers (1-20).
 */
const NICE_SQUARES: Set<number> = new Set([
  // 1-20 squares
  1, 4, 9, 16, 25, 36, 49, 64, 81, 100,
  121, 144, 169, 196, 225, 256, 289, 324, 361, 400,
  // Multiples of 5 squares
  625, 900, 1225, 1600, 2025, 2500, 3025, 3600, 4225, 4900,
  5625, 6400, 7225, 8100, 9025, 10000
]);

/**
 * Near Squares method implementation.
 *
 * Uses the algebraic identity n x (n + k) = n^2 + k*n where:
 * - n is the smaller of the two numbers
 * - k is the difference between the two numbers
 */
export class NearSquaresMethod extends BaseMethod {
  name = MethodName.NearSquares;
  displayName = 'Near Squares';

  /**
   * Maximum difference k for which this method is applicable.
   * Beyond this, the method becomes less efficient than alternatives.
   */
  private readonly MAX_DIFFERENCE = 5;

  /**
   * Determines if this method is applicable.
   *
   * Applicable when:
   * 1. Numbers are different (not squaring)
   * 2. Difference between numbers is small (k <= MAX_DIFFERENCE)
   * 3. Both numbers are positive
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns true if method can be applied
   */
  isApplicable(num1: number, num2: number): boolean {
    // Skip negative numbers for simplicity
    if (num1 <= 0 || num2 <= 0) {
      return false;
    }

    // Skip if same number (use Squaring method instead)
    if (num1 === num2) {
      return false;
    }

    // Calculate difference
    const k = Math.abs(num1 - num2);

    // Only applicable if difference is small
    return k <= this.MAX_DIFFERENCE;
  }

  /**
   * Computes the cognitive cost of using this method.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Cognitive cost score (lower is better)
   */
  computeCost(num1: number, num2: number): number {
    const n = Math.min(num1, num2);
    const k = Math.abs(num1 - num2);
    const nSquared = n * n;

    // Base cost
    let cost = 3.0;

    // Lower cost if n^2 is a "nice" square
    if (NICE_SQUARES.has(nSquared)) {
      cost -= 1.0;
    } else if (n % 10 === 0) {
      // Multiples of 10 are easy to square
      cost -= 0.8;
    } else if (n % 5 === 0) {
      // Multiples of 5 are fairly easy
      cost -= 0.5;
    } else if (n <= 20) {
      // Small numbers have well-known squares
      cost -= 0.3;
    }

    // Cost increases with k
    cost += k * 0.3;

    // Cost increases with digit count
    cost += this.countDigits(n) * 0.2;

    return cost;
  }

  /**
   * Computes quality score for how well suited this method is.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Quality score from 0-1 (higher is better)
   */
  qualityScore(num1: number, num2: number): number {
    const n = Math.min(num1, num2);
    const k = Math.abs(num1 - num2);
    const nSquared = n * n;

    // Perfect for nice squares with small k
    if (NICE_SQUARES.has(nSquared) && k <= 2) {
      return 0.9;
    }

    // Very good for multiples of 10 or 5
    if ((n % 10 === 0 || n % 5 === 0) && k <= 3) {
      return 0.85;
    }

    // Good for small numbers with small k
    if (n <= 20 && k <= 2) {
      return 0.75;
    }

    // Decent for other cases
    if (k <= 3) {
      return 0.6;
    }

    return 0.5;
  }

  /**
   * Generates a step-by-step solution using near squares.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Complete validated solution
   *
   * @throws Error if solution fails validation
   */
  generateSolution(num1: number, num2: number): Solution {
    const n = Math.min(num1, num2);
    const larger = Math.max(num1, num2);
    const k = larger - n;
    const nSquared = n * n;
    const kTimesN = k * n;
    const finalResult = num1 * num2;

    const steps: CalculationStep[] = [];

    // Step 1: Recognize the pattern
    steps.push({
      expression: `${num1} * ${num2}`,
      result: finalResult,
      explanation: `Recognize that ${larger} = ${n} + ${k}, so we can use the identity n(n+k) = n^2 + k*n`,
      depth: 0
    });

    // Step 2: Rewrite using the identity
    steps.push({
      expression: `${n} * (${n} + ${k})`,
      result: finalResult,
      explanation: `Rewrite as ${n} x (${n} + ${k}) to apply the near-squares formula`,
      depth: 0
    });

    // Step 3: Apply the algebraic identity
    steps.push({
      expression: `${n} * ${n} + ${k} * ${n}`,
      result: finalResult,
      explanation: `Apply the identity: n(n+k) = n^2 + k*n`,
      depth: 0,
      subSteps: [
        {
          expression: `${n} * ${n}`,
          result: nSquared,
          explanation: this.getSquareExplanation(n),
          depth: 1
        },
        {
          expression: `${k} * ${n}`,
          result: kTimesN,
          explanation: `Calculate ${k} x ${n} = ${kTimesN}`,
          depth: 1
        }
      ]
    });

    // Step 4: Final addition
    steps.push({
      expression: `${nSquared} + ${kTimesN}`,
      result: finalResult,
      explanation: `Add: ${nSquared} + ${kTimesN} = ${finalResult}`,
      depth: 0
    });

    const solution: Solution = {
      method: this.name,
      optimalReason: `${num1} and ${num2} are only ${k} apart, so we can express ${larger} as ${n} + ${k} and use the near-squares formula. ${this.getSquareExplanation(n)}`,
      steps,
      alternatives: [],
      validated: false,
      validationErrors: []
    };

    // Validate the solution before returning
    const validation = SolutionValidator.validateSolution(num1, num2, solution);
    solution.validated = validation.valid;
    solution.validationErrors = validation.errors;

    if (!validation.valid) {
      console.error('Generated invalid solution:', validation.errors);
      throw new Error(`Failed to generate valid solution: ${validation.errors.join('; ')}`);
    }

    return solution;
  }

  /**
   * Gets an explanation for why a square is easy to compute.
   *
   * @param n - The number being squared
   * @returns Human-readable explanation
   * @private
   */
  private getSquareExplanation(n: number): string {
    const nSquared = n * n;

    if (NICE_SQUARES.has(nSquared) && n <= 20) {
      return `${n}^2 = ${nSquared} (memorized fact)`;
    }

    if (n % 10 === 0) {
      const tens = n / 10;
      return `${n}^2 = ${tens}^2 x 100 = ${nSquared}`;
    }

    if (n % 5 === 0) {
      return `${n}^2 = ${nSquared} (square of multiple of 5)`;
    }

    return `${n}^2 = ${nSquared}`;
  }

  /**
   * Generates educational content for studying this method.
   *
   * @returns Complete study content with examples and exercises
   */
  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: `
The Near Squares method is a powerful technique for multiplying numbers that are close together.
It uses the algebraic identity: n x (n + k) = n^2 + k x n.

When you see two numbers that differ by a small amount (like 12 and 14, or 25 and 27),
you can express one as the other plus some difference k. Then the multiplication becomes
squaring the smaller number and adding a simple product.

Example: 12 x 14
- Express 14 as 12 + 2, so k = 2
- Apply: 12 x 14 = 12^2 + 2 x 12 = 144 + 24 = 168

The magic: If you know your squares, you've already done most of the work!
      `.trim(),
      mathematicalFoundation: `
The Near Squares identity is a direct application of the distributive property:

n x (n + k) = n x n + n x k = n^2 + k x n

### Proof

Starting with n x (n + k):
1. Distribute n over the sum: n x n + n x k
2. Simplify: n^2 + k x n

### Why It Works

This identity transforms multiplication into:
1. Squaring (which is often memorized)
2. Simple multiplication (k is small)
3. Addition (straightforward)

### Connection to Other Identities

This is related to the difference of squares:
- (n)(n+k) = n^2 + kn (near squares)
- (n-k)(n+k) = n^2 - k^2 (difference of squares)

Both leverage the power of squares to simplify multiplication.
      `.trim(),
      deepDiveContent: `
### When Near Squares Shines

This method is most effective when:

1. **n^2 is a "nice" square** - Multiples of 5 or 10, or small numbers (1-20)
2. **k is small** - Ideally 1-3, maximum 5
3. **You've memorized common squares**

### Key Squares to Memorize

**Essential (1-20):**
1^2=1, 2^2=4, 3^2=9, 4^2=16, 5^2=25
6^2=36, 7^2=49, 8^2=64, 9^2=81, 10^2=100
11^2=121, 12^2=144, 13^2=169, 14^2=196, 15^2=225
16^2=256, 17^2=289, 18^2=324, 19^2=361, 20^2=400

**Multiples of 5:**
25^2=625, 30^2=900, 35^2=1225, 40^2=1600
45^2=2025, 50^2=2500, 55^2=3025, 60^2=3600

### Worked Examples

**Example 1: 12 x 14**
- n = 12, k = 2
- 12^2 = 144 (memorized)
- 2 x 12 = 24
- 144 + 24 = 168

**Example 2: 25 x 27**
- n = 25, k = 2
- 25^2 = 625 (memorized)
- 2 x 25 = 50
- 625 + 50 = 675

**Example 3: 50 x 53**
- n = 50, k = 3
- 50^2 = 2500 (5^2 x 100)
- 3 x 50 = 150
- 2500 + 150 = 2650
      `.trim(),
      whenToUse: [
        'When two numbers differ by a small amount (1-5)',
        'When the smaller number has a well-known square (multiples of 5 or 10)',
        'When the smaller number is 20 or less (memorized squares)',
        'When the difference k is odd (no clean difference of squares alternative)',
        'When you want to leverage your memorized squares'
      ],
      whenNotToUse: [
        'When numbers are the same (use Squaring method instead)',
        'When the difference is large (> 5), other methods are more efficient',
        'When both numbers are symmetric around a round number (use Difference of Squares)',
        'When one number is near a power of 10 (use Near Power of 10)',
        'When the square of the smaller number is not easily known'
      ],
      commonMistakes: [
        'Forgetting which number is n (always use the smaller number)',
        'Mixing up n^2 + k*n with n^2 + k (must multiply k by n!)',
        'Using this method when the square is hard to compute',
        'Not recognizing when difference of squares is simpler',
        'Arithmetic errors when adding the final result'
      ],
      practiceStrategies: [
        'Memorize squares 1-20 until they are instant recall',
        'Memorize squares of multiples of 5 (25, 30, 35, ..., 100)',
        'Practice identifying k quickly when seeing two numbers',
        'Start with k=1 cases (consecutive numbers) and work up',
        'Compare with difference of squares to understand when each is better',
        'Time yourself on problems like 25x26, 50x52, 12x15'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Squaring, MethodName.Distributive],
      nextMethods: [MethodName.DifferenceSquares]
    };
  }
}
