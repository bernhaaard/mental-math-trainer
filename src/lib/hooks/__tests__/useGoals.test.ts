/**
 * Tests for useGoals hook
 *
 * Tests the React hook for managing daily goals state.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGoals } from '../useGoals';
import type { GoalsState } from '../../types/goals';
import { DEFAULT_DAILY_GOAL } from '../../types/goals';

// Mock the goals-store module
vi.mock('../../storage/goals-store', () => ({
  getGoalsState: vi.fn(),
  recordProblemsCompleted: vi.fn(),
  updateDailyGoalTarget: vi.fn(),
  getProgressPercentage: vi.fn((dailyGoal) => {
    if (!dailyGoal || dailyGoal.targetProblems <= 0) return 100;
    return Math.min(100, Math.round((dailyGoal.completedToday / dailyGoal.targetProblems) * 100));
  }),
  isDailyGoalMet: vi.fn((dailyGoal) => {
    if (!dailyGoal) return false;
    return dailyGoal.completedToday >= dailyGoal.targetProblems;
  }),
  getRemainingProblems: vi.fn((dailyGoal) => {
    if (!dailyGoal) return DEFAULT_DAILY_GOAL;
    return Math.max(0, dailyGoal.targetProblems - dailyGoal.completedToday);
  }),
}));

import {
  getGoalsState,
  recordProblemsCompleted,
  updateDailyGoalTarget,
} from '../../storage/goals-store';

const mockedGetGoalsState = vi.mocked(getGoalsState);
const mockedRecordProblemsCompleted = vi.mocked(recordProblemsCompleted);
const mockedUpdateDailyGoalTarget = vi.mocked(updateDailyGoalTarget);

describe('useGoals hook', () => {
  const mockGoalsState: GoalsState = {
    userId: 'local-user',
    dailyGoal: {
      targetProblems: 10,
      completedToday: 5,
      date: '2024-01-15',
    },
    streak: {
      currentStreak: 3,
      longestStreak: 7,
      lastPracticeDate: '2024-01-15',
      lastGoalMetDate: '2024-01-14',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetGoalsState.mockResolvedValue(mockGoalsState);
    mockedRecordProblemsCompleted.mockResolvedValue(mockGoalsState);
    mockedUpdateDailyGoalTarget.mockResolvedValue(mockGoalsState);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should start in loading state', () => {
      const { result } = renderHook(() => useGoals());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
    });

    it('should load goals state on mount', async () => {
      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedGetGoalsState).toHaveBeenCalledTimes(1);
      expect(result.current.goalsState).toEqual(mockGoalsState);
    });

    it('should set error state on load failure', async () => {
      const error = new Error('Failed to load');
      mockedGetGoalsState.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Failed to load');
    });
  });

  describe('computed values', () => {
    it('should compute progress percentage correctly', async () => {
      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 5 of 10 = 50%
      expect(result.current.progressPercentage).toBe(50);
    });

    it('should compute goal met status correctly', async () => {
      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 5 < 10, goal not met
      expect(result.current.goalMet).toBe(false);
    });

    it('should compute remaining problems correctly', async () => {
      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 10 - 5 = 5 remaining
      expect(result.current.remainingProblems).toBe(5);
    });
  });

  describe('recordProblems', () => {
    it('should call recordProblemsCompleted with correct count', async () => {
      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.recordProblems(3);
      });

      expect(mockedRecordProblemsCompleted).toHaveBeenCalledWith(3);
    });

    it('should update state after recording problems', async () => {
      const updatedState: GoalsState = {
        ...mockGoalsState,
        dailyGoal: {
          ...mockGoalsState.dailyGoal,
          completedToday: 8,
        },
      };
      mockedRecordProblemsCompleted.mockResolvedValueOnce(updatedState);

      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.recordProblems(3);
      });

      expect(result.current.dailyGoal?.completedToday).toBe(8);
    });

    it('should handle record failure gracefully', async () => {
      mockedRecordProblemsCompleted.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.recordProblems(3);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('setGoalTarget', () => {
    it('should call updateDailyGoalTarget with new target', async () => {
      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setGoalTarget(15);
      });

      expect(mockedUpdateDailyGoalTarget).toHaveBeenCalledWith(15);
    });

    it('should update state after setting new target', async () => {
      const updatedState: GoalsState = {
        ...mockGoalsState,
        dailyGoal: {
          ...mockGoalsState.dailyGoal,
          targetProblems: 15,
        },
      };
      mockedUpdateDailyGoalTarget.mockResolvedValueOnce(updatedState);

      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setGoalTarget(15);
      });

      expect(result.current.dailyGoal?.targetProblems).toBe(15);
    });
  });

  describe('refresh', () => {
    it('should reload goals state', async () => {
      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedGetGoalsState).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockedGetGoalsState).toHaveBeenCalledTimes(2);
    });
  });

  describe('dailyGoal and streak accessors', () => {
    it('should expose dailyGoal from state', async () => {
      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.dailyGoal).toEqual(mockGoalsState.dailyGoal);
    });

    it('should expose streak from state', async () => {
      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.streak).toEqual(mockGoalsState.streak);
    });

    it('should return null for dailyGoal when no state', () => {
      mockedGetGoalsState.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useGoals());

      expect(result.current.dailyGoal).toBeNull();
      expect(result.current.streak).toBeNull();
    });
  });
});
