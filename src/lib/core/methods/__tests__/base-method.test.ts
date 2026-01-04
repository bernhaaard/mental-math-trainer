/**
 * Tests for BaseMethod utility functions
 * @module core/methods/__tests__/base-method
 */

import { describe, it, expect } from 'vitest';
import { BaseMethod } from '../base-method';
import type { MethodName, Solution, StudyContent } from '../../../types';

/**
 * Concrete implementation of BaseMethod for testing protected methods.
 * This class exposes the protected utility methods for testing purposes.
 */
class TestableMethod extends BaseMethod {
  name = 'distributive' as MethodName;
  displayName = 'Test Method';

  isApplicable(_num1: number, _num2: number): boolean {
    return true;
  }

  computeCost(_num1: number, _num2: number): number {
    return 1;
  }

  qualityScore(_num1: number, _num2: number): number {
    return 0.5;
  }

  generateSolution(_num1: number, _num2: number): Solution {
    return {
      method: this.name,
      steps: [],
      optimalReason: 'Test',
      alternatives: [],
      validated: true,
      validationErrors: []
    };
  }

  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: '',
      mathematicalFoundation: '',
      deepDiveContent: '',
      whenToUse: [],
      whenNotToUse: [],
      commonMistakes: [],
      practiceStrategies: [],
      examples: [],
      interactiveExercises: [],
      prerequisites: [],
      nextMethods: []
    };
  }

  // Expose protected methods for testing
  public testCountDigits(n: number): number {
    return this.countDigits(n);
  }

  public testIsNear(num: number, target: number, threshold: number): boolean {
    return this.isNear(num, target, threshold);
  }

  public testDecompose(n: number): { tens: number; ones: number } {
    return this.decompose(n);
  }

  public testDecomposeFullPlaceValue(n: number): number[] {
    return this.decomposeFullPlaceValue(n);
  }

  public testNearestRound(n: number): number {
    return this.nearestRound(n);
  }
}

describe('BaseMethod utility functions', () => {
  const method = new TestableMethod();

  describe('countDigits', () => {
    it('should count digits in positive single-digit numbers', () => {
      expect(method.testCountDigits(1)).toBe(1);
      expect(method.testCountDigits(5)).toBe(1);
      expect(method.testCountDigits(9)).toBe(1);
    });

    it('should count digits in positive multi-digit numbers', () => {
      expect(method.testCountDigits(10)).toBe(2);
      expect(method.testCountDigits(47)).toBe(2);
      expect(method.testCountDigits(99)).toBe(2);
      expect(method.testCountDigits(100)).toBe(3);
      expect(method.testCountDigits(999)).toBe(3);
      expect(method.testCountDigits(1000)).toBe(4);
      expect(method.testCountDigits(12345)).toBe(5);
    });

    it('should handle zero correctly', () => {
      expect(method.testCountDigits(0)).toBe(1);
    });

    it('should handle negative numbers (uses absolute value)', () => {
      expect(method.testCountDigits(-1)).toBe(1);
      expect(method.testCountDigits(-47)).toBe(2);
      expect(method.testCountDigits(-123)).toBe(3);
      expect(method.testCountDigits(-1000)).toBe(4);
    });

    it('should handle large numbers', () => {
      expect(method.testCountDigits(1000000)).toBe(7);
      expect(method.testCountDigits(999999999)).toBe(9);
      expect(method.testCountDigits(1234567890)).toBe(10);
    });

    it('should handle large negative numbers', () => {
      expect(method.testCountDigits(-1000000)).toBe(7);
      expect(method.testCountDigits(-999999999)).toBe(9);
    });
  });

  describe('isNear', () => {
    it('should return true when number is exactly at target', () => {
      expect(method.testIsNear(50, 50, 5)).toBe(true);
      expect(method.testIsNear(100, 100, 10)).toBe(true);
      expect(method.testIsNear(0, 0, 1)).toBe(true);
    });

    it('should return true when number is within threshold (below target)', () => {
      expect(method.testIsNear(45, 50, 5)).toBe(true);
      expect(method.testIsNear(47, 50, 5)).toBe(true);
      expect(method.testIsNear(49, 50, 5)).toBe(true);
    });

    it('should return true when number is within threshold (above target)', () => {
      expect(method.testIsNear(55, 50, 5)).toBe(true);
      expect(method.testIsNear(53, 50, 5)).toBe(true);
      expect(method.testIsNear(51, 50, 5)).toBe(true);
    });

    it('should return true on exact boundary', () => {
      expect(method.testIsNear(45, 50, 5)).toBe(true);
      expect(method.testIsNear(55, 50, 5)).toBe(true);
    });

    it('should return false when number is outside threshold', () => {
      expect(method.testIsNear(44, 50, 5)).toBe(false);
      expect(method.testIsNear(56, 50, 5)).toBe(false);
      expect(method.testIsNear(40, 50, 5)).toBe(false);
      expect(method.testIsNear(60, 50, 5)).toBe(false);
    });

    it('should handle zero threshold', () => {
      expect(method.testIsNear(50, 50, 0)).toBe(true);
      expect(method.testIsNear(49, 50, 0)).toBe(false);
      expect(method.testIsNear(51, 50, 0)).toBe(false);
    });

    it('should handle negative numbers', () => {
      expect(method.testIsNear(-5, 0, 10)).toBe(true);
      expect(method.testIsNear(-15, 0, 10)).toBe(false);
      expect(method.testIsNear(-95, -100, 5)).toBe(true);
      expect(method.testIsNear(-105, -100, 5)).toBe(true);
      expect(method.testIsNear(-110, -100, 5)).toBe(false);
    });

    it('should handle large thresholds', () => {
      expect(method.testIsNear(0, 100, 100)).toBe(true);
      expect(method.testIsNear(200, 100, 100)).toBe(true);
      expect(method.testIsNear(201, 100, 100)).toBe(false);
    });
  });

  describe('decompose', () => {
    it('should decompose two-digit numbers correctly', () => {
      expect(method.testDecompose(47)).toEqual({ tens: 40, ones: 7 });
      expect(method.testDecompose(23)).toEqual({ tens: 20, ones: 3 });
      expect(method.testDecompose(90)).toEqual({ tens: 90, ones: 0 });
      expect(method.testDecompose(15)).toEqual({ tens: 10, ones: 5 });
    });

    it('should handle single-digit numbers', () => {
      expect(method.testDecompose(7)).toEqual({ tens: 0, ones: 7 });
      expect(method.testDecompose(0)).toEqual({ tens: 0, ones: 0 });
      expect(method.testDecompose(9)).toEqual({ tens: 0, ones: 9 });
    });

    it('should handle numbers ending in zero', () => {
      expect(method.testDecompose(10)).toEqual({ tens: 10, ones: 0 });
      expect(method.testDecompose(50)).toEqual({ tens: 50, ones: 0 });
      expect(method.testDecompose(100)).toEqual({ tens: 100, ones: 0 });
    });

    it('should handle three-digit numbers (returns tens as >= 100)', () => {
      expect(method.testDecompose(123)).toEqual({ tens: 120, ones: 3 });
      expect(method.testDecompose(500)).toEqual({ tens: 500, ones: 0 });
    });

    it('should handle negative numbers (uses absolute value)', () => {
      expect(method.testDecompose(-47)).toEqual({ tens: 40, ones: 7 });
      expect(method.testDecompose(-23)).toEqual({ tens: 20, ones: 3 });
      expect(method.testDecompose(-8)).toEqual({ tens: 0, ones: 8 });
    });

    it('should handle edge case of zero', () => {
      expect(method.testDecompose(0)).toEqual({ tens: 0, ones: 0 });
    });
  });

  describe('decomposeFullPlaceValue', () => {
    it('should decompose single-digit numbers', () => {
      expect(method.testDecomposeFullPlaceValue(7)).toEqual([7]);
      expect(method.testDecomposeFullPlaceValue(1)).toEqual([1]);
      expect(method.testDecomposeFullPlaceValue(9)).toEqual([9]);
    });

    it('should decompose two-digit numbers', () => {
      expect(method.testDecomposeFullPlaceValue(47)).toEqual([40, 7]);
      expect(method.testDecomposeFullPlaceValue(23)).toEqual([20, 3]);
      expect(method.testDecomposeFullPlaceValue(99)).toEqual([90, 9]);
    });

    it('should decompose three-digit numbers', () => {
      expect(method.testDecomposeFullPlaceValue(347)).toEqual([300, 40, 7]);
      expect(method.testDecomposeFullPlaceValue(123)).toEqual([100, 20, 3]);
      expect(method.testDecomposeFullPlaceValue(999)).toEqual([900, 90, 9]);
    });

    it('should handle numbers with zeros in the middle', () => {
      expect(method.testDecomposeFullPlaceValue(1005)).toEqual([1000, 5]);
      expect(method.testDecomposeFullPlaceValue(101)).toEqual([100, 1]);
      expect(method.testDecomposeFullPlaceValue(1001)).toEqual([1000, 1]);
      expect(method.testDecomposeFullPlaceValue(3007)).toEqual([3000, 7]);
      expect(method.testDecomposeFullPlaceValue(5050)).toEqual([5000, 50]);
    });

    it('should handle numbers ending in zeros', () => {
      expect(method.testDecomposeFullPlaceValue(50)).toEqual([50]);
      expect(method.testDecomposeFullPlaceValue(100)).toEqual([100]);
      expect(method.testDecomposeFullPlaceValue(500)).toEqual([500]);
      expect(method.testDecomposeFullPlaceValue(1000)).toEqual([1000]);
    });

    it('should handle zero', () => {
      expect(method.testDecomposeFullPlaceValue(0)).toEqual([0]);
    });

    it('should handle negative numbers (uses absolute value)', () => {
      expect(method.testDecomposeFullPlaceValue(-347)).toEqual([300, 40, 7]);
      expect(method.testDecomposeFullPlaceValue(-1005)).toEqual([1000, 5]);
      expect(method.testDecomposeFullPlaceValue(-50)).toEqual([50]);
    });

    it('should decompose four-digit numbers', () => {
      expect(method.testDecomposeFullPlaceValue(1234)).toEqual([1000, 200, 30, 4]);
      expect(method.testDecomposeFullPlaceValue(5678)).toEqual([5000, 600, 70, 8]);
    });

    it('should handle large numbers', () => {
      expect(method.testDecomposeFullPlaceValue(12345)).toEqual([10000, 2000, 300, 40, 5]);
      expect(method.testDecomposeFullPlaceValue(100000)).toEqual([100000]);
    });

    it('should ensure sum of parts equals original number', () => {
      const testNumbers = [347, 1005, 50, 123, 9999, 10000, 5050, 3007];
      testNumbers.forEach(n => {
        const parts = method.testDecomposeFullPlaceValue(n);
        const sum = parts.reduce((acc, val) => acc + val, 0);
        expect(sum).toBe(n);
      });
    });
  });

  describe('nearestRound', () => {
    it('should round down when closer to lower multiple of 10', () => {
      expect(method.testNearestRound(23)).toBe(20);
      expect(method.testNearestRound(12)).toBe(10);
      expect(method.testNearestRound(44)).toBe(40);
      expect(method.testNearestRound(71)).toBe(70);
    });

    it('should round up when closer to upper multiple of 10', () => {
      expect(method.testNearestRound(47)).toBe(50);
      expect(method.testNearestRound(18)).toBe(20);
      expect(method.testNearestRound(56)).toBe(60);
      expect(method.testNearestRound(99)).toBe(100);
    });

    it('should round down on ties (exactly in the middle)', () => {
      // Note: The implementation uses <=, so ties go to lower
      // Testing the actual behavior: absN - lower <= upper - absN means ties go to lower
      expect(method.testNearestRound(45)).toBe(40);
      expect(method.testNearestRound(25)).toBe(20);
      expect(method.testNearestRound(55)).toBe(50);
      expect(method.testNearestRound(85)).toBe(80);
    });

    it('should handle exact multiples of 10', () => {
      expect(method.testNearestRound(10)).toBe(10);
      expect(method.testNearestRound(50)).toBe(50);
      expect(method.testNearestRound(100)).toBe(100);
      expect(method.testNearestRound(0)).toBe(0);
    });

    it('should handle single-digit numbers', () => {
      expect(method.testNearestRound(1)).toBe(0);
      expect(method.testNearestRound(4)).toBe(0);
      expect(method.testNearestRound(6)).toBe(10);
      expect(method.testNearestRound(9)).toBe(10);
    });

    it('should handle negative numbers', () => {
      // For negative, the sign is applied after rounding
      expect(method.testNearestRound(-23)).toBe(-20);
      expect(method.testNearestRound(-47)).toBe(-50);
      expect(method.testNearestRound(-10)).toBe(-10);
      // Note: -5 rounds to -0 due to JavaScript's signed zero behavior
      // We check it equals zero (Object.is(-0, 0) is false, but -0 == 0 is true)
      expect(method.testNearestRound(-5)).toEqual(-0);
    });

    it('should handle three-digit numbers', () => {
      expect(method.testNearestRound(123)).toBe(120);
      expect(method.testNearestRound(127)).toBe(130);
      expect(method.testNearestRound(150)).toBe(150);
    });

    it('should handle numbers just below round value', () => {
      expect(method.testNearestRound(49)).toBe(50);
      expect(method.testNearestRound(99)).toBe(100);
      expect(method.testNearestRound(29)).toBe(30);
    });

    it('should handle numbers just above round value', () => {
      expect(method.testNearestRound(51)).toBe(50);
      expect(method.testNearestRound(101)).toBe(100);
      expect(method.testNearestRound(31)).toBe(30);
    });
  });

  describe('abstract method implementation', () => {
    it('should have required abstract properties', () => {
      expect(method.name).toBe('distributive');
      expect(method.displayName).toBe('Test Method');
    });

    it('should implement isApplicable', () => {
      expect(method.isApplicable(10, 20)).toBe(true);
    });

    it('should implement computeCost', () => {
      expect(method.computeCost(10, 20)).toBe(1);
    });

    it('should implement qualityScore', () => {
      expect(method.qualityScore(10, 20)).toBe(0.5);
    });

    it('should implement generateSolution', () => {
      const solution = method.generateSolution(10, 20);
      expect(solution).toBeDefined();
      expect(solution.method).toBe('distributive');
      expect(solution.validated).toBe(true);
    });

    it('should implement generateStudyContent', () => {
      const content = method.generateStudyContent();
      expect(content).toBeDefined();
      expect(content.method).toBe('distributive');
    });
  });
});
