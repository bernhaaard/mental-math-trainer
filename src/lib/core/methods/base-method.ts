/**
 * Base class for all calculation methods.
 * @module core/methods/base-method
 *
 * All calculation methods inherit from this class and implement
 * the required abstract methods.
 */

import type { MethodName, Solution, StudyContent, CalculationStep } from '../../types';

/**
 * Maximum depth for recursive step breakdown.
 * Prevents infinite recursion and keeps explanations manageable.
 */
export const MAX_SUBSTEP_DEPTH = 3;

/**
 * Abstract base class providing common utilities for all calculation methods.
 *
 * This class defines the interface that all methods must implement while
 * providing shared utility functions for common operations.
 */
export abstract class BaseMethod {
  /** Unique identifier for this method */
  abstract name: MethodName;

  /** Human-readable display name */
  abstract displayName: string;

  /**
   * Determines if this method can be applied to the given numbers.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns true if this method is applicable, false otherwise
   */
  abstract isApplicable(num1: number, num2: number): boolean;

  /**
   * Computes the cognitive cost of using this method.
   * Lower cost = easier for mental calculation.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Cognitive cost score (higher = more difficult)
   */
  abstract computeCost(num1: number, num2: number): number;

  /**
   * Computes a quality score for how well suited this method is.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Quality score from 0-1 (higher = better suited)
   */
  abstract qualityScore(num1: number, num2: number): number;

  /**
   * Generates a step-by-step solution using this method.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Complete solution with validation
   */
  abstract generateSolution(num1: number, num2: number): Solution;

  /**
   * Generates educational content explaining this method.
   *
   * @returns Study content for teaching this method
   */
  abstract generateStudyContent(): StudyContent;

  /**
   * Helper: Count digits in a number.
   *
   * @param n - Number to count digits of
   * @returns Number of digits
   *
   * @example
   * ```typescript
   * countDigits(47)   // returns 2
   * countDigits(-123) // returns 3
   * countDigits(0)    // returns 1
   * ```
   */
  protected countDigits(n: number): number {
    return Math.abs(n).toString().length;
  }

  /**
   * Helper: Check if number is close to a target.
   *
   * @param num - Number to check
   * @param target - Target value
   * @param threshold - Maximum distance from target
   * @returns true if num is within threshold of target
   *
   * @example
   * ```typescript
   * isNear(47, 50, 5)   // returns true (|47-50| = 3 <= 5)
   * isNear(47, 50, 2)   // returns false (|47-50| = 3 > 2)
   * ```
   */
  protected isNear(num: number, target: number, threshold: number): boolean {
    return Math.abs(num - target) <= threshold;
  }

  /**
   * Helper: Get base-10 decomposition into tens and ones.
   *
   * @param n - Number to decompose
   * @returns Object with tens and ones components
   *
   * @example
   * ```typescript
   * decompose(47)  // returns { tens: 40, ones: 7 }
   * decompose(-23) // returns { tens: 20, ones: 3 }
   * decompose(8)   // returns { tens: 0, ones: 8 }
   * ```
   */
  protected decompose(n: number): { tens: number; ones: number } {
    const absN = Math.abs(n);
    const ones = absN % 10;
    const tens = absN - ones;
    return { tens, ones };
  }

  /**
   * Helper: Get full place-value decomposition for any number.
   * Breaks number into individual place values (ones, tens, hundreds, etc.)
   *
   * @param n - Number to decompose (uses absolute value)
   * @returns Array of place values from largest to smallest, excluding zeros
   *
   * @example
   * ```typescript
   * decomposeFullPlaceValue(347)  // returns [300, 40, 7]
   * decomposeFullPlaceValue(1005) // returns [1000, 5]
   * decomposeFullPlaceValue(50)   // returns [50]
   * decomposeFullPlaceValue(7)    // returns [7]
   * ```
   */
  protected decomposeFullPlaceValue(n: number): number[] {
    const absN = Math.abs(n);
    if (absN === 0) return [0];

    const parts: number[] = [];
    let remaining = absN;
    let placeValue = 1;

    // Find the highest place value
    while (placeValue * 10 <= remaining) {
      placeValue *= 10;
    }

    // Extract each place value
    while (placeValue >= 1) {
      const digit = Math.floor(remaining / placeValue);
      if (digit > 0) {
        parts.push(digit * placeValue);
        remaining -= digit * placeValue;
      }
      placeValue = Math.floor(placeValue / 10);
    }

    return parts.length > 0 ? parts : [0];
  }

  /**
   * Helper: Find the nearest round number (multiple of 10).
   *
   * @param n - Number to find nearest round for
   * @returns Nearest multiple of 10
   *
   * @example
   * ```typescript
   * nearestRound(47)  // returns 50
   * nearestRound(23)  // returns 20
   * nearestRound(45)  // returns 50 (rounds up on ties)
   * ```
   */
  protected nearestRound(n: number): number {
    const absN = Math.abs(n);
    const lower = Math.floor(absN / 10) * 10;
    const upper = lower + 10;

    // Choose closer one; on tie, choose upper
    const sign = n < 0 ? -1 : 1;
    return sign * (absN - lower <= upper - absN ? lower : upper);
  }

  /**
   * Determines if a multiplication is "trivial" (can be done mentally without breakdown).
   * A multiplication is trivial if:
   * - Both numbers are single digits (1-9)
   * - One number is 0, 1, or 10
   * - One number is a single digit and the other ends in 0
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns true if the multiplication is trivial
   *
   * @example
   * ```typescript
   * isTrivialMultiplication(7, 8)   // true - single digit x single digit
   * isTrivialMultiplication(7, 28)  // false - needs breakdown
   * isTrivialMultiplication(40, 5)  // true - ends in 0 x single digit
   * isTrivialMultiplication(12, 5)  // false - two-digit x single digit
   * ```
   */
  protected isTrivialMultiplication(num1: number, num2: number): boolean {
    const absNum1 = Math.abs(num1);
    const absNum2 = Math.abs(num2);

    // Zero or one are always trivial
    if (absNum1 <= 1 || absNum2 <= 1) {
      return true;
    }

    // Both single digits: trivial (basic multiplication facts)
    if (absNum1 < 10 && absNum2 < 10) {
      return true;
    }

    // One is 10: trivial (just append zero)
    if (absNum1 === 10 || absNum2 === 10) {
      return true;
    }

    // Single digit x multiple of 10: trivial
    // e.g., 7 x 40 = 7 x 4 then append zero
    if (absNum1 < 10 && absNum2 % 10 === 0 && absNum2 < 100) {
      return true;
    }
    if (absNum2 < 10 && absNum1 % 10 === 0 && absNum1 < 100) {
      return true;
    }

    // Multiple of 10 x multiple of 10 (up to 2 digits each): trivial
    // e.g., 30 x 40 = 3 x 4 then append two zeros
    if (absNum1 % 10 === 0 && absNum2 % 10 === 0 && absNum1 < 100 && absNum2 < 100) {
      return true;
    }

    return false;
  }

  /**
   * Generates recursive sub-steps for a non-trivial multiplication.
   * Uses place-value decomposition to break down the calculation.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @param currentDepth - Current nesting depth (starts at 1 for first-level sub-steps)
   * @param maxDepth - Maximum allowed depth (default: MAX_SUBSTEP_DEPTH)
   * @returns Array of calculation sub-steps, or empty array if trivial or at max depth
   *
   * @example
   * ```typescript
   * // For 7 x 28 at depth 1:
   * // Returns sub-steps showing: 7 x (30 - 2) = 7 x 30 - 7 x 2 = 210 - 14 = 196
   * generateRecursiveSubSteps(7, 28, 1)
   * ```
   */
  protected generateRecursiveSubSteps(
    num1: number,
    num2: number,
    currentDepth: number,
    maxDepth: number = MAX_SUBSTEP_DEPTH
  ): CalculationStep[] {
    // Don't recurse if at max depth or multiplication is trivial
    if (currentDepth >= maxDepth || this.isTrivialMultiplication(num1, num2)) {
      return [];
    }

    const absNum1 = Math.abs(num1);
    const absNum2 = Math.abs(num2);
    const result = absNum1 * absNum2;

    // Choose which number to decompose (prefer the larger one, or the one with more digits)
    const digits1 = this.countDigits(absNum1);
    const digits2 = this.countDigits(absNum2);

    let numberToDecompose: number;
    let multiplier: number;

    if (digits1 > digits2 || (digits1 === digits2 && absNum1 >= absNum2)) {
      numberToDecompose = absNum1;
      multiplier = absNum2;
    } else {
      numberToDecompose = absNum2;
      multiplier = absNum1;
    }

    // Only decompose if the number has 2+ digits
    if (numberToDecompose < 10) {
      return [];
    }

    const subSteps: CalculationStep[] = [];

    // Choose optimal partition (subtractive near round numbers, otherwise additive)
    const partition = this.getOptimalPartition(numberToDecompose);

    // Step 1: Show the partition
    subSteps.push({
      expression: `${multiplier} * ${partition.displayText}`,
      result: result,
      explanation: `Break down ${numberToDecompose} ${partition.type === 'subtractive' ? 'as' : 'into'} ${partition.displayText}`,
      depth: currentDepth
    });

    // Step 2: Apply distributive property
    const operator = partition.type === 'subtractive' ? '-' : '+';
    const product1 = multiplier * partition.part1;
    const product2 = multiplier * partition.part2;

    subSteps.push({
      expression: `${multiplier} * ${partition.part1} ${operator} ${multiplier} * ${partition.part2}`,
      result: result,
      explanation: `Apply distributive property`,
      depth: currentDepth
    });

    // Step 3: Calculate each product with potential recursive sub-steps
    const subProduct1Steps = this.generateRecursiveSubSteps(
      multiplier,
      partition.part1,
      currentDepth + 1,
      maxDepth
    );

    const subProduct2Steps = this.generateRecursiveSubSteps(
      multiplier,
      partition.part2,
      currentDepth + 1,
      maxDepth
    );

    // First product
    const step3: CalculationStep = {
      expression: `${multiplier} * ${partition.part1}`,
      result: product1,
      explanation: this.explainSimpleMultiplication(multiplier, partition.part1),
      depth: currentDepth,
      subSteps: subProduct1Steps.length > 0 ? subProduct1Steps : undefined
    };
    subSteps.push(step3);

    // Second product (only if part2 is non-zero)
    if (partition.part2 !== 0) {
      const step4: CalculationStep = {
        expression: `${multiplier} * ${partition.part2}`,
        result: product2,
        explanation: this.explainSimpleMultiplication(multiplier, partition.part2),
        depth: currentDepth,
        subSteps: subProduct2Steps.length > 0 ? subProduct2Steps : undefined
      };
      subSteps.push(step4);
    }

    // Step 5: Combine the products (only if we had two parts)
    if (partition.part2 !== 0) {
      const finalExpr = partition.type === 'subtractive'
        ? `${product1} - ${product2}`
        : `${product1} + ${product2}`;

      subSteps.push({
        expression: finalExpr,
        result: result,
        explanation: partition.type === 'subtractive'
          ? `Subtract the products`
          : `Add the products`,
        depth: currentDepth
      });
    }

    return subSteps;
  }

  /**
   * Gets the optimal partition for a number (additive or subtractive).
   *
   * @param n - Number to partition (must be positive)
   * @returns Partition object with type, parts, and display text
   * @private
   */
  private getOptimalPartition(n: number): { type: 'additive' | 'subtractive'; part1: number; part2: number; displayText: string } {
    const upperRound = Math.ceil(n / 10) * 10;
    const distanceToUpper = upperRound - n;

    // Prefer subtractive if close to upper round (within 5)
    if (distanceToUpper > 0 && distanceToUpper <= 5) {
      return {
        type: 'subtractive',
        part1: upperRound,
        part2: distanceToUpper,
        displayText: `(${upperRound} - ${distanceToUpper})`
      };
    }

    // Otherwise use additive (place value decomposition)
    const { tens, ones } = this.decompose(n);
    if (ones === 0) {
      // Pure tens - no decomposition needed at this level
      return {
        type: 'additive',
        part1: tens,
        part2: 0,
        displayText: `${tens}`
      };
    }

    return {
      type: 'additive',
      part1: tens,
      part2: ones,
      displayText: `(${tens} + ${ones})`
    };
  }

  /**
   * Generates an explanation for a simple multiplication.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Human-readable explanation
   * @private
   */
  private explainSimpleMultiplication(num1: number, num2: number): string {
    const absNum1 = Math.abs(num1);
    const absNum2 = Math.abs(num2);

    if (absNum2 === 0) {
      return `Anything times zero is zero`;
    }

    if (absNum2 % 10 === 0 && absNum2 < 100) {
      const simplified = absNum2 / 10;
      return `${absNum1} x ${simplified} = ${absNum1 * simplified}, then append zero`;
    }

    if (absNum1 < 10 && absNum2 < 10) {
      return `Basic multiplication fact`;
    }

    if (absNum2 < 10) {
      return `Multiply ${absNum1} by ${absNum2}`;
    }

    return `Calculate ${absNum1} x ${absNum2}`;
  }
}
