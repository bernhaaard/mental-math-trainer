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
type PartitionType = 'additive' | 'subtractive';

/**
 * Partition of a number for distributive calculation
 */
interface Partition {
  type: PartitionType;
  part1: number;
  part2: number;
  displayText: string; // e.g., "(50 - 3)" or "(40 + 7)"
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
   * @param _num1 - First multiplicand (unused)
   * @param _num2 - Second multiplicand (unused)
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
   * @param _num1 - First multiplicand (unused)
   * @param _num2 - Second multiplicand (unused)
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

    // Calculate the products (with absolute values first)
    const product1 = partition.part1 * absNum2;
    const product2 = partition.part2 * absNum2;

    // Calculate the final result (accounting for signs)
    const intermediateResult = partition.type === 'additive'
      ? product1 + product2
      : product1 - product2;
    const finalResult = resultSign * intermediateResult;

    // Step 1: Show partition
    steps.push({
      expression: `${partition.displayText} * ${absNum2}`,
      result: intermediateResult,
      explanation: this.explainPartition(absNum1, partition),
      depth: 0
    });

    // Step 2: Apply distributive property
    const distributiveOp = partition.type === 'additive' ? '+' : '-';
    steps.push({
      expression: `${partition.part1} * ${absNum2} ${distributiveOp} ${partition.part2} * ${absNum2}`,
      result: intermediateResult,
      explanation: `Apply distributive property: a(b ${distributiveOp} c) = ab ${distributiveOp} ac`,
      depth: 0
    });

    // Step 3: Calculate sub-products with sub-steps
    steps.push({
      expression: `${product1} ${distributiveOp} ${product2}`,
      result: intermediateResult,
      explanation: `Calculate each product separately`,
      depth: 0,
      subSteps: [
        {
          expression: `${partition.part1} * ${absNum2}`,
          result: product1,
          explanation: this.explainSubMultiplication(partition.part1, absNum2),
          depth: 1
        },
        {
          expression: `${partition.part2} * ${absNum2}`,
          result: product2,
          explanation: this.explainSubMultiplication(partition.part2, absNum2),
          depth: 1
        }
      ]
    });

    // Step 4: Final calculation
    if (resultSign < 0) {
      // Need to show the sign correction
      steps.push({
        expression: `${intermediateResult}`,
        result: intermediateResult,
        explanation: `${partition.type === 'additive' ? 'Add' : 'Subtract'} the partial products`,
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
        explanation: `${partition.type === 'additive' ? 'Add' : 'Subtract'} the partial products`,
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

    // Find nearest round number
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
    if (partition.type === 'additive') {
      if (partition.part1 % 10 === 0 && partition.part1 !== this.decompose(n).tens) {
        return `Partition ${n} as ${partition.part1} + ${partition.part2} (near round number)`;
      } else {
        return `Partition ${n} by place value into ${partition.part1} + ${partition.part2}`;
      }
    } else {
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
      `.trim(),
      mathematicalFoundation: `
In abstract algebra, the distributive property is one of the axioms that
define a ring structure. For integers (ℤ, +, ×), the distributive property
ensures that multiplication is a homomorphism with respect to addition.

In concrete terms: when you split a number into parts and multiply each
part separately, the sum of those products equals the product of the whole.
This works because multiplication "respects" the additive structure of numbers.

Algebraically: ∀ a, b, c ∈ ℤ: a(b + c) = ab + ac
Also: ∀ a, b, c ∈ ℤ: a(b - c) = ab - ac
      `.trim(),
      deepDiveContent: `
### Ring Theory Foundation

The distributive property isn't an arbitrary rule—it's a structural
requirement for any ring. When we work with integers under addition and
multiplication (ℤ, +, ×), we're working within a ring structure.

### Base-10 Polynomial View

Any integer in base-10 can be viewed as a polynomial:
347 = 3(10²) + 4(10¹) + 7(10⁰) = 3x² + 4x + 7, where x = 10

When you multiply two numbers, you're multiplying polynomials. The
distributive property is what allows you to expand these polynomials
term by term.

### Why Place-Value Partition Works

When you partition 347 as (300 + 40 + 7), you're decomposing the
polynomial into its monomial basis. Each term (3x², 4x, 7) represents
a single "power of ten" component.

The distributive property guarantees that ANY additive decomposition
works. We prefer partitions that align with round numbers because
they minimize cognitive load.

### Bidirectional Partitioning

We can partition numbers in two ways:
- Additive: 28 = 20 + 8 (standard place value)
- Subtractive: 28 = 30 - 2 (near round number)

The subtractive form often simplifies mental calculation when the
number is close to a round value. For example, 47 × 28 is easier
as 47 × (30 - 2) than as 47 × (20 + 8).
      `.trim(),
      whenToUse: [
        'When no other method applies efficiently',
        'For numbers without special structure',
        'As a fallback for any multiplication',
        'To teach the fundamental principle behind all methods',
        'When numbers are close to round values (use subtractive partition)'
      ],
      examples: [],
      interactiveExercises: [],
      prerequisites: [],
      nextMethods: [MethodName.NearPower10, MethodName.Factorization]
    };
  }
}
