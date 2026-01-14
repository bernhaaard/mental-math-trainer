/**
 * Sum-to-Ten Multiplication Method
 * @module core/methods/sum-to-ten
 *
 * This method applies when multiplying two numbers that:
 * 1. Share the same tens digit (e.g., 24 and 26 both have tens digit 2)
 * 2. Have units digits that sum to 10 (e.g., 4 + 6 = 10)
 *
 * The Rule:
 * 1. Multiply the tens digit by its next consecutive number: n × (n+1)
 * 2. Multiply the two units digits together
 * 3. Concatenate: result = [n×(n+1)][units1×units2]
 *
 * Example: 44 × 46
 * - Same tens digit: 4 ✓
 * - Units sum: 4 + 6 = 10 ✓
 * - First part: 4 × 5 = 20
 * - Second part: 4 × 6 = 24
 * - Answer: 2024
 *
 * Mathematical Foundation:
 * (10n + a)(10n + b) where a + b = 10
 * = 100n² + 10n(a+b) + ab
 * = 100n² + 100n + ab  (since a+b = 10)
 * = 100n(n+1) + ab
 *
 * This is a generalization of the "Squaring numbers ending in 5" trick.
 */

import { BaseMethod } from './base-method';
import { MethodName, type Solution, type CalculationStep, type StudyContent } from '../../types';
import { SolutionValidator } from '../validator';

/**
 * Sum-to-Ten multiplication method.
 *
 * Optimal when two numbers have the same tens digit and
 * their units digits sum to 10.
 */
export class SumToTenMethod extends BaseMethod {
  name = MethodName.SumToTen;
  displayName = 'Sum-to-Ten Multiplication';

  /**
   * Determines if this method is applicable.
   * Requirements:
   * 1. Both numbers are 2-digit (10-99) or 3-digit with same hundreds (100-999)
   * 2. Same tens digit (or same tens within the same hundred)
   * 3. Units digits sum to 10
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns true if method applies
   */
  isApplicable(num1: number, num2: number): boolean {
    const absNum1 = Math.abs(num1);
    const absNum2 = Math.abs(num2);

    // Both must be at least 10 (need tens digit)
    if (absNum1 < 10 || absNum2 < 10) {
      return false;
    }

    // Extract tens and units
    const tens1 = Math.floor(absNum1 / 10) % 10;
    const tens2 = Math.floor(absNum2 / 10) % 10;
    const units1 = absNum1 % 10;
    const units2 = absNum2 % 10;

    // For 3+ digit numbers, check if hundreds (and beyond) are the same
    const prefix1 = Math.floor(absNum1 / 100);
    const prefix2 = Math.floor(absNum2 / 100);

    // Same tens digit and units sum to 10
    const sameTens = tens1 === tens2;
    const unitsSum10 = units1 + units2 === 10;
    const samePrefix = prefix1 === prefix2;

    // For 2-digit numbers, just check tens and units
    if (absNum1 < 100 && absNum2 < 100) {
      return sameTens && unitsSum10;
    }

    // For 3+ digit numbers, need same prefix too
    return sameTens && unitsSum10 && samePrefix;
  }

  /**
   * Compute cognitive cost for this method.
   * Very low cost - just two small multiplications and concatenation.
   *
   * @param num1 - First multiplicand
   * @param _num2 - Second multiplicand
   * @returns Cost score (lower is better)
   */
  computeCost(num1: number, _num2: number): number {
    // This method is very efficient when applicable
    // Cost components:
    // - 1 multiplication: base × (base+1)
    // - 1 multiplication: units1 × units2 - always single-digit × single-digit
    // - 1 concatenation: trivial

    const absNum1 = Math.abs(num1);
    const base = Math.floor(absNum1 / 10);  // Full prefix before units

    // Cost increases with base size
    // Single digit base (2-digit numbers): very low cost
    // Double digit base (3-digit numbers): moderate cost
    let baseMultCost: number;
    if (base < 10) {
      baseMultCost = base >= 5 ? 1.5 : 1.0;
    } else {
      // 3+ digit numbers: higher cost for larger base multiplication
      baseMultCost = 3.0 + Math.log10(base);
    }

    // Base cost is very low
    return 2.0 + baseMultCost;
  }

  /**
   * Compute quality score for how well this method suits the numbers.
   * High quality when applicable - elegant and fast.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Quality score from 0-1
   */
  qualityScore(num1: number, num2: number): number {
    if (!this.isApplicable(num1, num2)) {
      return 0;
    }

    // High quality - this is a beautiful pattern
    return 0.95;
  }

  /**
   * Generate step-by-step solution using Sum-to-Ten method.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Complete validated solution
   */
  generateSolution(num1: number, num2: number): Solution {
    const absNum1 = Math.abs(num1);
    const absNum2 = Math.abs(num2);
    const sign = (num1 < 0 ? -1 : 1) * (num2 < 0 ? -1 : 1);

    // Extract components
    // For Sum-to-Ten, we need the full "base" (everything except units digit)
    // e.g., 124 → base = 12, units = 4
    // e.g., 44 → base = 4, units = 4
    const base = Math.floor(absNum1 / 10);  // Full prefix before units
    const units1 = absNum1 % 10;
    const units2 = absNum2 % 10;

    // Calculate the two parts using the Sum-to-Ten formula:
    // (10n + a)(10n + b) = 100n(n+1) + ab  where a + b = 10
    const firstPart = base * (base + 1);  // n × (n+1) - where n is the full base
    const secondPart = units1 * units2;   // units product

    // Combine: firstPart × 100 + secondPart
    // e.g., 124 × 126: 12 × 13 = 156, 4 × 6 = 24 → 156 × 100 + 24 = 15624
    const absResult = firstPart * 100 + secondPart;
    const finalResult = sign * absResult;

    const steps: CalculationStep[] = [];

    // For explanation, extract the tens digit for display
    const tensDigit = base % 10;

    // Step 1: Recognize the pattern
    steps.push({
      expression: `${num1} * ${num2}`,
      result: finalResult,
      explanation: `Recognize Sum-to-Ten pattern: same tens digit (${tensDigit}), units sum to 10 (${units1} + ${units2} = 10)`,
      depth: 0
    });

    // Step 2: Calculate base * (base+1)
    steps.push({
      expression: `${base} * ${base + 1}`,
      result: firstPart,
      explanation: `Multiply base by next number: ${base} × ${base + 1} = ${firstPart}`,
      depth: 0
    });

    // Step 3: Calculate units product
    steps.push({
      expression: `${units1} * ${units2}`,
      result: secondPart,
      explanation: `Multiply units: ${units1} × ${units2} = ${secondPart}`,
      depth: 0
    });

    // Step 4: Combine the parts
    const secondPartStr = secondPart < 10 ? `0${secondPart}` : `${secondPart}`;
    steps.push({
      expression: `${firstPart} * 100 + ${secondPart}`,
      result: absResult,
      explanation: `Concatenate: ${firstPart} followed by ${secondPartStr} = ${absResult}`,
      depth: 0
    });

    // Step 5: Apply sign if negative
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
      optimalReason: `Numbers ${absNum1} and ${absNum2} have the same tens digit (${tensDigit}) and units that sum to 10 (${units1} + ${units2}), making Sum-to-Ten ideal`,
      steps,
      alternatives: [],
      validated: false,
      validationErrors: []
    };

    // Validate
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
The Sum-to-Ten method is one of the most elegant patterns in mental math.
It applies when multiplying two numbers that:
1. Share the same tens digit
2. Have units digits that sum to 10

When these conditions are met, you can calculate the answer almost instantly.

Example: 44 × 46
- Same tens digit: 4 ✓
- Units sum: 4 + 6 = 10 ✓
- Calculation: 4 × 5 = 20 (tens × next), 4 × 6 = 24 (units)
- Answer: 2,024

The beauty: Two simple multiplications, then concatenate!
      `.trim(),
      mathematicalFoundation: `
### Algebraic Proof

Let's prove why this works. For two numbers (10n + a) and (10n + b) where a + b = 10:

(10n + a)(10n + b)
= 100n² + 10nb + 10na + ab
= 100n² + 10n(a + b) + ab
= 100n² + 10n(10) + ab    [since a + b = 10]
= 100n² + 100n + ab
= 100n(n + 1) + ab

The result is 100 × [n(n+1)] + [ab], which means:
- The "hundreds" part is n × (n+1)
- The "units" part is a × b

### Connection to Difference of Squares

This is actually related to the difference of squares!
If a + b = 10, we can write a = 5 + d and b = 5 - d for some d.
Then (10n + a)(10n + b) = (10n + 5 + d)(10n + 5 - d) = (10n + 5)² - d²

### Generalization

This pattern works for any base! In base 10, we use units summing to 10.
The same principle applies to larger numbers when they're symmetric
around a midpoint that's a multiple of 10.
      `.trim(),
      deepDiveContent: `
### Pattern Recognition

Train yourself to instantly spot Sum-to-Ten candidates:

| Problem | Check | Answer |
|---------|-------|--------|
| 23 × 27 | 2=2 ✓, 3+7=10 ✓ | 6,21 |
| 44 × 46 | 4=4 ✓, 4+6=10 ✓ | 20,24 |
| 63 × 67 | 6=6 ✓, 3+7=10 ✓ | 42,21 |
| 89 × 81 | 8=8 ✓, 9+1=10 ✓ | 72,09 |

### Important: Padding the Units Part

When the units product is less than 10, you must write it with a leading zero!

Example: 81 × 89
- 8 × 9 = 72
- 1 × 9 = 9 (write as "09")
- Answer: 7,209 (not 729!)

### Extended Patterns

The same technique extends to larger numbers:
- 124 × 126: Same hundreds (1), same tens (2), units 4+6=10
- First: 12 × 13 = 156
- Second: 4 × 6 = 24
- Answer: 15,624

### Mental Speed Tips

1. Recognize the pattern before starting
2. Calculate n × (n+1) first - it's usually the harder part
3. Units product is always ≤ 25 (since max is 5 × 5)
4. Practice the n × (n+1) table: 1×2, 2×3, 3×4, ..., 9×10
      `.trim(),
      whenToUse: [
        'When both numbers have the same tens digit (e.g., 23 and 27)',
        'When the units digits sum exactly to 10',
        'For problems like 44×46, 63×67, 81×89, etc.',
        'Can extend to 3-digit numbers with same prefix (e.g., 124×126)',
        'When you need a quick mental calculation without paper'
      ],
      whenNotToUse: [
        'When tens digits differ (e.g., 23 × 37)',
        'When units don\'t sum to 10 (e.g., 23 × 24)',
        'When numbers are far apart (e.g., 21 × 89)',
        'When another method is simpler (e.g., 25 × 25 use squaring-end-5)'
      ],
      commonMistakes: [
        'Forgetting to pad single-digit unit products with zero (81×89 = 7209, not 729)',
        'Confusing which digit to multiply by next number (it\'s the TENS digit)',
        'Not recognizing the pattern when numbers are given in different order (27×23 = 23×27)',
        'Trying to apply when units don\'t sum to exactly 10'
      ],
      practiceStrategies: [
        'Memorize the n×(n+1) products: 2, 6, 12, 20, 30, 42, 56, 72, 90',
        'Practice pattern recognition: scan for same tens, units sum to 10',
        'Start with easier cases (21×29, 32×38) before harder ones (89×81)',
        'Time yourself and track improvement'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Distributive],
      nextMethods: [MethodName.DifferenceSquares]
    };
  }
}
