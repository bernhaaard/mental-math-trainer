/**
 * Tests for Near-100 calculation method.
 * @module core/methods/__tests__/near-100
 */

import { describe, it, expect } from 'vitest';
import { Near100Method } from '../near-100';
import { MethodName } from '../../../types';

describe('Near100Method', () => {
  const method = new Near100Method();

  describe('metadata', () => {
    it('should have correct name', () => {
      expect(method.name).toBe(MethodName.Near100);
    });

    it('should have correct display name', () => {
      expect(method.displayName).toBe('Near 100');
    });
  });

  describe('isApplicable', () => {
    it('should be applicable for numbers close to 100', () => {
      expect(method.isApplicable(97, 103)).toBe(true);
      expect(method.isApplicable(94, 97)).toBe(true);
      expect(method.isApplicable(98, 102)).toBe(true);
      expect(method.isApplicable(105, 108)).toBe(true);
    });

    it('should be applicable at boundary (within 15 of 100)', () => {
      expect(method.isApplicable(85, 115)).toBe(true);
      expect(method.isApplicable(86, 114)).toBe(true);
    });

    it('should not be applicable for numbers far from 100', () => {
      expect(method.isApplicable(47, 53)).toBe(false);
      expect(method.isApplicable(84, 116)).toBe(false);
      expect(method.isApplicable(50, 100)).toBe(false);
    });

    it('should handle negative numbers near 100', () => {
      expect(method.isApplicable(-97, -103)).toBe(true);
      expect(method.isApplicable(-98, -102)).toBe(true);
    });
  });

  describe('generateSolution', () => {
    it('should correctly solve 97 × 103 = 9991 (symmetric case)', () => {
      const solution = method.generateSolution(97, 103);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(9991);
    });

    it('should correctly solve 94 × 97 = 9118 (both below 100)', () => {
      const solution = method.generateSolution(94, 97);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(9118);
    });

    it('should correctly solve 104 × 107 = 11128 (both above 100)', () => {
      const solution = method.generateSolution(104, 107);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(11128);
    });

    it('should correctly solve 98 × 102 = 9996', () => {
      const solution = method.generateSolution(98, 102);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(9996);
    });

    it('should correctly solve 95 × 95 = 9025', () => {
      const solution = method.generateSolution(95, 95);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(9025);
    });

    it('should handle negative numbers', () => {
      const solution = method.generateSolution(-97, 103);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(-9991);
    });

    it('should handle both numbers negative', () => {
      const solution = method.generateSolution(-97, -103);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(9991); // Negative * negative = positive
    });

    it('should have proper step structure', () => {
      const solution = method.generateSolution(97, 103);

      expect(solution.steps.length).toBeGreaterThan(2);
      solution.steps.forEach(step => {
        expect(step.expression).toBeTruthy();
        expect(step.explanation).toBeTruthy();
        expect(typeof step.result).toBe('number');
      });
    });

    it('should include sub-steps for intermediate calculations', () => {
      const solution = method.generateSolution(97, 103);

      const stepWithSub = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);
      expect(stepWithSub).toBeDefined();
    });
  });

  describe('computeCost', () => {
    it('should return lower cost for numbers very close to 100', () => {
      const cost99 = method.computeCost(99, 101);
      const cost95 = method.computeCost(95, 105);

      expect(cost99).toBeLessThan(cost95);
    });

    it('should return positive costs', () => {
      const cost = method.computeCost(97, 103);
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('qualityScore', () => {
    it('should give highest quality for numbers within 5 of 100', () => {
      const quality = method.qualityScore(98, 102);
      expect(quality).toBe(0.95);
    });

    it('should give high quality for numbers within 10 of 100', () => {
      const quality = method.qualityScore(92, 108);
      expect(quality).toBe(0.85);
    });

    it('should give reasonable quality for other near-100 numbers', () => {
      const quality = method.qualityScore(87, 113);
      expect(quality).toBe(0.7);
    });
  });

  describe('known solutions', () => {
    const knownSolutions: Array<{ num1: number; num2: number; answer: number }> = [
      { num1: 97, num2: 103, answer: 9991 },
      { num1: 94, num2: 97, answer: 9118 },
      { num1: 98, num2: 102, answer: 9996 },
      { num1: 104, num2: 107, answer: 11128 },
      { num1: 95, num2: 95, answer: 9025 },
      { num1: 99, num2: 99, answer: 9801 },
      { num1: 101, num2: 101, answer: 10201 },
      { num1: 96, num2: 104, answer: 9984 },
      { num1: 93, num2: 107, answer: 9951 },
      { num1: 88, num2: 112, answer: 9856 }
    ];

    knownSolutions.forEach(({ num1, num2, answer }) => {
      it(`should correctly solve ${num1} × ${num2} = ${answer}`, () => {
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

      expect(content.method).toBe(MethodName.Near100);
      expect(content.introduction).toBeTruthy();
      expect(content.mathematicalFoundation).toBeTruthy();
      expect(content.whenToUse).toBeInstanceOf(Array);
      expect(content.whenToUse.length).toBeGreaterThan(0);
    });
  });
});
