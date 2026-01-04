/**
 * Tests for DailyProgress component
 *
 * Tests the daily progress display with streaks and goal tracking.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyProgress } from '../DailyProgress';
import type { UseGoalsReturn } from '@/lib/hooks/useGoals';

// Mock the useGoals hook
vi.mock('@/lib/hooks', () => ({
  useGoals: vi.fn(),
}));

import { useGoals } from '@/lib/hooks';

const mockedUseGoals = vi.mocked(useGoals);

describe('DailyProgress component', () => {
  const mockGoalsReturn: UseGoalsReturn = {
    goalsState: {
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
    },
    isLoading: false,
    error: null,
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
    progressPercentage: 50,
    goalMet: false,
    remainingProblems: 5,
    recordProblems: vi.fn(),
    setGoalTarget: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseGoals.mockReturnValue(mockGoalsReturn);
  });

  describe('loading state', () => {
    it('should show skeleton when loading', () => {
      mockedUseGoals.mockReturnValue({
        ...mockGoalsReturn,
        isLoading: true,
      });

      render(<DailyProgress />);

      // Look for loading indicators (animate-pulse)
      const container = document.querySelector('.animate-pulse');
      expect(container).toBeTruthy();
    });

    it('should show compact skeleton when loading in compact mode', () => {
      mockedUseGoals.mockReturnValue({
        ...mockGoalsReturn,
        isLoading: true,
      });

      render(<DailyProgress compact />);

      // Compact skeleton should exist
      const container = document.querySelector('.animate-pulse');
      expect(container).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('should return null on error', () => {
      mockedUseGoals.mockReturnValue({
        ...mockGoalsReturn,
        error: new Error('Failed to load'),
      });

      const { container } = render(<DailyProgress />);

      expect(container.innerHTML).toBe('');
    });

    it('should return null when dailyGoal is null', () => {
      mockedUseGoals.mockReturnValue({
        ...mockGoalsReturn,
        dailyGoal: null,
      });

      const { container } = render(<DailyProgress />);

      expect(container.innerHTML).toBe('');
    });

    it('should return null when streak is null', () => {
      mockedUseGoals.mockReturnValue({
        ...mockGoalsReturn,
        streak: null,
      });

      const { container } = render(<DailyProgress />);

      expect(container.innerHTML).toBe('');
    });
  });

  describe('full display mode', () => {
    it('should render Daily Progress heading', () => {
      render(<DailyProgress />);

      expect(screen.getByText('Daily Progress')).toBeInTheDocument();
    });

    it('should display progress text', () => {
      render(<DailyProgress />);

      expect(screen.getByText('5 of 10 problems')).toBeInTheDocument();
    });

    it('should display streak count', () => {
      render(<DailyProgress />);

      // Look for the streak badge text
      expect(screen.getByText(/3 days/)).toBeInTheDocument();
    });

    it('should display longest streak when available', () => {
      render(<DailyProgress />);

      expect(screen.getByText('Longest streak')).toBeInTheDocument();
      expect(screen.getByText('7 days')).toBeInTheDocument();
    });

    it('should display remaining problems message', () => {
      render(<DailyProgress />);

      expect(screen.getByText(/5 more problems? to reach your daily goal/)).toBeInTheDocument();
    });

    it('should show goal completed banner when goal is met', () => {
      mockedUseGoals.mockReturnValue({
        ...mockGoalsReturn,
        goalMet: true,
        remainingProblems: 0,
      });

      render(<DailyProgress />);

      expect(screen.getByText('Daily goal completed!')).toBeInTheDocument();
    });

    it('should show personal best text when current equals longest streak', () => {
      mockedUseGoals.mockReturnValue({
        ...mockGoalsReturn,
        streak: {
          currentStreak: 7,
          longestStreak: 7,
          lastPracticeDate: '2024-01-15',
          lastGoalMetDate: '2024-01-14',
        },
      });

      render(<DailyProgress />);

      expect(screen.getByText('Personal best!')).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('should show compact progress display', () => {
      render(<DailyProgress compact />);

      // Should show fraction
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('should show streak icon in compact mode when streak > 0', () => {
      render(<DailyProgress compact />);

      // Should show streak count
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should not show streak in compact mode when streak is 0', () => {
      mockedUseGoals.mockReturnValue({
        ...mockGoalsReturn,
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastPracticeDate: null,
          lastGoalMetDate: null,
        },
      });

      render(<DailyProgress compact />);

      // Should not show a lone "0" (the 0 would still be part of "5/10")
      const elements = screen.queryAllByText('0');
      // Only the one that's part of "5/10" should exist
      expect(elements.every(el => el.textContent !== '0')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have proper test id', () => {
      render(<DailyProgress />);

      expect(screen.getByTestId('daily-progress')).toBeInTheDocument();
    });

    it('should have proper aria labels on streak badge', () => {
      render(<DailyProgress />);

      expect(screen.getByRole('img', { name: 'fire' })).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<DailyProgress className="custom-class" />);

      const card = screen.getByTestId('daily-progress');
      expect(card.className).toContain('custom-class');
    });
  });
});
