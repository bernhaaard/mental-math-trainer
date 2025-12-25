/**
 * Tests for Distributive Property calculation method
 * @module core/methods/__tests__/distributive
 */

import { describe, it, expect } from 'vitest';
import { DistributiveMethod } from '../distributive';
import { MethodName } from '../../../types';

describe('DistributiveMethod', () => {
  const method = new DistributiveMethod();

  describe('metadata', () => {
    it('should have correct name and display name', () => {
      expect(method.name).toBe(MethodName.Distributive);
      expect(method.displayName).toBe('Distributive Property / Place Value Partition');
    });
  });

  describe('isApplicable', () => {
    it('should always be applicable', () => {
      expect(method.isApplicable(47, 53)).toBe(true);
      expect(method.isApplicable(1, 1)).toBe(true);
      expect(method.isApplicable(999999, 999999)).toBe(true);
      expect(method.isApplicable(12, 34)).toBe(true);
      expect(method.isApplicable(0, 100)).toBe(true);
    });

    it('should be applicable for negative numbers', () => {
      expect(method.isApplicable(-47, 53)).toBe(true);
      expect(method.isApplicable(47, -53)).toBe(true);
      expect(method.isApplicable(-47, -53)).toBe(true);
    });
  });

  describe('computeCost', () => {
    it('should calculate higher cost for larger numbers', () => {
      const cost1 = method.computeCost(12, 23);
      const cost2 = method.computeCost(123, 456);
      const cost3 = method.computeCost(1234, 5678);

      expect(cost2).toBeGreaterThan(cost1);
      expect(cost3).toBeGreaterThan(cost2);
    });

    it('should return positive cost values', () => {
      expect(method.computeCost(47, 53)).toBeGreaterThan(0);
      expect(method.computeCost(12, 15)).toBeGreaterThan(0);
    });

    it('should handle single-digit numbers', () => {
      const cost = method.computeCost(5, 7);
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(10);
    });
  });

  describe('qualityScore', () => {
    it('should return 0.5 for all inputs (general-purpose method)', () => {
      expect(method.qualityScore(47, 53)).toBe(0.5);
      expect(method.qualityScore(12, 34)).toBe(0.5);
      expect(method.qualityScore(100, 200)).toBe(0.5);
    });
  });

  describe('generateSolution - additive partition', () => {
    it('should correctly solve 23 × 47 using additive partition', () => {
      const solution = method.generateSolution(23, 47);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(1081);
      expect(solution.method).toBe(MethodName.Distributive);
    });

    it('should have proper step structure for additive partition', () => {
      const solution = method.generateSolution(23, 47);

      expect(solution.steps.length).toBeGreaterThan(2);

      // Each step should have required properties
      solution.steps.forEach(step => {
        expect(step.expression).toBeTruthy();
        expect(step.explanation).toBeTruthy();
        expect(typeof step.result).toBe('number');
        expect(typeof step.depth).toBe('number');
      });
    });
  });

  describe('generateSolution - subtractive partition', () => {
    it('should correctly solve 28 × 47 using subtractive partition', () => {
      const solution = method.generateSolution(28, 47);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(1316);

      // Should use (30 - 2) partition
      const firstStep = solution.steps[0];
      expect(firstStep?.expression).toContain('30');
      expect(firstStep?.expression).toContain('-');
    });

    it('should correctly solve 47 × 53 using subtractive partition', () => {
      const solution = method.generateSolution(47, 53);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(2491);

      // Should use (50 - 3) partition
      const firstStep = solution.steps[0];
      expect(firstStep?.expression).toContain('50');
      expect(firstStep?.expression).toContain('-');
    });

    it('should correctly solve 67 × 89 using subtractive partition', () => {
      const solution = method.generateSolution(67, 89);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(5963);

      // 67 should use (70 - 3) partition
      const firstStep = solution.steps[0];
      expect(firstStep?.expression).toContain('70');
      expect(firstStep?.expression).toContain('-');
    });
  });

  describe('generateSolution - negative numbers', () => {
    it('should handle negative first number', () => {
      const solution = method.generateSolution(-47, 53);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(-2491);
    });

    it('should handle negative second number', () => {
      const solution = method.generateSolution(47, -53);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(-2491);
    });

    it('should handle both numbers negative', () => {
      const solution = method.generateSolution(-47, -53);

      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(2491);
    });
  });

  describe('generateSolution - sub-steps', () => {
    it('should include sub-steps for intermediate calculations', () => {
      const solution = method.generateSolution(47, 53);

      // Find the step with sub-calculations
      const stepWithSub = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);
      expect(stepWithSub).toBeDefined();
      expect(stepWithSub!.subSteps!.length).toBeGreaterThan(0);

      // Sub-steps should have depth = 1
      stepWithSub!.subSteps!.forEach(subStep => {
        expect(subStep.depth).toBe(1);
        expect(subStep.expression).toBeTruthy();
        expect(subStep.explanation).toBeTruthy();
      });
    });

    it('should have explanatory sub-steps for each multiplication', () => {
      const solution = method.generateSolution(28, 47);

      const stepWithSub = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);
      expect(stepWithSub).toBeDefined();

      // Should have 2 sub-steps (one for each part of partition)
      expect(stepWithSub!.subSteps!.length).toBe(2);
    });
  });

  describe('generateSolution - known solutions', () => {
    const knownSolutions = [
      { num1: 12, num2: 13, answer: 156 },
      { num1: 23, num2: 45, answer: 1035 },
      { num1: 47, num2: 53, answer: 2491 },
      { num1: 78, num2: 92, answer: 7176 },
      { num1: 123, num2: 456, answer: 56088 },
      { num1: 28, num2: 47, answer: 1316 },
      { num1: 67, num2: 89, answer: 5963 },
      { num1: 19, num2: 21, answer: 399 },
      { num1: 88, num2: 77, answer: 6776 },
      { num1: 99, num2: 11, answer: 1089 }
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

  describe('generateSolution - edge cases', () => {
    it('should handle multiplication by 1', () => {
      const solution = method.generateSolution(47, 1);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(47);
    });

    it('should handle single-digit numbers', () => {
      const solution = method.generateSolution(7, 8);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(56);
    });

    it('should handle numbers ending in 0', () => {
      const solution = method.generateSolution(30, 40);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(1200);
    });

    it('should handle numbers ending in 5', () => {
      const solution = method.generateSolution(25, 35);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(875);
    });

    it('should handle identical numbers', () => {
      const solution = method.generateSolution(47, 47);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(2209);
    });
  });

  describe('generateSolution - validation', () => {
    it('should mark solution as validated', () => {
      const solution = method.generateSolution(47, 53);

      expect(solution.validated).toBe(true);
    });

    it('should have empty validation errors on success', () => {
      const solution = method.generateSolution(47, 53);

      expect(solution.validationErrors).toHaveLength(0);
    });

    it('should have correct method name in solution', () => {
      const solution = method.generateSolution(47, 53);

      expect(solution.method).toBe(MethodName.Distributive);
    });

    it('should have optimal reason explanation', () => {
      const solution = method.generateSolution(47, 53);

      expect(solution.optimalReason).toBeTruthy();
      expect(solution.optimalReason.length).toBeGreaterThan(20);
    });
  });

  describe('generateStudyContent', () => {
    it('should generate complete study content', () => {
      const content = method.generateStudyContent();

      expect(content.method).toBe(MethodName.Distributive);
      expect(content.introduction).toBeTruthy();
      expect(content.mathematicalFoundation).toBeTruthy();
      expect(content.deepDiveContent).toBeTruthy();
      expect(content.whenToUse).toBeInstanceOf(Array);
      expect(content.whenToUse.length).toBeGreaterThan(0);
    });

    it('should include information about bidirectional partitioning', () => {
      const content = method.generateStudyContent();

      // Deep dive should mention both additive and subtractive
      expect(content.deepDiveContent.toLowerCase()).toContain('additive');
      expect(content.deepDiveContent.toLowerCase()).toContain('subtractive');
    });

    it('should have non-empty introduction', () => {
      const content = method.generateStudyContent();

      expect(content.introduction.length).toBeGreaterThan(50);
    });

    it('should have mathematical foundation', () => {
      const content = method.generateStudyContent();

      expect(content.mathematicalFoundation.length).toBeGreaterThan(50);
      expect(content.mathematicalFoundation).toContain('distributive');
    });
  });

  describe('partition selection logic', () => {
    it('should prefer subtractive partition for numbers near 30', () => {
      // 28 should use (30 - 2)
      const solution = method.generateSolution(28, 5);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('30');
      expect(firstStep?.expression).toContain('-');
      expect(firstStep?.expression).toContain('2');
    });

    it('should prefer subtractive partition for numbers near 50', () => {
      // 47 should use (50 - 3)
      const solution = method.generateSolution(47, 5);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('50');
      expect(firstStep?.expression).toContain('-');
      expect(firstStep?.expression).toContain('3');
    });

    it('should use additive partition for numbers not near round values', () => {
      // 23 should use (20 + 3)
      const solution = method.generateSolution(23, 5);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('20');
      expect(firstStep?.expression).toContain('+');
      expect(firstStep?.expression).toContain('3');
    });

    it('should prefer subtractive partition for 67', () => {
      // 67 should use (70 - 3)
      const solution = method.generateSolution(67, 5);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('70');
      expect(firstStep?.expression).toContain('-');
      expect(firstStep?.expression).toContain('3');
    });

    it('should use additive partition for numbers ending in 0', () => {
      // 30 should use (30 + 0) or just be simple
      const solution = method.generateSolution(30, 5);
      expect(solution.validated).toBe(true);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(150);
    });
  });

  describe('comprehensive validation', () => {
    it('should validate all steps in sequence', () => {
      const solution = method.generateSolution(47, 53);

      // All steps should connect logically
      for (let i = 0; i < solution.steps.length; i++) {
        const step = solution.steps[i];
        expect(step).toBeDefined();
        expect(step!.expression).toBeTruthy();
        expect(step!.result).toBe(2491); // All intermediate steps show final result
      }
    });

    it('should have consistent results across all steps', () => {
      const solution = method.generateSolution(47, 53);
      const expectedResult = 2491;

      // All steps should reference the same final result
      solution.steps.forEach(step => {
        expect(step.result).toBe(expectedResult);
      });
    });
  });
});
