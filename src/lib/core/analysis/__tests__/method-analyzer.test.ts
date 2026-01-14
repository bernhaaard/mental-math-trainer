/**
 * Tests for Method Analyzer
 * @module core/analysis/__tests__/method-analyzer
 */

import { describe, it, expect } from 'vitest';
import {
  analyzeMethodProficiency,
  calculateMethodProficiency,
  getMethodDisplayName,
  getStrongestMethods,
  getWeakestMethods,
  createAnalyzerConfig,
  defaultAnalyzerConfig,
  type AnalyzerConfig,
} from '../method-analyzer';
import { MethodName } from '@/lib/types/method';
import type { UserStatistics, CumulativeMethodStats } from '@/lib/types/statistics';

/**
 * Helper function to create mock CumulativeMethodStats.
 */
function createMockMethodStats(
  overrides: Partial<CumulativeMethodStats> = {}
): CumulativeMethodStats {
  return {
    method: MethodName.Distributive,
    problemsSolved: 10,
    correctAnswers: 8,
    accuracy: 80,
    averageTime: 12000,
    trend: 'stable',
    lastPracticed: new Date('2024-01-15'),
    ...overrides,
  };
}

/**
 * Helper function to create mock UserStatistics.
 */
function createMockUserStats(
  overrides: Partial<UserStatistics> = {}
): UserStatistics {
  return {
    userId: 'test-user',
    totalProblems: 50,
    totalSessions: 5,
    overallAccuracy: 75,
    methodStatistics: {},
    difficultyStatistics: {},
    timeSeriesData: [],
    weakAreas: [],
    ...overrides,
  };
}

describe('getMethodDisplayName', () => {
  it('should return correct display names for all methods', () => {
    expect(getMethodDisplayName(MethodName.Distributive)).toBe('Distributive Method');
    expect(getMethodDisplayName(MethodName.NearPower10)).toBe('Near Power of 10');
    expect(getMethodDisplayName(MethodName.DifferenceSquares)).toBe('Difference of Squares');
    expect(getMethodDisplayName(MethodName.Factorization)).toBe('Factorization');
    expect(getMethodDisplayName(MethodName.Squaring)).toBe('Squaring');
    expect(getMethodDisplayName(MethodName.Near100)).toBe('Near 100');
  });
});

describe('calculateMethodProficiency', () => {
  describe('with no stats', () => {
    it('should return zero scores for undefined stats', () => {
      const proficiency = calculateMethodProficiency(MethodName.Distributive, undefined);

      expect(proficiency.method).toBe(MethodName.Distributive);
      expect(proficiency.displayName).toBe('Distributive Method');
      expect(proficiency.overallScore).toBe(0);
      expect(proficiency.accuracyScore).toBe(0);
      expect(proficiency.speedScore).toBe(0);
      expect(proficiency.trendScore).toBe(50); // Neutral
      expect(proficiency.problemsSolved).toBe(0);
      expect(proficiency.hasReliableData).toBe(false);
      expect(proficiency.lastPracticed).toBeNull();
    });
  });

  describe('with reliable stats', () => {
    it('should calculate correct overall score with default weights', () => {
      const stats = createMockMethodStats({
        accuracy: 80,
        averageTime: 15000, // Target time
        trend: 'stable',
        problemsSolved: 10,
      });

      const proficiency = calculateMethodProficiency(MethodName.Distributive, stats);

      // accuracy: 80 * 0.5 = 40
      // speed: 100 * 0.3 = 30 (at target time)
      // trend: 50 * 0.2 = 10
      // total: 80
      expect(proficiency.overallScore).toBe(80);
      expect(proficiency.accuracyScore).toBe(80);
      expect(proficiency.speedScore).toBe(100);
      expect(proficiency.trendScore).toBe(50);
      expect(proficiency.hasReliableData).toBe(true);
    });

    it('should calculate correct trend scores', () => {
      const improvingStats = createMockMethodStats({ trend: 'improving' });
      const stableStats = createMockMethodStats({ trend: 'stable' });
      const decliningStats = createMockMethodStats({ trend: 'declining' });

      expect(calculateMethodProficiency(MethodName.Distributive, improvingStats).trendScore).toBe(75);
      expect(calculateMethodProficiency(MethodName.Distributive, stableStats).trendScore).toBe(50);
      expect(calculateMethodProficiency(MethodName.Distributive, decliningStats).trendScore).toBe(25);
    });

    it('should calculate speed score based on target time', () => {
      // At target time (15000ms)
      const atTargetStats = createMockMethodStats({ averageTime: 15000 });
      expect(calculateMethodProficiency(MethodName.Distributive, atTargetStats).speedScore).toBe(100);

      // At double target time (30000ms)
      const doubleStats = createMockMethodStats({ averageTime: 30000 });
      expect(calculateMethodProficiency(MethodName.Distributive, doubleStats).speedScore).toBe(50);

      // Faster than target (7500ms)
      const fasterStats = createMockMethodStats({ averageTime: 7500 });
      const fasterProficiency = calculateMethodProficiency(MethodName.Distributive, fasterStats);
      // Speed would be 200% but capped at 100
      expect(fasterProficiency.speedScore).toBe(100);
    });

    it('should respect minimum problems for reliable data', () => {
      const insufficientStats = createMockMethodStats({ problemsSolved: 3 });
      const sufficientStats = createMockMethodStats({ problemsSolved: 5 });

      expect(calculateMethodProficiency(MethodName.Distributive, insufficientStats).hasReliableData).toBe(false);
      expect(calculateMethodProficiency(MethodName.Distributive, sufficientStats).hasReliableData).toBe(true);
    });

    it('should include last practiced date', () => {
      const date = new Date('2024-06-15');
      const stats = createMockMethodStats({ lastPracticed: date });

      const proficiency = calculateMethodProficiency(MethodName.Distributive, stats);
      expect(proficiency.lastPracticed).toEqual(date);
    });
  });

  describe('with custom config', () => {
    it('should use custom accuracy weight', () => {
      const stats = createMockMethodStats({
        accuracy: 100,
        averageTime: 15000,
        trend: 'stable',
      });

      const customConfig: AnalyzerConfig = {
        ...defaultAnalyzerConfig,
        accuracyWeight: 0.8,
        speedWeight: 0.1,
        trendWeight: 0.1,
      };

      const proficiency = calculateMethodProficiency(MethodName.Distributive, stats, customConfig);

      // accuracy: 100 * 0.8 = 80
      // speed: 100 * 0.1 = 10
      // trend: 50 * 0.1 = 5
      // total: 95
      expect(proficiency.overallScore).toBe(95);
    });

    it('should use custom min problems threshold', () => {
      const stats = createMockMethodStats({ problemsSolved: 8 });

      const strictConfig: AnalyzerConfig = {
        ...defaultAnalyzerConfig,
        minProblemsForReliableScore: 10,
      };

      expect(calculateMethodProficiency(MethodName.Distributive, stats, strictConfig).hasReliableData).toBe(false);
      expect(calculateMethodProficiency(MethodName.Distributive, stats).hasReliableData).toBe(true);
    });
  });
});

describe('analyzeMethodProficiency', () => {
  describe('with no stats', () => {
    it('should return empty proficiencies for new user', () => {
      const stats = createMockUserStats();
      const result = analyzeMethodProficiency(stats);

      expect(result.proficiencies).toHaveLength(Object.keys(MethodName).length); // All methods
      expect(result.hasEnoughData).toBe(false);
      expect(result.dataStatusMessage).toContain('Start practicing');
    });

    it('should recommend unpracticed methods', () => {
      const stats = createMockUserStats();
      const result = analyzeMethodProficiency(stats);

      // Should recommend trying new methods
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]?.reason).toBe('Not Yet Practiced');
    });
  });

  describe('with partial stats', () => {
    it('should identify methods with insufficient data', () => {
      const stats = createMockUserStats({
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({ problemsSolved: 3 }),
          [MethodName.Squaring]: createMockMethodStats({ problemsSolved: 2 }),
        },
      });

      const result = analyzeMethodProficiency(stats);

      expect(result.hasEnoughData).toBe(false);
      expect(result.dataStatusMessage).toContain('at least');
    });

    it('should recommend methods with insufficient data after unpracticed methods', () => {
      // When there are both unpracticed and insufficient-data methods,
      // insufficient data methods should be recommended after unpracticed ones
      const stats = createMockUserStats({
        methodStatistics: {
          // All methods have insufficient data (3 problems, needs 5)
          [MethodName.Distributive]: createMockMethodStats({ problemsSolved: 3 }),
          [MethodName.Squaring]: createMockMethodStats({ problemsSolved: 3 }),
          [MethodName.Near100]: createMockMethodStats({ problemsSolved: 3 }),
          [MethodName.Factorization]: createMockMethodStats({ problemsSolved: 3 }),
          [MethodName.NearPower10]: createMockMethodStats({ problemsSolved: 3 }),
          [MethodName.DifferenceSquares]: createMockMethodStats({ problemsSolved: 3 }),
          [MethodName.SumToTen]: createMockMethodStats({ problemsSolved: 3 }),
          [MethodName.SquaringEndIn5]: createMockMethodStats({ problemsSolved: 3 }),
          [MethodName.MultiplyBy111]: createMockMethodStats({ problemsSolved: 3 }),
          [MethodName.NearSquares]: createMockMethodStats({ problemsSolved: 3 }),
        },
      });

      const result = analyzeMethodProficiency(stats);

      // With all methods having insufficient data but practiced,
      // they should be recommended with 'Limited Practice' reason
      const limitedPracticeRecs = result.recommendations.filter(
        r => r.reason === 'Limited Practice'
      );
      expect(limitedPracticeRecs.length).toBeGreaterThan(0);
    });
  });

  describe('with reliable stats', () => {
    it('should identify weak methods', () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 90,
            problemsSolved: 20,
          }),
          [MethodName.Squaring]: createMockMethodStats({
            accuracy: 50,
            problemsSolved: 20,
          }),
          [MethodName.Near100]: createMockMethodStats({
            accuracy: 85,
            problemsSolved: 20,
          }),
        },
      });

      const result = analyzeMethodProficiency(stats);

      expect(result.hasEnoughData).toBe(true);

      // Squaring should be recommended due to low accuracy
      const squaringRec = result.recommendations.find(r => r.method === MethodName.Squaring);
      expect(squaringRec).toBeDefined();
      expect(squaringRec?.reason).toBe('Low Accuracy');
    });

    it('should prioritize declining methods', () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 60,
            trend: 'declining',
            problemsSolved: 20,
          }),
          [MethodName.Squaring]: createMockMethodStats({
            accuracy: 50,
            trend: 'stable',
            problemsSolved: 20,
          }),
        },
      });

      const result = analyzeMethodProficiency(stats);

      // Declining should be first priority
      expect(result.recommendations[0]?.method).toBe(MethodName.Distributive);
      expect(result.recommendations[0]?.reason).toBe('Declining Performance');
    });

    it('should identify methods needing speed improvement', () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 90,
            averageTime: 45000, // 3x target
            problemsSolved: 20,
          }),
        },
      });

      const result = analyzeMethodProficiency(stats);
      const distRec = result.recommendations.find(r => r.method === MethodName.Distributive);

      expect(distRec).toBeDefined();
      expect(distRec?.reason).toBe('Needs Speed Improvement');
    });

    it('should respect max recommendations config', () => {
      const stats = createMockUserStats({
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({ accuracy: 50 }),
          [MethodName.Squaring]: createMockMethodStats({ accuracy: 45 }),
          [MethodName.Near100]: createMockMethodStats({ accuracy: 40 }),
          [MethodName.Factorization]: createMockMethodStats({ accuracy: 55 }),
        },
      });

      const config = createAnalyzerConfig({ maxRecommendations: 2 });
      const result = analyzeMethodProficiency(stats, config);

      expect(result.recommendations.length).toBeLessThanOrEqual(2);
    });

    it('should order recommendations by priority', () => {
      const stats = createMockUserStats({
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({ accuracy: 50 }),
          [MethodName.Squaring]: createMockMethodStats({ accuracy: 45 }),
          [MethodName.Near100]: createMockMethodStats({ accuracy: 40 }),
        },
      });

      const result = analyzeMethodProficiency(stats);

      for (let i = 1; i < result.recommendations.length; i++) {
        expect(result.recommendations[i]!.priority).toBeGreaterThan(
          result.recommendations[i - 1]!.priority
        );
      }
    });
  });

  describe('proficiencies calculation', () => {
    it('should include all six methods in proficiencies', () => {
      const stats = createMockUserStats();
      const result = analyzeMethodProficiency(stats);

      const methodNames = result.proficiencies.map(p => p.method);
      expect(methodNames).toContain(MethodName.Distributive);
      expect(methodNames).toContain(MethodName.NearPower10);
      expect(methodNames).toContain(MethodName.DifferenceSquares);
      expect(methodNames).toContain(MethodName.Factorization);
      expect(methodNames).toContain(MethodName.Squaring);
      expect(methodNames).toContain(MethodName.Near100);
    });

    it('should include display names in proficiencies', () => {
      const stats = createMockUserStats({
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats(),
        },
      });

      const result = analyzeMethodProficiency(stats);
      const distProf = result.proficiencies.find(p => p.method === MethodName.Distributive);

      expect(distProf?.displayName).toBe('Distributive Method');
    });
  });
});

describe('getStrongestMethods', () => {
  it('should return strongest methods sorted by score', () => {
    const stats = createMockUserStats({
      methodStatistics: {
        [MethodName.Distributive]: createMockMethodStats({ accuracy: 90 }),
        [MethodName.Squaring]: createMockMethodStats({ accuracy: 70 }),
        [MethodName.Near100]: createMockMethodStats({ accuracy: 95 }),
      },
    });

    const strongest = getStrongestMethods(stats, 2);

    expect(strongest.length).toBe(2);
    expect(strongest[0]?.method).toBe(MethodName.Near100);
    expect(strongest[1]?.method).toBe(MethodName.Distributive);
  });

  it('should only include methods with reliable data', () => {
    const stats = createMockUserStats({
      methodStatistics: {
        [MethodName.Distributive]: createMockMethodStats({
          accuracy: 95,
          problemsSolved: 2, // Not reliable
        }),
        [MethodName.Squaring]: createMockMethodStats({
          accuracy: 70,
          problemsSolved: 10, // Reliable
        }),
      },
    });

    const strongest = getStrongestMethods(stats);

    expect(strongest.length).toBe(1);
    expect(strongest[0]?.method).toBe(MethodName.Squaring);
  });

  it('should return empty array when no reliable data', () => {
    const stats = createMockUserStats();
    const strongest = getStrongestMethods(stats);

    expect(strongest).toHaveLength(0);
  });
});

describe('getWeakestMethods', () => {
  it('should return weakest methods sorted by score (ascending)', () => {
    const stats = createMockUserStats({
      methodStatistics: {
        [MethodName.Distributive]: createMockMethodStats({ accuracy: 90 }),
        [MethodName.Squaring]: createMockMethodStats({ accuracy: 70 }),
        [MethodName.Near100]: createMockMethodStats({ accuracy: 50 }),
      },
    });

    const weakest = getWeakestMethods(stats, 2);

    expect(weakest.length).toBe(2);
    expect(weakest[0]?.method).toBe(MethodName.Near100);
    expect(weakest[1]?.method).toBe(MethodName.Squaring);
  });

  it('should only include methods with reliable data', () => {
    const stats = createMockUserStats({
      methodStatistics: {
        [MethodName.Distributive]: createMockMethodStats({
          accuracy: 30,
          problemsSolved: 2, // Not reliable
        }),
        [MethodName.Squaring]: createMockMethodStats({
          accuracy: 70,
          problemsSolved: 10, // Reliable
        }),
      },
    });

    const weakest = getWeakestMethods(stats);

    expect(weakest.length).toBe(1);
    expect(weakest[0]?.method).toBe(MethodName.Squaring);
  });
});

describe('createAnalyzerConfig', () => {
  it('should return default config when no overrides', () => {
    const config = createAnalyzerConfig();

    expect(config).toEqual(defaultAnalyzerConfig);
  });

  it('should override specific values', () => {
    const config = createAnalyzerConfig({
      minProblemsForReliableScore: 10,
      maxRecommendations: 5,
    });

    expect(config.minProblemsForReliableScore).toBe(10);
    expect(config.maxRecommendations).toBe(5);
    expect(config.accuracyWeight).toBe(defaultAnalyzerConfig.accuracyWeight);
  });
});

describe('defaultAnalyzerConfig', () => {
  it('should have valid weight values that sum to 1', () => {
    const totalWeight =
      defaultAnalyzerConfig.accuracyWeight +
      defaultAnalyzerConfig.speedWeight +
      defaultAnalyzerConfig.trendWeight;

    expect(totalWeight).toBeCloseTo(1, 5);
  });

  it('should have reasonable default values', () => {
    expect(defaultAnalyzerConfig.minProblemsForReliableScore).toBeGreaterThan(0);
    expect(defaultAnalyzerConfig.maxRecommendations).toBeGreaterThan(0);
    expect(defaultAnalyzerConfig.targetAverageTimeMs).toBeGreaterThan(0);
    expect(defaultAnalyzerConfig.weaknessThreshold).toBeGreaterThan(0);
    expect(defaultAnalyzerConfig.weaknessThreshold).toBeLessThanOrEqual(100);
  });
});

describe('edge cases', () => {
  it('should handle very high accuracy values', () => {
    const stats = createMockMethodStats({ accuracy: 100 });
    const proficiency = calculateMethodProficiency(MethodName.Distributive, stats);

    expect(proficiency.accuracyScore).toBe(100);
  });

  it('should handle zero accuracy', () => {
    const stats = createMockMethodStats({ accuracy: 0 });
    const proficiency = calculateMethodProficiency(MethodName.Distributive, stats);

    expect(proficiency.accuracyScore).toBe(0);
  });

  it('should handle very slow average time', () => {
    const stats = createMockMethodStats({ averageTime: 300000 }); // 5 minutes
    const proficiency = calculateMethodProficiency(MethodName.Distributive, stats);

    expect(proficiency.speedScore).toBeGreaterThanOrEqual(0);
    expect(proficiency.speedScore).toBeLessThan(20);
  });

  it('should handle very fast average time', () => {
    const stats = createMockMethodStats({ averageTime: 1000 }); // 1 second
    const proficiency = calculateMethodProficiency(MethodName.Distributive, stats);

    expect(proficiency.speedScore).toBe(100); // Capped
  });

  it('should handle user with all methods practiced', () => {
    const stats = createMockUserStats({
      methodStatistics: {
        [MethodName.Distributive]: createMockMethodStats(),
        [MethodName.NearPower10]: createMockMethodStats(),
        [MethodName.DifferenceSquares]: createMockMethodStats(),
        [MethodName.Factorization]: createMockMethodStats(),
        [MethodName.Squaring]: createMockMethodStats(),
        [MethodName.Near100]: createMockMethodStats(),
        [MethodName.SumToTen]: createMockMethodStats(),
        [MethodName.SquaringEndIn5]: createMockMethodStats(),
        [MethodName.MultiplyBy111]: createMockMethodStats(),
        [MethodName.NearSquares]: createMockMethodStats(),
      },
    });

    const result = analyzeMethodProficiency(stats);

    expect(result.proficiencies.length).toBe(Object.keys(MethodName).length);
    expect(result.proficiencies.every(p => p.problemsSolved > 0)).toBe(true);
  });

  it('should handle user with perfect performance', () => {
    const stats = createMockUserStats({
      methodStatistics: {
        [MethodName.Distributive]: createMockMethodStats({
          accuracy: 100,
          averageTime: 5000,
          trend: 'improving',
          problemsSolved: 50,
        }),
      },
    });

    const result = analyzeMethodProficiency(stats);
    const distProf = result.proficiencies.find(p => p.method === MethodName.Distributive);

    expect(distProf?.overallScore).toBeGreaterThanOrEqual(90);
  });
});
