/**
 * Tests for Squaring-End-5 multiplication method.
 * @module core/methods/__tests__/squaring-end-5
 */

import { describe, it, expect } from 'vitest';
import { SquaringEnd5Method } from '../squaring-end-5';
import { MethodName } from '../../../types';

describe('SquaringEnd5Method', () => {
  const method = new SquaringEnd5Method();

  describe('basic properties', () => {
    it('should have correct name and display name', () => {
      expect(method.name).toBe(MethodName.SquaringEndIn5);
      expect(method.displayName).toBe('Squaring Numbers Ending in 5');
    });
  });

  describe('isApplicable', () => {
    it('should return true for squaring numbers ending in 5', () => {
      expect(method.isApplicable(15, 15)).toBe(true);
      expect(method.isApplicable(25, 25)).toBe(true);
      expect(method.isApplicable(35, 35)).toBe(true);
      expect(method.isApplicable(95, 95)).toBe(true);
      expect(method.isApplicable(105, 105)).toBe(true);
    });

    it('should return false when numbers are different', () => {
      expect(method.isApplicable(15, 25)).toBe(false);
      expect(method.isApplicable(25, 35)).toBe(false);
    });

    it('should return false for numbers not ending in 5', () => {
      expect(method.isApplicable(14, 14)).toBe(false);
      expect(method.isApplicable(16, 16)).toBe(false);
      expect(method.isApplicable(20, 20)).toBe(false);
    });

    it('should handle negative numbers', () => {
      expect(method.isApplicable(-15, -15)).toBe(true);
      expect(method.isApplicable(-25, -25)).toBe(true);
    });

    it('should return false when only one is negative', () => {
      // Squaring requires num1 === num2, but -15 !== 15
      expect(method.isApplicable(-15, 15)).toBe(false);
    });

    it('should return true for 5 itself (5 ends in 5)', () => {
      // 5² = 25, and the formula works: 0×1=0, append 25 = 25
      expect(method.isApplicable(5, 5)).toBe(true);
    });
  });

  describe('generateSolution', () => {
    it('should solve 5² = 25', () => {
      const solution = method.generateSolution(5, 5);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(25);
    });

    it('should solve 15² = 225', () => {
      const solution = method.generateSolution(15, 15);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(225);
    });

    it('should solve 25² = 625', () => {
      const solution = method.generateSolution(25, 25);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(625);
    });

    it('should solve 35² = 1225', () => {
      const solution = method.generateSolution(35, 35);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(1225);
    });

    it('should solve 45² = 2025', () => {
      const solution = method.generateSolution(45, 45);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(2025);
    });

    it('should solve 55² = 3025', () => {
      const solution = method.generateSolution(55, 55);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(3025);
    });

    it('should solve 65² = 4225', () => {
      const solution = method.generateSolution(65, 65);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(4225);
    });

    it('should solve 75² = 5625', () => {
      const solution = method.generateSolution(75, 75);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(5625);
    });

    it('should solve 85² = 7225', () => {
      const solution = method.generateSolution(85, 85);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(7225);
    });

    it('should solve 95² = 9025', () => {
      const solution = method.generateSolution(95, 95);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(9025);
    });

    it('should solve 105² = 11025', () => {
      const solution = method.generateSolution(105, 105);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(11025);
    });

    it('should solve 125² = 15625', () => {
      const solution = method.generateSolution(125, 125);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1].result).toBe(15625);
    });

    describe('negative numbers', () => {
      it('should handle squaring negative numbers (result is always positive)', () => {
        const solution = method.generateSolution(-15, -15);
        expect(solution.validated).toBe(true);
        // (-15)² = 225
        expect(solution.steps[solution.steps.length - 1].result).toBe(225);
      });

      it('should handle -25² = 625', () => {
        const solution = method.generateSolution(-25, -25);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(625);
      });

      it('should handle -45² = 2025', () => {
        const solution = method.generateSolution(-45, -45);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(2025);
      });
    });

    describe('step verification', () => {
      it('should include the n×(n+1) intermediate step', () => {
        const solution = method.generateSolution(25, 25);
        // For 25²: n=2, so step should show 2×3=6
        const intermediateStep = solution.steps.find(s => s.expression.includes('2 * 3'));
        expect(intermediateStep).toBeDefined();
        expect(intermediateStep?.result).toBe(6);
      });

      it('should include the append-25 step', () => {
        const solution = method.generateSolution(25, 25);
        // Final step should show 6*100 + 25 = 625
        const appendStep = solution.steps.find(s => s.expression.includes('100 + 25'));
        expect(appendStep).toBeDefined();
        expect(appendStep?.result).toBe(625);
      });
    });
  });

  describe('computeCost', () => {
    it('should have very low cost for this method', () => {
      const cost = method.computeCost(25, 25);
      expect(cost).toBeLessThan(4);
    });

    it('should have consistent cost across different values', () => {
      // Cost should be similar regardless of the specific number
      const cost15 = method.computeCost(15, 15);
      const cost95 = method.computeCost(95, 95);
      expect(Math.abs(cost15 - cost95)).toBeLessThan(2);
    });
  });

  describe('qualityScore', () => {
    it('should return high quality when applicable', () => {
      const score = method.qualityScore(25, 25);
      expect(score).toBeGreaterThan(0.9);
    });

    it('should return 0 when not applicable', () => {
      expect(method.qualityScore(25, 26)).toBe(0);
      expect(method.qualityScore(24, 24)).toBe(0);
    });
  });

  describe('generateStudyContent', () => {
    it('should provide complete study content', () => {
      const content = method.generateStudyContent();
      expect(content.method).toBe(MethodName.SquaringEndIn5);
      expect(content.introduction).toBeDefined();
      expect(content.mathematicalFoundation).toBeDefined();
      expect(content.whenToUse.length).toBeGreaterThan(0);
      expect(content.commonMistakes.length).toBeGreaterThan(0);
    });
  });
});
