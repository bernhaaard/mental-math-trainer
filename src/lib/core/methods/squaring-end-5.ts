/**
 * Squaring Numbers Ending in 5 Method
 * @module core/methods/squaring-end-5
 *
 * This method applies when squaring any number ending in 5.
 *
 * The Rule:
 * 1. Take the tens digit (n)
 * 2. Multiply n by (n+1)
 * 3. Append 25
 *
 * Example: 75²
 * - Tens digit: 7
 * - 7 × 8 = 56
 * - Append 25: 5625
 *
 * Mathematical Foundation:
 * (10n + 5)² = 100n² + 100n + 25
 *            = 100n(n+1) + 25
 *            = [n×(n+1)]00 + 25
 *
 * This is a special case of the Sum-to-Ten method where both numbers are equal.
 */

import { BaseMethod } from './base-method';
import { MethodName, type Solution, type CalculationStep, type StudyContent } from '../../types';
import { SolutionValidator } from '../validator';

/**
 * Squaring numbers ending in 5 method.
 *
 * Optimal when squaring any number ending in 5.
 * This is the fastest possible method for such numbers.
 */
export class SquaringEnd5Method extends BaseMethod {
  name = MethodName.SquaringEndIn5;
  displayName = 'Squaring Numbers Ending in 5';

  /**
   * Determines if this method is applicable.
   * Requirements:
   * 1. Both numbers must be equal (squaring)
   * 2. The number must end in 5
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns true if method applies
   */
  isApplicable(num1: number, num2: number): boolean {
    // Must be squaring (same number)
    if (num1 !== num2) {
      return false;
    }

    const abs = Math.abs(num1);

    // Must be at least 5 and end in 5
    if (abs < 5) {
      return false;
    }

    return abs % 10 === 5;
  }

  /**
   * Compute cognitive cost for this method.
   * Extremely low cost - just one multiplication and append 25.
   *
   * @param num1 - First multiplicand
   * @param _num2 - Second multiplicand
   * @returns Cost score (lower is better)
   */
  computeCost(num1: number, _num2: number): number {
    // This is the most efficient method when applicable
    // Cost components:
    // - 1 multiplication: n × (n+1) - typically single-digit × single-digit for 2-digit numbers
    // - 1 append: trivial

    const abs = Math.abs(num1);
    const n = Math.floor(abs / 10); // The "tens prefix" (everything before the 5)

    // Very low base cost
    // Slightly higher if n is large (3+ digit numbers ending in 5)
    if (n >= 100) {
      return 3.0; // 3-digit prefix: 105² requires 10×11
    }
    if (n >= 10) {
      return 2.0; // 2-digit prefix: 105² requires 10×11
    }
    return 1.5; // Single-digit prefix: 75² requires 7×8
  }

  /**
   * Compute quality score for how well this method suits the numbers.
   * Perfect quality when applicable - this is THE method for squaring end-5.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Quality score from 0-1
   */
  qualityScore(num1: number, num2: number): number {
    if (!this.isApplicable(num1, num2)) {
      return 0;
    }

    // Perfect quality - this is the optimal method
    return 1.0;
  }

  /**
   * Generate step-by-step solution using Squaring End-5 method.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Complete validated solution
   */
  generateSolution(num1: number, num2: number): Solution {
    const abs = Math.abs(num1);
    // For squaring, sign is always positive (negative² = positive)
    const sign = 1;

    // Extract the prefix (everything before the 5)
    const n = Math.floor(abs / 10);

    // Calculate the first part: n × (n+1)
    const firstPart = n * (n + 1);

    // The result is firstPart followed by 25
    const absResult = firstPart * 100 + 25;
    const finalResult = sign * absResult;

    const steps: CalculationStep[] = [];

    // Step 1: Recognize the pattern
    steps.push({
      expression: `${num1} * ${num2}`,
      result: finalResult,
      explanation: `Recognize ${abs} ends in 5, so we can use the squaring-end-5 shortcut`,
      depth: 0
    });

    // Step 2: Calculate n * (n+1)
    steps.push({
      expression: `${n} * ${n + 1}`,
      result: firstPart,
      explanation: `Multiply the prefix (${n}) by the next number: ${n} * ${n + 1} = ${firstPart}`,
      depth: 0
    });

    // Step 3: Append 25 (multiply by 100 and add 25)
    steps.push({
      expression: `${firstPart} * 100 + 25`,
      result: absResult,
      explanation: `Append 25 to get the answer: ${firstPart} * 100 + 25 = ${absResult}`,
      depth: 0
    });

    // Step 4: Handle negative (though squaring is always positive)
    if (num1 < 0) {
      steps.push({
        expression: `0 - (0 - ${absResult})`,
        result: finalResult,
        explanation: `Squaring a negative gives positive: (-${abs})^2 = ${absResult}`,
        depth: 0
      });
    }

    const solution: Solution = {
      method: this.name,
      optimalReason: `${abs} ends in 5, making squaring-end-5 the fastest method: ${n} × ${n + 1} = ${firstPart}, append 25`,
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
The Squaring Numbers Ending in 5 method is one of the fastest mental math tricks.
Any number ending in 5 can be squared almost instantly using this pattern.

The Rule:
1. Take everything before the 5 (call it n)
2. Multiply n by (n+1)
3. Append 25

Example: 75²
- Prefix: 7
- 7 × 8 = 56
- Append 25: 5,625

That's it! Two simple steps and you have the answer.
      `.trim(),
      mathematicalFoundation: `
### Algebraic Proof

Any number ending in 5 can be written as (10n + 5) where n is the prefix.

(10n + 5)²
= 100n² + 100n + 25
= 100n² + 100n + 25
= 100(n² + n) + 25
= 100 × n(n + 1) + 25

The result is [n × (n+1)] followed by 25!

### Why This Works

The key insight is that 5² = 25 provides the constant ending,
while the cross-term 2 × (10n) × 5 = 100n combines perfectly
with 100n² to give 100n(n+1).

### Connection to Sum-to-Ten

This is actually a special case of the Sum-to-Ten method!
When we multiply two numbers with the same tens digit where
units sum to 10, we get a similar pattern. Here, both numbers
are equal and end in 5, so: (n5)(n5) = (n5)².
      `.trim(),
      deepDiveContent: `
### Quick Reference Table

| Number | n | n×(n+1) | Result |
|--------|---|---------|--------|
| 5² | 0 | 0×1=0 | 25 |
| 15² | 1 | 1×2=2 | 225 |
| 25² | 2 | 2×3=6 | 625 |
| 35² | 3 | 3×4=12 | 1,225 |
| 45² | 4 | 4×5=20 | 2,025 |
| 55² | 5 | 5×6=30 | 3,025 |
| 65² | 6 | 6×7=42 | 4,225 |
| 75² | 7 | 7×8=56 | 5,625 |
| 85² | 8 | 8×9=72 | 7,225 |
| 95² | 9 | 9×10=90 | 9,025 |

### Three-Digit Numbers

The method extends perfectly to larger numbers:

**105²**
- n = 10
- 10 × 11 = 110
- Append 25: 11,025

**125²**
- n = 12
- 12 × 13 = 156
- Append 25: 15,625

**995²**
- n = 99
- 99 × 100 = 9,900
- Append 25: 990,025

### Mental Calculation Tips

1. **Memorize n × (n+1) products**: These are triangular numbers doubled!
   - 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42, 7×8=56, 8×9=72, 9×10=90

2. **For larger prefixes**: Use (n)(n+1) = n² + n
   - Example: 12×13 = 144 + 12 = 156

3. **Always end with 25**: Never forget to append 25!

### Practical Applications

This trick is useful for:
- Quick percentage calculations (since many involve 25%, 75%, etc.)
- Estimating areas when dimensions end in 5
- Impressing people at parties (seriously, it's very fast!)
      `.trim(),
      whenToUse: [
        'When squaring ANY number ending in 5',
        'Works for any size: 5², 25², 105², 995², etc.',
        'When you need a quick mental calculation',
        'As a building block for other calculations involving numbers ending in 5'
      ],
      whenNotToUse: [
        'When the number does not end in 5',
        'When you are multiplying two different numbers (use Sum-to-Ten instead)',
        'When the number is very large and n × (n+1) becomes difficult'
      ],
      commonMistakes: [
        'Forgetting to append 25 (getting just n × (n+1) as the answer)',
        'Using n × n instead of n × (n+1)',
        'Miscounting the prefix for 3+ digit numbers (105 has prefix 10, not 1)',
        'Not recognizing when this method applies'
      ],
      practiceStrategies: [
        'Memorize the n × (n+1) table from 1-10',
        'Practice with all two-digit numbers ending in 5 until instant',
        'Then extend to three-digit numbers (105², 115², etc.)',
        'Race against a calculator - you should win!'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [MethodName.Squaring],
      nextMethods: [MethodName.SumToTen]
    };
  }
}
