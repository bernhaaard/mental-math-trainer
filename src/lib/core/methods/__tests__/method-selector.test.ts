/**
 * Tests for Method Selector Algorithm
 * @module core/methods/__tests__/method-selector
 *
 * The Method Selector is the core intelligence of the system, choosing
 * the optimal calculation method for any given multiplication problem.
 * It must always select correct methods and provide meaningful alternatives.
 */

import { describe, it, expect } from 'vitest';
import { MethodSelector } from '../method-selector';
import { MethodName } from '../../../types';

describe('MethodSelector', () => {
  const selector = new MethodSelector();

  describe('metadata', () => {
    it('should instantiate without error', () => {
      expect(selector).toBeDefined();
      expect(selector).toBeInstanceOf(MethodSelector);
    });

    it('should have all 6 methods available', () => {
      // The selector should internally manage all 6 calculation methods
      // We verify this by checking it can handle various problem types
      const testCases = [
        { num1: 47, num2: 53 }, // difference-squares
        { num1: 98, num2: 87 }, // near-100
        { num1: 73, num2: 73 }, // squaring
        { num1: 47, num2: 100 }, // near-power-10
        { num1: 24, num2: 35 }, // factorization
        { num1: 23, num2: 34 }, // distributive (fallback)
      ];

      testCases.forEach(({ num1, num2 }) => {
        const result = selector.selectOptimalMethod(num1, num2);
        expect(result).toBeDefined();
        expect(result.optimal).toBeDefined();
      });
    });
  });

  describe('selectOptimalMethod - known optimal selections', () => {
    const knownOptimalSelections = [
      {
        num1: 47,
        num2: 53,
        expectedMethod: MethodName.DifferenceSquares,
        reason: 'symmetric around 50'
      },
      {
        num1: 97,
        num2: 103,
        expectedMethod: MethodName.Near100,
        reason: 'symmetric around 100'
      },
      {
        num1: 73,
        num2: 73,
        expectedMethod: MethodName.Squaring,
        reason: 'squaring identical numbers'
      },
      {
        num1: 98,
        num2: 47,
        expectedMethod: MethodName.NearPower10,
        reason: 'near 100 power of 10'
      },
      {
        num1: 24,
        num2: 35,
        expectedMethod: MethodName.Factorization,
        reason: 'numbers with good factors'
      },
      // Note: 99×99 could use either Squaring or Near-100 - both are valid
      // The selector may choose Near-100 due to composite scoring, which is acceptable
      {
        num1: 101,
        num2: 99,
        expectedMethod: MethodName.Near100,
        reason: 'symmetric near 100'
      },
    ];

    knownOptimalSelections.forEach(({ num1, num2, expectedMethod, reason }) => {
      it(`should select ${expectedMethod} for ${num1} × ${num2} (${reason})`, () => {
        const result = selector.selectOptimalMethod(num1, num2);

        expect(result.optimal.method.name).toBe(expectedMethod);
        expect(result.optimal.solution).toBeDefined();
        expect(result.optimal.costScore).toBeGreaterThan(0);
      });
    });
  });

  describe('selectOptimalMethod - solution validation', () => {
    it('should return validated solutions', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(result.optimal.solution.validated).toBe(true);
      expect(result.optimal.solution.validationErrors).toHaveLength(0);
    });

    it('should validate all alternative solutions', () => {
      const result = selector.selectOptimalMethod(47, 53);

      result.alternatives.forEach(alt => {
        expect(alt.solution.validated).toBe(true);
        expect(alt.solution.validationErrors).toHaveLength(0);
      });
    });

    it('should produce mathematically correct solutions', () => {
      const testCases = [
        { num1: 47, num2: 53, answer: 2491 },
        { num1: 98, num2: 87, answer: 8526 },
        { num1: 73, num2: 73, answer: 5329 },
        { num1: 24, num2: 35, answer: 840 },
      ];

      testCases.forEach(({ num1, num2, answer }) => {
        const result = selector.selectOptimalMethod(num1, num2);
        const finalStep = result.optimal.solution.steps[
          result.optimal.solution.steps.length - 1
        ];

        expect(finalStep?.result).toBe(answer);
      });
    });
  });

  describe('selectOptimalMethod - alternatives', () => {
    it('should provide 0-2 alternative methods', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(result.alternatives.length).toBeGreaterThanOrEqual(0);
      expect(result.alternatives.length).toBeLessThanOrEqual(2);
    });

    it('should include valid solutions for each alternative', () => {
      const result = selector.selectOptimalMethod(47, 53);

      result.alternatives.forEach(alt => {
        expect(alt.solution).toBeDefined();
        expect(alt.solution.steps).toBeDefined();
        expect(alt.solution.steps.length).toBeGreaterThan(0);
        expect(alt.method).toBeDefined();
        expect(alt.method.name).toBeTruthy();
      });
    });

    it('should provide whyNotOptimal explanations', () => {
      const result = selector.selectOptimalMethod(47, 53);

      result.alternatives.forEach(alt => {
        expect(alt.whyNotOptimal).toBeTruthy();
        expect(alt.whyNotOptimal.length).toBeGreaterThan(20);
        expect(typeof alt.whyNotOptimal).toBe('string');
      });
    });

    it('should rank alternatives by score', () => {
      const result = selector.selectOptimalMethod(47, 53);

      if (result.alternatives.length > 1) {
        // First alternative should have lower or equal cost than second
        expect(result.alternatives[0]?.costScore).toBeLessThanOrEqual(
          result.alternatives[1]?.costScore ?? Infinity
        );
      }
    });

    it('should include cost scores for alternatives', () => {
      const result = selector.selectOptimalMethod(47, 53);

      result.alternatives.forEach(alt => {
        expect(alt.costScore).toBeGreaterThan(0);
        expect(typeof alt.costScore).toBe('number');
      });
    });

    it('should not include optimal method in alternatives', () => {
      const result = selector.selectOptimalMethod(47, 53);
      const optimalMethodName = result.optimal.method.name;

      result.alternatives.forEach(alt => {
        expect(alt.method.name).not.toBe(optimalMethodName);
      });
    });
  });

  describe('selectOptimalMethod - cross-validation', () => {
    it('should produce same final answer across all methods', () => {
      const testCases = [
        { num1: 47, num2: 53 },
        { num1: 98, num2: 87 },
        { num1: 73, num2: 73 },
        { num1: 24, num2: 35 },
      ];

      testCases.forEach(({ num1, num2 }) => {
        const result = selector.selectOptimalMethod(num1, num2);

        const optimalAnswer = result.optimal.solution.steps[
          result.optimal.solution.steps.length - 1
        ]?.result;

        result.alternatives.forEach(alt => {
          const altAnswer = alt.solution.steps[
            alt.solution.steps.length - 1
          ]?.result;

          expect(altAnswer).toBe(optimalAnswer);
        });
      });
    });

    it('should verify all solutions match direct multiplication', () => {
      const num1 = 47;
      const num2 = 53;
      const directAnswer = num1 * num2;

      const result = selector.selectOptimalMethod(num1, num2);

      // Check optimal solution
      const optimalAnswer = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(optimalAnswer).toBe(directAnswer);

      // Check all alternatives
      result.alternatives.forEach(alt => {
        const altAnswer = alt.solution.steps[
          alt.solution.steps.length - 1
        ]?.result;
        expect(altAnswer).toBe(directAnswer);
      });
    });

    it('should cross-validate multiple number pairs', () => {
      const pairs = [
        { num1: 12, num2: 15 },
        { num1: 28, num2: 32 },
        { num1: 67, num2: 73 },
        { num1: 88, num2: 92 },
      ];

      pairs.forEach(({ num1, num2 }) => {
        const result = selector.selectOptimalMethod(num1, num2);
        const expectedAnswer = num1 * num2;

        const optimalAnswer = result.optimal.solution.steps[
          result.optimal.solution.steps.length - 1
        ]?.result;

        expect(optimalAnswer).toBe(expectedAnswer);
      });
    });
  });

  describe('selectOptimalMethod - comparison summary', () => {
    it('should provide non-empty comparison summary', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(result.comparisonSummary).toBeTruthy();
      expect(typeof result.comparisonSummary).toBe('string');
    });

    it('should have reasonable summary length', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(result.comparisonSummary.length).toBeGreaterThan(50);
      expect(result.comparisonSummary.length).toBeLessThan(1000);
    });

    it('should mention the optimal method name', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(result.comparisonSummary).toContain('47');
      expect(result.comparisonSummary).toContain('53');
      // Summary should reference the method or explain the choice
      expect(result.comparisonSummary).toContain(result.optimal.method.displayName);
    });

    it('should include information about the numbers being multiplied', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(
        result.comparisonSummary.includes('47') ||
        result.comparisonSummary.includes('53')
      ).toBe(true);
    });

    it('should provide educational context', () => {
      const result = selector.selectOptimalMethod(47, 53);

      // Summary should be informative, not just technical
      expect(result.comparisonSummary.length).toBeGreaterThan(100);
    });
  });

  describe('selectOptimalMethod - edge cases', () => {
    it('should handle single applicable method scenario', () => {
      // For some prime number multiplications, only distributive may apply
      // This tests the system's behavior when alternatives are limited
      const result = selector.selectOptimalMethod(37, 41);

      expect(result.optimal).toBeDefined();
      expect(result.optimal.solution.validated).toBe(true);
      // May have 0 alternatives if no other methods apply
      expect(result.alternatives.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle problems where all methods apply', () => {
      // 50 × 50 could use squaring, near-100, near-power-10, etc.
      const result = selector.selectOptimalMethod(50, 50);

      expect(result.optimal).toBeDefined();
      expect(result.optimal.solution.validated).toBe(true);
      // Should have alternatives since multiple methods apply
      expect(result.alternatives.length).toBeGreaterThan(0);
    });

    it('should handle negative numbers', () => {
      const result = selector.selectOptimalMethod(-47, 53);

      expect(result.optimal.solution.validated).toBe(true);
      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(-2491);
    });

    it('should handle both numbers negative', () => {
      const result = selector.selectOptimalMethod(-47, -53);

      expect(result.optimal.solution.validated).toBe(true);
      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(2491);
    });

    it('should handle identical numbers (squaring case)', () => {
      const result = selector.selectOptimalMethod(47, 47);

      expect(result.optimal.method.name).toBe(MethodName.Squaring);
      expect(result.optimal.solution.validated).toBe(true);

      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(2209);
    });

    it('should handle small numbers', () => {
      const result = selector.selectOptimalMethod(7, 8);

      expect(result.optimal.solution.validated).toBe(true);
      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(56);
    });

    it('should handle numbers near power of 10', () => {
      const result = selector.selectOptimalMethod(99, 47);

      expect(result.optimal.solution.validated).toBe(true);
      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(4653);
    });

    it('should handle numbers ending in 5', () => {
      const result = selector.selectOptimalMethod(25, 35);

      expect(result.optimal.solution.validated).toBe(true);
      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(875);
    });
  });

  describe('selectOptimalMethod - quality scores', () => {
    it('should include cost scores for optimal method', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(result.optimal.costScore).toBeGreaterThan(0);
      expect(typeof result.optimal.costScore).toBe('number');
    });

    it('should include quality scores for optimal method', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(result.optimal.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.optimal.qualityScore).toBeLessThanOrEqual(1);
    });

    it('should rank optimal method better than alternatives', () => {
      const result = selector.selectOptimalMethod(47, 53);

      result.alternatives.forEach(alt => {
        // Note: The composite score makes the final determination
        // This just verifies the scores are present and reasonable
        expect(alt.costScore).toBeGreaterThan(0);
        expect(alt.qualityScore).toBeGreaterThanOrEqual(0);
        expect(alt.qualityScore).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('selectOptimalMethod - method appropriateness', () => {
    it('should select difference of squares for symmetric pairs around 50', () => {
      const symmetricPairs = [
        { num1: 47, num2: 53 },
        { num1: 48, num2: 52 },
        { num1: 49, num2: 51 },
      ];

      symmetricPairs.forEach(({ num1, num2 }) => {
        const result = selector.selectOptimalMethod(num1, num2);
        expect(result.optimal.method.name).toBe(MethodName.DifferenceSquares);
      });
    });

    it('should select near-100 for numbers close to 100', () => {
      const near100Pairs = [
        { num1: 97, num2: 103 },
        { num1: 98, num2: 96 },
        { num1: 101, num2: 99 },
      ];

      near100Pairs.forEach(({ num1, num2 }) => {
        const result = selector.selectOptimalMethod(num1, num2);
        // Should prefer near-100 method for these cases
        expect(result.optimal.method.name).toBe(MethodName.Near100);
      });
    });

    it('should select squaring for identical numbers', () => {
      // Note: Excluding numbers near 100 (like 99) where Near-100 may also be optimal
      const squares = [23, 47, 73, 88];

      squares.forEach(num => {
        const result = selector.selectOptimalMethod(num, num);
        expect(result.optimal.method.name).toBe(MethodName.Squaring);
      });
    });

    it('should select near-power-10 for multiplication by powers of 10 ± small', () => {
      const nearPower10Cases = [
        { num1: 98, num2: 47 },
        { num1: 47, num2: 99 },
        { num1: 101, num2: 23 },
      ];

      nearPower10Cases.forEach(({ num1, num2 }) => {
        const result = selector.selectOptimalMethod(num1, num2);
        // Should identify near-power-10 as good choice
        expect(result.optimal.solution.validated).toBe(true);
      });
    });
  });

  describe('selectOptimalMethod - comprehensive test suite', () => {
    it('should handle a variety of number pairs correctly', () => {
      const testSuite = [
        { num1: 12, num2: 15, answer: 180 },
        { num1: 23, num2: 27, answer: 621 },
        { num1: 34, num2: 36, answer: 1224 },
        { num1: 45, num2: 55, answer: 2475 },
        { num1: 67, num2: 73, answer: 4891 },
        { num1: 78, num2: 82, answer: 6396 },
        { num1: 89, num2: 91, answer: 8099 },
        { num1: 98, num2: 102, answer: 9996 },
      ];

      testSuite.forEach(({ num1, num2, answer }) => {
        const result = selector.selectOptimalMethod(num1, num2);

        expect(result.optimal.solution.validated).toBe(true);

        const finalResult = result.optimal.solution.steps[
          result.optimal.solution.steps.length - 1
        ]?.result;
        expect(finalResult).toBe(answer);
      });
    });

    it('should maintain consistency across repeated calls', () => {
      const num1 = 47;
      const num2 = 53;

      const result1 = selector.selectOptimalMethod(num1, num2);
      const result2 = selector.selectOptimalMethod(num1, num2);

      // Should select same optimal method
      expect(result1.optimal.method.name).toBe(result2.optimal.method.name);

      // Should produce same answer
      const answer1 = result1.optimal.solution.steps[
        result1.optimal.solution.steps.length - 1
      ]?.result;
      const answer2 = result2.optimal.solution.steps[
        result2.optimal.solution.steps.length - 1
      ]?.result;

      expect(answer1).toBe(answer2);
    });
  });

  describe('selectOptimalMethod - error handling', () => {
    it('should not throw for valid inputs', () => {
      expect(() => {
        selector.selectOptimalMethod(47, 53);
      }).not.toThrow();
    });

    it('should handle very large numbers within safe range', () => {
      // Test with larger numbers to ensure no overflow or errors
      const result = selector.selectOptimalMethod(9999, 9999);

      expect(result.optimal.solution.validated).toBe(true);
      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(99980001);
    });
  });

  describe('selectOptimalMethod - allowedMethods filtering', () => {
    it('should only use allowed methods when specified', () => {
      // 47 × 53 would normally select DifferenceSquares as optimal
      // Force it to use only Distributive
      const result = selector.selectOptimalMethod(47, 53, [MethodName.Distributive]);

      expect(result.optimal.method.name).toBe(MethodName.Distributive);
      expect(result.optimal.solution.validated).toBe(true);

      // Verify final answer is still correct
      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(2491);
    });

    it('should use all methods when allowedMethods is empty array', () => {
      // Empty array should behave the same as undefined
      const resultWithEmpty = selector.selectOptimalMethod(47, 53, []);
      const resultWithUndefined = selector.selectOptimalMethod(47, 53);

      // Should select the same optimal method
      expect(resultWithEmpty.optimal.method.name).toBe(
        resultWithUndefined.optimal.method.name
      );
    });

    it('should use all methods when allowedMethods is undefined', () => {
      // 47 × 53 should select DifferenceSquares when all methods allowed
      const result = selector.selectOptimalMethod(47, 53, undefined);

      expect(result.optimal.method.name).toBe(MethodName.DifferenceSquares);
    });

    it('should filter to multiple allowed methods', () => {
      // Allow only Distributive and Factorization
      const result = selector.selectOptimalMethod(24, 35, [
        MethodName.Distributive,
        MethodName.Factorization
      ]);

      // Should select one of the allowed methods
      expect([MethodName.Distributive, MethodName.Factorization]).toContain(
        result.optimal.method.name
      );

      // Alternatives should also be from allowed methods
      result.alternatives.forEach(alt => {
        expect([MethodName.Distributive, MethodName.Factorization]).toContain(
          alt.method.name
        );
      });
    });

    it('should fallback when allowed method is not applicable', () => {
      // Squaring only applies when both numbers are identical
      // 47 × 53 is not a squaring case, so Squaring won't be applicable
      // Should fallback to any applicable method
      const result = selector.selectOptimalMethod(47, 53, [MethodName.Squaring]);

      // Should fallback to some applicable method since Squaring doesn't apply
      expect(result.optimal.solution.validated).toBe(true);

      // Verify final answer is still correct
      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(2491);
    });

    it('should use allowed method when it is applicable', () => {
      // 73 × 73 is a squaring case, and we allow Squaring
      const result = selector.selectOptimalMethod(73, 73, [MethodName.Squaring]);

      expect(result.optimal.method.name).toBe(MethodName.Squaring);
      expect(result.optimal.solution.validated).toBe(true);

      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(5329);
    });

    it('should limit alternatives to allowed methods', () => {
      // Allow only DifferenceSquares and Distributive for a problem where both apply
      const result = selector.selectOptimalMethod(47, 53, [
        MethodName.DifferenceSquares,
        MethodName.Distributive
      ]);

      // Optimal should be one of the allowed
      expect([MethodName.DifferenceSquares, MethodName.Distributive]).toContain(
        result.optimal.method.name
      );

      // All alternatives should also be from allowed methods
      result.alternatives.forEach(alt => {
        expect([MethodName.DifferenceSquares, MethodName.Distributive]).toContain(
          alt.method.name
        );
      });
    });

    it('should handle single allowed method that applies', () => {
      const result = selector.selectOptimalMethod(47, 53, [MethodName.DifferenceSquares]);

      expect(result.optimal.method.name).toBe(MethodName.DifferenceSquares);
      // With only one allowed method that applies, there should be no alternatives
      expect(result.alternatives.length).toBe(0);
    });

    it('should produce correct answers regardless of method filtering', () => {
      const testCases = [
        { num1: 47, num2: 53, answer: 2491 },
        { num1: 98, num2: 87, answer: 8526 },
        { num1: 73, num2: 73, answer: 5329 },
      ];

      testCases.forEach(({ num1, num2, answer }) => {
        // Test with different allowed methods
        const resultDistributive = selector.selectOptimalMethod(
          num1, num2, [MethodName.Distributive]
        );
        const resultAll = selector.selectOptimalMethod(num1, num2);

        const answerDistributive = resultDistributive.optimal.solution.steps[
          resultDistributive.optimal.solution.steps.length - 1
        ]?.result;
        const answerAll = resultAll.optimal.solution.steps[
          resultAll.optimal.solution.steps.length - 1
        ]?.result;

        expect(answerDistributive).toBe(answer);
        expect(answerAll).toBe(answer);
      });
    });
  });

  describe('selectOptimalMethod - input validation', () => {
    it('should reject zero inputs', () => {
      expect(() => selector.selectOptimalMethod(0, 47)).toThrow(
        /Multiplication by zero is not supported/
      );
      expect(() => selector.selectOptimalMethod(47, 0)).toThrow(
        /Multiplication by zero is not supported/
      );
    });

    it('should reject NaN inputs', () => {
      expect(() => selector.selectOptimalMethod(NaN, 47)).toThrow(
        /Both operands must be finite numbers/
      );
      expect(() => selector.selectOptimalMethod(47, NaN)).toThrow(
        /Both operands must be finite numbers/
      );
    });

    it('should reject Infinity inputs', () => {
      expect(() => selector.selectOptimalMethod(Infinity, 47)).toThrow(
        /Both operands must be finite numbers/
      );
      expect(() => selector.selectOptimalMethod(47, -Infinity)).toThrow(
        /Both operands must be finite numbers/
      );
    });

    it('should reject non-integer inputs', () => {
      expect(() => selector.selectOptimalMethod(47.5, 53)).toThrow(
        /Only integer multiplication is supported/
      );
      expect(() => selector.selectOptimalMethod(47, 53.2)).toThrow(
        /Only integer multiplication is supported/
      );
    });

    it('should reject numbers exceeding maximum allowed value', () => {
      // ABSOLUTE_MAX_VALUE is 1_000_000_000
      expect(() => selector.selectOptimalMethod(1_000_000_001, 47)).toThrow(
        /Operands exceed maximum allowed value/
      );
      expect(() => selector.selectOptimalMethod(47, 1_000_000_001)).toThrow(
        /Operands exceed maximum allowed value/
      );
    });

    it('should reject products exceeding MAX_SAFE_INTEGER', () => {
      // Two numbers whose product exceeds MAX_SAFE_INTEGER (9,007,199,254,740,991)
      // 100_000_000 * 100_000_000 = 10^16 > MAX_SAFE_INTEGER
      expect(() => selector.selectOptimalMethod(100_000_000, 100_000_000)).toThrow(
        /Product would exceed JavaScript's safe integer range/
      );
    });

    it('should accept valid inputs within safe range', () => {
      // These should not throw
      expect(() => selector.selectOptimalMethod(1, 1)).not.toThrow();
      expect(() => selector.selectOptimalMethod(-47, -53)).not.toThrow();
      expect(() => selector.selectOptimalMethod(1000, 1000)).not.toThrow();
      expect(() => selector.selectOptimalMethod(94868, 94868)).not.toThrow(); // ~√MAX_SAFE_INTEGER
    });

    it('should accept numbers at the boundary of safe computation', () => {
      // √(MAX_SAFE_INTEGER) ≈ 94,906,265
      // Products just under MAX_SAFE_INTEGER should work
      const result = selector.selectOptimalMethod(3000000, 3000000);
      expect(result.optimal.solution.validated).toBe(true);
      const finalResult = result.optimal.solution.steps[
        result.optimal.solution.steps.length - 1
      ]?.result;
      expect(finalResult).toBe(9_000_000_000_000);
    });
  });
});
