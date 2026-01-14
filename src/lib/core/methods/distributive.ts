/**
 * Distributive Property / Place Value Partition Method
 * @module core/methods/distributive
 *
 * This is the foundational mental math technique that works for any multiplication.
 * It supports both additive partitions (40 + 7) and subtractive partitions (50 - 3),
 * automatically choosing the partition that minimizes cognitive load.
 *
 * Mathematical Foundation:
 * - Distributive property: a(b + c) = ab + ac
 * - Also: a(b - c) = ab - ac
 * - This is one of the ring axioms that define arithmetic
 */

import { BaseMethod } from './base-method';
import { MethodName, type Solution, type CalculationStep, type StudyContent } from '../../types';
import { SolutionValidator } from '../validator';

/**
 * Type of partition to use for a number
 */
type PartitionType = 'additive' | 'subtractive' | 'multi-additive';

/**
 * Partition of a number for distributive calculation
 */
interface Partition {
  type: PartitionType;
  part1: number;
  part2: number;
  /** Additional parts for multi-additive partitions (Issue #33) */
  additionalParts?: number[];
  displayText: string; // e.g., "(50 - 3)" or "(40 + 7)" or "(300 + 40 + 7)"
}

/**
 * Distributive Property calculation method.
 *
 * This method is always applicable and serves as the fallback when
 * no specialized method offers significant advantages.
 */
export class DistributiveMethod extends BaseMethod {
  name = MethodName.Distributive;
  displayName = 'Distributive Property / Place Value Partition';

  /**
   * Distributive property is always applicable.
   * It's the foundational method that works for any multiplication.
   *
   * @param _num1 - First multiplicand (unused - always applicable)
   * @param _num2 - Second multiplicand (unused - always applicable)
   * @returns Always true
   */
  isApplicable(_num1: number, _num2: number): boolean {
    return true;
  }

  /**
   * Calculate computational cost for distributive method.
   *
   * Cost factors:
   * - Number of sub-multiplications (digits1 × digits2)
   * - Digit complexity (longer numbers are harder)
   * - Memory chunks (intermediate results to hold)
   * - Magnitude penalty (very large numbers are harder)
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Cognitive cost score
   */
  computeCost(num1: number, num2: number): number {
    const digits1 = this.countDigits(num1);
    const digits2 = this.countDigits(num2);

    // For two-digit × two-digit: typically 4 sub-multiplications
    // For three-digit × two-digit: typically 6 sub-multiplications
    const subMultiplications = digits1 * digits2;

    // Complexity based on digit count
    const digitComplexity = (digits1 + digits2) * 0.8;

    // Memory chunks (need to hold intermediate results)
    // Cap at 7 (working memory limit)
    const memoryChunks = Math.min(digits1 * 2, 7);

    // Small penalty for very large numbers
    const magnitude = Math.max(Math.abs(num1), Math.abs(num2));
    const magnitudePenalty = magnitude > 1000 ? Math.log10(magnitude) : 0;

    return subMultiplications + digitComplexity + (memoryChunks * 0.5) + magnitudePenalty;
  }

  /**
   * Quality score: How elegant/educational is this method for these numbers?
   *
   * Distributive is general-purpose, so it gets an average quality score.
   * Specialized methods should score higher when applicable.
   *
   * @param _num1 - First multiplicand (unused - constant quality)
   * @param _num2 - Second multiplicand (unused - constant quality)
   * @returns Quality score (0-1, higher is better)
   */
  qualityScore(_num1: number, _num2: number): number {
    // Distributive is always acceptable but rarely optimal
    return 0.5;
  }

  /**
   * Generate solution using distributive property with optimal partitioning.
   *
   * Automatically chooses between additive (20 + 8) and subtractive (30 - 2)
   * partitions based on which minimizes cognitive load.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Complete validated solution
   * @throws Error if validation fails
   */
  generateSolution(num1: number, num2: number): Solution {
    const steps: CalculationStep[] = [];

    // Handle sign
    const sign1 = num1 < 0 ? -1 : 1;
    const sign2 = num2 < 0 ? -1 : 1;
    const resultSign = sign1 * sign2;

    const absNum1 = Math.abs(num1);
    const absNum2 = Math.abs(num2);

    // Choose optimal partition for the first number
    const partition = this.chooseOptimalPartition(absNum1);

    // Get all parts for the partition, filtering out zero parts
    // This prevents useless steps like "(70 + 0)" becoming "70 × n + 0 × n"
    const rawParts = partition.type === 'multi-additive'
      ? [partition.part1, partition.part2, ...(partition.additionalParts || [])]
      : [partition.part1, partition.part2];
    const allParts = rawParts.filter(part => part !== 0);

    // Calculate products for all parts
    const products = allParts.map(part => part * absNum2);

    // Calculate the final result (accounting for signs)
    // Note: products always has at least 2 elements since partition has part1 and part2
    const firstProduct = products[0] ?? 0;
    const secondProduct = products[1] ?? 0;
    let intermediateResult: number;
    if (partition.type === 'subtractive') {
      intermediateResult = firstProduct - secondProduct;
    } else {
      // additive or multi-additive: sum all products
      intermediateResult = products.reduce((sum, p) => sum + p, 0);
    }
    const finalResult = resultSign * intermediateResult;

    // Step 1: Show partition
    steps.push({
      expression: `${partition.displayText} * ${absNum2}`,
      result: intermediateResult,
      explanation: this.explainPartition(absNum1, partition),
      depth: 0
    });

    // Step 2: Apply distributive property (skip if only one effective part)
    const hasSinglePart = allParts.length === 1;
    if (!hasSinglePart) {
      if (partition.type === 'multi-additive') {
        // Multi-part distributive: (a + b + c) * d = a*d + b*d + c*d
        const distributiveExpr = allParts.map(p => `${p} * ${absNum2}`).join(' + ');
        steps.push({
          expression: distributiveExpr,
          result: intermediateResult,
          explanation: `Apply distributive property to each place value`,
          depth: 0
        });
      } else {
        const distributiveOp = partition.type === 'additive' ? '+' : '-';
        steps.push({
          expression: `${partition.part1} * ${absNum2} ${distributiveOp} ${partition.part2} * ${absNum2}`,
          result: intermediateResult,
          explanation: `Apply distributive property: a(b ${distributiveOp} c) = ab ${distributiveOp} ac`,
          depth: 0
        });
      }
    }

    // Step 3: Calculate sub-products with sub-steps
    // Note: products and allParts have the same length, so products[index] always exists
    // For non-trivial multiplications, generate recursive breakdowns
    const subSteps: CalculationStep[] = allParts.map((part, index) => {
      const productResult = products[index] ?? 0;

      // Generate recursive sub-steps if this multiplication is non-trivial
      const recursiveSubSteps = this.generateRecursiveSubSteps(part, absNum2, 2);

      return {
        expression: `${part} * ${absNum2}`,
        result: productResult,
        explanation: this.explainSubMultiplication(part, absNum2),
        depth: 1,
        subSteps: recursiveSubSteps.length > 0 ? recursiveSubSteps : undefined
      };
    });

    // For single-part (round numbers), just show direct multiplication
    if (hasSinglePart) {
      // Round number - no distribution needed, just calculate
      steps.push({
        expression: `${allParts[0]} * ${absNum2}`,
        result: intermediateResult,
        explanation: `Direct multiplication with round number`,
        depth: 0,
        subSteps
      });
    } else {
      if (partition.type === 'multi-additive') {
        // Show sum of all products
        const productsExpr = products.join(' + ');
        steps.push({
          expression: productsExpr,
          result: intermediateResult,
          explanation: `Calculate each product separately`,
          depth: 0,
          subSteps
        });
      } else {
        const distributiveOp = partition.type === 'additive' ? '+' : '-';
        steps.push({
          expression: `${firstProduct} ${distributiveOp} ${secondProduct}`,
          result: intermediateResult,
          explanation: `Calculate each product separately`,
          depth: 0,
          subSteps
        });
      }
    }

    // Step 4: Final calculation (skip for single-part as result is already shown)
    if (!hasSinglePart) {
      if (resultSign < 0) {
        // Need to show the sign correction
        steps.push({
          expression: `${intermediateResult}`,
          result: intermediateResult,
          explanation: partition.type === 'subtractive' ? 'Subtract the partial products' : 'Add the partial products',
          depth: 0
        });

        steps.push({
          expression: `-1 * ${intermediateResult}`,
          result: finalResult,
          explanation: `Apply the negative sign from the original multiplication`,
          depth: 0
        });
      } else {
        steps.push({
          expression: `${finalResult}`,
          result: finalResult,
          explanation: partition.type === 'subtractive' ? 'Subtract the partial products' : 'Add the partial products',
          depth: 0
        });
      }
    } else if (resultSign < 0) {
      // Single-part with negative result
      steps.push({
        expression: `-1 * ${intermediateResult}`,
        result: finalResult,
        explanation: `Apply the negative sign from the original multiplication`,
        depth: 0
      });
    }

    const solution: Solution = {
      method: this.name,
      optimalReason: 'Distributive property is a general-purpose method that works for any multiplication by breaking numbers into simpler parts.',
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
      console.error('Generated invalid solution:', validation.errors);
      throw new Error(`Failed to generate valid solution: ${validation.errors.join('; ')}`);
    }

    return solution;
  }

  /**
   * Choose the optimal partition (additive vs subtractive) for a number.
   *
   * Decision logic:
   * 1. Find nearest round number (multiple of 10)
   * 2. If distance <= 5, use subtractive/additive from round number
   * 3. Otherwise use standard place-value (additive)
   *
   * Examples:
   * - 28 → (30 - 2) preferred over (20 + 8)
   * - 47 → (50 - 3) preferred over (40 + 7)
   * - 23 → (20 + 3) preferred (already simple)
   * - 67 → (70 - 3) preferred over (60 + 7)
   *
   * @param n - Number to partition (must be positive)
   * @returns Optimal partition
   * @private
   */
  private chooseOptimalPartition(n: number): Partition {
    const { tens, ones } = this.decompose(n);
    const digitCount = this.countDigits(n);

    // Guard: If ones digit is 0, the number is already a multiple of 10
    // Don't produce useless partitions like (70 + 0)
    // Instead, treat it as if near to the lower round (which it IS)
    if (ones === 0 && digitCount <= 2) {
      // For round 2-digit numbers like 70, partition using decade structure
      // 70 = (7 * 10), but we can express as (60 + 10) or just keep as is
      // Actually, for multiplication 70 × n, we don't need to partition 70 at all
      // Return a "trivial" partition that keeps the number as-is
      return {
        type: 'additive',
        part1: n,
        part2: 0,
        displayText: `${n}`  // No partition needed - number is already round
      };
    }

    // For 3+ digit numbers, first check for near-1000 partitions (Issue #104)
    // then fall back to full place-value decomposition (Issue #33)
    if (digitCount >= 3) {
      // Check for near-1000 partition (e.g., 997 = 1000 - 3)
      const lowerRound1000 = Math.floor(n / 1000) * 1000;
      const upperRound1000 = lowerRound1000 + 1000;
      const distToUpper1000 = upperRound1000 - n;
      const distToLower1000 = n - lowerRound1000;

      if (distToUpper1000 > 0 && distToUpper1000 <= 5 && upperRound1000 <= 2000) {
        return {
          type: 'subtractive',
          part1: upperRound1000,
          part2: distToUpper1000,
          displayText: `(${upperRound1000} - ${distToUpper1000})`
        };
      }

      if (lowerRound1000 > 0 && distToLower1000 > 0 && distToLower1000 <= 5) {
        return {
          type: 'additive',
          part1: lowerRound1000,
          part2: distToLower1000,
          displayText: `(${lowerRound1000} + ${distToLower1000})`
        };
      }

      // Use full place-value decomposition for other 3+ digit numbers
      const parts = this.decomposeFullPlaceValue(n);
      const firstPart = parts[0];
      const secondPart = parts[1];
      if (parts.length >= 2 && firstPart !== undefined && secondPart !== undefined) {
        const displayText = `(${parts.join(' + ')})`;
        return {
          type: 'multi-additive',
          part1: firstPart,
          part2: secondPart,
          additionalParts: parts.slice(2),
          displayText
        };
      }
    }

    // For 2-digit numbers: check near-100 first, then near-10 (Issue #104)
    // Check for near-100 partition (e.g., 97 = 100 - 3)
    const distToHundred = 100 - n;
    if (n >= 85 && distToHundred > 0 && distToHundred <= 5) {
      return {
        type: 'subtractive',
        part1: 100,
        part2: distToHundred,
        displayText: `(100 - ${distToHundred})`
      };
    }

    // Find nearest round number (multiple of 10)
    const lowerRound = Math.floor(n / 10) * 10;
    const upperRound = lowerRound + 10;

    const distanceToLower = n - lowerRound;
    const distanceToUpper = upperRound - n;

    // Use round number partition if close enough (within 5)
    if (distanceToLower > 0 && distanceToLower <= 5 && distanceToLower < distanceToUpper) {
      // Closer to lower, use additive: e.g., 23 = (20 + 3)
      return {
        type: 'additive',
        part1: lowerRound,
        part2: distanceToLower,
        displayText: `(${lowerRound} + ${distanceToLower})`
      };
    } else if (distanceToUpper > 0 && distanceToUpper <= 5) {
      // Closer to upper, use subtractive: e.g., 47 = (50 - 3), 28 = (30 - 2)
      return {
        type: 'subtractive',
        part1: upperRound,
        part2: distanceToUpper,
        displayText: `(${upperRound} - ${distanceToUpper})`
      };
    } else {
      // Not close to round number, use standard place-value partition
      return {
        type: 'additive',
        part1: tens,
        part2: ones,
        displayText: `(${tens} + ${ones})`
      };
    }
  }

  /**
   * Generate explanation for partition choice.
   *
   * @param n - Original number
   * @param partition - Chosen partition
   * @returns Human-readable explanation
   * @private
   */
  private explainPartition(n: number, partition: Partition): string {
    // Handle round numbers (no partition needed)
    if (partition.part2 === 0) {
      return `${n} is already a round number - no partition needed`;
    }
    if (partition.type === 'multi-additive') {
      const allParts = [partition.part1, partition.part2, ...(partition.additionalParts || [])];
      return `Partition ${n} by full place value into ${allParts.join(' + ')}`;
    } else if (partition.type === 'additive') {
      if (partition.part1 % 1000 === 0) {
        return `Partition ${n} as ${partition.part1} + ${partition.part2} (near round thousand)`;
      } else if (partition.part1 % 100 === 0) {
        return `Partition ${n} as ${partition.part1} + ${partition.part2} (near round hundred)`;
      } else if (partition.part1 % 10 === 0 && partition.part1 !== this.decompose(n).tens) {
        return `Partition ${n} as ${partition.part1} + ${partition.part2} (near round number)`;
      } else {
        return `Partition ${n} by place value into ${partition.part1} + ${partition.part2}`;
      }
    } else {
      // Subtractive partition
      if (partition.part1 % 1000 === 0) {
        return `Partition ${n} as ${partition.part1} - ${partition.part2} (near round thousand)`;
      } else if (partition.part1 % 100 === 0) {
        return `Partition ${n} as ${partition.part1} - ${partition.part2} (near round hundred)`;
      }
      return `Partition ${n} as ${partition.part1} - ${partition.part2} (subtractive is simpler)`;
    }
  }

  /**
   * Generate explanation for a sub-multiplication.
   *
   * @param part - The partition part being multiplied
   * @param multiplier - The number to multiply by
   * @returns Human-readable explanation
   * @private
   */
  private explainSubMultiplication(part: number, multiplier: number): string {
    if (part % 10 === 0) {
      const simplified = part / 10;
      return `${simplified} × ${multiplier} = ${simplified * multiplier}, then append zero: ${part * multiplier}`;
    } else if (part < 10) {
      return `Single-digit multiplication: ${part} × ${multiplier}`;
    } else {
      return `Two-digit multiplication: ${part} × ${multiplier}`;
    }
  }

  /**
   * Generate educational content for study mode.
   *
   * @returns Complete study content
   */
  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: `
The distributive property is the foundational technique for mental math.
It states that multiplication distributes over addition: a(b + c) = ab + ac.

This property is not just a trick—it's one of the defining axioms of algebra.
Every mental math technique ultimately relies on this principle.

Think of it this way: when you need to calculate 47 x 8, you're not stuck
doing complex multiplication. Instead, you can split 47 into 40 + 7, then
calculate (40 x 8) + (7 x 8) = 320 + 56 = 376. The problem becomes two
easier multiplications and one simple addition.
      `.trim(),
      mathematicalFoundation: `
In abstract algebra, the distributive property is one of the axioms that
define a ring structure. For integers (Z, +, x), the distributive property
ensures that multiplication is a homomorphism with respect to addition.

In concrete terms: when you split a number into parts and multiply each
part separately, the sum of those products equals the product of the whole.
This works because multiplication "respects" the additive structure of numbers.

Algebraically: For all a, b, c in Z: a(b + c) = ab + ac
Also: For all a, b, c in Z: a(b - c) = ab - ac

### Why This Works

The distributive property is not arbitrary—it emerges from how multiplication
is defined as repeated addition:

5 x (3 + 2) = 5 + 5 + 5 + 5 + 5 (five times, each time adding 5)
            = (5 + 5 + 5) + (5 + 5) (grouping first 3 and last 2)
            = (5 x 3) + (5 x 2)
            = 15 + 10 = 25

This same logic extends to all integer multiplication.
      `.trim(),
      deepDiveContent: `
### Ring Theory Foundation

The distributive property isn't an arbitrary rule—it's a structural
requirement for any ring. When we work with integers under addition and
multiplication (Z, +, x), we're working within a ring structure.

### Base-10 Polynomial View

Any integer in base-10 can be viewed as a polynomial:
347 = 3(10^2) + 4(10^1) + 7(10^0) = 3x^2 + 4x + 7, where x = 10

When you multiply two numbers, you're multiplying polynomials. The
distributive property is what allows you to expand these polynomials
term by term.

### Partition Strategies

There are several ways to partition numbers for mental multiplication.
We can partition in two ways: additive partitioning (breaking into sums)
or subtractive partitioning (expressing as differences from round numbers).

### 1. Additive Partitioning - Standard Place Value (Most Common)
Split at the decimal boundaries:
- 47 = 40 + 7 (tens + ones)
- 347 = 300 + 40 + 7 (hundreds + tens + ones)

### 2. Subtractive Partitioning
When a number is close to a round value, subtract the difference:
- 47 = 50 - 3 (easier for 47 x 6: 300 - 18 = 282)
- 98 = 100 - 2 (much easier for 98 x 7: 700 - 14 = 686)

### 3. Friendly Number Partitioning
Split to create easy multiplication:
- 45 = 40 + 5 (both easy to multiply)
- 25 = 20 + 5 (or 30 - 5)

### Choosing the Right Partition

Ask yourself:
1. Is the number close to a round value? Use subtractive.
2. Are all digits manageable? Use standard place value.
3. For 3+ digit numbers, full place value decomposition often works best.

### Memory Management

The key challenge in mental math is working memory. Each intermediate
result you hold consumes cognitive resources. Strategies to minimize load:

1. Calculate and add as you go—don't try to remember all parts
2. Round to simpler intermediate results when possible
3. Use the larger number as the base when one is much bigger
      `.trim(),
      whenToUse: [
        'When no other specialized method applies efficiently',
        'For numbers without special structure (not near powers of 10, not symmetric)',
        'As a reliable fallback for any multiplication',
        'When learning mental math fundamentals—master this first',
        'When numbers are close to round values (use subtractive partition)',
        'For 3+ digit multiplications using full place value decomposition'
      ],
      whenNotToUse: [
        'When numbers are symmetric around a nice midpoint (use Difference of Squares instead)',
        'When one number is very close to 10, 100, or 1000 (use Near Powers of 10)',
        'When multiplying a number by itself (use Squaring method)',
        'When both numbers are between 85-115 (use Near 100 method)',
        'When one number has very convenient factors like 2, 4, 5 (consider Factorization)'
      ],
      commonMistakes: [
        'Forgetting to add zeroes when multiplying by tens, hundreds, etc. (e.g., 40 x 8 = 320, not 32)',
        'Losing track of intermediate results—write them down while learning',
        'Using additive partition when subtractive would be much easier (47 = 50-3, not 40+7 for some cases)',
        'Trying to hold too many intermediate values in memory at once',
        'Partitioning the wrong number—usually partition the more complex number',
        'Forgetting the sign when using subtractive partitions (e.g., 47 x (50-3) = 47x50 - 47x3)'
      ],
      practiceStrategies: [
        'Start with single-digit multipliers (e.g., 47 x 8) before advancing to two-digit x two-digit',
        'Practice recognizing when subtractive partitions are easier (numbers ending in 7, 8, 9)',
        'Drill the basic products you will use repeatedly: 2x through 9x tables, multiples of 10',
        'Time yourself and track improvement—speed comes with familiarity',
        'Practice mental running totals: say each partial product, then immediately add it to your running sum',
        'Use estimation first to verify your answer is in the right ballpark'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [],
      nextMethods: [MethodName.NearPower10, MethodName.Factorization]
    };
  }
}
