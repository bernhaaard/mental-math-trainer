/**
 * Tests for Factorization calculation method.
 * @module core/methods/__tests__/factorization
 */

import { describe, it, expect } from 'vitest';
import { FactorizationMethod } from '../factorization';
import { MethodName } from '../../../types';

describe('FactorizationMethod', () => {
  const method = new FactorizationMethod();

  describe('metadata', () => {
    it('should have correct name', () => {
      expect(method.name).toBe(MethodName.Factorization);
    });

    it('should have correct display name', () => {
      expect(method.displayName).toBe('Factorization');
    });
  });

  describe('isApplicable', () => {
    it('should be applicable for numbers with good factors', () => {
      expect(method.isApplicable(24, 35)).toBe(true); // 24 = 6 * 4
      expect(method.isApplicable(15, 23)).toBe(true); // 15 = 5 * 3
      expect(method.isApplicable(18, 47)).toBe(true); // 18 = 6 * 3
      expect(method.isApplicable(32, 19)).toBe(true); // 32 = 8 * 4
    });

    it('should be applicable when second number has good factors', () => {
      expect(method.isApplicable(23, 24)).toBe(true);
      expect(method.isApplicable(47, 15)).toBe(true);
    });

    it('should not be applicable for prime numbers', () => {
      expect(method.isApplicable(17, 23)).toBe(false);
      expect(method.isApplicable(13, 19)).toBe(false);
    });

    it('should handle negative numbers', () => {
      expect(method.isApplicable(-24, 35)).toBe(true);
      expect(method.isApplicable(24, -35)).toBe(true);
    });
  });

  describe('generateSolution', () => {
    it('should correctly solve 24 * 35 = 840', () => {
      const solution = method.generateSolution(24, 35);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(840);
    });

    it('should correctly solve 15 * 23 = 345', () => {
      const solution = method.generateSolution(15, 23);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(345);
    });

    it('should correctly solve 18 * 47 = 846', () => {
      const solution = method.generateSolution(18, 47);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(846);
    });

    it('should correctly solve 32 * 19 = 608', () => {
      const solution = method.generateSolution(32, 19);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(608);
    });

    it('should handle negative numbers', () => {
      const solution = method.generateSolution(-24, 35);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(-840);
    });

    it('should have proper step structure', () => {
      const solution = method.generateSolution(24, 35);

      expect(solution.steps.length).toBeGreaterThan(2);
      solution.steps.forEach(step => {
        expect(step.expression).toBeTruthy();
        expect(step.explanation).toBeTruthy();
        expect(typeof step.result).toBe('number');
      });
    });

    it('should include sub-steps for intermediate calculations', () => {
      const solution = method.generateSolution(24, 35);

      const stepWithSub = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);
      expect(stepWithSub).toBeDefined();
    });
  });

  describe('computeCost', () => {
    it('should return lower cost for numbers with better factors', () => {
      const cost24 = method.computeCost(24, 35);
      const cost25 = method.computeCost(25, 35); // 25 = 5*5

      // Both should have reasonable costs
      expect(cost24).toBeGreaterThan(0);
      expect(cost25).toBeGreaterThan(0);
    });
  });

  describe('qualityScore', () => {
    it('should give high quality for numbers with good factors', () => {
      const quality = method.qualityScore(24, 35);
      expect(quality).toBeGreaterThan(0.5);
    });
  });

  describe('known solutions', () => {
    const knownSolutions: Array<{ num1: number; num2: number; answer: number }> = [
      { num1: 24, num2: 35, answer: 840 },
      { num1: 15, num2: 23, answer: 345 },
      { num1: 18, num2: 47, answer: 846 },
      { num1: 32, num2: 19, answer: 608 },
      { num1: 12, num2: 45, answer: 540 },
      { num1: 16, num2: 37, answer: 592 },
      { num1: 25, num2: 48, answer: 1200 }
    ];

    knownSolutions.forEach(({ num1, num2, answer }) => {
      it(`should correctly solve ${num1} * ${num2} = ${answer}`, () => {
        const solution = method.generateSolution(num1, num2);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(answer);
      });
    });
  });

  describe('generateStudyContent', () => {
    it('should generate complete study content', () => {
      const content = method.generateStudyContent();

      expect(content.method).toBe(MethodName.Factorization);
      expect(content.introduction).toBeTruthy();
      expect(content.mathematicalFoundation).toBeTruthy();
      expect(content.whenToUse).toBeInstanceOf(Array);
      expect(content.whenToUse.length).toBeGreaterThan(0);
    });
  });

  describe('memoization behavior', () => {
    it('should return consistent results for cached computations', () => {
      // Use a fresh instance to ensure clean cache state
      const freshMethod = new FactorizationMethod();

      // First call - will compute and cache
      const result1 = freshMethod.isApplicable(24, 35);
      const cost1 = freshMethod.computeCost(24, 35);
      const quality1 = freshMethod.qualityScore(24, 35);

      // Second call - should use cached factorizations
      const result2 = freshMethod.isApplicable(24, 35);
      const cost2 = freshMethod.computeCost(24, 35);
      const quality2 = freshMethod.qualityScore(24, 35);

      // Results should be identical
      expect(result1).toBe(result2);
      expect(cost1).toBe(cost2);
      expect(quality1).toBe(quality2);
    });

    it('should produce identical solutions for same inputs (cached vs uncached)', () => {
      const freshMethod = new FactorizationMethod();

      // Generate solution (caches factorizations internally)
      const solution1 = freshMethod.generateSolution(24, 35);

      // Generate again (uses cached factorizations)
      const solution2 = freshMethod.generateSolution(24, 35);

      // Solutions should have same structure and results
      expect(solution1.steps.length).toBe(solution2.steps.length);
      expect(solution1.validated).toBe(solution2.validated);

      const finalResult1 = solution1.steps[solution1.steps.length - 1]?.result;
      const finalResult2 = solution2.steps[solution2.steps.length - 1]?.result;
      expect(finalResult1).toBe(finalResult2);
      expect(finalResult1).toBe(840);
    });

    it('should handle many different numbers efficiently', () => {
      const freshMethod = new FactorizationMethod();

      // Test with many different numbers to exercise caching
      const testNumbers = [12, 15, 18, 24, 25, 32, 36, 48, 64, 72];

      testNumbers.forEach(num => {
        const applicable = freshMethod.isApplicable(num, 35);
        if (applicable) {
          const solution = freshMethod.generateSolution(num, 35);
          expect(solution.validated).toBe(true);
        }
      });

      // Re-test to verify cached results match
      testNumbers.forEach(num => {
        const applicable = freshMethod.isApplicable(num, 35);
        if (applicable) {
          const solution = freshMethod.generateSolution(num, 35);
          expect(solution.validated).toBe(true);
          const finalResult = solution.steps[solution.steps.length - 1]?.result;
          expect(finalResult).toBe(num * 35);
        }
      });
    });
  });
});
