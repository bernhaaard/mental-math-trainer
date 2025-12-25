/**
 * Near Powers of 10 Method - Optimized for numbers near powers of 10
 * @module core/methods/near-power-10
 *
 * This method exploits the ease of multiplying by powers of 10 (10, 100, 1000)
 * by rewriting nearby numbers as (power ± difference).
 *
 * Example: 98 × 47 = (100 - 2) × 47 = 4700 - 94 = 4606
 */

import { BaseMethod } from './base-method';
import type { MethodName, Solution, CalculationStep, StudyContent } from '../../types';
import { SolutionValidator } from '../validator';

/**
 * Near Powers of 10 calculation method.
 *
 * Optimal when one number is close to 10, 100, 1000, etc.
 * Uses the distributive property: (power ± diff) × n = (power × n) ± (diff × n)
 */
export class NearPower10Method extends BaseMethod {
  name: MethodName = 'near-power-10' as MethodName;
  displayName = 'Near Powers of 10';

  /**
   * Find the nearest power of 10 to a given number.
   *
   * @param n - Number to check
   * @returns The nearest power and the difference from it
   */
  private findNearestPowerOf10(n: number): { power: number; diff: number } {
    const abs = Math.abs(n);

    // Check powers of 10: 10, 100, 1000, 10000
    const powers = [10, 100, 1000, 10000];
    let nearest = 10;
    let minDiff = Math.abs(abs - 10);

    for (const p of powers) {
      const diff = Math.abs(abs - p);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = p;
      }
    }

    // Return signed difference
    const signedDiff = n - (n < 0 ? -nearest : nearest);
    return { power: nearest, diff: signedDiff };
  }

  /**
   * Determines if this method is applicable.
   * At least one number should be within 10% of a power of 10.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns true if at least one number is near a power of 10
   */
  isApplicable(num1: number, num2: number): boolean {
    const check = (n: number): boolean => {
      const { power, diff } = this.findNearestPowerOf10(n);
      return Math.abs(diff) <= power * 0.1; // Within 10%
    };
    return check(num1) || check(num2);
  }

  /**
   * Compute cognitive cost for this method.
   * Lower cost when number is very close to power of 10.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Cost score (lower is better)
   */
  computeCost(num1: number, num2: number): number {
    const cost1 = this.costForNumber(num1);
    const cost2 = this.costForNumber(num2);
    return Math.min(cost1, cost2);
  }

  /**
   * Calculate cost for a single number based on proximity to power of 10.
   *
   * @param n - Number to evaluate
   * @returns Cost score
   * @private
   */
  private costForNumber(n: number): number {
    const { power, diff } = this.findNearestPowerOf10(n);
    // Cost based on how close to power and size of diff
    return Math.abs(diff) + this.countDigits(power) * 0.5;
  }

  /**
   * Compute quality score for how well this method suits the numbers.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Quality score from 0-1 (higher = better)
   */
  qualityScore(num1: number, num2: number): number {
    const { diff: diff1 } = this.findNearestPowerOf10(num1);
    const { diff: diff2 } = this.findNearestPowerOf10(num2);

    // High quality if one is exactly power of 10 or very close
    if (diff1 === 0 || diff2 === 0) return 0.95;
    if (Math.abs(diff1) <= 3 || Math.abs(diff2) <= 3) return 0.8;
    return 0.6;
  }

  /**
   * Generate a step-by-step solution using the near power of 10 method.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Complete solution with validation
   */
  generateSolution(num1: number, num2: number): Solution {
    // Work with absolute values first, handle sign at the end
    const absNum1 = Math.abs(num1);
    const absNum2 = Math.abs(num2);
    const resultSign = (num1 < 0 ? -1 : 1) * (num2 < 0 ? -1 : 1);

    // Determine which number is closer to power of 10 (using absolute values)
    const { power: p1, diff: d1 } = this.findNearestPowerOf10(absNum1);
    const { power: p2, diff: d2 } = this.findNearestPowerOf10(absNum2);

    // Use the number closer to power of 10
    const useFirst = Math.abs(d1) <= Math.abs(d2);
    const nearPower = useFirst ? absNum1 : absNum2;
    const other = useFirst ? absNum2 : absNum1;
    const { power, diff } = useFirst ? { power: p1, diff: d1 } : { power: p2, diff: d2 };

    const steps: CalculationStep[] = [];
    const finalResult = num1 * num2;

    // Step 1: Recognize near power of 10
    const absDiff = Math.abs(diff);
    const sign = diff >= 0 ? '+' : '-';

    steps.push({
      expression: `${num1} * ${num2}`,
      result: finalResult,
      explanation: `Recognize ${nearPower} = ${power} ${sign} ${absDiff}, which is near a power of 10`,
      depth: 0
    });

    // Step 2: Rewrite using power of 10
    if (diff >= 0) {
      steps.push({
        expression: `(${power} + ${diff}) * ${other}`,
        result: finalResult,
        explanation: `Rewrite ${nearPower} as ${power} + ${diff}`,
        depth: 0
      });
    } else {
      steps.push({
        expression: `(${power} - ${absDiff}) * ${other}`,
        result: finalResult,
        explanation: `Rewrite ${nearPower} as ${power} - ${absDiff}`,
        depth: 0
      });
    }

    // Step 3: Apply distributive property
    const powerProduct = power * other;
    const diffProduct = absDiff * other;
    const absResult = diff >= 0 ? powerProduct + diffProduct : powerProduct - diffProduct;

    if (diff >= 0) {
      steps.push({
        expression: `${power} * ${other} + ${diff} * ${other}`,
        result: absResult,
        explanation: `Distribute: ${power} × ${other} + ${diff} × ${other}`,
        depth: 0,
        subSteps: [
          {
            expression: `${power} * ${other}`,
            result: powerProduct,
            explanation: `${power} × ${other} = ${powerProduct} (easy - just shift decimal)`,
            depth: 1
          },
          {
            expression: `${diff} * ${other}`,
            result: diffProduct,
            explanation: `${diff} × ${other} = ${diffProduct}`,
            depth: 1
          }
        ]
      });
    } else {
      steps.push({
        expression: `${power} * ${other} - ${absDiff} * ${other}`,
        result: absResult,
        explanation: `Distribute: ${power} × ${other} - ${absDiff} × ${other}`,
        depth: 0,
        subSteps: [
          {
            expression: `${power} * ${other}`,
            result: powerProduct,
            explanation: `${power} × ${other} = ${powerProduct} (easy - just shift decimal)`,
            depth: 1
          },
          {
            expression: `${absDiff} * ${other}`,
            result: diffProduct,
            explanation: `${absDiff} × ${other} = ${diffProduct}`,
            depth: 1
          }
        ]
      });
    }

    // Step 4: Calculate absolute result
    if (diff >= 0) {
      steps.push({
        expression: `${powerProduct} + ${diffProduct}`,
        result: absResult,
        explanation: `Add: ${powerProduct} + ${diffProduct} = ${absResult}`,
        depth: 0
      });
    } else {
      steps.push({
        expression: `${powerProduct} - ${diffProduct}`,
        result: absResult,
        explanation: `Subtract: ${powerProduct} - ${diffProduct} = ${absResult}`,
        depth: 0
      });
    }

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
      optimalReason: `${nearPower} is close to ${power}, making multiplication by power of 10 easy`,
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
   * Generate educational study content for this method.
   *
   * @returns Study content explaining the near power of 10 method
   */
  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: `
        The Near Powers of 10 method exploits the cognitive ease of multiplying
        by powers of 10 (10, 100, 1000, etc.). When one number is close to a
        power of 10, we can rewrite it as (power ± small difference) and use
        the distributive property.

        This transforms a difficult multiplication into an easy one (by the power)
        plus or minus a simpler correction term.
      `,
      mathematicalFoundation: `
        This method combines two fundamental properties:

        1. Multiplying by powers of 10 is trivial in base-10 notation
           (just shift the decimal point or append zeros)

        2. The distributive property allows us to split multiplication:
           (a ± b) × c = (a × c) ± (b × c)

        Algebraically: If n ≈ 10^k, write n = 10^k ± d where d is small.
        Then: n × m = (10^k ± d) × m = (10^k × m) ± (d × m)

        The first term (10^k × m) is mentally trivial, and the second term
        (d × m) involves a much smaller number d, making it easier.
      `,
      deepDiveContent: `
        ### Why Powers of 10 Are Special

        In base-10 positional notation, multiplying by 10^k is a pure
        positional shift with no computation required. This is a structural
        property of how we represent numbers, not a mathematical trick.

        ### Cognitive Load Analysis

        This method minimizes cognitive load in two ways:

        1. **Positional Shift**: Multiplying 47 × 100 = 4700 requires no
           calculation—we simply recognize the pattern and append zeros.

        2. **Smaller Secondary Calculation**: The correction term uses a
           small number (the difference from the power), which is easier
           to work with mentally than the original.

        ### When Distance Matters

        The method's efficiency degrades as the distance from the power
        increases. Compare:
        - 98 × 47: diff = 2, very efficient
        - 93 × 47: diff = 7, less efficient
        - 85 × 47: diff = 15, better to use another method

        The threshold depends on the other multiplicand's size, but generally
        if diff > 10% of the power, other methods may be better.
      `,
      whenToUse: [
        'When one number is within 10% of a power of 10 (10, 100, 1000)',
        'Especially effective when difference is 1-5',
        'Works for both slightly above and slightly below powers',
        'Ideal for problems like 99 × n, 101 × n, 998 × n, etc.'
      ],
      examples: [],
      interactiveExercises: []
    };
  }
}
