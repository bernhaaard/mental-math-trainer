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

  describe('generateSolution - recursive sub-steps (Issue #62)', () => {
    it('should generate recursive sub-steps for non-trivial intermediate calculations', () => {
      // 23 x 47: partitions 23 as (20 + 3)
      // 20 x 47 and 3 x 47 are non-trivial (47 is two-digit)
      // So each should have their own sub-steps breaking down 47
      const solution = method.generateSolution(23, 47);

      const stepWithSub = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);
      expect(stepWithSub).toBeDefined();

      // Find sub-steps that themselves have sub-steps (nested breakdown)
      const nestedSubSteps = stepWithSub!.subSteps!.filter(
        s => s.subSteps && s.subSteps.length > 0
      );

      // At least one intermediate calculation should have recursive breakdown
      // 20 x 47: needs to break down 47 (47 = 50 - 3)
      // 3 x 47: needs to break down 47 (47 = 50 - 3)
      expect(nestedSubSteps.length).toBeGreaterThan(0);
    });

    it('should not generate recursive sub-steps for trivial multiplications', () => {
      // 7 x 8 is trivial (single digit x single digit)
      const solution = method.generateSolution(7, 8);

      // For single digit x single digit, there may not even be sub-steps at top level
      const stepWithSub = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);

      if (stepWithSub) {
        // If there are sub-steps, they shouldn't have their own sub-steps (trivial)
        stepWithSub.subSteps!.forEach(subStep => {
          expect(subStep.subSteps).toBeUndefined();
        });
      }
    });

    it('should have valid expressions at all recursion levels', () => {
      const solution = method.generateSolution(47, 53);

      // Helper to recursively check all expressions
      const checkExpressions = (steps: typeof solution.steps) => {
        steps.forEach(step => {
          // Expressions should not contain '=' (result is stored separately)
          expect(step.expression).not.toContain('=');
          // Expression should be a valid math expression
          expect(step.expression).toMatch(/^[0-9+\-*/()\s]+$/);

          if (step.subSteps) {
            checkExpressions(step.subSteps);
          }
        });
      };

      checkExpressions(solution.steps);
    });

    it('should respect maximum depth limit of 3', () => {
      // Use a complex problem that could recurse deeply
      const solution = method.generateSolution(123, 456);

      // Helper to find max depth
      const findMaxDepth = (steps: typeof solution.steps): number => {
        let maxDepth = 0;
        steps.forEach(step => {
          maxDepth = Math.max(maxDepth, step.depth);
          if (step.subSteps) {
            maxDepth = Math.max(maxDepth, findMaxDepth(step.subSteps));
          }
        });
        return maxDepth;
      };

      const maxDepth = findMaxDepth(solution.steps);

      // Depth should not exceed 2 (0, 1, 2) since max recursion is 3
      // depth 0 = main steps, depth 1 = first level sub-steps, depth 2 = second level
      expect(maxDepth).toBeLessThanOrEqual(2);
    });

    it('should include explanatory text at each level', () => {
      const solution = method.generateSolution(28, 47);

      // Helper to check all explanations
      const checkExplanations = (steps: typeof solution.steps) => {
        steps.forEach(step => {
          expect(step.explanation).toBeTruthy();
          expect(step.explanation.length).toBeGreaterThan(0);

          if (step.subSteps) {
            checkExplanations(step.subSteps);
          }
        });
      };

      checkExplanations(solution.steps);
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

  describe('near-100 round number partitions (Issue #104)', () => {
    it('should prefer (100 - 3) for 97', () => {
      const solution = method.generateSolution(97, 12);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('100');
      expect(firstStep?.expression).toContain('-');
      expect(firstStep?.expression).toContain('3');
      expect(solution.validated).toBe(true);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(1164);
    });

    it('should prefer (100 - 2) for 98', () => {
      const solution = method.generateSolution(98, 7);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('100');
      expect(firstStep?.expression).toContain('-');
      expect(firstStep?.expression).toContain('2');
      expect(solution.validated).toBe(true);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(686);
    });

    it('should prefer (100 - 1) for 99', () => {
      const solution = method.generateSolution(99, 8);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('100');
      expect(firstStep?.expression).toContain('-');
      expect(firstStep?.expression).toContain('1');
      expect(solution.validated).toBe(true);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(792);
    });

    it('should prefer (100 - 5) for 95', () => {
      const solution = method.generateSolution(95, 6);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('100');
      expect(firstStep?.expression).toContain('-');
      expect(firstStep?.expression).toContain('5');
      expect(solution.validated).toBe(true);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(570);
    });
  });

  describe('near-1000 round number partitions (Issue #104)', () => {
    it('should prefer (1000 - 3) for 997', () => {
      const solution = method.generateSolution(997, 5);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('1000');
      expect(firstStep?.expression).toContain('-');
      expect(firstStep?.expression).toContain('3');
      expect(solution.validated).toBe(true);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(4985);
    });

    it('should prefer (1000 - 2) for 998', () => {
      const solution = method.generateSolution(998, 4);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('1000');
      expect(firstStep?.expression).toContain('-');
      expect(firstStep?.expression).toContain('2');
      expect(solution.validated).toBe(true);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(3992);
    });

    it('should prefer (1000 + 3) for 1003', () => {
      const solution = method.generateSolution(1003, 6);
      const firstStep = solution.steps[0];

      expect(firstStep?.expression).toContain('1000');
      expect(firstStep?.expression).toContain('+');
      expect(firstStep?.expression).toContain('3');
      expect(solution.validated).toBe(true);

      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(6018);
    });
  });

  describe('mathematical correctness with near-100/1000 partitions', () => {
    const testCases = [
      { num1: 97, num2: 12, expected: 1164 },
      { num1: 98, num2: 23, expected: 2254 },
      { num1: 99, num2: 34, expected: 3366 },
      { num1: 96, num2: 15, expected: 1440 },
      { num1: 95, num2: 18, expected: 1710 },
      { num1: 997, num2: 5, expected: 4985 },
      { num1: 998, num2: 6, expected: 5988 },
      { num1: 999, num2: 7, expected: 6993 },
      { num1: 1001, num2: 8, expected: 8008 },
      { num1: 1002, num2: 9, expected: 9018 },
    ];

    testCases.forEach(({ num1, num2, expected }) => {
      it(`should correctly calculate ${num1} x ${num2} = ${expected}`, () => {
        const solution = method.generateSolution(num1, num2);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(expected);
      });
    });
  });
});
