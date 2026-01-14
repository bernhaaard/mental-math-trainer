/**
 * Method Analyzer - Analyzes user statistics to identify weak methods
 * and generate personalized practice recommendations.
 * @module core/analysis/method-analyzer
 */

import type { UserStatistics, CumulativeMethodStats } from '@/lib/types/statistics';
import { MethodName } from '@/lib/types/method';

/**
 * Proficiency score for a single method, including components and overall score.
 */
export interface MethodProficiency {
  /** The method being evaluated */
  method: MethodName;
  /** Display name for the method */
  displayName: string;
  /** Overall proficiency score (0-100, higher is better) */
  overallScore: number;
  /** Accuracy component score (0-100) */
  accuracyScore: number;
  /** Speed component score (0-100) */
  speedScore: number;
  /** Trend component score (0-100) - higher means improving */
  trendScore: number;
  /** Number of problems solved with this method */
  problemsSolved: number;
  /** Whether there's enough data for a reliable score */
  hasReliableData: boolean;
  /** When the method was last practiced */
  lastPracticed: Date | null;
}

/**
 * A recommendation for practice.
 */
export interface MethodRecommendation {
  /** The recommended method */
  method: MethodName;
  /** Display name for the method */
  displayName: string;
  /** Priority level (1 = highest priority) */
  priority: number;
  /** Reason for the recommendation */
  reason: string;
  /** Detailed explanation for the user */
  explanation: string;
  /** The proficiency score that led to this recommendation */
  proficiency: MethodProficiency;
}

/**
 * Result of analyzing all methods for a user.
 */
export interface MethodAnalysisResult {
  /** Proficiency scores for all methods with data */
  proficiencies: MethodProficiency[];
  /** Recommended methods for focused practice (ordered by priority) */
  recommendations: MethodRecommendation[];
  /** Whether the user has enough data for meaningful recommendations */
  hasEnoughData: boolean;
  /** Message to display if not enough data */
  dataStatusMessage: string;
}

/**
 * Configuration for the analyzer.
 */
export interface AnalyzerConfig {
  /** Minimum problems needed for reliable scoring */
  minProblemsForReliableScore: number;
  /** Weight for accuracy in overall score (0-1) */
  accuracyWeight: number;
  /** Weight for speed in overall score (0-1) */
  speedWeight: number;
  /** Weight for trend in overall score (0-1) */
  trendWeight: number;
  /** Target average time in ms (used for speed scoring) */
  targetAverageTimeMs: number;
  /** Maximum recommendations to return */
  maxRecommendations: number;
  /** Threshold below which a method is considered weak (0-100) */
  weaknessThreshold: number;
}

/**
 * Default configuration for the analyzer.
 */
const DEFAULT_CONFIG: AnalyzerConfig = {
  minProblemsForReliableScore: 5,
  accuracyWeight: 0.5,
  speedWeight: 0.3,
  trendWeight: 0.2,
  targetAverageTimeMs: 15000, // 15 seconds target
  maxRecommendations: 3,
  weaknessThreshold: 70,
};

/**
 * Display names for methods.
 */
const METHOD_DISPLAY_NAMES: Record<MethodName, string> = {
  [MethodName.Distributive]: 'Distributive Method',
  [MethodName.NearPower10]: 'Near Power of 10',
  [MethodName.DifferenceSquares]: 'Difference of Squares',
  [MethodName.Factorization]: 'Factorization',
  [MethodName.Squaring]: 'Squaring',
  [MethodName.Near100]: 'Near 100',
  [MethodName.SumToTen]: 'Sum to Ten',
  [MethodName.SquaringEndIn5]: 'Squaring Numbers Ending in 5',
  [MethodName.MultiplyBy111]: 'Multiply by 111',
  [MethodName.NearSquares]: 'Near Squares',
};

/**
 * Get display name for a method.
 */
export function getMethodDisplayName(method: MethodName): string {
  return METHOD_DISPLAY_NAMES[method];
}

/**
 * Calculate the proficiency score for a single method.
 */
export function calculateMethodProficiency(
  method: MethodName,
  stats: CumulativeMethodStats | undefined,
  config: AnalyzerConfig = DEFAULT_CONFIG
): MethodProficiency {
  const displayName = getMethodDisplayName(method);

  // No data for this method
  if (!stats) {
    return {
      method,
      displayName,
      overallScore: 0,
      accuracyScore: 0,
      speedScore: 0,
      trendScore: 50, // Neutral trend
      problemsSolved: 0,
      hasReliableData: false,
      lastPracticed: null,
    };
  }

  const hasReliableData = stats.problemsSolved >= config.minProblemsForReliableScore;

  // Calculate accuracy score (0-100)
  // Accuracy is already 0-100
  const accuracyScore = Math.min(100, Math.max(0, stats.accuracy));

  // Calculate speed score (0-100)
  // Score of 100 for hitting target time, decreasing as time increases
  // Score scales: at 2x target time = 50, at 3x = 33, etc.
  const speedRatio = config.targetAverageTimeMs / Math.max(stats.averageTime, 1000);
  const speedScore = Math.min(100, Math.max(0, speedRatio * 100));

  // Calculate trend score (0-100)
  // 50 = stable, >50 = improving, <50 = declining
  let trendScore: number;
  switch (stats.trend) {
    case 'improving':
      trendScore = 75;
      break;
    case 'declining':
      trendScore = 25;
      break;
    case 'stable':
    default:
      trendScore = 50;
      break;
  }

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    config.accuracyWeight * accuracyScore +
      config.speedWeight * speedScore +
      config.trendWeight * trendScore
  );

  return {
    method,
    displayName,
    overallScore,
    accuracyScore: Math.round(accuracyScore),
    speedScore: Math.round(speedScore),
    trendScore,
    problemsSolved: stats.problemsSolved,
    hasReliableData,
    lastPracticed: stats.lastPracticed ? new Date(stats.lastPracticed) : null,
  };
}

/**
 * Generate a recommendation reason based on proficiency analysis.
 */
function generateRecommendationReason(proficiency: MethodProficiency): {
  reason: string;
  explanation: string;
} {
  const { accuracyScore, speedScore, trendScore, hasReliableData, problemsSolved } = proficiency;

  // Not enough data
  if (!hasReliableData) {
    return {
      reason: 'Limited Practice',
      explanation: `You've only practiced ${problemsSolved} problem${problemsSolved === 1 ? '' : 's'} with this method. More practice will help build proficiency.`,
    };
  }

  // Declining trend is priority concern
  if (trendScore < 40) {
    return {
      reason: 'Declining Performance',
      explanation:
        'Your recent performance with this method has been declining. Some focused practice can help turn this around.',
    };
  }

  // Low accuracy is the main issue
  if (accuracyScore < 70) {
    return {
      reason: 'Low Accuracy',
      explanation: `Your accuracy is ${accuracyScore}% for this method. Focus on understanding the steps rather than speed.`,
    };
  }

  // Slow but accurate
  if (speedScore < 50 && accuracyScore >= 70) {
    return {
      reason: 'Needs Speed Improvement',
      explanation:
        'You understand this method well but are taking longer than optimal. Practice will help build speed.',
    };
  }

  // General weakness
  return {
    reason: 'Needs Practice',
    explanation:
      'This method has room for improvement. Regular practice will strengthen your skills.',
  };
}

/**
 * Analyze user statistics and generate method recommendations.
 */
export function analyzeMethodProficiency(
  stats: UserStatistics,
  config: AnalyzerConfig = DEFAULT_CONFIG
): MethodAnalysisResult {
  // Calculate proficiency for all methods
  const allMethods = Object.values(MethodName);
  const proficiencies: MethodProficiency[] = allMethods.map((method) =>
    calculateMethodProficiency(method, stats.methodStatistics[method], config)
  );

  // Check if we have enough data overall
  const methodsWithData = proficiencies.filter((p) => p.problemsSolved > 0);
  const methodsWithReliableData = proficiencies.filter((p) => p.hasReliableData);

  // Determine data status
  let hasEnoughData = false;
  let dataStatusMessage = '';

  if (methodsWithData.length === 0) {
    dataStatusMessage = 'Start practicing to get personalized recommendations!';
  } else if (methodsWithReliableData.length === 0) {
    dataStatusMessage = `Practice at least ${config.minProblemsForReliableScore} problems per method for accurate recommendations.`;
    hasEnoughData = false;
  } else {
    hasEnoughData = true;
    dataStatusMessage = `Based on ${stats.totalProblems} problems across ${methodsWithData.length} methods.`;
  }

  // Generate recommendations
  const recommendations: MethodRecommendation[] = [];

  // Priority 1: Methods with declining trends
  const decliningMethods = proficiencies
    .filter((p) => p.hasReliableData && p.trendScore < 40)
    .sort((a, b) => a.trendScore - b.trendScore);

  // Priority 2: Methods with low overall scores
  const weakMethods = proficiencies
    .filter(
      (p) =>
        p.hasReliableData &&
        p.overallScore < config.weaknessThreshold &&
        !decliningMethods.some((d) => d.method === p.method)
    )
    .sort((a, b) => a.overallScore - b.overallScore);

  // Priority 3: Methods never practiced
  const unpracticedMethods = proficiencies.filter((p) => p.problemsSolved === 0);

  // Priority 4: Methods with insufficient data
  const insufficientDataMethods = proficiencies.filter(
    (p) =>
      p.problemsSolved > 0 &&
      !p.hasReliableData &&
      !unpracticedMethods.some((u) => u.method === p.method)
  );

  // Build recommendations list
  let priority = 1;

  // Add declining methods
  for (const proficiency of decliningMethods) {
    if (recommendations.length >= config.maxRecommendations) break;
    const { reason, explanation } = generateRecommendationReason(proficiency);
    recommendations.push({
      method: proficiency.method,
      displayName: proficiency.displayName,
      priority: priority++,
      reason,
      explanation,
      proficiency,
    });
  }

  // Add weak methods
  for (const proficiency of weakMethods) {
    if (recommendations.length >= config.maxRecommendations) break;
    const { reason, explanation } = generateRecommendationReason(proficiency);
    recommendations.push({
      method: proficiency.method,
      displayName: proficiency.displayName,
      priority: priority++,
      reason,
      explanation,
      proficiency,
    });
  }

  // Add unpracticed methods (if no other recommendations)
  if (recommendations.length < config.maxRecommendations) {
    for (const proficiency of unpracticedMethods) {
      if (recommendations.length >= config.maxRecommendations) break;
      recommendations.push({
        method: proficiency.method,
        displayName: proficiency.displayName,
        priority: priority++,
        reason: 'Not Yet Practiced',
        explanation: "You haven't tried this method yet. Give it a go!",
        proficiency,
      });
    }
  }

  // Add insufficient data methods
  if (recommendations.length < config.maxRecommendations) {
    for (const proficiency of insufficientDataMethods) {
      if (recommendations.length >= config.maxRecommendations) break;
      const { reason, explanation } = generateRecommendationReason(proficiency);
      recommendations.push({
        method: proficiency.method,
        displayName: proficiency.displayName,
        priority: priority++,
        reason,
        explanation,
        proficiency,
      });
    }
  }

  return {
    proficiencies,
    recommendations,
    hasEnoughData,
    dataStatusMessage,
  };
}

/**
 * Get the strongest methods for a user.
 */
export function getStrongestMethods(
  stats: UserStatistics,
  count: number = 3,
  config: AnalyzerConfig = DEFAULT_CONFIG
): MethodProficiency[] {
  const result = analyzeMethodProficiency(stats, config);

  return result.proficiencies
    .filter((p) => p.hasReliableData)
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, count);
}

/**
 * Get the weakest methods for a user.
 */
export function getWeakestMethods(
  stats: UserStatistics,
  count: number = 3,
  config: AnalyzerConfig = DEFAULT_CONFIG
): MethodProficiency[] {
  const result = analyzeMethodProficiency(stats, config);

  return result.proficiencies
    .filter((p) => p.hasReliableData)
    .sort((a, b) => a.overallScore - b.overallScore)
    .slice(0, count);
}

/**
 * Create a custom analyzer configuration.
 */
export function createAnalyzerConfig(
  overrides: Partial<AnalyzerConfig> = {}
): AnalyzerConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
  };
}

export { DEFAULT_CONFIG as defaultAnalyzerConfig };
