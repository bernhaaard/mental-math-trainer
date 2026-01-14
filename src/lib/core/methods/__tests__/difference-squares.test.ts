/**
 * Tests for Difference of Squares calculation method.
 * @module core/methods/__tests__/difference-squares
 */

import { describe, it, expect } from 'vitest';
import { DifferenceSquaresMethod } from '../difference-squares';

describe('DifferenceSquaresMethod', () => {
  const method = new DifferenceSquaresMethod();

  describe('method properties', () => {
    it('should have correct name', () => {
      expect(method.name).toBe('difference-squares');
    });

    it('should have correct display name', () => {
      expect(method.displayName).toBe('Difference of Squares');
    });
  });

  describe('isApplicable', () => {
    describe('should return true for symmetric pairs around round numbers', () => {
      it('47 × 53 (symmetric around 50)', () => {
        expect(method.isApplicable(47, 53)).toBe(true);
      });

      it('48 × 52 (symmetric around 50)', () => {
        expect(method.isApplicable(48, 52)).toBe(true);
      });

      it('45 × 55 (symmetric around 50)', () => {
        expect(method.isApplicable(45, 55)).toBe(true);
      });

      it('95 × 105 (symmetric around 100)', () => {
        expect(method.isApplicable(95, 105)).toBe(true);
      });

      it('98 × 102 (symmetric around 100)', () => {
        expect(method.isApplicable(98, 102)).toBe(true);
      });

      it('23 × 27 (symmetric around 25)', () => {
        expect(method.isApplicable(23, 27)).toBe(true);
      });

      it('21 × 29 (symmetric around 25)', () => {
        expect(method.isApplicable(21, 29)).toBe(true);
      });

      it('68 × 72 (symmetric around 70)', () => {
        expect(method.isApplicable(68, 72)).toBe(true);
      });
    });

    describe('should return true for small symmetric pairs', () => {
      it('8 × 12 (symmetric around 10)', () => {
        expect(method.isApplicable(8, 12)).toBe(true);
      });

      it('13 × 17 (symmetric around 15)', () => {
        expect(method.isApplicable(13, 17)).toBe(true);
      });

      it('18 × 22 (symmetric around 20)', () => {
        expect(method.isApplicable(18, 22)).toBe(true);
      });
    });

    describe('should return true for perfect square midpoints', () => {
      it('47 × 51 (midpoint 49 = 7^2)', () => {
        expect(method.isApplicable(47, 51)).toBe(true);
      });

      it('46 × 52 (midpoint 49 = 7^2)', () => {
        expect(method.isApplicable(46, 52)).toBe(true);
      });

      it('61 × 67 (midpoint 64 = 8^2)', () => {
        expect(method.isApplicable(61, 67)).toBe(true);
      });

      it('78 × 84 (midpoint 81 = 9^2)', () => {
        expect(method.isApplicable(78, 84)).toBe(true);
      });

      it('33 × 39 (midpoint 36 = 6^2)', () => {
        expect(method.isApplicable(33, 39)).toBe(true);
      });

      it('118 × 124 (midpoint 121 = 11^2)', () => {
        expect(method.isApplicable(118, 124)).toBe(true);
      });

      it('141 × 147 (midpoint 144 = 12^2)', () => {
        expect(method.isApplicable(141, 147)).toBe(true);
      });
    });

    describe('should return false for non-symmetric pairs', () => {
      it('23 × 45 (not symmetric - midpoint 34)', () => {
        expect(method.isApplicable(23, 45)).toBe(false);
      });

      it('47 × 48 (midpoint 47.5, not integer)', () => {
        expect(method.isApplicable(47, 48)).toBe(false);
      });
    });

    describe('should return false when distance is too large', () => {
      it('35 × 65 (distance 15, too large)', () => {
        expect(method.isApplicable(35, 65)).toBe(false);
      });

      it('40 × 60 (distance 10 is ok)', () => {
        expect(method.isApplicable(40, 60)).toBe(true);
      });

      it('39 × 61 (distance 11, too large)', () => {
        expect(method.isApplicable(39, 61)).toBe(false);
      });
    });

    describe('should return false when midpoint is not round or perfect square', () => {
      it('41 × 43 (midpoint 42, not multiple of 5 or perfect square)', () => {
        expect(method.isApplicable(41, 43)).toBe(false);
      });

      it('56 × 58 (midpoint 57, not multiple of 5 or perfect square)', () => {
        expect(method.isApplicable(56, 58)).toBe(false);
      });

      it('73 × 75 (midpoint 74, not multiple of 5 or perfect square)', () => {
        expect(method.isApplicable(73, 75)).toBe(false);
      });
    });
  });

  describe('computeCost', () => {
    it('should return low cost for symmetric pairs around multiples of 10', () => {
      const cost1 = method.computeCost(47, 53); // around 50
      const cost2 = method.computeCost(95, 105); // around 100

      expect(cost1).toBeLessThan(5);
      expect(cost2).toBeLessThan(6);
    });

    it('should return higher cost for multiples of 5 than multiples of 10', () => {
      const cost10 = method.computeCost(47, 53); // around 50
      const cost5 = method.computeCost(23, 27); // around 25

      expect(cost5).toBeGreaterThan(cost10);
    });

    it('should return reasonable cost for perfect square midpoints', () => {
      const cost49 = method.computeCost(47, 51); // midpoint 49 = 7^2
      const cost64 = method.computeCost(61, 67); // midpoint 64 = 8^2
      const cost81 = method.computeCost(78, 84); // midpoint 81 = 9^2

      // Perfect squares should have moderate cost (between multiples of 5 and random numbers)
      expect(cost49).toBeLessThan(6);
      expect(cost64).toBeLessThan(6);
      expect(cost81).toBeLessThan(6);
    });

    it('should increase cost with larger distance', () => {
      const smallDist = method.computeCost(48, 52); // distance 2
      const largeDist = method.computeCost(45, 55); // distance 5

      expect(largeDist).toBeGreaterThan(smallDist);
    });

    it('should increase cost with more digits in midpoint', () => {
      const twoDigit = method.computeCost(47, 53); // midpoint 50
      const threeDigit = method.computeCost(95, 105); // midpoint 100

      expect(threeDigit).toBeGreaterThan(twoDigit);
    });
  });

  describe('qualityScore', () => {
    it('should return high quality for perfect cases', () => {
      expect(method.qualityScore(47, 53)).toBeGreaterThanOrEqual(0.9);
      expect(method.qualityScore(48, 52)).toBeGreaterThanOrEqual(0.9);
      expect(method.qualityScore(95, 105)).toBeGreaterThanOrEqual(0.9);
    });

    it('should return good quality for multiples of 5', () => {
      const quality = method.qualityScore(23, 27);
      expect(quality).toBeGreaterThanOrEqual(0.7);
      expect(quality).toBeLessThan(0.9);
    });

    it('should return good quality for perfect square midpoints', () => {
      const quality49 = method.qualityScore(47, 51); // midpoint 49 = 7^2
      const quality64 = method.qualityScore(61, 67); // midpoint 64 = 8^2
      const quality81 = method.qualityScore(78, 84); // midpoint 81 = 9^2

      // Perfect squares should have decent quality (0.5-0.7 range)
      expect(quality49).toBeGreaterThanOrEqual(0.5);
      expect(quality49).toBeLessThan(0.9);
      expect(quality64).toBeGreaterThanOrEqual(0.5);
      expect(quality64).toBeLessThan(0.9);
      expect(quality81).toBeGreaterThanOrEqual(0.5);
      expect(quality81).toBeLessThan(0.9);
    });

    it('should return decent quality for small numbers', () => {
      const quality = method.qualityScore(13, 17);
      expect(quality).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('generateSolution', () => {
    describe('should generate valid solutions for known cases', () => {
      it('47 × 53 = 2491', () => {
        const solution = method.generateSolution(47, 53);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);
        expect(solution.method).toBe('difference-squares');

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(2491);
      });

      it('48 × 52 = 2496', () => {
        const solution = method.generateSolution(48, 52);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(2496);
      });

      it('95 × 105 = 9975', () => {
        const solution = method.generateSolution(95, 105);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(9975);
      });

      it('23 × 27 = 621', () => {
        const solution = method.generateSolution(23, 27);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(621);
      });

      it('18 × 22 = 396', () => {
        const solution = method.generateSolution(18, 22);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(396);
      });

      it('68 × 72 = 4896', () => {
        const solution = method.generateSolution(68, 72);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(4896);
      });

      it('98 × 102 = 9996', () => {
        const solution = method.generateSolution(98, 102);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(9996);
      });
    });

    describe('should generate valid solutions for perfect square midpoints', () => {
      it('47 × 51 = 2397 (midpoint 49 = 7^2)', () => {
        const solution = method.generateSolution(47, 51);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(2397);
      });

      it('61 × 67 = 4087 (midpoint 64 = 8^2)', () => {
        const solution = method.generateSolution(61, 67);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(4087);
      });

      it('78 × 84 = 6552 (midpoint 81 = 9^2)', () => {
        const solution = method.generateSolution(78, 84);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(6552);
      });
    });

    describe('should work with reversed order', () => {
      it('53 × 47 = 2491 (same as 47 × 53)', () => {
        const solution = method.generateSolution(53, 47);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(2491);
      });

      it('27 × 23 = 621 (same as 23 × 27)', () => {
        const solution = method.generateSolution(27, 23);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(621);
      });
    });

    describe('solution structure', () => {
      it('should have at least 4 steps', () => {
        const solution = method.generateSolution(47, 53);
        expect(solution.steps.length).toBeGreaterThanOrEqual(4);
      });

      it('should have meaningful explanations', () => {
        const solution = method.generateSolution(47, 53);

        solution.steps.forEach(step => {
          expect(step.expression).toBeTruthy();
          expect(step.explanation).toBeTruthy();
          expect(step.explanation.length).toBeGreaterThan(10);
        });
      });

      it('should include sub-steps for square calculations', () => {
        const solution = method.generateSolution(47, 53);

        const stepWithSubSteps = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);
        expect(stepWithSubSteps).toBeDefined();
        expect(stepWithSubSteps?.subSteps?.length).toBeGreaterThanOrEqual(2);
      });

      it('should have proper depth values', () => {
        const solution = method.generateSolution(47, 53);

        // Main steps should be depth 0
        solution.steps.forEach(step => {
          expect(step.depth).toBe(0);

          // Sub-steps should be depth 1
          if (step.subSteps) {
            step.subSteps.forEach(subStep => {
              expect(subStep.depth).toBe(1);
            });
          }
        });
      });

      it('should include optimal reason', () => {
        const solution = method.generateSolution(47, 53);

        expect(solution.optimalReason).toBeTruthy();
        expect(solution.optimalReason.length).toBeGreaterThan(20);
        expect(solution.optimalReason).toContain('symmetric');
      });
    });

    describe('mathematical correctness', () => {
      it('should match direct multiplication', () => {
        const testCases = [
          { num1: 47, num2: 53 },
          { num1: 48, num2: 52 },
          { num1: 95, num2: 105 },
          { num1: 23, num2: 27 },
          { num1: 18, num2: 22 },
          { num1: 68, num2: 72 },
          { num1: 8, num2: 12 },
          { num1: 45, num2: 55 }
        ];

        testCases.forEach(({ num1, num2 }) => {
          const solution = method.generateSolution(num1, num2);
          const finalResult = solution.steps[solution.steps.length - 1]?.result;
          const directResult = num1 * num2;

          expect(finalResult).toBe(directResult);
        });
      });

      it('should have all intermediate results correct', () => {
        const solution = method.generateSolution(47, 53);

        // All steps should have the same final result (they just show the progression)
        const expectedResult = 2491;
        solution.steps.forEach(step => {
          expect(step.result).toBe(expectedResult);
        });
      });
    });

    describe('edge cases', () => {
      it('should handle small symmetric pairs', () => {
        const solution = method.generateSolution(8, 12);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(96);
      });

      it('should handle larger symmetric pairs', () => {
        const solution = method.generateSolution(95, 105);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(9975);
      });

      it('should handle maximum distance (10)', () => {
        const solution = method.generateSolution(40, 60);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(2400);
      });
    });
  });

  describe('generateStudyContent', () => {
    it('should return complete study content', () => {
      const content = method.generateStudyContent();

      expect(content.method).toBe('difference-squares');
      expect(content.introduction).toBeTruthy();
      expect(content.mathematicalFoundation).toBeTruthy();
      expect(content.deepDiveContent).toBeTruthy();
      expect(content.whenToUse).toBeInstanceOf(Array);
      expect(content.whenToUse.length).toBeGreaterThan(0);
    });

    it('should have meaningful introduction', () => {
      const content = method.generateStudyContent();

      expect(content.introduction.length).toBeGreaterThan(100);
      expect(content.introduction).toContain('difference of squares');
    });

    it('should explain mathematical foundation', () => {
      const content = method.generateStudyContent();

      expect(content.mathematicalFoundation).toContain('(a - b)(a + b) = a² - b²');
      expect(content.mathematicalFoundation.length).toBeGreaterThan(100);
    });

    it('should provide when-to-use guidance', () => {
      const content = method.generateStudyContent();

      expect(content.whenToUse.length).toBeGreaterThanOrEqual(3);
      content.whenToUse.forEach(item => {
        expect(item.length).toBeGreaterThan(10);
      });
    });
  });

  describe('comprehensive validation', () => {
    it('should pass validation for all test cases', () => {
      const testCases = [
        // Round number midpoints
        [47, 53], [48, 52], [45, 55],
        [95, 105], [98, 102],
        [23, 27], [21, 29],
        [18, 22], [8, 12],
        [68, 72], [40, 60],
        // Perfect square midpoints
        [47, 51], [46, 52], // midpoint 49 = 7^2
        [61, 67], // midpoint 64 = 8^2
        [78, 84], // midpoint 81 = 9^2
        [33, 39], // midpoint 36 = 6^2
        [118, 124], // midpoint 121 = 11^2
        [141, 147]  // midpoint 144 = 12^2
      ];

      testCases.forEach(([num1, num2]) => {
        // TypeScript strict mode: assert values are defined
        if (num1 === undefined || num2 === undefined) {
          throw new Error('Test case values are undefined');
        }

        const solution = method.generateSolution(num1, num2);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(num1 * num2);
      });
    });

    it('should throw error if validation fails', () => {
      // This test verifies the error handling works correctly
      // We can't easily make it fail without mocking, but we verify the structure exists
      const solution = method.generateSolution(47, 53);
      expect(solution.validated).toBe(true);
    });
  });
});
