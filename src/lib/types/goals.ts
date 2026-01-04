/**
 * Daily goals and streak tracking type definitions.
 * @module types/goals
 */

/**
 * Daily goal configuration and progress tracking.
 */
export interface DailyGoal {
  /** Target number of problems to complete per day */
  targetProblems: number;
  /** Number of problems completed today */
  completedToday: number;
  /** Date string (YYYY-MM-DD) for the current day's progress */
  date: string;
}

/**
 * Streak tracking data for consecutive practice days.
 */
export interface StreakData {
  /** Current streak count (consecutive days with goal met) */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Last date (YYYY-MM-DD) when practice was completed */
  lastPracticeDate: string | null;
  /** Last date (YYYY-MM-DD) when the daily goal was met */
  lastGoalMetDate: string | null;
}

/**
 * Combined goals and streaks state for storage.
 */
export interface GoalsState {
  /** User's unique identifier (for storage key) */
  userId: string;
  /** Current daily goal configuration and progress */
  dailyGoal: DailyGoal;
  /** Streak tracking information */
  streak: StreakData;
}

/**
 * Default daily goal target
 */
export const DEFAULT_DAILY_GOAL = 10;

/**
 * Minimum daily goal value
 */
export const MIN_DAILY_GOAL = 1;

/**
 * Maximum daily goal value
 */
export const MAX_DAILY_GOAL = 100;
