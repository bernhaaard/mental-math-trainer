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
        Using the algebraic identity (a ± b)² = a² ± 2ab + b², we can break
        any square into simpler components.

        For example: 47² = (50 - 3)² = 2500 - 300 + 9 = 2209
      `.trim(),
      mathematicalFoundation: `
        The key identities are:

        (a + b)² = a² + 2ab + b²
        (a - b)² = a² - 2ab + b²

        By choosing 'a' to be a round number (like 50, 100), we make a²
        trivial to compute. The 2ab term is also easy since 'a' is round.
        Only b² requires real calculation, and if b is small (like 3), b²
        is just 9.

        This transforms a difficult square (like 47²) into three easy pieces.
      `.trim(),
      deepDiveContent: `
        ### Why This Works So Well

        The power of this method comes from strategic decomposition:

        1. **a² is trivial**: 50² = 2500, 100² = 10000
        2. **2ab is easy**: 2 * 50 * 3 = 300 (just 6 * 50)
        3. **b² is small**: For b ≤ 10, memorize these squares

        ### Memorize Small Squares

        The method is faster if you know squares up to 10²:
        1, 4, 9, 16, 25, 36, 49, 64, 81, 100

        ### Choosing a and b

        Pick the nearest multiple of 10 for 'a':
        - 47 → (50 - 3)²
        - 73 → (70 + 3)²
        - 98 → (100 - 2)²
      `.trim(),
      whenToUse: [
        'When multiplying a number by itself (squaring)',
        'Numbers close to round values (within 5 of a multiple of 10)',
        'After memorizing squares 1-10',
        'For quick mental estimates (just use a²)'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Distributive, MethodName.DifferenceSquares],
      nextMethods: []
    };
  }
}
