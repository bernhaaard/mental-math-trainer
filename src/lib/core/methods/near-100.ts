/**
 * Near-100 Method - Optimized for multiplying numbers close to 100
 * @module core/methods/near-100
 *
 * Uses the identity: (100 + a)(100 + b) = 10000 + 100(a + b) + ab
 *
 * This is a specialized version of near-power-10 that exploits
 * the particularly nice properties of 100.
 *
 * Example: 97 × 103 = (100 - 3)(100 + 3) = 10000 + 0 - 9 = 9991
 * Example: 94 × 97 = (100 - 6)(100 - 3) = 10000 - 900 + 18 = 9118
 */

import { BaseMethod } from './base-method';
import { MethodName, type Solution, type CalculationStep, type StudyContent } from '../../types';
import { SolutionValidator } from '../validator';

/**
 * Near-100 calculation method.
 *
 * Highly optimized for numbers between 90 and 110.
 * The algorithm uses deviations from 100 to simplify calculation.
 */
export class Near100Method extends BaseMethod {
  name = MethodName.Near100;
  displayName = 'Near 100';

  /**
   * Determines if this method is applicable.
   * Both numbers should be within 15 of 100.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns true if both numbers are near 100
   */
  isApplicable(num1: number, num2: number): boolean {
    const abs1 = Math.abs(num1);
    const abs2 = Math.abs(num2);

    const near1 = Math.abs(abs1 - 100) <= 15;
    const near2 = Math.abs(abs2 - 100) <= 15;

    return near1 && near2;
  }

  /**
   * Compute cognitive cost for this method.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Cost score (lower is better)
   */
  computeCost(num1: number, num2: number): number {
    const diff1 = Math.abs(Math.abs(num1) - 100);
    const diff2 = Math.abs(Math.abs(num2) - 100);

    // Cost based on deviations from 100
    return (diff1 + diff2) * 0.3;
  }

  /**
   * Compute quality score for this method.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Quality score from 0-1 (higher is better)
   */
  qualityScore(num1: number, num2: number): number {
    const diff1 = Math.abs(Math.abs(num1) - 100);
    const diff2 = Math.abs(Math.abs(num2) - 100);

    // Perfect for numbers very close to 100
    if (diff1 <= 5 && diff2 <= 5) return 0.95;
    if (diff1 <= 10 && diff2 <= 10) return 0.85;
    return 0.7;
  }

  /**
   * Generate step-by-step solution using near-100 method.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Complete validated solution
   */
  generateSolution(num1: number, num2: number): Solution {
    const abs1 = Math.abs(num1);
    const abs2 = Math.abs(num2);
    const resultSign = (num1 < 0 ? -1 : 1) * (num2 < 0 ? -1 : 1);

    // Deviations from 100
    const a = abs1 - 100; // Can be negative (below 100) or positive (above)
    const b = abs2 - 100;

    const steps: CalculationStep[] = [];
    const finalResult = num1 * num2;

    // Step 1: Recognize the pattern
    const aSign = a >= 0 ? '+' : '-';
    const bSign = b >= 0 ? '+' : '-';
    const absA = Math.abs(a);
    const absB = Math.abs(b);

    steps.push({
      expression: `${num1} * ${num2}`,
      result: finalResult,
      explanation: `Recognize: ${abs1} = 100 ${aSign} ${absA}, ${abs2} = 100 ${bSign} ${absB}`,
      depth: 0
    });

    // Step 3: Apply the formula
    // (100 + a)(100 + b) = 10000 + 100(a + b) + ab
    const sumAB = a + b; // Sum of deviations
    const productAB = a * b; // Product of deviations
    const middleTerm = 100 * sumAB;
    const absResult = 10000 + middleTerm + productAB;

    // Step 2: Rewrite using deviations from 100
    steps.push({
      expression: `(100 ${aSign} ${absA}) * (100 ${bSign} ${absB})`,
      result: absResult,
      explanation: `Rewrite both numbers as deviations from 100`,
      depth: 0
    });

    steps.push({
      expression: `10000 + 100 * ${sumAB >= 0 ? sumAB : `(${sumAB})`} + ${productAB >= 0 ? productAB : `(${productAB})`}`,
      result: absResult,
      explanation: `Apply: (100+a)(100+b) = 10000 + 100(a+b) + ab`,
      depth: 0,
      subSteps: [
        {
          expression: `${a} + ${b}`,
          result: sumAB,
          explanation: `Sum of deviations: ${a} + ${b} = ${sumAB}`,
          depth: 1
        },
        {
          expression: `100 * ${sumAB}`,
          result: middleTerm,
          explanation: `100 * ${sumAB} = ${middleTerm}`,
          depth: 1
        },
        {
          expression: `${a} * ${b}`,
          result: productAB,
          explanation: `Product of deviations: ${a} * ${b} = ${productAB}`,
          depth: 1
        }
      ]
    });

    // Step 4: Calculate result
    steps.push({
      expression: `10000 + ${middleTerm} + ${productAB}`,
      result: absResult,
      explanation: `Calculate: 10000 + ${middleTerm} + ${productAB} = ${absResult}`,
      depth: 0
    });

    // Step 5: Apply sign if needed
    if (resultSign < 0) {
      steps.push({
        expression: `-${absResult}`,
        result: finalResult,
        explanation: `Apply negative sign: -${absResult} = ${finalResult}`,
        depth: 0
      });
    }

    const solution: Solution = {
      method: this.name,
      optimalReason: `Both ${abs1} and ${abs2} are close to 100, making the near-100 technique ideal`,
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
The Near-100 method is a powerful technique for multiplying numbers
close to 100. By expressing numbers as (100 + a) where 'a' is the
deviation from 100, we can use a simple formula to find the answer.

Formula: (100 + a)(100 + b) = 10000 + 100(a + b) + ab

Example: 97 x 103
- 97 = 100 - 3, so a = -3
- 103 = 100 + 3, so b = +3
- Apply: 10000 + 100(-3 + 3) + (-3)(+3)
- Calculate: 10000 + 0 - 9 = 9991

The magic: for symmetric pairs like 97 x 103, the middle term vanishes!
You just compute 10000 minus the square of the deviation.
      `.trim(),
      mathematicalFoundation: `
The formula derives from FOIL expansion:

(100 + a)(100 + b) = 100 x 100 + 100 x b + a x 100 + a x b
                   = 10000 + 100(a + b) + ab

### Breaking Down the Three Terms

1. **10000**: This is 100^2, always the same base value
2. **100(a + b)**: The sum of deviations, multiplied by 100
3. **ab**: The product of the two deviations

### Sign Rules for Deviations

Numbers below 100 have negative deviations:
- 97 has deviation a = -3
- 94 has deviation a = -6

Numbers above 100 have positive deviations:
- 103 has deviation b = +3
- 108 has deviation b = +8

### Computing the Product of Deviations (ab)

When both deviations have the same sign:
- Both negative: (-6) x (-3) = +18 (positive product)
- Both positive: (+4) x (+7) = +28 (positive product)

When deviations have opposite signs:
- (-3) x (+3) = -9 (negative product)
- (-5) x (+2) = -10 (negative product)
      `.trim(),
      deepDiveContent: `
### Three Cases to Master

### Case 1: Symmetric Around 100

When one number is above 100 and the other is below by the same amount:
- 97 x 103: a = -3, b = +3, so a + b = 0
- The middle term vanishes: 100(0) = 0
- Result = 10000 + 0 + (-9) = 9991

This is actually difference of squares in disguise:
97 x 103 = (100 - 3)(100 + 3) = 100^2 - 3^2 = 10000 - 9 = 9991

### Case 2: Both Below 100

When both numbers are below 100:
- 94 x 97: a = -6, b = -3
- Sum: a + b = -9, so middle term = 100 x (-9) = -900
- Product: (-6) x (-3) = +18 (positive!)
- Result = 10000 - 900 + 18 = 9118

Shortcut: Take one number and subtract the other's deviation:
- 94 - 3 = 91 (this gives 9100)
- Add the product of deviations: 9100 + 18 = 9118

### Case 3: Both Above 100

When both numbers are above 100:
- 104 x 107: a = +4, b = +7
- Sum: a + b = 11, so middle term = 100 x 11 = 1100
- Product: 4 x 7 = 28
- Result = 10000 + 1100 + 28 = 11128

Shortcut: Take one number and add the other's deviation:
- 104 + 7 = 111 (this gives 11100)
- Add the product of deviations: 11100 + 28 = 11128

### The Mental Shortcut

For any two numbers near 100:
1. Add one number to the OTHER's deviation: num1 + deviation2
2. Append the product of the deviations (as two digits)

Examples:
- 96 x 97: 96 + (-3) = 93 -> 93XX, then 4 x 3 = 12 -> 9312
- 102 x 108: 102 + 8 = 110 -> 110XX, then 2 x 8 = 16 -> 11016

### Handling Two-Digit Products

When ab >= 100 or ab < 10, be careful:
- If ab has only one digit, pad with leading zero: 9 becomes 09
- If ab >= 100, you need to carry: 12 x 15 = 180, so carry 1

Example: 88 x 85
- 88 + (-15) = 73 -> base is 73XX
- 12 x 15 = 180 -> but this is three digits!
- Solution: 7300 + 180 = 7480
      `.trim(),
      whenToUse: [
        'When BOTH numbers are between 85 and 115 (within 15 of 100)',
        'Especially powerful for symmetric pairs around 100 (like 97 x 103)',
        'When deviations from 100 are single digits (easiest case)',
        'For quick estimation of products near 10000',
        'When you recognize both numbers are "near 100" at a glance'
      ],
      whenNotToUse: [
        'When only ONE number is near 100 (use Near Powers of 10 instead)',
        'When numbers are far from 100 (more than 15 away)',
        'When the product of deviations is hard to compute (>10 x >10)',
        'When numbers are symmetric around a different midpoint like 50 (use Difference of Squares)',
        'When another method is clearly simpler for the specific numbers'
      ],
      commonMistakes: [
        'Forgetting the sign of deviations (below 100 = negative, above 100 = positive)',
        'Errors in computing ab when signs differ (negative times positive = negative)',
        'Forgetting that ab is ADDED for same-side cases (both below or both above)',
        'Not padding the product when ab is single-digit (9 should be 09)',
        'Confusing this with Near Powers of 10 (this requires BOTH numbers near 100)',
        'Forgetting to carry when ab >= 100'
      ],
      practiceStrategies: [
        'Start with symmetric pairs (97x103, 98x102) where the middle term is zero',
        'Practice identifying deviations instantly: see 94 and think "-6"',
        'Drill the three cases separately: symmetric, both-below, both-above',
        'Practice the shortcut: "num + other deviation, then multiply deviations"',
        'Master products of small numbers (2x3, 3x4, 4x5, etc.) for quick ab calculation',
        'Time yourself on problems like 96x97, 94x98, 103x107 to build speed'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Distributive, MethodName.NearPower10],
      nextMethods: []
    };
  }
}
