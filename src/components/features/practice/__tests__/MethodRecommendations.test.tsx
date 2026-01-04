/**
 * Tests for MethodRecommendations component
 * @module components/features/practice/__tests__/MethodRecommendations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MethodRecommendations } from '../MethodRecommendations';
import { MethodName } from '@/lib/types/method';
import type { UserStatistics, CumulativeMethodStats } from '@/lib/types/statistics';

// Mock the statistics store
const mockGetUserStatistics = vi.fn();
vi.mock('@/lib/storage/statistics-store', () => ({
  getUserStatistics: () => mockGetUserStatistics(),
}));

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

describe('MethodRecommendations', () => {
  const mockOnSelectMethod = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loading state', () => {
    it('should show loading skeleton while fetching data', async () => {
      // Create a promise that doesn't resolve immediately
      let resolvePromise: (value: UserStatistics) => void;
      const statsPromise = new Promise<UserStatistics>((resolve) => {
        resolvePromise = resolve;
      });
      mockGetUserStatistics.mockReturnValue(statsPromise);

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      // Should show loading state
      expect(screen.getByLabelText(/loading recommendations/i)).toBeInTheDocument();

      // Resolve the promise to clean up
      resolvePromise!(createMockUserStats());
      await waitFor(() => {
        expect(screen.queryByLabelText(/loading recommendations/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('empty state', () => {
    it('should show message for new users with no statistics', async () => {
      mockGetUserStatistics.mockResolvedValue(createMockUserStats());

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        expect(screen.getByText(/start practicing/i)).toBeInTheDocument();
      });
    });
  });

  describe('with recommendations', () => {
    it('should display recommendations when user has practiced', async () => {
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
      mockGetUserStatistics.mockResolvedValue(stats);

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        // Should show Squaring as a weak method recommendation (appears in both rec and overview)
        const squaringElements = screen.getAllByText('Squaring');
        expect(squaringElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should call onSelectMethod when recommendation is clicked', async () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 50,
            problemsSolved: 20,
          }),
        },
      });
      mockGetUserStatistics.mockResolvedValue(stats);

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      // Wait for the recommendation button to appear
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /practice distributive method/i })
        ).toBeInTheDocument();
      });

      // Click on the recommendation
      const recButton = screen.getByRole('button', {
        name: /practice distributive method/i,
      });
      fireEvent.click(recButton);

      expect(mockOnSelectMethod).toHaveBeenCalledWith(MethodName.Distributive);
    });

    it('should display priority numbers', async () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 50,
            problemsSolved: 20,
          }),
          [MethodName.Squaring]: createMockMethodStats({
            accuracy: 45,
            problemsSolved: 20,
          }),
        },
      });
      mockGetUserStatistics.mockResolvedValue(stats);

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
      });
    });

    it('should display recommendation reasons', async () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 50,
            problemsSolved: 20,
          }),
        },
      });
      mockGetUserStatistics.mockResolvedValue(stats);

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        expect(screen.getByText('Low Accuracy')).toBeInTheDocument();
      });
    });

    it('should display proficiency score for methods with reliable data', async () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 50, // Low accuracy to ensure it appears as a recommendation
            averageTime: 12000,
            problemsSolved: 20,
          }),
        },
      });
      mockGetUserStatistics.mockResolvedValue(stats);

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      // Wait for recommendations to load by checking for the heading
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /recommended practice/i })
        ).toBeInTheDocument();
      });

      // Wait a bit more for full render
      await waitFor(() => {
        // Score should be visible (appears in recommendations and overview)
        const scoreElements = screen.getAllByText('score');
        expect(scoreElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('refresh functionality', () => {
    it('should have a refresh button', async () => {
      mockGetUserStatistics.mockResolvedValue(createMockUserStats());

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /refresh recommendations/i })
        ).toBeInTheDocument();
      });
    });

    it('should reload data when refresh button is clicked', async () => {
      mockGetUserStatistics.mockResolvedValue(createMockUserStats());

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        expect(mockGetUserStatistics).toHaveBeenCalledTimes(1);
      });

      // Click refresh
      const refreshButton = screen.getByRole('button', {
        name: /refresh recommendations/i,
      });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockGetUserStatistics).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('error handling', () => {
    it('should show error message when loading fails', async () => {
      mockGetUserStatistics.mockRejectedValue(new Error('Network error'));

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load recommendations/i)).toBeInTheDocument();
      });
    });

    it('should have retry button when error occurs', async () => {
      mockGetUserStatistics.mockRejectedValue(new Error('Network error'));

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    it('should retry loading when retry button is clicked', async () => {
      mockGetUserStatistics.mockRejectedValueOnce(new Error('Network error'));
      mockGetUserStatistics.mockResolvedValueOnce(createMockUserStats());

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load recommendations/i)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockGetUserStatistics).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('methods overview', () => {
    it('should show all methods overview when user has enough data', async () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 90,
            problemsSolved: 20,
          }),
          [MethodName.Squaring]: createMockMethodStats({
            accuracy: 70,
            problemsSolved: 20,
          }),
          [MethodName.Near100]: createMockMethodStats({
            accuracy: 85,
            problemsSolved: 20,
          }),
        },
      });
      mockGetUserStatistics.mockResolvedValue(stats);

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        expect(screen.getByText('All Methods Overview')).toBeInTheDocument();
      });
    });

    it('should display progress bars for practiced methods', async () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 90,
            problemsSolved: 20,
          }),
        },
      });
      mockGetUserStatistics.mockResolvedValue(stats);

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        // Check for progress bars (by role)
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBeGreaterThan(0);
      });
    });
  });

  describe('accessibility', () => {
    it('should have accessible labels on recommendation buttons', async () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 50,
            problemsSolved: 20,
          }),
        },
      });
      mockGetUserStatistics.mockResolvedValue(stats);

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        const recButton = screen.getByRole('button', {
          name: /practice distributive method/i,
        });
        expect(recButton).toBeInTheDocument();
      });
    });

    it('should have proper heading structure', async () => {
      mockGetUserStatistics.mockResolvedValue(createMockUserStats());

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
          'Recommended Practice'
        );
      });
    });
  });

  describe('className prop', () => {
    it('should apply custom className', async () => {
      mockGetUserStatistics.mockResolvedValue(createMockUserStats());

      const { container } = render(
        <MethodRecommendations
          onSelectMethod={mockOnSelectMethod}
          className="custom-class"
        />
      );

      await waitFor(() => {
        const card = container.firstChild as HTMLElement;
        expect(card.classList.contains('custom-class')).toBe(true);
      });
    });
  });

  describe('declining trend highlighting', () => {
    it('should prioritize declining methods in recommendations', async () => {
      const stats = createMockUserStats({
        totalProblems: 100,
        methodStatistics: {
          [MethodName.Distributive]: createMockMethodStats({
            accuracy: 70,
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
      mockGetUserStatistics.mockResolvedValue(stats);

      render(<MethodRecommendations onSelectMethod={mockOnSelectMethod} />);

      // Wait for recommendations to load
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /practice distributive method/i })
        ).toBeInTheDocument();
      });

      // Declining method should have the "Declining Performance" badge
      expect(screen.getByText('Declining Performance')).toBeInTheDocument();

      // First recommendation (Priority 1) should be the declining one
      const priorityLabel = screen.getByLabelText('Priority 1');
      expect(priorityLabel.closest('button')).toHaveTextContent(
        'Distributive Method'
      );
    });
  });
});
