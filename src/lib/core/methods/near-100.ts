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

        Example: 97 * 103 = (100 - 3)(100 + 3)
                         = 10000 + 100(0) + (-9)
                         = 9991
      `.trim(),
      mathematicalFoundation: `
        The formula derives from FOIL expansion:

        (100 + a)(100 + b) = 100*100 + 100*b + a*100 + a*b
                          = 10000 + 100(a + b) + ab

        The beauty is that:
        - 10000 is trivial (just write it down)
        - 100(a + b) is easy (add deviations, shift two places)
        - ab is typically small (small numbers times small numbers)

        For symmetric cases like 97 * 103 where a = -3 and b = +3:
        a + b = 0, so the middle term vanishes!
        Result = 10000 + 0 + (-9) = 9991
      `.trim(),
      deepDiveContent: `
        ### The Symmetric Case

        When numbers are symmetric around 100 (like 97 and 103):
        - a + b = 0, eliminating the middle term
        - This becomes difference of squares: 100² - d² = 10000 - d²
        - 97 * 103 = 10000 - 9 = 9991

        ### The Same-Side Case

        When both are below 100 (like 94 and 97):
        - a = -6, b = -3
        - a + b = -9, so middle term = -900
        - ab = 18 (positive!)
        - 10000 - 900 + 18 = 9118

        When both are above 100 (like 104 and 107):
        - a = 4, b = 7
        - a + b = 11, middle term = 1100
        - ab = 28
        - 10000 + 1100 + 28 = 11128

        ### Mental Shortcut

        For numbers below 100:
        1. Write down 100 plus the smaller deviation
        2. Subtract the sum of deviations from 100
        3. Append the product of deviations

        Example: 94 * 97
        1. Take either number plus other's deviation: 94 + (-3) = 91
        2. Product of deviations: 6 * 3 = 18
        3. Answer: 9118
      `.trim(),
      whenToUse: [
        'When both numbers are between 85 and 115',
        'Especially powerful for symmetric pairs (like 97 * 103)',
        'When deviations from 100 are single digits',
        'For quick estimation of products near 10000'
      ],
      examples: [],
      interactiveExercises: []
    };
  }
}
