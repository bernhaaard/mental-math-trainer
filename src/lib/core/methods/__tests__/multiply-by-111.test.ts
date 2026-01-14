/**
 * Tests for Multiply by 111 calculation method.
 * @module core/methods/__tests__/multiply-by-111
 */

import { describe, it, expect } from 'vitest';
import { MultiplyBy111Method } from '../multiply-by-111';
import { MethodName } from '../../../types';

describe('MultiplyBy111Method', () => {
  const method = new MultiplyBy111Method();

  describe('metadata', () => {
    it('should have correct name', () => {
      expect(method.name).toBe(MethodName.MultiplyBy111);
    });

    it('should have correct display name', () => {
      expect(method.displayName).toBe('Multiply by 111');
    });
  });

  describe('isApplicable', () => {
    it('should return true when first number is 111', () => {
      expect(method.isApplicable(111, 5)).toBe(true);
      expect(method.isApplicable(111, 23)).toBe(true);
      expect(method.isApplicable(111, 99)).toBe(true);
    });

    it('should return true when second number is 111', () => {
      expect(method.isApplicable(5, 111)).toBe(true);
      expect(method.isApplicable(23, 111)).toBe(true);
      expect(method.isApplicable(99, 111)).toBe(true);
    });

    it('should return true for negative 111', () => {
      expect(method.isApplicable(-111, 5)).toBe(true);
      expect(method.isApplicable(23, -111)).toBe(true);
    });

    it('should return false when neither number is 111', () => {
      expect(method.isApplicable(47, 53)).toBe(false);
      expect(method.isApplicable(110, 112)).toBe(false);
      expect(method.isApplicable(11, 100)).toBe(false);
    });
  });

  describe('generateSolution', () => {
    describe('single digit numbers (repdigits)', () => {
      it('should correctly solve 111 x 5 = 555', () => {
        const solution = method.generateSolution(111, 5);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(555);
      });

      it('should correctly solve 7 x 111 = 777', () => {
        const solution = method.generateSolution(7, 111);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(777);
      });

      it('should correctly solve 111 x 9 = 999', () => {
        const solution = method.generateSolution(111, 9);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(999);
      });

      it('should correctly solve 111 x 1 = 111', () => {
        const solution = method.generateSolution(111, 1);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(111);
      });
    });

    describe('two-digit numbers (with carries)', () => {
      it('should correctly solve 111 x 23 = 2553', () => {
        const solution = method.generateSolution(111, 23);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(2553);
      });

      it('should correctly solve 45 x 111 = 4995', () => {
        const solution = method.generateSolution(45, 111);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(4995);
      });

      it('should correctly solve 111 x 99 = 10989', () => {
        const solution = method.generateSolution(111, 99);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(10989);
      });

      it('should correctly solve 111 x 12 = 1332', () => {
        const solution = method.generateSolution(111, 12);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(1332);
      });
    });

    describe('larger numbers', () => {
      it('should correctly solve 111 x 100 = 11100', () => {
        const solution = method.generateSolution(111, 100);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(11100);
      });

      it('should correctly solve 111 x 123 = 13653', () => {
        const solution = method.generateSolution(111, 123);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(13653);
      });
    });

    describe('negative numbers', () => {
      it('should correctly solve -111 x 5 = -555', () => {
        const solution = method.generateSolution(-111, 5);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(-555);
      });

      it('should correctly solve 111 x -23 = -2553', () => {
        const solution = method.generateSolution(111, -23);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(-2553);
      });

      it('should correctly solve -111 x -5 = 555', () => {
        const solution = method.generateSolution(-111, -5);

        expect(solution.validated).toBe(true);
        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(555);
      });
    });

    describe('solution structure', () => {
      it('should have proper step structure for single digit', () => {
        const solution = method.generateSolution(111, 5);

        expect(solution.steps.length).toBeGreaterThan(1);

        solution.steps.forEach(step => {
          expect(step.expression).toBeTruthy();
          expect(step.explanation).toBeTruthy();
          expect(typeof step.result).toBe('number');
          expect(typeof step.depth).toBe('number');
        });
      });

      it('should have proper step structure for multi-digit', () => {
        const solution = method.generateSolution(111, 23);

        expect(solution.steps.length).toBeGreaterThan(1);

        solution.steps.forEach(step => {
          expect(step.expression).toBeTruthy();
          expect(step.explanation).toBeTruthy();
          expect(typeof step.result).toBe('number');
          expect(typeof step.depth).toBe('number');
        });
      });

      it('should set the method name correctly', () => {
        const solution = method.generateSolution(111, 5);
        expect(solution.method).toBe(MethodName.MultiplyBy111);
      });

      it('should provide optimal reason', () => {
        const solution = method.generateSolution(111, 5);
        expect(solution.optimalReason).toBeTruthy();
      });
    });
  });

  describe('computeCost', () => {
    it('should have lowest cost for single digit', () => {
      const cost = method.computeCost(111, 5);
      expect(cost).toBe(1.0);
    });

    it('should have higher cost for two-digit numbers', () => {
      const singleDigitCost = method.computeCost(111, 5);
      const twoDigitCost = method.computeCost(111, 23);

      expect(twoDigitCost).toBeGreaterThan(singleDigitCost);
    });

    it('should increase cost for larger numbers', () => {
      const twoDigitCost = method.computeCost(111, 23);
      const threeDigitCost = method.computeCost(111, 123);

      expect(threeDigitCost).toBeGreaterThan(twoDigitCost);
    });
  });

  describe('qualityScore', () => {
    it('should return 0 for non-applicable cases', () => {
      expect(method.qualityScore(47, 53)).toBe(0);
    });

    it('should return very high quality for single digits', () => {
      const quality = method.qualityScore(111, 5);
      expect(quality).toBeGreaterThan(0.95);
    });

    it('should return high quality for two-digit numbers', () => {
      const quality = method.qualityScore(111, 23);
      expect(quality).toBeGreaterThan(0.90);
    });

    it('should return good quality for larger numbers', () => {
      const quality = method.qualityScore(111, 123);
      expect(quality).toBeGreaterThan(0.80);
    });
  });

  describe('known solutions (repdigits)', () => {
    const repdigitSolutions = [
      { num1: 111, num2: 1, answer: 111, desc: '111 x 1 = 111' },
      { num1: 111, num2: 2, answer: 222, desc: '111 x 2 = 222' },
      { num1: 111, num2: 3, answer: 333, desc: '111 x 3 = 333' },
      { num1: 111, num2: 4, answer: 444, desc: '111 x 4 = 444' },
      { num1: 111, num2: 5, answer: 555, desc: '111 x 5 = 555' },
      { num1: 111, num2: 6, answer: 666, desc: '111 x 6 = 666' },
      { num1: 111, num2: 7, answer: 777, desc: '111 x 7 = 777' },
      { num1: 111, num2: 8, answer: 888, desc: '111 x 8 = 888' },
      { num1: 111, num2: 9, answer: 999, desc: '111 x 9 = 999' },
    ];

    repdigitSolutions.forEach(({ num1, num2, answer, desc }) => {
      it(`should correctly solve ${desc}`, () => {
        const solution = method.generateSolution(num1, num2);

        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(answer);
      });
    });
  });

  describe('known solutions (with carries)', () => {
    const knownSolutions = [
      { num1: 111, num2: 12, answer: 1332, desc: '111 x 12' },
      { num1: 111, num2: 23, answer: 2553, desc: '111 x 23' },
      { num1: 111, num2: 45, answer: 4995, desc: '111 x 45' },
      { num1: 111, num2: 67, answer: 7437, desc: '111 x 67' },
      { num1: 111, num2: 89, answer: 9879, desc: '111 x 89' },
      { num1: 111, num2: 99, answer: 10989, desc: '111 x 99' },
      { num1: 111, num2: 10, answer: 1110, desc: '111 x 10' },
      { num1: 111, num2: 50, answer: 5550, desc: '111 x 50' },
      { num1: 111, num2: 100, answer: 11100, desc: '111 x 100' },
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
    it('should handle 111 x 111 = 12321', () => {
      const solution = method.generateSolution(111, 111);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(12321);
    });

    it('should handle 111 x 11 = 1221', () => {
      const solution = method.generateSolution(111, 11);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(1221);
    });

    it('should handle swap: 5 x 111 = 555', () => {
      const solution = method.generateSolution(5, 111);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(555);
    });

    it('should handle swap: 23 x 111 = 2553', () => {
      const solution = method.generateSolution(23, 111);

      expect(solution.validated).toBe(true);
      const finalResult = solution.steps[solution.steps.length - 1]?.result;
      expect(finalResult).toBe(2553);
    });
  });

  describe('generateStudyContent', () => {
    it('should generate study content', () => {
      const content = method.generateStudyContent();

      expect(content.method).toBe(MethodName.MultiplyBy111);
      expect(content.introduction).toBeTruthy();
      expect(content.mathematicalFoundation).toBeTruthy();
      expect(content.whenToUse).toBeTruthy();
    });

    it('should include meaningful content about repdigits', () => {
      const content = method.generateStudyContent();

      expect(content.introduction.length).toBeGreaterThan(50);
      expect(content.introduction.toLowerCase()).toContain('repdigit');
    });

    it('should include mathematical foundation', () => {
      const content = method.generateStudyContent();

      expect(content.mathematicalFoundation.length).toBeGreaterThan(50);
      expect(content.mathematicalFoundation).toContain('100');
      expect(content.mathematicalFoundation).toContain('10');
    });
  });

  describe('random problem verification', () => {
    it('should produce valid solutions for random single-digit multipliers', () => {
      for (let i = 1; i <= 9; i++) {
        const solution = method.generateSolution(111, i);
        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(111 * i);
      }
    });

    it('should produce valid solutions for various two-digit multipliers', () => {
      const twoDigitNumbers = [10, 15, 23, 37, 42, 58, 67, 75, 84, 91, 99];

      for (const n of twoDigitNumbers) {
        const solution = method.generateSolution(111, n);
        expect(solution.validated).toBe(true);
        expect(solution.validationErrors).toHaveLength(0);

        const finalResult = solution.steps[solution.steps.length - 1]?.result;
        expect(finalResult).toBe(111 * n);
      }
    });
  });
});
