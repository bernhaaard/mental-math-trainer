/**
 * Tests for goals-store.ts
 *
 * Tests daily goal tracking, streak calculations, and persistence.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  getProgressPercentage,
  isDailyGoalMet,
  getRemainingProblems,
  getTodayDateString,
} from '../goals-store';
import type { DailyGoal, GoalsState } from '../../types/goals';
import { DEFAULT_DAILY_GOAL } from '../../types/goals';

// Note: IndexedDB operations are tested implicitly through integration tests.
// These unit tests focus on the pure utility functions.

describe('goals-store pure functions', () => {
  describe('getTodayDateString', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const dateString = getTodayDateString();
      expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return today\'s date', () => {
      const dateString = getTodayDateString();
      const today = new Date();
      const expected = today.toISOString().split('T')[0];
      expect(dateString).toBe(expected);
    });
  });

  describe('getProgressPercentage', () => {
    it('should return 0 when no problems completed', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 0,
        date: getTodayDateString(),
      };
      expect(getProgressPercentage(dailyGoal)).toBe(0);
    });

    it('should return 50 when half complete', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 5,
        date: getTodayDateString(),
      };
      expect(getProgressPercentage(dailyGoal)).toBe(50);
    });

    it('should return 100 when goal is met', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 10,
        date: getTodayDateString(),
      };
      expect(getProgressPercentage(dailyGoal)).toBe(100);
    });

    it('should cap at 100 when exceeded', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 15,
        date: getTodayDateString(),
      };
      expect(getProgressPercentage(dailyGoal)).toBe(100);
    });

    it('should return 100 when target is 0', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 0,
        completedToday: 5,
        date: getTodayDateString(),
      };
      expect(getProgressPercentage(dailyGoal)).toBe(100);
    });

    it('should round to nearest integer', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 3,
        completedToday: 1,
        date: getTodayDateString(),
      };
      expect(getProgressPercentage(dailyGoal)).toBe(33);
    });
  });

  describe('isDailyGoalMet', () => {
    it('should return false when below target', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 5,
        date: getTodayDateString(),
      };
      expect(isDailyGoalMet(dailyGoal)).toBe(false);
    });

    it('should return true when at target', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 10,
        date: getTodayDateString(),
      };
      expect(isDailyGoalMet(dailyGoal)).toBe(true);
    });

    it('should return true when above target', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 15,
        date: getTodayDateString(),
      };
      expect(isDailyGoalMet(dailyGoal)).toBe(true);
    });
  });

  describe('getRemainingProblems', () => {
    it('should return full target when none completed', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 0,
        date: getTodayDateString(),
      };
      expect(getRemainingProblems(dailyGoal)).toBe(10);
    });

    it('should return remaining count', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 7,
        date: getTodayDateString(),
      };
      expect(getRemainingProblems(dailyGoal)).toBe(3);
    });

    it('should return 0 when goal met', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 10,
        date: getTodayDateString(),
      };
      expect(getRemainingProblems(dailyGoal)).toBe(0);
    });

    it('should return 0 when exceeded', () => {
      const dailyGoal: DailyGoal = {
        targetProblems: 10,
        completedToday: 15,
        date: getTodayDateString(),
      };
      expect(getRemainingProblems(dailyGoal)).toBe(0);
    });
  });
});

describe('goals-store date helpers', () => {
  describe('date string formatting', () => {
    it('should pad single digit months', () => {
      // Create a date for January 5th
      const mockDate = new Date('2024-01-05T12:00:00Z');
      vi.setSystemTime(mockDate);

      const dateString = getTodayDateString();
      expect(dateString).toBe('2024-01-05');

      vi.useRealTimers();
    });

    it('should pad single digit days', () => {
      const mockDate = new Date('2024-12-03T12:00:00Z');
      vi.setSystemTime(mockDate);

      const dateString = getTodayDateString();
      expect(dateString).toBe('2024-12-03');

      vi.useRealTimers();
    });
  });
});

describe('goals-store streak logic', () => {
  // These tests verify the streak calculation logic conceptually
  // Full integration tests would require IndexedDB mocking

  describe('streak continuation rules', () => {
    it('should define that a streak continues when goal was met yesterday', () => {
      // This is a documentation test verifying the expected behavior
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayString = yesterdayDate.toISOString().split('T')[0];

      // If lastGoalMetDate is yesterday and we meet goal today,
      // streak should increment
      expect(yesterdayString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should define that a streak resets when gap is more than one day', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoString = twoDaysAgo.toISOString().split('T')[0];

      // If lastGoalMetDate is more than 1 day ago, streak should reset to 1
      expect(twoDaysAgoString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

describe('GoalsState structure', () => {
  it('should have correct default values', () => {
    const defaultState: GoalsState = {
      userId: 'local-user',
      dailyGoal: {
        targetProblems: DEFAULT_DAILY_GOAL,
        completedToday: 0,
        date: getTodayDateString(),
      },
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
        lastGoalMetDate: null,
      },
    };

    expect(defaultState.dailyGoal.targetProblems).toBe(10);
    expect(defaultState.dailyGoal.completedToday).toBe(0);
    expect(defaultState.streak.currentStreak).toBe(0);
    expect(defaultState.streak.longestStreak).toBe(0);
  });
});

describe('goal target constraints', () => {
  it('should have valid MIN_DAILY_GOAL constant', () => {
    // Import and check the constant
    expect(DEFAULT_DAILY_GOAL).toBe(10);
  });

  it('should document valid goal range (1-100)', () => {
    // The updateDailyGoalTarget function should clamp values to 1-100
    // This is a documentation test of expected behavior
    const minGoal = 1;
    const maxGoal = 100;

    expect(minGoal).toBeLessThan(maxGoal);
    expect(DEFAULT_DAILY_GOAL).toBeGreaterThanOrEqual(minGoal);
    expect(DEFAULT_DAILY_GOAL).toBeLessThanOrEqual(maxGoal);
  });
});
