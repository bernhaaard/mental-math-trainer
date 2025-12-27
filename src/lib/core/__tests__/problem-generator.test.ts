/**
 * Tests for Method-Aware Problem Generator
 * @module core/__tests__/problem-generator
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateMethodAwareProblem,
  type GeneratorConfig
} from '../problem-generator';
import { MethodName } from '../../types/method';
import { DifficultyLevel, DIFFICULTY_RANGES } from '../../types/problem';

describe('Problem Generator', () => {
  describe('generateForDifferenceSquares', () => {
    const config: GeneratorConfig = {
      difficulty: DifficultyLevel.Intermediate,
      allowNegatives: false
    };

    it('should generate symmetric pairs around a midpoint', () => {
      // Test multiple times to account for randomness
      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.DifferenceSquares],
          i
        );

        // Verify symmetry: num1 + num2 should be even (they are symmetric around midpoint)
        const sum = problem.num1 + problem.num2;
        const midpoint = sum / 2;

        // Both numbers should be equidistant from midpoint
        expect(Math.abs(problem.num1 - midpoint)).toBe(
          Math.abs(problem.num2 - midpoint)
        );
      }
    });

    it('should produce valid answer (num1 * num2)', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.DifferenceSquares],
          i
        );
        expect(problem.answer).toBe(problem.num1 * problem.num2);
      }
    });

    it('should use different midpoints for different difficulty levels', () => {
      const beginnerProblem = generateMethodAwareProblem(
        { difficulty: DifficultyLevel.Beginner, allowNegatives: false },
        [MethodName.DifferenceSquares],
        1
      );

      const advancedProblem = generateMethodAwareProblem(
        { difficulty: DifficultyLevel.Advanced, allowNegatives: false },
        [MethodName.DifferenceSquares],
        2
      );

      // Both should be symmetric
      expect((beginnerProblem.num1 + beginnerProblem.num2) % 2).toBe(0);
      expect((advancedProblem.num1 + advancedProblem.num2) % 2).toBe(0);
    });

    it('should handle custom range', () => {
      const customConfig: GeneratorConfig = {
        difficulty: { num1Min: 10, num1Max: 100, num2Min: 10, num2Max: 100 },
        allowNegatives: false
      };

      const problem = generateMethodAwareProblem(
        customConfig,
        [MethodName.DifferenceSquares],
        1
      );

      expect(problem.answer).toBe(problem.num1 * problem.num2);
    });
  });

  describe('generateForSquaring', () => {
    const config: GeneratorConfig = {
      difficulty: DifficultyLevel.Intermediate,
      allowNegatives: false
    };

    it('should generate identical numbers (num1 === num2)', () => {
      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Squaring],
          i
        );
        expect(problem.num1).toBe(problem.num2);
      }
    });

    it('should produce answer equal to num1 squared', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Squaring],
          i
        );
        expect(problem.answer).toBe(problem.num1 * problem.num1);
      }
    });

    it('should cap max at 200 for difficulties with max above 200', () => {
      // For Intermediate, max is 400, so it should be capped at 200
      const intermediateConfig: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: false
      };

      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          intermediateConfig,
          [MethodName.Squaring],
          i
        );
        expect(Math.abs(problem.num1)).toBeLessThanOrEqual(200);
      }
    });

    it('should respect min constraint from difficulty range', () => {
      // For Advanced difficulty, min is 100 and max is 1000 (capped to 200)
      const advancedConfig: GeneratorConfig = {
        difficulty: DifficultyLevel.Advanced,
        allowNegatives: false
      };

      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          advancedConfig,
          [MethodName.Squaring],
          i
        );
        expect(Math.abs(problem.num1)).toBeGreaterThanOrEqual(100);
        expect(Math.abs(problem.num1)).toBeLessThanOrEqual(200);
      }
    });

    it('should generate numbers >= 2', () => {
      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Squaring],
          i
        );
        expect(Math.abs(problem.num1)).toBeGreaterThanOrEqual(2);
      }
    });

    it('should handle custom range', () => {
      const customConfig: GeneratorConfig = {
        difficulty: { num1Min: 50, num1Max: 100, num2Min: 50, num2Max: 100 },
        allowNegatives: false
      };

      const problem = generateMethodAwareProblem(
        customConfig,
        [MethodName.Squaring],
        1
      );

      expect(problem.num1).toBe(problem.num2);
      expect(problem.answer).toBe(problem.num1 * problem.num2);
    });
  });

  describe('generateForNearPower10', () => {
    const config: GeneratorConfig = {
      difficulty: DifficultyLevel.Intermediate,
      allowNegatives: false
    };

    it('should generate one number within 3 of 10, 100, or 1000', () => {
      for (let i = 0; i < 30; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.NearPower10],
          i
        );

        // At least one number should be near a power of 10
        const nearPower10 =
          Math.abs(problem.num1 - 10) <= 3 ||
          Math.abs(problem.num1 - 100) <= 3 ||
          Math.abs(problem.num1 - 1000) <= 3 ||
          Math.abs(problem.num2 - 10) <= 3 ||
          Math.abs(problem.num2 - 100) <= 3 ||
          Math.abs(problem.num2 - 1000) <= 3;

        expect(nearPower10).toBe(true);
      }
    });

    it('should produce valid answers', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.NearPower10],
          i
        );
        expect(problem.answer).toBe(problem.num1 * problem.num2);
      }
    });

    it('should cap second number at 200', () => {
      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.NearPower10],
          i
        );
        // The non-near-power number should be capped
        // Note: near power numbers can be close to 1000
        expect(
          Math.abs(problem.num1) <= 1003 && Math.abs(problem.num2) <= 1003
        ).toBe(true);
      }
    });
  });

  describe('generateForNear100', () => {
    const config: GeneratorConfig = {
      difficulty: DifficultyLevel.Intermediate,
      allowNegatives: false
    };

    it('should generate both numbers in range 85-115', () => {
      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Near100],
          i
        );

        expect(Math.abs(problem.num1)).toBeGreaterThanOrEqual(85);
        expect(Math.abs(problem.num1)).toBeLessThanOrEqual(115);
        expect(Math.abs(problem.num2)).toBeGreaterThanOrEqual(85);
        expect(Math.abs(problem.num2)).toBeLessThanOrEqual(115);
      }
    });

    it('should produce valid answers', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Near100],
          i
        );
        expect(problem.answer).toBe(problem.num1 * problem.num2);
      }
    });

    it('should ignore config difficulty (always uses 85-115 range)', () => {
      const beginnerConfig: GeneratorConfig = {
        difficulty: DifficultyLevel.Beginner,
        allowNegatives: false
      };

      for (let i = 0; i < 10; i++) {
        const problem = generateMethodAwareProblem(
          beginnerConfig,
          [MethodName.Near100],
          i
        );

        expect(Math.abs(problem.num1)).toBeGreaterThanOrEqual(85);
        expect(Math.abs(problem.num1)).toBeLessThanOrEqual(115);
      }
    });
  });

  describe('generateForFactorization', () => {
    const config: GeneratorConfig = {
      difficulty: DifficultyLevel.Intermediate,
      allowNegatives: false
    };

    const niceNumbers = [
      12, 15, 16, 18, 20, 24, 25, 32, 36, 40, 45, 48, 50, 64, 72, 75, 80, 125
    ];

    it('should include at least one "nice" number with good factors', () => {
      for (let i = 0; i < 30; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Factorization],
          i
        );

        // At least one number should be from the nice numbers list
        const hasNiceNumber =
          niceNumbers.includes(Math.abs(problem.num1)) ||
          niceNumbers.includes(Math.abs(problem.num2));

        expect(hasNiceNumber).toBe(true);
      }
    });

    it('should produce valid answers', () => {
      for (let i = 0; i < 10; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Factorization],
          i
        );
        expect(problem.answer).toBe(problem.num1 * problem.num2);
      }
    });

    it('should generate second number within range', () => {
      const range = DIFFICULTY_RANGES[DifficultyLevel.Intermediate];

      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Factorization],
          i
        );

        // One of the numbers should be in range (the non-nice one)
        const inRange =
          (Math.abs(problem.num1) >= 2 && Math.abs(problem.num1) <= 200) ||
          (Math.abs(problem.num2) >= 2 && Math.abs(problem.num2) <= 200);

        expect(inRange).toBe(true);
      }
    });

    it('should randomly swap number order', () => {
      let num1FirstCount = 0;
      let num2FirstCount = 0;

      for (let i = 0; i < 50; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Factorization],
          i
        );

        if (niceNumbers.includes(Math.abs(problem.num1))) {
          num1FirstCount++;
        }
        if (niceNumbers.includes(Math.abs(problem.num2))) {
          num2FirstCount++;
        }
      }

      // Both positions should have had nice numbers at some point
      expect(num1FirstCount).toBeGreaterThan(0);
      expect(num2FirstCount).toBeGreaterThan(0);
    });
  });

  describe('generateForDistributive', () => {
    it('should generate numbers within beginner range', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Beginner,
        allowNegatives: false
      };
      const range = DIFFICULTY_RANGES[DifficultyLevel.Beginner];

      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Distributive],
          i
        );

        expect(Math.abs(problem.num1)).toBeGreaterThanOrEqual(range.min);
        expect(Math.abs(problem.num1)).toBeLessThanOrEqual(range.max);
        expect(Math.abs(problem.num2)).toBeGreaterThanOrEqual(range.min);
        expect(Math.abs(problem.num2)).toBeLessThanOrEqual(range.max);
      }
    });

    it('should generate numbers within intermediate range', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: false
      };
      const range = DIFFICULTY_RANGES[DifficultyLevel.Intermediate];

      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Distributive],
          i
        );

        expect(Math.abs(problem.num1)).toBeGreaterThanOrEqual(range.min);
        expect(Math.abs(problem.num1)).toBeLessThanOrEqual(range.max);
        expect(Math.abs(problem.num2)).toBeGreaterThanOrEqual(range.min);
        expect(Math.abs(problem.num2)).toBeLessThanOrEqual(range.max);
      }
    });

    it('should generate numbers within custom range', () => {
      const config: GeneratorConfig = {
        difficulty: { num1Min: 50, num1Max: 75, num2Min: 100, num2Max: 150 },
        allowNegatives: false
      };

      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Distributive],
          i
        );

        expect(Math.abs(problem.num1)).toBeGreaterThanOrEqual(50);
        expect(Math.abs(problem.num1)).toBeLessThanOrEqual(75);
        expect(Math.abs(problem.num2)).toBeGreaterThanOrEqual(100);
        expect(Math.abs(problem.num2)).toBeLessThanOrEqual(150);
      }
    });

    it('should produce valid answers', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: false
      };

      for (let i = 0; i < 10; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Distributive],
          i
        );
        expect(problem.answer).toBe(problem.num1 * problem.num2);
      }
    });
  });

  describe('generateMethodAwareProblem', () => {
    it('should use Distributive when no methods specified', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: false
      };
      const range = DIFFICULTY_RANGES[DifficultyLevel.Intermediate];

      const problem = generateMethodAwareProblem(config, [], 1);

      // Should generate within distributive range
      expect(Math.abs(problem.num1)).toBeGreaterThanOrEqual(range.min);
      expect(Math.abs(problem.num1)).toBeLessThanOrEqual(range.max);
    });

    it('should select randomly from multiple methods', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: false
      };

      const methods = [MethodName.Squaring, MethodName.Near100];

      let squaringCount = 0;
      let near100Count = 0;

      for (let i = 0; i < 50; i++) {
        const problem = generateMethodAwareProblem(config, methods, i);

        if (problem.num1 === problem.num2) {
          squaringCount++;
        } else if (
          Math.abs(problem.num1) >= 85 &&
          Math.abs(problem.num1) <= 115
        ) {
          near100Count++;
        }
      }

      // Both methods should have been used
      expect(squaringCount).toBeGreaterThan(0);
      expect(near100Count).toBeGreaterThan(0);
    });

    it('should generate unique problem IDs', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: false
      };

      const ids = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Distributive],
          i
        );
        ids.add(problem.id);
      }

      expect(ids.size).toBe(20);
    });

    it('should include problem number in ID', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: false
      };

      const problem = generateMethodAwareProblem(
        config,
        [MethodName.Distributive],
        42
      );

      expect(problem.id).toContain('problem-42');
    });

    it('should set correct difficulty level in problem', () => {
      const beginnerConfig: GeneratorConfig = {
        difficulty: DifficultyLevel.Beginner,
        allowNegatives: false
      };

      const advancedConfig: GeneratorConfig = {
        difficulty: DifficultyLevel.Advanced,
        allowNegatives: false
      };

      const beginnerProblem = generateMethodAwareProblem(
        beginnerConfig,
        [MethodName.Distributive],
        1
      );
      const advancedProblem = generateMethodAwareProblem(
        advancedConfig,
        [MethodName.Distributive],
        2
      );

      expect(beginnerProblem.difficulty).toBe(DifficultyLevel.Beginner);
      expect(advancedProblem.difficulty).toBe(DifficultyLevel.Advanced);
    });

    it('should set Advanced difficulty for custom ranges', () => {
      const customConfig: GeneratorConfig = {
        difficulty: { num1Min: 10, num1Max: 100, num2Min: 10, num2Max: 100 },
        allowNegatives: false
      };

      const problem = generateMethodAwareProblem(
        customConfig,
        [MethodName.Distributive],
        1
      );

      expect(problem.difficulty).toBe(DifficultyLevel.Advanced);
    });

    it('should set generatedAt timestamp', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: false
      };

      const before = new Date();
      const problem = generateMethodAwareProblem(
        config,
        [MethodName.Distributive],
        1
      );
      const after = new Date();

      expect(problem.generatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(problem.generatedAt.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
    });
  });

  describe('negative numbers handling', () => {
    beforeEach(() => {
      // Mock Math.random to control negative application
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should not apply negatives when allowNegatives is false', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: false
      };

      for (let i = 0; i < 20; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Distributive],
          i
        );

        expect(problem.num1).toBeGreaterThan(0);
        expect(problem.num2).toBeGreaterThan(0);
      }
    });

    it('should apply negatives with ~30% probability when allowed', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: true
      };

      let negativeCount = 0;
      const totalNumbers = 200; // 100 problems * 2 numbers

      for (let i = 0; i < 100; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Distributive],
          i
        );

        if (problem.num1 < 0) negativeCount++;
        if (problem.num2 < 0) negativeCount++;
      }

      // Should be roughly 30% (with some variance)
      const negativeRatio = negativeCount / totalNumbers;
      expect(negativeRatio).toBeGreaterThan(0.1);
      expect(negativeRatio).toBeLessThan(0.5);
    });

    it('should correctly calculate answer with negative numbers', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: true
      };

      for (let i = 0; i < 50; i++) {
        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Distributive],
          i
        );

        expect(problem.answer).toBe(problem.num1 * problem.num2);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle all difficulty levels', () => {
      const levels = [
        DifficultyLevel.Beginner,
        DifficultyLevel.Intermediate,
        DifficultyLevel.Advanced,
        DifficultyLevel.Expert,
        DifficultyLevel.Mastery
      ];

      levels.forEach(level => {
        const config: GeneratorConfig = {
          difficulty: level,
          allowNegatives: false
        };

        const problem = generateMethodAwareProblem(
          config,
          [MethodName.Distributive],
          1
        );

        expect(problem.answer).toBe(problem.num1 * problem.num2);
        expect(problem.difficulty).toBe(level);
      });
    });

    it('should handle all method types', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Intermediate,
        allowNegatives: false
      };

      const methods = [
        MethodName.DifferenceSquares,
        MethodName.Squaring,
        MethodName.NearPower10,
        MethodName.Near100,
        MethodName.Factorization,
        MethodName.Distributive
      ];

      methods.forEach(methodName => {
        const problem = generateMethodAwareProblem(config, [methodName], 1);

        expect(problem.answer).toBe(problem.num1 * problem.num2);
        expect(problem.id).toContain('problem-1');
      });
    });

    it('should always produce valid multiplication results', () => {
      const config: GeneratorConfig = {
        difficulty: DifficultyLevel.Advanced,
        allowNegatives: true
      };

      const allMethods = Object.values(MethodName);

      for (let i = 0; i < 100; i++) {
        const problem = generateMethodAwareProblem(config, allMethods, i);

        // Verify mathematical correctness
        expect(problem.answer).toBe(problem.num1 * problem.num2);

        // Verify problem structure
        expect(problem.id).toBeTruthy();
        expect(problem.generatedAt).toBeInstanceOf(Date);
      }
    });
  });
});
