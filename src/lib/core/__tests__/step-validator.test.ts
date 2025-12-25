/**
 * Step Validator Tests
 * @module core/__tests__/step-validator.test
 */

import { describe, it, expect } from 'vitest';
import { validateStep } from '../step-validator';
import type { CalculationStep } from '../../types';

describe('validateStep', () => {
  describe('valid steps', () => {
    it('should validate a correct simple step', () => {
      const step: CalculationStep = {
        expression: '40 * 53',
        result: 2120,
        explanation: 'Multiply 40 by 53',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate step with addition', () => {
      const step: CalculationStep = {
        expression: '2120 + 371',
        result: 2491,
        explanation: 'Add partial products',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate step with subtraction', () => {
      const step: CalculationStep = {
        expression: '2500 - 9',
        result: 2491,
        explanation: 'Subtract 9 from 2500',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate step with parentheses', () => {
      const step: CalculationStep = {
        expression: '(50 - 3) * (50 + 3)',
        result: 2491,
        explanation: 'Apply difference of squares',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate step with complex expression', () => {
      const step: CalculationStep = {
        expression: '50 * 50 - 3 * 3',
        result: 2491,
        explanation: 'Expand difference of squares',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('invalid steps', () => {
    it('should detect incorrect result', () => {
      const step: CalculationStep = {
        expression: '40 * 53',
        result: 2000, // Wrong! Should be 2120
        explanation: 'Multiply 40 by 53',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('evaluates to 2120');
      expect(result.errors[0]).toContain('but step claims result is 2000');
    });

    it('should detect invalid expression', () => {
      const step: CalculationStep = {
        expression: 'invalid expression',
        result: 100,
        explanation: 'This will fail',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to evaluate expression');
    });

    it('should detect malformed expression', () => {
      const step: CalculationStep = {
        expression: '40 ** 53', // Invalid operator
        result: 2120,
        explanation: 'Bad expression',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('warnings', () => {
    it('should warn if explanation is empty', () => {
      const step: CalculationStep = {
        expression: '40 * 53',
        result: 2120,
        explanation: '',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(true); // Still valid mathematically
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('no explanation');
    });

    it('should warn if explanation is whitespace only', () => {
      const step: CalculationStep = {
        expression: '40 * 53',
        result: 2120,
        explanation: '   ',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('no explanation');
    });
  });

  describe('sub-steps validation', () => {
    it('should validate steps with valid sub-steps', () => {
      const step: CalculationStep = {
        expression: '2120 + 371',
        result: 2491,
        explanation: 'Add partial products',
        depth: 0,
        subSteps: [
          {
            expression: '40 * 53',
            result: 2120,
            explanation: 'First partial product',
            depth: 1
          },
          {
            expression: '7 * 53',
            result: 371,
            explanation: 'Second partial product',
            depth: 1
          }
        ]
      };

      const result = validateStep(step);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid sub-steps', () => {
      const step: CalculationStep = {
        expression: '2120 + 371',
        result: 2491,
        explanation: 'Add partial products',
        depth: 0,
        subSteps: [
          {
            expression: '40 * 53',
            result: 2000, // Wrong!
            explanation: 'First partial product',
            depth: 1
          }
        ]
      };

      const result = validateStep(step);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Sub-step 1');
      expect(result.errors[0]).toContain('invalid');
    });

    it('should propagate warnings from sub-steps', () => {
      const step: CalculationStep = {
        expression: '2120 + 371',
        result: 2491,
        explanation: 'Add partial products',
        depth: 0,
        subSteps: [
          {
            expression: '40 * 53',
            result: 2120,
            explanation: '', // Missing explanation
            depth: 1
          }
        ]
      };

      const result = validateStep(step);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Sub-step 1');
    });

    it('should recursively validate nested sub-steps', () => {
      const step: CalculationStep = {
        expression: '2491',
        result: 2491,
        explanation: 'Final answer',
        depth: 0,
        subSteps: [
          {
            expression: '2120 + 371',
            result: 2491,
            explanation: 'Add partials',
            depth: 1,
            subSteps: [
              {
                expression: '40 * 53',
                result: 2120,
                explanation: 'First partial',
                depth: 2
              },
              {
                expression: '7 * 53',
                result: 300, // Wrong! Should be 371
                explanation: 'Second partial',
                depth: 2
              }
            ]
          }
        ]
      };

      const result = validateStep(step);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Sub-step');
    });
  });

  describe('floating point tolerance', () => {
    it('should accept results within tolerance', () => {
      const step: CalculationStep = {
        expression: '10 / 3 * 3',
        result: 10,
        explanation: 'Division and multiplication',
        depth: 0
      };

      const result = validateStep(step);

      // This should pass despite floating-point imprecision
      expect(result.valid).toBe(true);
    });

    it('should reject results outside tolerance', () => {
      const step: CalculationStep = {
        expression: '40 * 53',
        result: 2120.1, // Off by more than tolerance
        explanation: 'Multiply',
        depth: 0
      };

      const result = validateStep(step);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('evaluates to');
    });
  });
});
