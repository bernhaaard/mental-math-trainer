/**
 * Tests for Sum-to-Ten multiplication method.
 * @module core/methods/__tests__/sum-to-ten
 */

import { describe, it, expect } from 'vitest';
import { SumToTenMethod } from '../sum-to-ten';
import { MethodName } from '../../../types';

describe('SumToTenMethod', () => {
  const method = new SumToTenMethod();

  describe('basic properties', () => {
    it('should have correct name and display name', () => {
      expect(method.name).toBe(MethodName.SumToTen);
      expect(method.displayName).toBe('Sum-to-Ten Multiplication');
    });
  });

  describe('isApplicable', () => {
    it('should return true for 2-digit numbers with same tens and units summing to 10', () => {
      expect(method.isApplicable(44, 46)).toBe(true);
      expect(method.isApplicable(23, 27)).toBe(true);
      expect(method.isApplicable(81, 89)).toBe(true);
      expect(method.isApplicable(32, 38)).toBe(true);
    });

    it('should return true for units 5+5 case', () => {
      expect(method.isApplicable(25, 25)).toBe(true);
      expect(method.isApplicable(35, 35)).toBe(true);
    });

    it('should return true for 3-digit numbers with same prefix', () => {
      expect(method.isApplicable(124, 126)).toBe(true);
      expect(method.isApplicable(213, 217)).toBe(true);
    });

    it('should return false when tens digits differ', () => {
      expect(method.isApplicable(23, 37)).toBe(false);
      expect(method.isApplicable(44, 56)).toBe(false);
    });

    it('should return false when units do not sum to 10', () => {
      expect(method.isApplicable(44, 47)).toBe(false);
      expect(method.isApplicable(23, 28)).toBe(false);
    });

    it('should return false for single-digit numbers', () => {
      expect(method.isApplicable(4, 6)).toBe(false);
      expect(method.isApplicable(3, 7)).toBe(false);
    });

    it('should return false for 3-digit numbers with different prefix', () => {
      expect(method.isApplicable(124, 136)).toBe(false);
      expect(method.isApplicable(213, 317)).toBe(false);
    });

    it('should handle negative numbers', () => {
      expect(method.isApplicable(-44, 46)).toBe(true);
      expect(method.isApplicable(44, -46)).toBe(true);
      expect(method.isApplicable(-44, -46)).toBe(true);
    });
  });

  describe('generateSolution', () => {
    describe('2-digit numbers', () => {
      it('should solve 44 × 46 = 2024', () => {
        const solution = method.generateSolution(44, 46);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(2024);
      });

      it('should solve 23 × 27 = 621', () => {
        const solution = method.generateSolution(23, 27);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(621);
      });

      it('should solve 81 × 89 = 7209 (handles single-digit unit product)', () => {
        const solution = method.generateSolution(81, 89);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(7209);
      });

      it('should solve 63 × 67 = 4221', () => {
        const solution = method.generateSolution(63, 67);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(4221);
      });
    });

    describe('3-digit numbers (regression test for 3-digit bug)', () => {
      it('should solve 124 × 126 = 15624', () => {
        const solution = method.generateSolution(124, 126);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(15624);
        // Verify intermediate step: 12 × 13 = 156
        const baseMultStep = solution.steps.find(s => s.expression.includes('12 * 13'));
        expect(baseMultStep).toBeDefined();
        expect(baseMultStep?.result).toBe(156);
      });

      it('should solve 213 × 217 = 46221', () => {
        const solution = method.generateSolution(213, 217);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(46221);
      });

      it('should solve 341 × 349 = 119009', () => {
        const solution = method.generateSolution(341, 349);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(119009);
      });
    });

    describe('5+5 units case', () => {
      it('should solve 25 × 25 = 625', () => {
        const solution = method.generateSolution(25, 25);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(625);
      });

      it('should solve 45 × 45 = 2025', () => {
        const solution = method.generateSolution(45, 45);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(2025);
      });
    });

    describe('negative numbers', () => {
      it('should handle one negative number', () => {
        const solution = method.generateSolution(-44, 46);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(-2024);
      });

      it('should handle both negative numbers', () => {
        const solution = method.generateSolution(-44, -46);
        expect(solution.validated).toBe(true);
        expect(solution.steps[solution.steps.length - 1].result).toBe(2024);
      });
    });

    describe('commutativity', () => {
      it('should produce same result regardless of order', () => {
        const sol1 = method.generateSolution(44, 46);
        const sol2 = method.generateSolution(46, 44);
        expect(sol1.steps[sol1.steps.length - 1].result)
          .toBe(sol2.steps[sol2.steps.length - 1].result);
      });
    });
  });

  describe('computeCost', () => {
    it('should have low cost for 2-digit numbers', () => {
      const cost = method.computeCost(44, 46);
      expect(cost).toBeLessThan(5);
    });

    it('should have higher cost for 3-digit numbers', () => {
      const cost2digit = method.computeCost(44, 46);
      const cost3digit = method.computeCost(124, 126);
      expect(cost3digit).toBeGreaterThan(cost2digit);
    });

    it('should have slightly higher cost when base >= 5', () => {
      const costLowBase = method.computeCost(24, 26);
      const costHighBase = method.computeCost(54, 56);
      expect(costHighBase).toBeGreaterThan(costLowBase);
    });
  });

  describe('qualityScore', () => {
    it('should return high quality when applicable', () => {
      const score = method.qualityScore(44, 46);
      expect(score).toBeGreaterThan(0.9);
    });

    it('should return 0 when not applicable', () => {
      const score = method.qualityScore(44, 47);
      expect(score).toBe(0);
    });
  });

  describe('generateStudyContent', () => {
    it('should provide complete study content', () => {
      const content = method.generateStudyContent();
      expect(content.method).toBe(MethodName.SumToTen);
      expect(content.introduction).toBeDefined();
      expect(content.mathematicalFoundation).toBeDefined();
      expect(content.whenToUse.length).toBeGreaterThan(0);
      expect(content.commonMistakes.length).toBeGreaterThan(0);
    });
  });
});
