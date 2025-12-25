/**
 * Base class for all calculation methods.
 * @module core/methods/base-method
 *
 * All calculation methods inherit from this class and implement
 * the required abstract methods.
 */

import type { MethodName, Solution, StudyContent } from '../../types';

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
}
