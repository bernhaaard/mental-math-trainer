/**
 * User statistics and analytics type definitions.
 * @module types/statistics
 */

import type { MethodName } from './method';
import type { DifficultyLevel } from './problem';
import type { MethodStats } from './session';

/**
 * Cumulative statistics for a user across all sessions.
 */
export interface UserStatistics {
  /** Unique identifier for this user */
  userId: string;
  /** Total problems attempted across all sessions */
  totalProblems: number;
  /** Total number of practice sessions */
  totalSessions: number;
  /** Overall accuracy percentage (0-100) */
  overallAccuracy: number;
  /** Cumulative stats for each calculation method (not all methods may have been practiced) */
  methodStatistics: Partial<Record<MethodName, CumulativeMethodStats>>;
  /** Cumulative stats for each difficulty level (not all levels may have been practiced) */
  difficultyStatistics: Partial<Record<DifficultyLevel, DifficultyStats>>;
  /** Historical performance data points */
  timeSeriesData: TimeSeriesPoint[];
  /** Identified areas needing improvement */
  weakAreas: WeakArea[];
}

/**
 * Extended method statistics with trend analysis.
 */
export interface CumulativeMethodStats extends MethodStats {
  /** Performance trend direction */
  trend: 'improving' | 'stable' | 'declining';
  /** When this method was last practiced */
  lastPracticed: Date;
}

/**
 * Statistics for a specific difficulty level.
 */
export interface DifficultyStats {
  /** The difficulty level */
  level: DifficultyLevel;
  /** Total problems at this difficulty */
  problemsSolved: number;
  /** Accuracy percentage (0-100) */
  accuracy: number;
  /** Average time in milliseconds */
  averageTime: number;
}

/**
 * A single data point for time series analytics.
 */
export interface TimeSeriesPoint {
  /** Date of this data point */
  date: Date;
  /** Accuracy on this date (0-100) */
  accuracy: number;
  /** Number of problems attempted */
  problemCount: number;
  /** Average time per problem */
  averageTime: number;
}

/**
 * An identified weak area that needs improvement.
 */
export interface WeakArea {
  /** Type of weakness identified */
  category: 'method' | 'difficulty' | 'number_range';
  /** Specific identifier (method name, difficulty level, or range description) */
  identifier: string;
  /** Severity score (0-1, higher = more severe) */
  severity: number;
  /** Actionable recommendation for improvement */
  recommendation: string;
}
