'use client';

/**
 * DailyProgress Component
 *
 * Displays daily goal progress and streak information.
 * Shows a progress bar, problems completed, and current streak count.
 */

import { useGoals } from '@/lib/hooks';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

/**
 * Props for the DailyProgress component
 */
export interface DailyProgressProps {
  /** Optional CSS class name */
  className?: string;
  /** Whether to show in compact mode (minimal display) */
  compact?: boolean;
}

/**
 * Streak badge component for displaying current streak
 */
function StreakBadge({ count, longestStreak }: { count: number; longestStreak: number }) {
  const isNewRecord = count > 0 && count === longestStreak;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
          count > 0
            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <span className="text-lg" role="img" aria-label="fire">
          {count > 0 ? '\u{1F525}' : '\u{1F9CA}'}
        </span>
        <span>{count} day{count !== 1 ? 's' : ''}</span>
      </div>
      {isNewRecord && count > 1 && (
        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
          Personal best!
        </span>
      )}
    </div>
  );
}

/**
 * Goal completion celebration
 */
function GoalCompletedBanner() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
      <span className="text-lg" role="img" aria-label="check">
        \u2705
      </span>
      <span>Daily goal completed!</span>
    </div>
  );
}

/**
 * Loading skeleton for the component
 */
function DailyProgressSkeleton({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-2 w-32 rounded-full bg-muted" />
      </div>
    );
  }

  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-5 w-32 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-2 w-full rounded-full bg-muted" />
          <div className="flex justify-between">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * DailyProgress component displays current daily goal progress and streak.
 *
 * Features:
 * - Progress bar showing problems completed vs goal
 * - Current streak count with visual indicator
 * - Goal completion celebration when target is met
 * - Compact mode for minimal display
 *
 * @example
 * ```tsx
 * // Full display
 * <DailyProgress />
 *
 * // Compact mode for header/nav
 * <DailyProgress compact />
 * ```
 */
export function DailyProgress({ className = '', compact = false }: DailyProgressProps) {
  const {
    dailyGoal,
    streak,
    progressPercentage,
    goalMet,
    remainingProblems,
    isLoading,
    error,
  } = useGoals();

  // Loading state
  if (isLoading) {
    return <DailyProgressSkeleton compact={compact} />;
  }

  // Error state
  if (error || !dailyGoal || !streak) {
    return null; // Silently fail - goals are optional enhancement
  }

  // Compact mode for header/navigation
  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`.trim()}>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">
            {dailyGoal.completedToday}/{dailyGoal.targetProblems}
          </span>
          <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all duration-300 ${
                goalMet ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        {streak.currentStreak > 0 && (
          <div className="flex items-center gap-1 text-sm text-orange-500">
            <span role="img" aria-label="fire">{'\u{1F525}'}</span>
            <span>{streak.currentStreak}</span>
          </div>
        )}
      </div>
    );
  }

  // Full display mode
  return (
    <Card className={className} data-testid="daily-progress">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">
            Daily Progress
          </h3>
          <StreakBadge count={streak.currentStreak} longestStreak={streak.longestStreak} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <Progress
            value={dailyGoal.completedToday}
            max={dailyGoal.targetProblems}
            label={`${dailyGoal.completedToday} of ${dailyGoal.targetProblems} problems`}
            className={goalMet ? '[&_div]:bg-green-500' : ''}
          />

          {/* Status message */}
          {goalMet ? (
            <GoalCompletedBanner />
          ) : (
            <p className="text-sm text-muted-foreground">
              {remainingProblems} more problem{remainingProblems !== 1 ? 's' : ''} to reach your daily goal
            </p>
          )}

          {/* Streak info */}
          {streak.longestStreak > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
              <span>Longest streak</span>
              <span className="font-medium text-foreground">
                {streak.longestStreak} day{streak.longestStreak !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
