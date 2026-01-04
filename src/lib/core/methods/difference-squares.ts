/**
 * Difference of Squares calculation method.
 * @module core/methods/difference-squares
 *
 * Implements the algebraic identity: (a-b)(a+b) = a² - b²
 *
 * This method is optimal when two numbers are symmetric around a nice midpoint.
 * For example: 47 × 53 = (50-3)(50+3) = 50² - 3² = 2500 - 9 = 2491
 *
 * Mathematical Foundation:
 * - Works for any pair where (num1 + num2)/2 is a whole number
 * - Most efficient when the midpoint is a "round" number (multiple of 5 or 10)
 * - The difference should be small (typically ≤ 10) for mental calculation
 */

import { BaseMethod } from './base-method';
import { MethodName, type Solution, type CalculationStep, type StudyContent } from '../../types';
import { SolutionValidator } from '../validator';

/**
 * Difference of Squares method implementation.
 *
 * Uses the algebraic identity (a-b)(a+b) = a² - b² where:
 * - a = midpoint = (num1 + num2) / 2
 * - b = half-distance = |num1 - num2| / 2
 */
export class DifferenceSquaresMethod extends BaseMethod {
  name = 'difference-squares' as MethodName;
  displayName = 'Difference of Squares';

  /**
   * Determines if this method is applicable.
   *
   * Applicable when:
   * 1. Numbers are symmetric around a whole number midpoint
   * 2. Midpoint is "round" (ends in 0 or 5, or is small ≤ 20)
   * 3. Distance from midpoint is small (≤ 10)
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns true if method can be applied
   *
   * @example
   * ```typescript
   * isApplicable(47, 53)  // true (midpoint 50, distance 3)
   * isApplicable(48, 52)  // true (midpoint 50, distance 2)
   * isApplicable(23, 27)  // true (midpoint 25, distance 2)
   * isApplicable(47, 51)  // false (midpoint 49, not round)
   * ```
   */
  isApplicable(num1: number, num2: number): boolean {
    const avg = (num1 + num2) / 2;
    const diff = Math.abs(num1 - num2) / 2;

    // Must have whole number midpoint
    if (!Number.isInteger(avg)) {
      return false;
    }

    // Distance must be reasonable for mental math
    if (diff > 10) {
      return false;
    }

    // Midpoint should be "round" for mental calculation
    // Accept multiples of 5, 10, or small numbers
    const absAvg = Math.abs(avg);
    const isRound = absAvg % 5 === 0 || absAvg <= 20;

    return isRound;
  }

  /**
   * Computes the cognitive cost of using this method.
   *
   * Cost factors:
   * - Roundness of midpoint (multiples of 10 are easiest)
   * - Size of the distance (smaller is easier)
   * - Digit count in midpoint
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Cognitive cost score (lower is better)
   *
   * @example
   * ```typescript
   * computeCost(47, 53)  // Low cost (midpoint 50, distance 3)
   * computeCost(95, 105) // Medium cost (midpoint 100, distance 5)
   * ```
   */
  computeCost(num1: number, num2: number): number {
    const avg = (num1 + num2) / 2;
    const diff = Math.abs(num1 - num2) / 2;

    let cost = 0;

    // Cost based on roundness of midpoint
    // Multiples of 10 are easiest to square
    if (avg % 10 === 0) {
      cost += 1;
    } else if (avg % 5 === 0) {
      cost += 2;
    } else {
      cost += 4;
    }

    // Cost increases with distance (more to subtract)
    cost += diff * 0.5;

    // Cost increases with digit count of midpoint
    cost += this.countDigits(avg) * 0.5;

    return cost;
  }

  /**
   * Computes quality score for how well suited this method is.
   *
   * Higher quality when:
   * - Midpoint is a perfect round number (multiple of 10)
   * - Distance is very small
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Quality score from 0-1 (higher is better)
   *
   * @example
   * ```typescript
   * qualityScore(47, 53)  // High (0.9) - perfect for difference of squares
   * qualityScore(48, 52)  // High (0.9) - also perfect
   * qualityScore(23, 27)  // Good (0.7) - midpoint is 25
   * ```
   */
  qualityScore(num1: number, num2: number): number {
    const avg = (num1 + num2) / 2;
    const diff = Math.abs(num1 - num2) / 2;

    // Perfect for multiples of 10
    if (avg % 10 === 0 && diff <= 5) {
      return 0.9;
    }

    // Very good for multiples of 5
    if (avg % 5 === 0 && diff <= 5) {
      return 0.7;
    }

    // Still good for small numbers
    if (Math.abs(avg) <= 20 && diff <= 5) {
      return 0.6;
    }

    return 0.5;
  }

  /**
   * Generates a step-by-step solution using difference of squares.
   *
   * Steps:
   * 1. Identify the symmetric pattern
   * 2. Rewrite as (a-b)(a+b)
   * 3. Apply the identity a² - b²
   * 4. Calculate the squares
   * 5. Perform final subtraction
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Complete validated solution
   *
   * @throws Error if solution fails validation
   *
   * @example
   * ```typescript
   * const solution = generateSolution(47, 53);
   * // Returns solution with steps showing:
   * // 47 × 53 = (50-3)(50+3) = 50² - 3² = 2500 - 9 = 2491
   * ```
   */
  generateSolution(num1: number, num2: number): Solution {
    // Calculate midpoint (a) and half-distance (b)
    // Formula: (a-b)(a+b) = a² - b²
    const a = (num1 + num2) / 2;  // midpoint
    const b = Math.abs(num1 - num2) / 2;  // distance from midpoint

    const steps: CalculationStep[] = [];

    // Determine which number is smaller (a-b) and which is larger (a+b)
    const smaller = Math.min(num1, num2);
    const larger = Math.max(num1, num2);
    const finalResult = num1 * num2;

    // Step 1: Recognize the symmetric pattern
    steps.push({
      expression: `${num1} * ${num2}`,
      result: finalResult,
      explanation: `Recognize that ${smaller} and ${larger} are symmetric around ${a} (both ${b} away from ${a})`,
      depth: 0
    });

    // Step 2: Rewrite using difference of squares form
    steps.push({
      expression: `(${a} - ${b}) * (${a} + ${b})`,
      result: finalResult,
      explanation: `Rewrite as (${a} - ${b})(${a} + ${b}) to apply the difference of squares identity`,
      depth: 0
    });

    // Step 3: Apply the algebraic identity
    const aSquared = a * a;
    const bSquared = b * b;

    steps.push({
      expression: `${a} * ${a} - ${b} * ${b}`,
      result: finalResult,
      explanation: `Apply the identity: (a - b)(a + b) = a² - b²`,
      depth: 0,
      subSteps: [
        {
          expression: `${a} * ${a}`,
          result: aSquared,
          explanation: `Calculate ${a}² = ${aSquared}`,
          depth: 1
        },
        {
          expression: `${b} * ${b}`,
          result: bSquared,
          explanation: `Calculate ${b}² = ${bSquared}`,
          depth: 1
        }
      ]
    });

    // Step 4: Final subtraction
    steps.push({
      expression: `${aSquared} - ${bSquared}`,
      result: finalResult,
      explanation: `Subtract: ${aSquared} - ${bSquared} = ${finalResult}`,
      depth: 0
    });

    const solution: Solution = {
      method: this.name,
      optimalReason: `Numbers ${num1} and ${num2} are symmetric around ${a}, making difference of squares ideal. The midpoint ${a} is easy to square, and the small distance ${b} minimizes the subtraction.`,
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
   * Generates educational content for studying this method.
   *
   * @returns Complete study content with examples and exercises
   */
  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: `
The difference of squares is one of the most elegant techniques in mental math.
It leverages a fundamental algebraic identity: (a - b)(a + b) = a^2 - b^2.

This method is perfect when you notice two numbers are symmetric around
a nice round number. Instead of multiplying directly, you square the
midpoint and subtract the square of the distance.

Example: 47 x 53
- Both numbers are 3 away from 50
- Rewrite as (50 - 3)(50 + 3)
- Apply identity: 50^2 - 3^2 = 2500 - 9 = 2491

The magic: a potentially complex multiplication becomes squaring a round
number (trivial) and subtracting a small square (also trivial).
      `.trim(),
      mathematicalFoundation: `
The difference of squares identity is a cornerstone of algebra:

(a - b)(a + b) = a² - b²

### Proof by Expansion

(a - b)(a + b) = a(a + b) - b(a + b)
               = a² + ab - ab - b²
               = a² - b²

The cross terms (+ab and -ab) cancel perfectly, leaving only squares.

### Visual Proof

Imagine a square with side length 'a'. Its area is a².
Now remove a corner square with side length 'b'. The remaining area
can be rearranged into a rectangle with dimensions (a+b) by (a-b).

This geometric interpretation shows why the identity holds.

### For Mental Math

We identify:
- a = (num1 + num2) / 2 (the midpoint)
- b = |num1 - num2| / 2 (the half-distance)

Then: num1 x num2 = (a - b)(a + b) = a² - b²

The identity works because any two numbers can be expressed as a midpoint
plus and minus some distance.
      `.trim(),
      deepDiveContent: `
### Recognizing the Pattern

The key skill is pattern recognition. Train yourself to spot these clues:

### 1. Check for Symmetry
When you see two numbers, immediately check:
- What's their sum? If it's a nice round number, halve it for the midpoint.
- 47 + 53 = 100 -> midpoint = 50
- 23 + 27 = 50 -> midpoint = 25
- 95 + 105 = 200 -> midpoint = 100

### 2. Verify Equal Distance
Both numbers must be the same distance from the midpoint:
- 47 is 3 below 50, 53 is 3 above 50: distance = 3
- 23 is 2 below 25, 27 is 2 above 25: distance = 2

### 3. Evaluate Squaring Difficulty
This method only helps if:
- The midpoint is easy to square (multiples of 5, 10, or small numbers)
- The distance is small (ideally 1-5)

### Common Symmetric Patterns

Memorize these templates:
- Around 50: 49x51, 48x52, 47x53, 46x54, 45x55
- Around 100: 99x101, 98x102, 97x103, 95x105
- Around 25: 24x26, 23x27, 22x28
- Around 75: 74x76, 73x77, 72x78

### Squares to Memorize

For quick application, know these squares:
- 1^2=1, 2^2=4, 3^2=9, 4^2=16, 5^2=25
- 6^2=36, 7^2=49, 8^2=64, 9^2=81, 10^2=100
- 25^2=625, 50^2=2500, 75^2=5625, 100^2=10000

### Connection to Other Methods

This identity connects to the Near-100 method: when both numbers are near 100,
you're applying difference of squares with midpoint 100.
      `.trim(),
      whenToUse: [
        'When numbers are symmetric around a multiple of 10 (e.g., 47 x 53 around 50)',
        'When numbers are symmetric around a multiple of 5 (e.g., 23 x 27 around 25)',
        'When the distance from midpoint is small (typically 1-10)',
        'When the midpoint is easy to square (round numbers, known squares)',
        'When you quickly notice the sum of the two numbers is a nice round number'
      ],
      whenNotToUse: [
        'When numbers are not symmetric (e.g., 47 x 58 has no clean midpoint)',
        'When the midpoint is awkward to square (e.g., 47 x 59 has midpoint 53)',
        'When the distance is too large (>10 makes the subtraction harder)',
        'When one number is much larger than the other (no meaningful midpoint)',
        'When another method is clearly simpler (e.g., 99 x 47 is better with Near Power of 10)'
      ],
      commonMistakes: [
        'Not checking that both numbers are equidistant from the midpoint',
        'Miscalculating the midpoint (always verify: midpoint x 2 = sum of numbers)',
        'Forgetting to square the distance before subtracting (subtract b^2, not b)',
        'Confusing this with near-100: difference of squares needs BOTH numbers equidistant',
        'Trying to force this method when numbers are not actually symmetric',
        'Using this when the midpoint is hard to square (defeats the purpose)'
      ],
      practiceStrategies: [
        'Drill instant recognition: see 48 x 52 and immediately think "around 50, distance 2"',
        'Memorize squares 1-10 and key values: 25, 50, 75, 100',
        'Practice computing sums quickly: 47 + 53 = 100, so midpoint = 50',
        'Start with distance 1 (49x51, 99x101) then work up to larger distances',
        'Create mental flash cards: given two numbers, identify if this method applies',
        'Time yourself on symmetric pairs to build speed and confidence'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Distributive],
      nextMethods: [MethodName.Squaring]
    };
  }
}
