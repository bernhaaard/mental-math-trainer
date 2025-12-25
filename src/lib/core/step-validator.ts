/**
 * Step Validator - Validates individual calculation steps
 * @module core/step-validator
 */

import type { CalculationStep } from '../types';
import { evaluateExpression } from './expression-evaluator';

/**
 * Result of validating a single calculation step.
 */
export interface StepValidationResult {
  /** Whether the step is mathematically valid */
  valid: boolean;
  /** Critical errors that make the step incorrect */
  errors: string[];
  /** Non-critical issues or suggestions */
  warnings: string[];
}

/**
 * Validates a single calculation step for mathematical correctness.
 *
 * Checks performed:
 * 1. Expression evaluates to the claimed result (within floating-point tolerance)
 * 2. All sub-steps are recursively validated
 * 3. Explanation is present and non-empty (warning if missing)
 *
 * @param step - The calculation step to validate
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```typescript
 * const step: CalculationStep = {
 *   expression: "40 * 53",
 *   result: 2120,
 *   explanation: "Multiply 40 by 53",
 *   depth: 0
 * };
 * const result = validateStep(step);
 * // result.valid === true
 * ```
 */
export function validateStep(step: CalculationStep): StepValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validation 1: Check that expression evaluates to result
  try {
    const computed = evaluateExpression(step.expression);

    // Use floating-point tolerance for comparison
    const TOLERANCE = 0.0001;
    if (Math.abs(computed - step.result) > TOLERANCE) {
      errors.push(
        `Expression "${step.expression}" evaluates to ${computed} ` +
        `but step claims result is ${step.result} ` +
        `(difference: ${Math.abs(computed - step.result).toFixed(6)})`
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(
      `Failed to evaluate expression "${step.expression}": ${errorMessage}`
    );
  }

  // Validation 2: Check explanation is present
  if (!step.explanation || step.explanation.trim().length === 0) {
    warnings.push('Step has no explanation');
  }

  // Validation 3: Recursively validate all sub-steps
  if (step.subSteps && step.subSteps.length > 0) {
    step.subSteps.forEach((subStep, index) => {
      const subValidation = validateStep(subStep);

      if (!subValidation.valid) {
        errors.push(
          `Sub-step ${index + 1} (depth ${subStep.depth}) is invalid: ` +
          subValidation.errors.join('; ')
        );
      }

      // Propagate warnings from sub-steps
      if (subValidation.warnings.length > 0) {
        warnings.push(
          `Sub-step ${index + 1} warnings: ${subValidation.warnings.join('; ')}`
        );
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
