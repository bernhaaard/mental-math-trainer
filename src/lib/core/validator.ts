/**
 * Solution Validator - Validates complete solutions for mathematical correctness
 * @module core/validator
 *
 * This is the cornerstone of the entire application - every generated solution
 * must pass validation before being presented to users.
 */

import type { Solution, ValidationResult, CalculationStep } from '../types';
import { validateStep } from './step-validator';

/**
 * Validates solutions for mathematical correctness.
 * This is the cornerstone of the entire application - every generated solution
 * must pass validation before being presented to users.
 */
export class SolutionValidator {
  /**
   * Validates that a solution is mathematically correct.
   *
   * Checks performed:
   * 1. Final step result matches direct multiplication
   * 2. Every step is mathematically valid
   * 3. Steps form a logical progression
   * 4. All sub-steps are valid
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @param solution - The solution to validate
   * @returns Validation result with errors and warnings
   *
   * @example
   * ```typescript
   * const solution = generateSolution(47, 53);
   * const result = SolutionValidator.validateSolution(47, 53, solution);
   * if (!result.valid) {
   *   console.error('Invalid solution:', result.errors);
   * }
   * ```
   */
  static validateSolution(
    num1: number,
    num2: number,
    solution: Solution
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check 1: Solution has steps
    if (!solution.steps || solution.steps.length === 0) {
      errors.push('Solution has no steps');
      return { valid: false, errors, warnings };
    }

    const finalStep = solution.steps[solution.steps.length - 1];
    const directResult = num1 * num2;

    // Check 2: Final answer matches direct multiplication
    // Safety: finalStep is guaranteed to exist since we checked steps.length > 0 above
    if (finalStep === undefined) {
      errors.push('Solution has no final step');
      return { valid: false, errors, warnings };
    }

    if (finalStep.result !== directResult) {
      errors.push(
        `Final answer ${finalStep.result} does not match ` +
        `direct multiplication ${num1} × ${num2} = ${directResult}`
      );
    }

    // Check 3: Every step is mathematically valid
    solution.steps.forEach((step, index) => {
      const stepValidation = validateStep(step);

      if (!stepValidation.valid) {
        errors.push(
          `Step ${index + 1} is invalid: ${stepValidation.errors.join('; ')}`
        );
      }

      // Collect warnings
      stepValidation.warnings.forEach(warning => {
        warnings.push(`Step ${index + 1}: ${warning}`);
      });
    });

    // Check 4: Step sequence is logically connected
    for (let i = 1; i < solution.steps.length; i++) {
      const prev = solution.steps[i - 1];
      const curr = solution.steps[i];

      // Safety: prev and curr are guaranteed to exist within loop bounds
      if (prev === undefined || curr === undefined) {
        continue;
      }

      if (!this.isLogicalProgression(prev, curr)) {
        warnings.push(
          `Step ${i + 1} may not follow logically from step ${i}. ` +
          `Previous result: ${prev.result}, Current expression: "${curr.expression}"`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Cross-validates that multiple solutions give the same answer.
   *
   * This is critical for ensuring that different methods (distributive,
   * difference of squares, etc.) all produce the correct result.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @param solutions - Array of solutions to cross-validate
   * @returns true if all solutions give the same answer, false otherwise
   *
   * @example
   * ```typescript
   * const solutions = [
   *   generateDistributiveSolution(47, 53),
   *   generateDifferenceSquaresSolution(47, 53)
   * ];
   * const consistent = SolutionValidator.crossValidate(47, 53, solutions);
   * // consistent should be true (both give 2491)
   * ```
   */
  static crossValidate(
    num1: number,
    num2: number,
    solutions: Solution[]
  ): boolean {
    if (solutions.length === 0) {
      return false;
    }

    // Get the answer from the first solution
    const firstSolution = solutions[0];
    if (firstSolution === undefined || !firstSolution.steps || firstSolution.steps.length === 0) {
      return false;
    }

    const lastStepOfFirst = firstSolution.steps[firstSolution.steps.length - 1];
    if (lastStepOfFirst === undefined) {
      return false;
    }
    const expectedAnswer = lastStepOfFirst.result;
    const directResult = num1 * num2;

    // First solution must match direct result
    if (expectedAnswer !== directResult) {
      return false;
    }

    // All other solutions must match the first
    return solutions.every(solution => {
      if (!solution.steps || solution.steps.length === 0) {
        return false;
      }

      const lastStep = solution.steps[solution.steps.length - 1];
      if (lastStep === undefined) {
        return false;
      }
      return lastStep.result === expectedAnswer;
    });
  }

  /**
   * Checks if current step follows logically from previous step.
   *
   * This is a heuristic check - we look for evidence that the current
   * step uses the result from the previous step in some way.
   *
   * @param prev - Previous calculation step
   * @param curr - Current calculation step
   * @returns true if progression seems logical, false otherwise
   * @private
   */
  private static isLogicalProgression(
    prev: CalculationStep,
    curr: CalculationStep
  ): boolean {
    // Heuristic: Check if current step's expression contains previous result
    // This isn't foolproof but catches obvious logical breaks
    const prevResultStr = prev.result.toString();
    return curr.expression.includes(prevResultStr);
  }
}
