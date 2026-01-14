/**
 * Tests for the Near Squares calculation method.
 * @module core/methods/__tests__/near-squares.test
 *
 * Tests the formula: n x (n + k) = n^2 + k * n
 */

import { describe, it, expect } from 'vitest';
import { NearSquaresMethod } from '../near-squares';
import { MethodName } from '../../../types';
import { SolutionValidator } from '../../validator';

describe('NearSquaresMethod', () => {
  const method = new NearSquaresMethod();

  describe('method properties', () => {
    it('should have correct name', () => {
      expect(method.name).toBe(MethodName.NearSquares);
    });

    it('should have correct display name', () => {
      expect(method.displayName).toBe('Near Squares');
    });
  });

  describe('isApplicable', () => {
    it('should return true when numbers differ by 1', () => {
      expect(method.isApplicable(12, 13)).toBe(true);
      expect(method.isApplicable(25, 26)).toBe(true);
    });

    it('should return true when numbers differ by 2', () => {
      expect(method.isApplicable(12, 14)).toBe(true);
      expect(method.isApplicable(50, 52)).toBe(true);
    });

    it('should return true when numbers differ by 3', () => {
      expect(method.isApplicable(12, 15)).toBe(true);
    });

    it('should return true when numbers differ by 4', () => {
      expect(method.isApplicable(12, 16)).toBe(true);
    });

    it('should return true when numbers differ by 5 (max)', () => {
      expect(method.isApplicable(12, 17)).toBe(true);
      expect(method.isApplicable(50, 55)).toBe(true);
    });

    it('should return false when numbers differ by more than 5', () => {
      expect(method.isApplicable(12, 18)).toBe(false);
      expect(method.isApplicable(12, 20)).toBe(false);
      expect(method.isApplicable(50, 60)).toBe(false);
    });

    it('should return false for same numbers (use Squaring instead)', () => {
      expect(method.isApplicable(12, 12)).toBe(false);
      expect(method.isApplicable(25, 25)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(method.isApplicable(-12, 14)).toBe(false);
      expect(method.isApplicable(12, -14)).toBe(false);
      expect(method.isApplicable(-12, -14)).toBe(false);
    });

    it('should return false for zero', () => {
      expect(method.isApplicable(0, 5)).toBe(false);
      expect(method.isApplicable(5, 0)).toBe(false);
    });

    it('should handle reversed order', () => {
      expect(method.isApplicable(14, 12)).toBe(true);
      expect(method.isApplicable(53, 50)).toBe(true);
    });
  });

  describe('computeCost', () => {
    it('should have lower cost for nice squares', () => {
      // 12^2 = 144 (nice square)
      const costNice = method.computeCost(12, 14);
      // 23^2 = 529 (not nice square)
      const costNotNice = method.computeCost(23, 25);
      expect(costNice).toBeLessThan(costNotNice);
    });

    it('should have lower cost for multiples of 10', () => {
      const costMult10 = method.computeCost(50, 52);
      const costOther = method.computeCost(47, 49);
      expect(costMult10).toBeLessThan(costOther);
    });

    it('should have lower cost for multiples of 5', () => {
      const costMult5 = method.computeCost(25, 27);
      const costOther = method.computeCost(27, 29);
      expect(costMult5).toBeLessThan(costOther);
    });

    it('should have higher cost for larger k', () => {
      const costK1 = method.computeCost(12, 13);
      const costK5 = method.computeCost(12, 17);
      expect(costK1).toBeLessThan(costK5);
    });

    it('should have higher cost for larger numbers', () => {
      const costSmall = method.computeCost(12, 14);
      const costLarge = method.computeCost(112, 114);
      expect(costSmall).toBeLessThan(costLarge);
    });
  });

  describe('qualityScore', () => {
    it('should return high score for nice squares with small k', () => {
      // 12^2 = 144 (nice), k = 2
      expect(method.qualityScore(12, 14)).toBeGreaterThanOrEqual(0.75);
    });

    it('should return high score for multiples of 10', () => {
      expect(method.qualityScore(50, 52)).toBeGreaterThanOrEqual(0.85);
    });

    it('should return high score for multiples of 5', () => {
      expect(method.qualityScore(25, 27)).toBeGreaterThanOrEqual(0.85);
    });

    it('should return lower score for larger k', () => {
      const scoreK2 = method.qualityScore(12, 14);
      const scoreK5 = method.qualityScore(12, 17);
      expect(scoreK2).toBeGreaterThan(scoreK5);
    });

    it('should return score between 0 and 1', () => {
      const score = method.qualityScore(12, 14);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('generateSolution', () => {
    it('should generate valid solution for 12 x 14', () => {
      const solution = method.generateSolution(12, 14);
      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      // Verify mathematical correctness
      const lastStep = solution.steps[solution.steps.length - 1];
      expect(lastStep?.result).toBe(168); // 12 * 14 = 168
    });

    it('should generate valid solution for 25 x 27', () => {
      const solution = method.generateSolution(25, 27);
      expect(solution.validated).toBe(true);

      // 25^2 + 2*25 = 625 + 50 = 675
      const lastStep = solution.steps[solution.steps.length - 1];
      expect(lastStep?.result).toBe(675);
    });

    it('should generate valid solution for 50 x 53', () => {
      const solution = method.generateSolution(50, 53);
      expect(solution.validated).toBe(true);

      // 50^2 + 3*50 = 2500 + 150 = 2650
      const lastStep = solution.steps[solution.steps.length - 1];
      expect(lastStep?.result).toBe(2650);
    });

    it('should handle reversed order', () => {
      const solution = method.generateSolution(14, 12);
      expect(solution.validated).toBe(true);
      const lastStep = solution.steps[solution.steps.length - 1];
      expect(lastStep?.result).toBe(168);
    });

    it('should have correct method name in solution', () => {
      const solution = method.generateSolution(12, 14);
      expect(solution.method).toBe(MethodName.NearSquares);
    });

    it('should have at least 4 steps', () => {
      const solution = method.generateSolution(12, 14);
      expect(solution.steps.length).toBeGreaterThanOrEqual(4);
    });

    it('should include substeps for square and product', () => {
      const solution = method.generateSolution(12, 14);
      const stepWithSubsteps = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);
      expect(stepWithSubsteps).toBeDefined();
      expect(stepWithSubsteps?.subSteps?.length).toBe(2);
    });

    it('should include square explanation in optimalReason', () => {
      const solution = method.generateSolution(12, 14);
      expect(solution.optimalReason).toContain('12');
      expect(solution.optimalReason).toContain('2');
    });
  });

  describe('generateStudyContent', () => {
    it('should return complete study content', () => {
      const content = method.generateStudyContent();
      expect(content.method).toBe(MethodName.NearSquares);
      expect(content.introduction.length).toBeGreaterThan(0);
      expect(content.mathematicalFoundation.length).toBeGreaterThan(0);
      expect(content.deepDiveContent.length).toBeGreaterThan(0);
    });

    it('should include when to use', () => {
      const content = method.generateStudyContent();
      expect(content.whenToUse.length).toBeGreaterThan(0);
    });

    it('should include when not to use', () => {
      const content = method.generateStudyContent();
      expect(content.whenNotToUse.length).toBeGreaterThan(0);
    });

    it('should include common mistakes', () => {
      const content = method.generateStudyContent();
      expect(content.commonMistakes.length).toBeGreaterThan(0);
    });

    it('should include practice strategies', () => {
      const content = method.generateStudyContent();
      expect(content.practiceStrategies.length).toBeGreaterThan(0);
    });

    it('should include prerequisites', () => {
      const content = method.generateStudyContent();
      expect(content.prerequisites).toContain(MethodName.Squaring);
      expect(content.prerequisites).toContain(MethodName.Distributive);
    });

    it('should include next methods', () => {
      const content = method.generateStudyContent();
      expect(content.nextMethods).toContain(MethodName.DifferenceSquares);
    });

    it('should mention near or squares in introduction', () => {
      const content = method.generateStudyContent();
      expect(content.introduction.toLowerCase()).toContain('near');
    });
  });

  describe('comprehensive validation', () => {
    const testCases = [
      { num1: 5, num2: 6 },
      { num1: 8, num2: 10 },
      { num1: 10, num2: 12 },
      { num1: 12, num2: 14 },
      { num1: 15, num2: 17 },
      { num1: 20, num2: 22 },
      { num1: 25, num2: 27 },
      { num1: 30, num2: 33 },
      { num1: 50, num2: 53 },
      { num1: 100, num2: 103 }
    ];

    testCases.forEach(({ num1, num2 }) => {
      it(`should generate valid solution for ${num1} x ${num2}`, () => {
        const solution = method.generateSolution(num1, num2);
        expect(solution.validated).toBe(true);

        // Independently verify the formula: n^2 + k*n
        const n = Math.min(num1, num2);
        const k = Math.abs(num1 - num2);
        const expected = n * n + k * n;
        expect(expected).toBe(num1 * num2);

        const lastStep = solution.steps[solution.steps.length - 1];
        expect(lastStep?.result).toBe(expected);
      });
    });
  });

  describe('formula verification', () => {
    it('should correctly apply n x (n+k) = n^2 + k*n formula', () => {
      // Test with various values
      const testCases = [
        { n: 12, k: 2 },
        { n: 25, k: 2 },
        { n: 50, k: 3 },
        { n: 100, k: 5 }
      ];

      testCases.forEach(({ n, k }) => {
        const num1 = n;
        const num2 = n + k;

        // Verify formula algebraically
        const directProduct = num1 * num2;
        const nearSquaresFormula = n * n + k * n;

        expect(nearSquaresFormula).toBe(directProduct);

        // Verify method produces correct result
        const solution = method.generateSolution(num1, num2);
        const lastStep = solution.steps[solution.steps.length - 1];
        expect(lastStep?.result).toBe(directProduct);
      });
    });

    it('should pass SolutionValidator for generated solutions', () => {
      const num1 = 12;
      const num2 = 14;
      const solution = method.generateSolution(num1, num2);
      const validation = SolutionValidator.validateSolution(num1, num2, solution);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });
});
