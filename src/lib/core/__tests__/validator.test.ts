/**
 * Solution Validator Tests
 * @module core/__tests__/validator.test
 */

import { describe, it, expect } from 'vitest';
import { SolutionValidator } from '../validator';
import { MethodName, type Solution } from '../../types';
import { KNOWN_SOLUTIONS } from './fixtures/known-solutions';

describe('SolutionValidator', () => {
  describe('validateSolution', () => {
    it('should validate a correct solution', () => {
      const solution: Solution = {
        method: MethodName.DifferenceSquares,
        optimalReason: 'Numbers are equidistant from 50',
        steps: [
          {
            expression: '(50 - 3) * (50 + 3)',
            result: 2491,
            explanation: 'Apply difference of squares formula',
            depth: 0
          },
          {
            expression: '50 * 50 - 3 * 3',
            result: 2491,
            explanation: 'Expand using a² - b²',
            depth: 0
          },
          {
            expression: '2500 - 9',
            result: 2491,
            explanation: 'Calculate final result',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.validateSolution(47, 53, solution);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect incorrect final answer', () => {
      const solution: Solution = {
        method: MethodName.Distributive,
        optimalReason: 'Test',
        steps: [
          {
            expression: '47 * 53',
            result: 2500, // Wrong! Should be 2491
            explanation: 'Incorrect calculation',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.validateSolution(47, 53, solution);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('does not match direct multiplication');
      expect(result.errors[0]).toContain('2491');
    });

    it('should detect invalid intermediate step', () => {
      const solution: Solution = {
        method: MethodName.Distributive,
        optimalReason: 'Test',
        steps: [
          {
            expression: '(40 + 7) * 53',
            result: 2491,
            explanation: 'Partition',
            depth: 0
          },
          {
            expression: '40 * 53 + 7 * 53',
            result: 2000, // Wrong intermediate calculation
            explanation: 'Distribute',
            depth: 0
          },
          {
            expression: '2120 + 371',
            result: 2491,
            explanation: 'Add',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.validateSolution(47, 53, solution);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('Step 2'))).toBe(true);
    });

    it('should reject solution with no steps', () => {
      const solution: Solution = {
        method: MethodName.Distributive,
        optimalReason: 'Test',
        steps: [],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.validateSolution(47, 53, solution);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('no steps');
    });

    it('should validate all steps in sequence', () => {
      const solution: Solution = {
        method: MethodName.Distributive,
        optimalReason: 'Test',
        steps: [
          {
            expression: '(40 + 7) * 53',
            result: 2491,
            explanation: 'Partition first number',
            depth: 0
          },
          {
            expression: '40 * 53 + 7 * 53',
            result: 2491,
            explanation: 'Apply distributive property',
            depth: 0
          },
          {
            expression: '2120 + 371',
            result: 2491,
            explanation: 'Add partial products',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.validateSolution(47, 53, solution);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about logical progression issues', () => {
      const solution: Solution = {
        method: MethodName.Distributive,
        optimalReason: 'Test',
        steps: [
          {
            expression: '40 * 53',
            result: 2120,
            explanation: 'First partial',
            depth: 0
          },
          {
            expression: '7 * 53', // Doesn't reference previous result
            result: 371,
            explanation: 'Second partial',
            depth: 0
          },
          {
            expression: '2120 + 371',
            result: 2491,
            explanation: 'Add',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.validateSolution(47, 53, solution);

      expect(result.valid).toBe(true); // Still mathematically valid
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('may not follow logically'))).toBe(true);
    });
  });

  describe('crossValidate', () => {
    it('should confirm multiple methods give same answer', () => {
      const solution1: Solution = {
        method: MethodName.Distributive,
        optimalReason: '',
        steps: [
          {
            expression: '47 * 53',
            result: 2491,
            explanation: 'Direct multiplication',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const solution2: Solution = {
        method: MethodName.DifferenceSquares,
        optimalReason: '',
        steps: [
          {
            expression: '50 * 50 - 3 * 3',
            result: 2491,
            explanation: 'Difference of squares',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.crossValidate(47, 53, [solution1, solution2]);

      expect(result).toBe(true);
    });

    it('should detect inconsistent answers', () => {
      const solution1: Solution = {
        method: MethodName.Distributive,
        optimalReason: '',
        steps: [
          {
            expression: '47 * 53',
            result: 2491,
            explanation: 'Correct',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const solution2: Solution = {
        method: MethodName.DifferenceSquares,
        optimalReason: '',
        steps: [
          {
            expression: '50 * 50 - 3 * 3',
            result: 2500, // Wrong!
            explanation: 'Incorrect',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.crossValidate(47, 53, [solution1, solution2]);

      expect(result).toBe(false);
    });

    it('should return false for empty solutions array', () => {
      const result = SolutionValidator.crossValidate(47, 53, []);
      expect(result).toBe(false);
    });

    it('should return false if first solution is wrong', () => {
      const solution: Solution = {
        method: MethodName.Distributive,
        optimalReason: '',
        steps: [
          {
            expression: '47 * 53',
            result: 2500, // Wrong!
            explanation: 'Incorrect',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.crossValidate(47, 53, [solution]);

      expect(result).toBe(false);
    });

    it('should handle solutions with no steps', () => {
      const solution: Solution = {
        method: MethodName.Distributive,
        optimalReason: '',
        steps: [],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.crossValidate(47, 53, [solution]);

      expect(result).toBe(false);
    });
  });

  describe('known solutions', () => {
    // Test a sample of known solutions to ensure validator works correctly
    const sampleSolutions = KNOWN_SOLUTIONS.slice(0, 5);

    sampleSolutions.forEach(({ num1, num2, answer, method, description }) => {
      it(`should validate ${description || `${num1} × ${num2} = ${answer}`}`, () => {
        const solution: Solution = {
          method,
          optimalReason: 'Test case',
          steps: [
            {
              expression: `${num1} * ${num2}`,
              result: answer,
              explanation: description || 'Test calculation',
              depth: 0
            }
          ],
          alternatives: [],
          validated: false,
          validationErrors: []
        };

        const result = SolutionValidator.validateSolution(num1, num2, solution);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      const solution: Solution = {
        method: MethodName.Distributive,
        optimalReason: 'Test',
        steps: [
          {
            expression: '-47 * 53',
            result: -2491,
            explanation: 'Negative multiplication',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.validateSolution(-47, 53, solution);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle multiplication by zero', () => {
      const solution: Solution = {
        method: MethodName.Distributive,
        optimalReason: 'Test',
        steps: [
          {
            expression: '47 * 0',
            result: 0,
            explanation: 'Multiply by zero',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.validateSolution(47, 0, solution);

      expect(result.valid).toBe(true);
    });

    it('should handle multiplication by one', () => {
      const solution: Solution = {
        method: MethodName.Distributive,
        optimalReason: 'Test',
        steps: [
          {
            expression: '47 * 1',
            result: 47,
            explanation: 'Multiply by one',
            depth: 0
          }
        ],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.validateSolution(47, 1, solution);

      expect(result.valid).toBe(true);
    });
  });
});
