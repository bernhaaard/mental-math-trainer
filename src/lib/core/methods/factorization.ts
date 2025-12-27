/**
 * Factorization Method - Uses factor pairs to simplify multiplication
 * @module core/methods/factorization
 *
 * When one number has convenient factors, we can rearrange:
 * a × b = (f × g) × b = f × (g × b)
 *
 * Example: 24 × 35 = (6 × 4) × 35 = 6 × (4 × 35) = 6 × 140 = 840
 */

import { BaseMethod } from './base-method';
import { MethodName, type Solution, type CalculationStep, type StudyContent } from '../../types';
import { SolutionValidator } from '../validator';

/**
 * Represents a useful factorization for mental math.
 */
interface UsefulFactorization {
  factor1: number;
  factor2: number;
  score: number; // Lower is better
}

/**
 * Factorization calculation method.
 *
 * This method works best when one number can be factored into
 * convenient components that make subsequent multiplication easier.
 */
export class FactorizationMethod extends BaseMethod {
  name = MethodName.Factorization;
  displayName = 'Factorization';

  /**
   * Cache for factorization results to avoid recomputation.
   * Key is the absolute value of the number.
   */
  private factorizationCache = new Map<number, UsefulFactorization[]>();

  /**
   * Find useful factorizations for a number.
   * Prefers factors that are powers of 2, 5, or single digits.
   * Results are cached for performance.
   *
   * @param n - Number to factorize
   * @returns Array of useful factorizations sorted by score
   */
  private findUsefulFactorizations(n: number): UsefulFactorization[] {
    const abs = Math.abs(n);

    // Check cache first
    if (this.factorizationCache.has(abs)) {
      return this.factorizationCache.get(abs)!;
    }

    const factorizations: UsefulFactorization[] = [];

    for (let i = 2; i <= Math.sqrt(abs); i++) {
      if (abs % i === 0) {
        const other = abs / i;
        const score = this.scoreFactorPair(i, other);
        factorizations.push({ factor1: i, factor2: other, score });
      }
    }

    // Sort by score (lower is better)
    const sorted = factorizations.sort((a, b) => a.score - b.score);

    // Cache the result
    this.factorizationCache.set(abs, sorted);

    return sorted;
  }

  /**
   * Score a factor pair - lower score means more useful.
   *
   * @param f1 - First factor
   * @param f2 - Second factor
   * @returns Score (lower is better)
   */
  private scoreFactorPair(f1: number, f2: number): number {
    let score = 0;

    // Prefer single-digit factors
    if (f1 < 10) score -= 3;
    if (f2 < 10) score -= 3;

    // Prefer powers of 2
    const isPowerOf2 = (n: number) => n > 0 && (n & (n - 1)) === 0;
    if (isPowerOf2(f1)) score -= 2;
    if (isPowerOf2(f2)) score -= 2;

    // Prefer factors ending in 5
    if (f1 % 5 === 0) score -= 1;
    if (f2 % 5 === 0) score -= 1;

    // Prefer factors ending in 0
    if (f1 % 10 === 0) score -= 2;
    if (f2 % 10 === 0) score -= 2;

    // Penalize large factors
    score += (this.countDigits(f1) + this.countDigits(f2)) * 0.5;

    return score;
  }

  /**
   * Determines if this method is applicable.
   * Applicable when at least one number has useful factorizations.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns true if method can be applied
   */
  isApplicable(num1: number, num2: number): boolean {
    const facts1 = this.findUsefulFactorizations(num1);
    const facts2 = this.findUsefulFactorizations(num2);

    // Need at least one good factorization with score < 0
    return facts1.some(f => f.score < 0) || facts2.some(f => f.score < 0);
  }

  /**
   * Compute cognitive cost for this method.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Cost score (lower is better)
   */
  computeCost(num1: number, num2: number): number {
    const facts1 = this.findUsefulFactorizations(num1);
    const facts2 = this.findUsefulFactorizations(num2);

    const best1 = facts1[0]?.score ?? Infinity;
    const best2 = facts2[0]?.score ?? Infinity;

    // Return cost based on best factorization available
    // Score can be as low as -10, so add 15 to ensure positive range
    return Math.min(best1, best2) + 15;
  }

  /**
   * Compute quality score for how well this method suits the numbers.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Quality score from 0-1 (higher is better)
   */
  qualityScore(num1: number, num2: number): number {
    const facts1 = this.findUsefulFactorizations(num1);
    const facts2 = this.findUsefulFactorizations(num2);

    const best1 = facts1[0]?.score ?? 10;
    const best2 = facts2[0]?.score ?? 10;
    const best = Math.min(best1, best2);

    // Convert score to 0-1 range (lower score = higher quality)
    if (best <= -5) return 0.9;
    if (best <= -3) return 0.8;
    if (best <= 0) return 0.7;
    return 0.5;
  }

  /**
   * Generate step-by-step solution using factorization.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Complete validated solution
   */
  generateSolution(num1: number, num2: number): Solution {
    const facts1 = this.findUsefulFactorizations(num1);
    const facts2 = this.findUsefulFactorizations(num2);

    // Decide which number to factorize
    const useFirst = (facts1[0]?.score ?? Infinity) <= (facts2[0]?.score ?? Infinity);
    const toFactor = useFirst ? Math.abs(num1) : Math.abs(num2);
    const other = useFirst ? Math.abs(num2) : Math.abs(num1);
    const factorization = useFirst ? facts1[0] : facts2[0];

    if (!factorization) {
      throw new Error('No useful factorization found');
    }

    const { factor1, factor2 } = factorization;
    const steps: CalculationStep[] = [];
    const finalResult = num1 * num2;
    const sign = (num1 < 0 ? -1 : 1) * (num2 < 0 ? -1 : 1);

    // Step 1: Recognize the factorization
    steps.push({
      expression: `${num1} * ${num2}`,
      result: finalResult,
      explanation: `Recognize that ${toFactor} = ${factor1} * ${factor2}`,
      depth: 0
    });

    // Calculate absolute result for intermediate steps
    const absResult = toFactor * other;

    // Step 2: Rewrite using factors (using absolute values)
    steps.push({
      expression: `${factor1} * ${factor2} * ${other}`,
      result: absResult,
      explanation: `Rewrite as ${factor1} * ${factor2} * ${other}`,
      depth: 0
    });

    // Step 3: Regroup for easier calculation
    // Use the smaller intermediate result
    let firstMult: number, secondMult: number, intermediate: number;
    if (factor1 <= factor2) {
      firstMult = factor2;
      secondMult = factor1;
      intermediate = firstMult * other;
    } else {
      firstMult = factor1;
      secondMult = factor2;
      intermediate = firstMult * other;
    }

    steps.push({
      expression: `${secondMult} * (${firstMult} * ${other})`,
      result: absResult,
      explanation: `Regroup: multiply ${firstMult} * ${other} first, then by ${secondMult}`,
      depth: 0,
      subSteps: [
        {
          expression: `${firstMult} * ${other}`,
          result: intermediate,
          explanation: `${firstMult} * ${other} = ${intermediate}`,
          depth: 1
        }
      ]
    });

    // Step 4: Final multiplication
    steps.push({
      expression: `${secondMult} * ${intermediate}`,
      result: absResult,
      explanation: `${secondMult} * ${intermediate} = ${absResult}`,
      depth: 0
    });

    // Step 5: Apply sign if needed
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
      optimalReason: `${toFactor} factors nicely as ${factor1} * ${factor2}, making the calculation simpler`,
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
        The Factorization method leverages the associative property of multiplication.
        When one number has convenient factors, we can rearrange the calculation
        to create easier intermediate products.

        For example: 24 * 35 = (6 * 4) * 35 = 6 * (4 * 35) = 6 * 140 = 840
      `.trim(),
      mathematicalFoundation: `
        This method relies on the associative property of multiplication:
        (a * b) * c = a * (b * c)

        Combined with factorization:
        If n = f * g, then n * m = (f * g) * m = f * (g * m)

        We choose the regrouping that minimizes cognitive load, typically
        pairing factors to create round numbers or single-digit intermediate products.
      `.trim(),
      deepDiveContent: `
        ### Strategic Factor Selection

        Not all factorizations are equally useful. We prefer:

        1. **Single-digit factors** (2, 3, 4, 5, 6, 7, 8, 9)
        2. **Powers of 2** (2, 4, 8, 16) - easy to double/halve
        3. **Multiples of 5** - create nice intermediate products
        4. **Round numbers** - end in zero for easy mental tracking

        ### The Halving-Doubling Variant

        A special case of factorization is halving one number while doubling another:
        24 * 35 = 12 * 70 = 6 * 140 = 3 * 280 = 840

        This works because (a/2) * (b*2) = a * b
      `.trim(),
      whenToUse: [
        'When one number has obvious small factors (especially 2, 4, 5)',
        'When factoring creates round intermediate products',
        'For numbers like 12, 15, 18, 24, 25, 32, 36, 48',
        'When halving/doubling would simplify the problem'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Distributive],
      nextMethods: []
    };
  }
}
