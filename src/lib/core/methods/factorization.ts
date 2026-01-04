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
   * Maximum number of entries to keep in the factorization cache.
   * This prevents unbounded memory growth.
   */
  private static readonly MAX_CACHE_SIZE = 1000;

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

    // Evict oldest entry if cache is full (FIFO eviction)
    if (this.factorizationCache.size >= FactorizationMethod.MAX_CACHE_SIZE) {
      const firstKey = this.factorizationCache.keys().next().value;
      if (firstKey !== undefined) {
        this.factorizationCache.delete(firstKey);
      }
    }

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

Example: 24 x 35
- Factor 24 as 6 x 4
- Regroup: (6 x 4) x 35 = 6 x (4 x 35)
- Calculate: 4 x 35 = 140, then 6 x 140 = 840

The insight: 4 x 35 = 140 is easy (just double 35 twice), and 6 x 140
is also straightforward (6 x 14 = 84, append zero).

This method transforms one harder multiplication into two easier ones.
      `.trim(),
      mathematicalFoundation: `
This method relies on the associative property of multiplication:
(a x b) x c = a x (b x c)

### Factorization Principle

If n = f x g (where f and g are factors of n), then:
n x m = (f x g) x m = f x (g x m)

We can compute g x m first, then multiply by f.

### Why This Works

Multiplication is associative—the grouping doesn't change the result.
This means we're free to regroup factors in whatever way minimizes
cognitive load.

### Optimal Regrouping

The goal is to create intermediate products that are:
1. Round numbers (easy to work with)
2. Small enough to multiply easily
3. Convenient for the final step

Example Analysis:
24 x 35 could be factored as:
- (3 x 8) x 35: gives 8 x 35 = 280, then 3 x 280 = 840
- (4 x 6) x 35: gives 6 x 35 = 210, then 4 x 210 = 840
- (2 x 12) x 35: gives 12 x 35 = 420, then 2 x 420 = 840

Different factorizations lead to different intermediate calculations.
Choose the one that feels easiest mentally.
      `.trim(),
      deepDiveContent: `
### Finding Good Factors

The key skill is recognizing useful factorizations quickly.

### 1. Look for Small Factors First

Check divisibility in this order:
- Is it even? Factor of 2
- Does it end in 0 or 5? Factor of 5
- Do the digits sum to a multiple of 3? Factor of 3
- Is it a quarter of 100? Factor of 4 (e.g., 24, 48, 72, 96)

### 2. Preferred Factor Types

**Powers of 2: 2, 4, 8, 16**
- Multiplying/dividing by 2 is just doubling/halving
- 4 = double twice, 8 = double three times
- Example: 8 x 47 = 2 x 2 x 2 x 47 = 94 x 2 x 2 = 188 x 2 = 376

**Factors of 5 and 10:**
- Lead to round intermediate products
- 5 x anything ends in 0 or 5
- 10 x anything just appends a zero

**Single-digit factors: 2-9**
- These are the building blocks of mental multiplication
- Master your times tables through 9

### 3. The Halving-Doubling Trick

A special case: repeatedly halve one number while doubling the other:
24 x 35 = 12 x 70 = 6 x 140 = 3 x 280 = 840

This continues until one factor becomes awkward (like 1.5) or until
the other factor is convenient to multiply.

### 4. Factorization Table

Numbers with the best factorizations:
- 12 = 3 x 4 = 2 x 6 = 2 x 2 x 3
- 15 = 3 x 5
- 16 = 2 x 8 = 4 x 4 = 2 x 2 x 2 x 2
- 18 = 2 x 9 = 3 x 6
- 20 = 4 x 5 = 2 x 10
- 24 = 3 x 8 = 4 x 6 = 2 x 12
- 25 = 5 x 5
- 32 = 4 x 8 = 2 x 16
- 36 = 4 x 9 = 6 x 6
- 48 = 6 x 8 = 4 x 12

### 5. Creating Round Products

The best factorizations create round intermediate products:
- 35 x 4 = 140 (round number!)
- 25 x 4 = 100 (perfect!)
- 15 x 6 = 90 (nice!)

Look for factor pairs where one factor times the other number gives a multiple of 10.
      `.trim(),
      whenToUse: [
        'When one number has obvious small factors (especially 2, 4, 5, or 8)',
        'When factoring creates round intermediate products (multiples of 10)',
        'For highly composite numbers like 12, 16, 18, 24, 25, 32, 36, 48',
        'When halving/doubling would simplify the problem',
        'When the other number multiplies nicely with one of the factors'
      ],
      whenNotToUse: [
        'When numbers are prime or have only large factors',
        'When another method is more direct (e.g., 99 x 47 uses Near Power of 10)',
        'When the intermediate products are not simpler than the original',
        'When both numbers are odd primes (e.g., 37 x 43)',
        'When you cannot quickly identify useful factors'
      ],
      commonMistakes: [
        'Choosing factors that do not simplify the calculation (factoring for its own sake)',
        'Forgetting which intermediate product you calculated (memory overload)',
        'Incorrect factorization (always verify: factors should multiply back to the original)',
        'Not recognizing when another method would be simpler',
        'Getting confused about which factor to multiply by which number',
        'Halving a number that becomes fractional (e.g., halving an odd number)'
      ],
      practiceStrategies: [
        'Memorize useful factorizations for numbers 10-50 (especially composite numbers)',
        'Practice instant factor recognition: see 24 and think "3 x 8" or "4 x 6"',
        'Drill the halving-doubling technique until it becomes automatic',
        'Work through examples focusing on creating round intermediate products',
        'Compare different factorizations of the same number to find the easiest path',
        'Build speed by practicing with numbers you factor frequently (12, 15, 18, 24, 36, 48)'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Distributive],
      nextMethods: []
    };
  }
}
