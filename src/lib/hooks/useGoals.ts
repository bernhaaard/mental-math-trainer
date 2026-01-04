/**
 * useGoals Hook
 *
 * Custom React hook for managing daily goals and streak state.
 * Handles loading, updating, and persisting goals data.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GoalsState, DailyGoal, StreakData } from '../types/goals';
import {
  getGoalsState,
  recordProblemsCompleted,
  updateDailyGoalTarget,
  getProgressPercentage,
  isDailyGoalMet,
  getRemainingProblems,
} from '../storage/goals-store';
import { DEFAULT_DAILY_GOAL } from '../types/goals';

/**
 * Return type for the useGoals hook
 */
export interface UseGoalsReturn {
  /** Current goals state */
  goalsState: GoalsState | null;
  /** Whether goals data is loading */
  isLoading: boolean;
  /** Error if loading failed */
  error: Error | null;
  /** Current daily goal configuration */
  dailyGoal: DailyGoal | null;
  /** Current streak data */
  streak: StreakData | null;
  /** Progress percentage (0-100) */
  progressPercentage: number;
  /** Whether daily goal is met */
  goalMet: boolean;
  /** Remaining problems to reach goal */
  remainingProblems: number;
  /** Record completed problems */
  recordProblems: (count: number) => Promise<void>;
  /** Update daily goal target */
  setGoalTarget: (target: number) => Promise<void>;
  /** Refresh goals data */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing daily goals and streaks
 */
export function useGoals(): UseGoalsReturn {
  const [goalsState, setGoalsState] = useState<GoalsState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load goals state on mount
  const loadGoalsState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const state = await getGoalsState();
      setGoalsState(state);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load goals'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoalsState();
  }, [loadGoalsState]);

  // Record completed problems
  const recordProblems = useCallback(async (count: number) => {
    try {
      const updatedState = await recordProblemsCompleted(count);
      setGoalsState(updatedState);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to record problems'));
    }
  }, []);

  // Update daily goal target
  const setGoalTarget = useCallback(async (target: number) => {
    try {
      const updatedState = await updateDailyGoalTarget(target);
      setGoalsState(updatedState);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update goal'));
    }
  }, []);

  // Computed values
  const dailyGoal = goalsState?.dailyGoal ?? null;
  const streak = goalsState?.streak ?? null;

  const progressPercentage = dailyGoal
    ? getProgressPercentage(dailyGoal)
    : 0;

  const goalMet = dailyGoal
    ? isDailyGoalMet(dailyGoal)
    : false;

  const remainingProblems = dailyGoal
    ? getRemainingProblems(dailyGoal)
    : DEFAULT_DAILY_GOAL;

  return {
    goalsState,
    isLoading,
    error,
    dailyGoal,
    streak,
    progressPercentage,
    goalMet,
    remainingProblems,
    recordProblems,
    setGoalTarget,
    refresh: loadGoalsState,
  };
}
