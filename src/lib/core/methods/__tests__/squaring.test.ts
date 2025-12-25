/**
 * Tests for Squaring calculation method.
 * @module core/methods/__tests__/squaring
 */

import { describe, it, expect } from 'vitest';
import { SquaringMethod } from '../squaring';
import { MethodName } from '../../../types';

describe('SquaringMethod', () => {
  const method = new SquaringMethod();

  describe('metadata', () => {
    it('should have correct name', () => {
      expect(method.name).toBe(MethodName.Squaring);
    });

    it('should have correct display name', () => {
      expect(method.displayName).toBe('Squaring');
    });
  });

  describe('isApplicable', () => {
    it('should be applicable when both numbers are the same', () => {
      expect(method.isApplicable(47, 47)).toBe(true);
      expect(method.isApplicable(73, 73)).toBe(true);
      expect(method.isApplicable(25, 25)).toBe(true);
      expect(method.isApplicable(99, 99)).toBe(true);
    });

    it('should not be applicable when numbers differ', () => {
      expect(method.isApplicable(47, 53)).toBe(false);
      expect(method.isApplicable(23, 24)).toBe(false);
      expect(method.isApplicable(100, 99)).toBe(false);
    });

    it('should handle negative numbers', () => {
      expect(method.isApplicable(-47, -47)).toBe(true);
      expect(method.isApplicable(-25, -25)).toBe(true);
    });

    it('should not be applicable for opposite signs', () => {
      expect(method.isApplicable(-47, 47)).toBe(false);
      expect(method.isApplicable(47, -47)).toBe(false);
    });
  });

  describe('generateSolution', () => {
    it('should correctly solve 47² = 2209', () => {
      const solution = method.generateSolution(47, 47);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(2209);
    });

    it('should correctly solve 73² = 5329', () => {
      const solution = method.generateSolution(73, 73);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(5329);
    });

    it('should correctly solve 25² = 625', () => {
      const solution = method.generateSolution(25, 25);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(625);
    });

    it('should correctly solve 98² = 9604', () => {
      const solution = method.generateSolution(98, 98);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(9604);
    });

    it('should handle negative numbers', () => {
      const solution = method.generateSolution(-47, -47);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(2209); // Negative * negative = positive
    });

    it('should have proper step structure', () => {
      const solution = method.generateSolution(47, 47);

      expect(solution.steps.length).toBeGreaterThan(2);
      solution.steps.forEach(step => {
        expect(step.expression).toBeTruthy();
        expect(step.explanation).toBeTruthy();
        expect(typeof step.result).toBe('number');
      });
    });

    it('should include sub-steps for intermediate calculations', () => {
      const solution = method.generateSolution(47, 47);

      const stepWithSub = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);
      expect(stepWithSub).toBeDefined();
    });

    it('should throw error when numbers differ', () => {
      expect(() => method.generateSolution(47, 53)).toThrow('Squaring method requires num1 === num2');
    });
  });

  describe('computeCost', () => {
    it('should return Infinity for non-matching numbers', () => {
      const cost = method.computeCost(47, 53);
      expect(cost).toBe(Infinity);
    });

    it('should return lower cost for numbers near round values', () => {
      const cost48 = method.computeCost(48, 48); // Near 50, diff = 2
      const cost43 = method.computeCost(43, 43); // Near 40, diff = 3

      // Both should have reasonable costs
      expect(cost48).toBeGreaterThan(0);
      expect(cost43).toBeGreaterThan(0);
    });
  });

  describe('qualityScore', () => {
    it('should return 0 for non-matching numbers', () => {
      const quality = method.qualityScore(47, 53);
      expect(quality).toBe(0);
    });

    it('should give high quality for numbers near round values', () => {
      const quality48 = method.qualityScore(48, 48); // diff = 2
      const quality47 = method.qualityScore(47, 47); // diff = 3

      expect(quality48).toBeGreaterThanOrEqual(0.8);
      expect(quality47).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('known solutions', () => {
    const knownSolutions: Array<{ n: number; answer: number }> = [
      { n: 11, answer: 121 },
      { n: 12, answer: 144 },
      { n: 15, answer: 225 },
      { n: 25, answer: 625 },
      { n: 33, answer: 1089 },
      { n: 47, answer: 2209 },
      { n: 52, answer: 2704 },
      { n: 73, answer: 5329 },
      { n: 85, answer: 7225 },
      { n: 98, answer: 9604 }
    ];

    knownSolutions.forEach(({ n, answer }) => {
      it(`should correctly solve ${n}² = ${answer}`, () => {
        const solution = method.generateSolution(n, n);

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

      expect(content.method).toBe(MethodName.Squaring);
      expect(content.introduction).toBeTruthy();
      expect(content.mathematicalFoundation).toBeTruthy();
      expect(content.whenToUse).toBeInstanceOf(Array);
      expect(content.whenToUse.length).toBeGreaterThan(0);
    });
  });
});
