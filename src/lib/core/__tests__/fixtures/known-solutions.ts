/**
 * Known Solutions - Test fixtures with verified correct answers
 * @module core/__tests__/fixtures/known-solutions
 */

import { MethodName } from '../../../types';

/**
 * Known correct multiplication problems for testing.
 * Each has been manually verified.
 */
export interface KnownSolution {
  /** First multiplicand */
  num1: number;
  /** Second multiplicand */
  num2: number;
  /** Correct answer */
  answer: number;
  /** Optimal method for this problem */
  method: MethodName;
  /** Description of why this is a good test case */
  description?: string;
}

/**
 * Comprehensive test cases covering various problem types.
 * These are manually verified and serve as regression tests.
 */
export const KNOWN_SOLUTIONS: readonly KnownSolution[] = [
  // Difference of Squares cases
  {
    num1: 47,
    num2: 53,
    answer: 2491,
    method: MethodName.DifferenceSquares,
    description: 'Classic difference of squares: (50-3)(50+3) = 50² - 3²'
  },
  {
    num1: 95,
    num2: 105,
    answer: 9975,
    method: MethodName.DifferenceSquares,
    description: 'Larger difference of squares: (100-5)(100+5)'
  },

  // Distributive Property cases
  {
    num1: 23,
    num2: 87,
    answer: 2001,
    method: MethodName.Distributive,
    description: 'Basic distributive: (20+3) × 87'
  },
  {
    num1: 34,
    num2: 56,
    answer: 1904,
    method: MethodName.Distributive,
    description: 'Two-digit × two-digit distributive'
  },

  // Squaring cases
  {
    num1: 73,
    num2: 73,
    answer: 5329,
    method: MethodName.Squaring,
    description: 'Perfect square: 73²'
  },
  {
    num1: 125,
    num2: 125,
    answer: 15625,
    method: MethodName.Squaring,
    description: 'Three-digit square: 125²'
  },

  // Near Powers of 10
  {
    num1: 47,
    num2: 100,
    answer: 4700,
    method: MethodName.NearPower10,
    description: 'Multiply by exact power of 10'
  },
  {
    num1: 98,
    num2: 47,
    answer: 4606,
    method: MethodName.NearPower10,
    description: 'Near 100: (100-2) × 47'
  },

  // Near-100 Method
  {
    num1: 98,
    num2: 87,
    answer: 8526,
    method: MethodName.Near100,
    description: 'Both near 100: combine deviations efficiently'
  },
  {
    num1: 94,
    num2: 96,
    answer: 9024,
    method: MethodName.Near100,
    description: 'Close to 100 on both sides'
  },

  // Factorization cases
  {
    num1: 24,
    num2: 35,
    answer: 840,
    method: MethodName.Factorization,
    description: 'Factor out common factors: 24 = 8×3, 35 = 7×5'
  },
  {
    num1: 15,
    num2: 16,
    answer: 240,
    method: MethodName.Factorization,
    description: 'Factor to simpler multiplication'
  },

  // Edge cases
  {
    num1: 11,
    num2: 11,
    answer: 121,
    method: MethodName.Squaring,
    description: 'Small square'
  },
  {
    num1: 99,
    num2: 99,
    answer: 9801,
    method: MethodName.Squaring,
    description: 'Square near 100'
  },
  {
    num1: 12,
    num2: 13,
    answer: 156,
    method: MethodName.Distributive,
    description: 'Small consecutive numbers'
  },

  // Larger numbers
  {
    num1: 123,
    num2: 456,
    answer: 56088,
    method: MethodName.Distributive,
    description: 'Three-digit multiplication'
  },
  {
    num1: 997,
    num2: 1003,
    answer: 999991,
    method: MethodName.DifferenceSquares,
    description: 'Large difference of squares near 1000'
  }
] as const;
