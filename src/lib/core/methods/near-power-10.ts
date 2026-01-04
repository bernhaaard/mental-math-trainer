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
import { MethodName, type Solution, type CalculationStep, type StudyContent } from '../../types';
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
power of 10, we can rewrite it as (power +/- small difference) and use
the distributive property.

This transforms a difficult multiplication into an easy one (by the power)
plus or minus a simpler correction term.

Example: 98 x 47
- 98 is just 2 away from 100
- Rewrite as (100 - 2) x 47
- Calculate: 100 x 47 - 2 x 47 = 4700 - 94 = 4606

The trick: multiplying by 100 is instant (just append two zeros),
and multiplying by 2 is trivial.
      `.trim(),
      mathematicalFoundation: `
This method combines two fundamental properties:

### 1. Powers of 10 in Base-10 Notation

Multiplying by 10^k is a pure positional shift—no computation required:
- n x 10 = n with one zero appended
- n x 100 = n with two zeros appended
- n x 1000 = n with three zeros appended

This is why base-10 is so convenient: powers of the base are trivial.

### 2. The Distributive Property

We can split multiplication across addition or subtraction:
(a +/- b) x c = (a x c) +/- (b x c)

### Combining These

If one number n is close to a power of 10, write n = 10^k +/- d where d is small.
Then: n x m = (10^k +/- d) x m = (10^k x m) +/- (d x m)

- The first term (10^k x m) is mentally trivial
- The second term (d x m) uses a small multiplier, making it easier

### Calculating the Adjustment

The adjustment calculation d x m is the key step. Keep these strategies in mind:
- If d is 1-3, this is usually trivial (double, triple, etc.)
- If d is 5, halve and shift: 5 x 47 = 47/2 x 10 = 23.5 x 10 (not ideal)
- Better: 5 x 47 = (10-5) x 47/2... actually just compute 5 x 47 = 235
      `.trim(),
      deepDiveContent: `
### Why Powers of 10 Are Special

In base-10 positional notation, multiplying by 10^k is a pure positional
shift with no computation required. This is a structural property of how
we represent numbers, not a mathematical trick.

When you multiply 47 by 100, you're not calculating—you're repositioning
digits: 47 becomes 4700.

### Choosing the Right Power

Always use the nearest power of 10:
- Numbers 5-15: use 10
- Numbers 85-115: use 100
- Numbers 950-1050: use 1000

### Above vs. Below the Power

The method works whether the number is above or below the power:

**Below the power (subtractive):**
98 x 47 = (100 - 2) x 47 = 4700 - 94 = 4606

**Above the power (additive):**
102 x 47 = (100 + 2) x 47 = 4700 + 94 = 4794

### Optimal Distance Thresholds

The method becomes less efficient as distance increases:
- Distance 1-3: Highly efficient (correction is trivial)
- Distance 4-6: Still good (correction is manageable)
- Distance 7-10: Borderline (may want another method)
- Distance >10: Usually better to use distributive or factorization

### Mental Calculation Tips

1. Always compute the power multiplication first (it's free)
2. For the correction term, think of it as "small number x other number"
3. For subtraction (below power), you may need to borrow—plan ahead

### Special Cases

Numbers ending in 9 (19, 29, 99, 999) and 1 (11, 21, 101, 1001) are perfect:
- The difference is just 1
- The correction term equals the other number
- 99 x 47 = 4700 - 47 = 4653
- 101 x 47 = 4700 + 47 = 4747
      `.trim(),
      whenToUse: [
        'When one number is within 10% of a power of 10 (10, 100, 1000)',
        'Especially effective when the difference is 1-5',
        'Works for both slightly above (101, 102) and slightly below (98, 99)',
        'Perfect for problems like 99 x n, 101 x n, 998 x n, 1001 x n',
        'When you only need to adjust one of the two numbers'
      ],
      whenNotToUse: [
        'When neither number is close to a power of 10 (use distributive instead)',
        'When the difference from the power is large (>10% of the power)',
        'When both numbers are near 100 (use the Near-100 method instead)',
        'When numbers are symmetric around a midpoint (use Difference of Squares)',
        'When the correction calculation is harder than the original problem'
      ],
      commonMistakes: [
        'Forgetting to add/subtract the correction term (getting just the power product)',
        'Adding when you should subtract (or vice versa)—track the sign carefully',
        'Using the wrong power of 10 (e.g., using 10 when 100 is closer)',
        'Miscalculating the difference from the power (e.g., 98 is 2 from 100, not 2 from 10)',
        'Errors in the correction multiplication (double-check d x m)',
        'Not recognizing when this method applies—practice pattern recognition'
      ],
      practiceStrategies: [
        'Start with numbers ending in 9 or 1 (99, 101) where correction equals the other number',
        'Practice instant recognition: see 98 and immediately think "100 - 2"',
        'Drill the power multiplication until it is automatic (47 x 100 = 4700, instant)',
        'Practice the adjustment calculation separately: 2 x 47, 3 x 47, etc.',
        'Work up from small differences (1, 2) to larger ones (5, 8, 10)',
        'Time yourself and track improvement on problems like 99 x various numbers'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Distributive],
      nextMethods: [MethodName.Near100]
    };
  }
}
