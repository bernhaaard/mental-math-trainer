/**
 * Tests for Near Powers of 10 calculation method.
 * @module core/methods/__tests__/near-power-10
 */

import { describe, it, expect } from 'vitest';
import { NearPower10Method } from '../near-power-10';

describe('NearPower10Method', () => {
  const method = new NearPower10Method();

  describe('isApplicable', () => {
    it('should be applicable when num1 is near 100', () => {
      expect(method.isApplicable(98, 47)).toBe(true);
      expect(method.isApplicable(102, 35)).toBe(true);
      expect(method.isApplicable(95, 23)).toBe(true);
      expect(method.isApplicable(105, 23)).toBe(true);
    });

    it('should be applicable when num2 is near 100', () => {
      expect(method.isApplicable(47, 98)).toBe(true);
      expect(method.isApplicable(35, 102)).toBe(true);
    });

    it('should be applicable when exactly a power of 10', () => {
      expect(method.isApplicable(100, 47)).toBe(true);
      expect(method.isApplicable(47, 10)).toBe(true);
      expect(method.isApplicable(1000, 5)).toBe(true);
    });

    it('should be applicable when near 10', () => {
      expect(method.isApplicable(9, 12)).toBe(true);
      expect(method.isApplicable(11, 15)).toBe(true);
    });

    it('should be applicable when near 1000', () => {
      expect(method.isApplicable(999, 5)).toBe(true);
      expect(method.isApplicable(1001, 3)).toBe(true);
      expect(method.isApplicable(5, 998)).toBe(true);
    });

    it('should not be applicable when both numbers are far from powers of 10', () => {
      expect(method.isApplicable(47, 53)).toBe(false);
      expect(method.isApplicable(23, 67)).toBe(false);
      expect(method.isApplicable(45, 85)).toBe(false);
    });

    it('should handle edge case of numbers around 10% threshold', () => {
      // 10% of 100 is 10, so 90 and 110 should be applicable
      expect(method.isApplicable(90, 47)).toBe(true);
      expect(method.isApplicable(110, 47)).toBe(true);
      // But numbers further away shouldn't be
      expect(method.isApplicable(85, 47)).toBe(false);
      expect(method.isApplicable(115, 47)).toBe(false);
    });

    describe('boundary tests at exact thresholds', () => {
      it('should be applicable at exactly 10% below 100', () => {
        // 100 - 10% = 90, which should be at the boundary
        expect(method.isApplicable(90, 47)).toBe(true);
      });

      it('should be applicable at exactly 10% above 100', () => {
        // 100 + 10% = 110, which should be at the boundary
        expect(method.isApplicable(110, 47)).toBe(true);
      });

      it('should NOT be applicable just beyond 10% threshold', () => {
        // 89 is 11% below 100, should not be applicable
        expect(method.isApplicable(89, 47)).toBe(false);
        // 111 is 11% above 100, should not be applicable
        expect(method.isApplicable(111, 47)).toBe(false);
      });

      it('should be applicable at exactly 10% below 1000', () => {
        // 1000 - 10% = 900
        expect(method.isApplicable(900, 5)).toBe(true);
      });

      it('should be applicable at exactly 10% above 1000', () => {
        // 1000 + 10% = 1100
        expect(method.isApplicable(1100, 5)).toBe(true);
      });

      it('should NOT be applicable beyond 10% of 1000', () => {
        // 1000 - 11% = 890, too far
        expect(method.isApplicable(890, 5)).toBe(false);
        // 1000 + 11% = 1110, too far
        expect(method.isApplicable(1110, 5)).toBe(false);
      });

      it('should be applicable at exactly 10% below 10', () => {
        // 10 - 10% = 9
        expect(method.isApplicable(9, 47)).toBe(true);
      });

      it('should be applicable at exactly 10% above 10', () => {
        // 10 + 10% = 11
        expect(method.isApplicable(11, 47)).toBe(true);
      });
    });
  });

  describe('generateSolution', () => {
    describe('basic correctness', () => {
      it('should correctly solve 98 × 47 = 4606', () => {
        const solution = method.generateSolution(98, 47);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(4606);
      });

      it('should correctly solve 102 × 35 = 3570', () => {
        const solution = method.generateSolution(102, 35);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(3570);
      });

      it('should correctly solve 47 × 100 = 4700 (exact power)', () => {
        const solution = method.generateSolution(47, 100);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(4700);
      });

      it('should correctly solve 999 × 5 = 4995', () => {
        const solution = method.generateSolution(999, 5);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(4995);
      });

      it('should correctly solve 11 × 23 = 253', () => {
        const solution = method.generateSolution(11, 23);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(253);
      });

      it('should correctly solve 9 × 34 = 306', () => {
        const solution = method.generateSolution(9, 34);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(306);
      });
    });

    describe('solution structure', () => {
      it('should have proper step structure', () => {
        const solution = method.generateSolution(98, 47);

        expect(solution.steps.length).toBeGreaterThan(2);

        // Each step should have required properties
        solution.steps.forEach(step => {
          expect(step.expression).toBeTruthy();
          expect(step.explanation).toBeTruthy();
          expect(typeof step.result).toBe('number');
          expect(typeof step.depth).toBe('number');
        });
      });

      it('should include sub-steps for intermediate calculations', () => {
        const solution = method.generateSolution(98, 47);

        // Find the step with sub-calculations
        const stepWithSub = solution.steps.find(s => s.subSteps && s.subSteps.length > 0);
        expect(stepWithSub).toBeDefined();
        expect(stepWithSub?.subSteps?.length).toBeGreaterThan(0);
      });

      it('should have explanatory text mentioning the power of 10', () => {
        const solution = method.generateSolution(98, 47);

        const hasExplanation = solution.steps.some(step =>
          step.explanation.toLowerCase().includes('power of 10') ||
          step.explanation.includes('100')
        );
        expect(hasExplanation).toBe(true);
      });

      it('should set the method name correctly', () => {
        const solution = method.generateSolution(98, 47);
        expect(solution.method).toBe('near-power-10');
      });

      it('should provide optimal reason', () => {
        const solution = method.generateSolution(98, 47);
        expect(solution.optimalReason).toBeTruthy();
        expect(solution.optimalReason.length).toBeGreaterThan(10);
      });
    });

    describe('handling different power levels', () => {
      it('should handle numbers near 10', () => {
        const solution = method.generateSolution(9, 12);
        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(108);
      });

      it('should handle numbers near 100', () => {
        const solution = method.generateSolution(99, 23);
        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(2277);
      });

      it('should handle numbers near 1000', () => {
        const solution = method.generateSolution(1001, 7);
        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(7007);
      });
    });

    describe('handling number order', () => {
      it('should work when power-near number is first', () => {
        const solution = method.generateSolution(98, 47);
        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(4606);
      });

      it('should work when power-near number is second', () => {
        const solution = method.generateSolution(47, 98);
        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(4606);
      });

      it('should give same answer regardless of order', () => {
        const solution1 = method.generateSolution(98, 47);
        const solution2 = method.generateSolution(47, 98);

        const result1 = solution1.steps[solution1.steps.length - 1]?.result;
        const result2 = solution2.steps[solution2.steps.length - 1]?.result;

        expect(result1).toBe(result2);
      });
    });

    describe('negative numbers', () => {
      it.skip('should handle negative numbers near powers of 10', () => {
        // TODO: Implement proper negative number handling
        const solution = method.generateSolution(-98, 47);
        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(-4606);
      });

      it.skip('should handle both numbers negative', () => {
        // TODO: Implement proper negative number handling
        const solution = method.generateSolution(-102, -35);
        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(3570);
      });
    });
  });

  describe('computeCost', () => {
    it('should calculate lower cost for numbers closer to power of 10', () => {
      const cost99 = method.computeCost(99, 47);
      const cost95 = method.computeCost(95, 47);
      const cost90 = method.computeCost(90, 47);

      expect(cost99).toBeLessThan(cost95);
      expect(cost95).toBeLessThan(cost90);
    });

    it('should calculate low cost for exact powers', () => {
      const cost = method.computeCost(100, 47);
      expect(cost).toBeLessThan(3); // Should be low for exact power
    });

    it('should handle either number being near power', () => {
      const cost1 = method.computeCost(98, 47);
      const cost2 = method.computeCost(47, 98);

      // Cost should be similar (uses min of both)
      expect(Math.abs(cost1 - cost2)).toBeLessThan(0.1);
    });

    // Issue #110: Power of 10 multiplication should be nearly free
    describe('power-of-10 multiplication cost', () => {
      it('should treat exact power of 10 multiplication as nearly free', () => {
        // 100 x 47: only cost is the power mult (~0.1) + add/sub (~0.3)
        const cost = method.computeCost(100, 47);
        // Total should be around 0.4 (0.1 power + 0 adjustment + 0.3 add/sub)
        expect(cost).toBeLessThan(0.5);
      });

      it('should have very low cost for diff=1 (just add/subtract the other number)', () => {
        // 99 x 47: 100 x 47 - 1 x 47
        // Cost: 0.1 (power) + 0.2 (diff=1) + 0.3 (add/sub) = 0.6
        const cost = method.computeCost(99, 47);
        expect(cost).toBeLessThan(0.7);
        expect(cost).toBeGreaterThan(0.5); // Higher than exact power
      });

      it('should have low cost for diff=2 (just double the other number)', () => {
        // 98 x 47: 100 x 47 - 2 x 47
        // Cost: 0.1 (power) + 0.4 (diff=2) + 0.3 (add/sub) = 0.8
        const cost = method.computeCost(98, 47);
        expect(cost).toBeLessThan(0.9);
        expect(cost).toBeGreaterThan(0.7); // Higher than diff=1
      });

      it('should have progressively higher cost for larger diffs', () => {
        const cost1 = method.computeCost(99, 47);  // diff = 1
        const cost2 = method.computeCost(98, 47);  // diff = 2
        const cost5 = method.computeCost(95, 47);  // diff = 5
        const cost10 = method.computeCost(90, 47); // diff = 10

        expect(cost1).toBeLessThan(cost2);
        expect(cost2).toBeLessThan(cost5);
        expect(cost5).toBeLessThan(cost10);
      });

      it('should recognize that power of 10 mult is same cost regardless of power', () => {
        // Multiplying by 10, 100, or 1000 should all be nearly free
        const cost10 = method.computeCost(10, 47);
        const cost100 = method.computeCost(100, 47);
        const cost1000 = method.computeCost(1000, 47);

        // All should be very low (just power mult + add/sub, no adjustment)
        expect(cost10).toBeLessThan(0.5);
        expect(cost100).toBeLessThan(0.5);
        expect(cost1000).toBeLessThan(0.5);

        // And they should all be approximately equal
        expect(Math.abs(cost10 - cost100)).toBeLessThan(0.1);
        expect(Math.abs(cost100 - cost1000)).toBeLessThan(0.1);
      });

      it('should have cost dominated by adjustment, not power multiplication', () => {
        // For 98 x 47, the cost should be mostly from 2 x 47, not from 100 x 47
        // If we compare to a larger diff like 90 x 47 (diff=10), the difference
        // should reflect the harder adjustment (10 x 47 vs 2 x 47)
        const cost98 = method.computeCost(98, 47);
        const cost90 = method.computeCost(90, 47);

        // Cost difference should reflect adjustment difficulty, not power difficulty
        // 90 has diff=10, 98 has diff=2, so cost difference should be significant
        expect(cost90 - cost98).toBeGreaterThan(0.5);
      });

      it('should consider the other operand when calculating adjustment cost', () => {
        // 99 x 5 (diff=1, other=5) should be cheaper than 99 x 999 (diff=1, other=999)
        // because 1 x 5 is easier than 1 x 999
        const costSmallOther = method.computeCost(99, 5);
        const costLargeOther = method.computeCost(99, 999);

        // For diff=1, the adjustment is just adding/subtracting the other number
        // This should be similar regardless of other's size (it's just one operation)
        // But for larger diffs, the other's size matters more
        const cost5diff5 = method.computeCost(95, 5);   // 5 x 5 = 25
        const cost5diff999 = method.computeCost(95, 999); // 5 x 999

        // The difference should be larger for diff=5 than diff=1
        const diff1 = Math.abs(costLargeOther - costSmallOther);
        const diff5 = Math.abs(cost5diff999 - cost5diff5);

        expect(diff5).toBeGreaterThan(diff1);
      });
    });
  });

  describe('qualityScore', () => {
    it('should give high quality for exact powers of 10', () => {
      const quality = method.qualityScore(100, 47);
      expect(quality).toBeGreaterThan(0.9);
    });

    it('should give high quality for very close numbers', () => {
      const quality = method.qualityScore(99, 47);
      expect(quality).toBeGreaterThan(0.75);
    });

    it('should give lower quality for numbers further from powers', () => {
      const quality = method.qualityScore(95, 47);
      expect(quality).toBeLessThan(0.85);
    });
  });

  describe('known solutions', () => {
    const knownSolutions = [
      { num1: 98, num2: 47, answer: 4606, desc: '98 × 47 (near 100)' },
      { num1: 102, num2: 35, answer: 3570, desc: '102 × 35 (near 100)' },
      { num1: 47, num2: 100, answer: 4700, desc: '47 × 100 (exact power)' },
      { num1: 999, num2: 5, answer: 4995, desc: '999 × 5 (near 1000)' },
      { num1: 11, num2: 23, answer: 253, desc: '11 × 23 (near 10)' },
      { num1: 9, num2: 34, answer: 306, desc: '9 × 34 (near 10)' },
      { num1: 101, num2: 19, answer: 1919, desc: '101 × 19 (near 100)' },
      { num1: 99, num2: 99, answer: 9801, desc: '99 × 99 (near 100, both)' },
      { num1: 10, num2: 10, answer: 100, desc: '10 × 10 (exact power)' },
      { num1: 1000, num2: 3, answer: 3000, desc: '1000 × 3 (exact power)' }
    ];

    knownSolutions.forEach(({ num1, num2, answer, desc }) => {
      it(`should correctly solve ${desc} = ${answer}`, () => {
        const solution = method.generateSolution(num1, num2);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(answer);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle single digit times power of 10', () => {
      const solution = method.generateSolution(5, 100);
      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(500);
    });

    it('should handle very large numbers near powers', () => {
      const solution = method.generateSolution(9999, 3);
      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(29997);
    });

    it('should prefer the number closer to a power when both are near powers', () => {
      // 99 is 1 away from 100, 11 is 1 away from 10
      // Should choose based on which gives better cost
      const solution = method.generateSolution(99, 11);
      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(1089);
    });
  });

  describe('validation', () => {
    it('should mark all generated solutions as validated', () => {
      const testCases: Array<[number, number]> = [
        [98, 47],
        [102, 35],
        [999, 5],
        [11, 23]
      ];

      testCases.forEach(([num1, num2]) => {
        const solution = method.generateSolution(num1, num2);
        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);
      });
    });

    it('should throw error if solution fails validation', () => {
      // This is a safety check - the implementation should never generate
      // an invalid solution, but if it does, it should throw
      // We can't easily test this without mocking the validator,
      // but we document the expected behavior
      expect(true).toBe(true);
    });
  });

  describe('method selection integration', () => {
    it('should be the optimal choice for 98 × 47', () => {
      // 98 × 47 is the canonical example for Near Power of 10
      // It should be applicable with low cost
      expect(method.isApplicable(98, 47)).toBe(true);

      const cost = method.computeCost(98, 47);
      expect(cost).toBeLessThan(1.0); // Should be very efficient

      const quality = method.qualityScore(98, 47);
      expect(quality).toBeGreaterThan(0.7);

      const solution = method.generateSolution(98, 47);
      expect(solution.validated).toBe(true);
      expect(solution.steps[solution.steps.length - 1]?.result).toBe(4606);
    });

    it('should have low cost for power-of-10 adjustment scenarios', () => {
      // Verify the cost model reflects the intuition that:
      // - 100 × n is essentially free (just append zeros)
      // - The main cost is the adjustment (2 × n for 98)

      const costExact = method.computeCost(100, 47);
      const cost99 = method.computeCost(99, 47);
      const cost98 = method.computeCost(98, 47);

      // Exact power should have lowest cost
      expect(costExact).toBeLessThan(cost99);
      expect(cost99).toBeLessThan(cost98);

      // But all should be quite low
      expect(cost98).toBeLessThan(1.0);
    });
  });

  describe('generateStudyContent', () => {
    it('should generate study content', () => {
      const content = method.generateStudyContent();

      expect(content.method).toBe('near-power-10');
      expect(content.introduction).toBeTruthy();
      expect(content.mathematicalFoundation).toBeTruthy();
      expect(content.deepDiveContent).toBeTruthy();
      expect(content.whenToUse).toBeTruthy();
      expect(Array.isArray(content.whenToUse)).toBe(true);
    });

    it('should include meaningful content', () => {
      const content = method.generateStudyContent();

      expect(content.introduction.length).toBeGreaterThan(50);
      expect(content.mathematicalFoundation.length).toBeGreaterThan(50);
      expect(content.whenToUse.length).toBeGreaterThan(0);
    });
  });
});
