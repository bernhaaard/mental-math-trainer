/**
 * Practice session type definitions.
 * @module types/session
 */

import type { Problem, DifficultyLevel, CustomRange } from './problem';
import type { MethodName } from './method';
import type { Solution } from './solution';

/**
 * A complete practice session with problems and results.
 */
export interface PracticeSession {
  /** Unique identifier for this session */
  id: string;
  /** When the session began */
  startedAt: Date;
  /** When the session ended (undefined if still active) */
  endedAt?: Date;
  /** Configuration used for this session */
  configuration: SessionConfig;
  /** All problem attempts in this session */
  problems: ProblemAttempt[];
  /** Aggregated statistics for this session */
  statistics: SessionStatistics;
}

/**
 * Configuration options for a practice session.
 */
export interface SessionConfig {
  /** Difficulty level or custom range for problem generation */
  difficulty: DifficultyLevel | CustomRange;
  /** Which calculation methods to practice (empty = all) */
  methods: MethodName[];
  /** Number of problems or 'infinite' for continuous practice */
  problemCount: number | 'infinite';
  /** Whether to include negative numbers in problems */
  allowNegatives: boolean;
}

/**
 * A single problem attempt within a session.
 */
export interface ProblemAttempt {
  /** The problem that was presented */
  problem: Problem;
  /** All answers the user submitted (allows multiple attempts) */
  userAnswers: number[];
  /** The correct answer */
  correctAnswer: number;
  /** Time taken in milliseconds */
  timeTaken: number;
  /** Number of hints the user requested */
  hintsUsed: number;
  /** Whether the user skipped this problem */
  skipped: boolean;
  /** The solution shown to the user */
  solution: Solution;
  /** Magnitude of error (0 if correct) */
  errorMagnitude: number;
}

/**
 * Aggregated statistics for a practice session.
 */
export interface SessionStatistics {
  /** Total problems attempted */
  totalProblems: number;
  /** Number of problems answered correctly on first try */
  correctAnswers: number;
  /** Percentage of correct answers (0-100) */
  accuracy: number;
  /** Average time per problem in milliseconds */
  averageTime: number;
  /** Average error magnitude for incorrect answers */
  averageError: number;
  /** Statistics broken down by method */
  methodBreakdown: Record<MethodName, MethodStats>;
}

/**
 * Statistics for a specific calculation method.
 */
export interface MethodStats {
  /** The method these stats are for */
  method: MethodName;
  /** Number of problems using this method */
  problemsSolved: number;
  /** Number answered correctly */
  correctAnswers: number;
  /** Percentage correct (0-100) */
  accuracy: number;
  /** Average time for problems using this method */
  averageTime: number;
}
