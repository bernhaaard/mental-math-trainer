/**
 * Solution type definitions for calculation steps and validation.
 * @module types/solution
 */

import type { MethodName } from './method';

/**
 * A complete solution to a multiplication problem.
 */
export interface Solution {
  /** The method used to solve this problem */
  method: MethodName;
  /** Explanation of why this method was chosen as optimal */
  optimalReason: string;
  /** Ordered list of calculation steps */
  steps: CalculationStep[];
  /** Alternative solutions using other methods */
  alternatives: AlternativeSolution[];
  /** Whether this solution has been validated */
  validated: boolean;
  /** Any errors found during validation */
  validationErrors: string[];
}

/**
 * A single step in a calculation.
 * Steps can contain sub-steps for more detailed breakdowns.
 */
export interface CalculationStep {
  /** Mathematical expression for this step (e.g., "40 × 53") */
  expression: string;
  /** Numerical result of this step */
  result: number;
  /** Human-readable explanation of what this step does */
  explanation: string;
  /** Optional nested steps for detailed breakdowns */
  subSteps?: CalculationStep[];
  /** Nesting depth (0 = top level) */
  depth: number;
}

/**
 * An alternative solution using a different method.
 */
export interface AlternativeSolution {
  /** The method used for this alternative */
  method: MethodName;
  /** Cost score for this alternative (higher = more difficult) */
  costScore: number;
  /** The calculation steps for this alternative */
  steps: CalculationStep[];
  /** Explanation of why this wasn't chosen as optimal */
  whyNotOptimal: string;
}

/**
 * Result of validating a solution for mathematical correctness.
 */
export interface ValidationResult {
  /** Whether the solution is mathematically valid */
  valid: boolean;
  /** Critical errors that make the solution incorrect */
  errors: string[];
  /** Non-critical issues or suggestions */
  warnings: string[];
}
