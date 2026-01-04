/**
 * ExerciseProgress component - Shows exercise completion and session progress.
 * @module components/features/study/ExerciseProgress
 */

'use client';

import { useMemo } from 'react';

/**
 * Status of a single exercise
 */
export type ExerciseStatus = 'pending' | 'completed' | 'skipped' | 'current';

/**
 * Difficulty level for exercises
 */
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

/**
 * An exercise item with its status
 */
export interface ExerciseItem {
  /** Unique identifier for the exercise */
  id: string;
  /** Current status of the exercise */
  status: ExerciseStatus;
  /** Difficulty level */
  difficulty: ExerciseDifficulty;
  /** Number of hints used (if completed) */
  hintsUsed?: number;
  /** Number of attempts (if completed) */
  attempts?: number;
}

export interface ExerciseProgressProps {
  /** List of all exercises with their status */
  exercises: ExerciseItem[];
  /** Index of the current exercise (0-based) */
  currentIndex: number;
  /** Current streak of correct answers without hints */
  streak?: number;
  /** Total score accumulated */
  score?: number;
  /** Callback when clicking on an exercise indicator */
  onExerciseClick?: (index: number) => void;
  /** Whether navigation to completed exercises is allowed */
  allowNavigation?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * Displays progress through a set of exercises with:
 * - Completed vs remaining exercises visualization
 * - Difficulty labels (Easy, Medium, Hard)
 * - Score/streak tracking within session
 */
export function ExerciseProgress({
  exercises,
  currentIndex: _currentIndex,
  streak = 0,
  score = 0,
  onExerciseClick,
  allowNavigation = true,
  className = ''
}: ExerciseProgressProps) {
  // currentIndex is used by parent to track which exercise is active
  // We use it implicitly through the status property of each exercise
  void _currentIndex;
  // Calculate statistics
  const stats = useMemo(() => {
    const completed = exercises.filter(e => e.status === 'completed').length;
    const skipped = exercises.filter(e => e.status === 'skipped').length;
    const pending = exercises.filter(e => e.status === 'pending' || e.status === 'current').length;
    const total = exercises.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Count by difficulty
    const byDifficulty = {
      easy: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      hard: { total: 0, completed: 0 }
    };

    exercises.forEach(ex => {
      byDifficulty[ex.difficulty].total++;
      if (ex.status === 'completed') {
        byDifficulty[ex.difficulty].completed++;
      }
    });

    // Calculate average hints used
    const completedExercises = exercises.filter(e => e.status === 'completed');
    const avgHints = completedExercises.length > 0
      ? completedExercises.reduce((sum, e) => sum + (e.hintsUsed || 0), 0) / completedExercises.length
      : 0;

    return {
      completed,
      skipped,
      pending,
      total,
      progressPercent,
      byDifficulty,
      avgHints
    };
  }, [exercises]);

  // Difficulty badge colors using design tokens
  const difficultyColors: Record<ExerciseDifficulty, { bg: string; text: string; border: string }> = {
    easy: { bg: 'bg-success-muted', text: 'text-success', border: 'border-success/30' },
    medium: { bg: 'bg-warning-muted', text: 'text-warning', border: 'border-warning/30' },
    hard: { bg: 'bg-error-muted', text: 'text-error', border: 'border-error/30' }
  };

  // Status indicator colors using design tokens
  const statusColors: Record<ExerciseStatus, string> = {
    pending: 'bg-muted border-border',
    current: 'bg-accent border-accent animate-pulse',
    completed: 'bg-success border-success',
    skipped: 'bg-muted-foreground/50 border-muted-foreground'
  };

  // Handle exercise click
  const handleExerciseClick = (index: number) => {
    if (!allowNavigation || !onExerciseClick) return;
    const exercise = exercises[index];
    // Only allow navigation to completed or current exercises
    if (exercise && (exercise.status === 'completed' || exercise.status === 'current')) {
      onExerciseClick(index);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Progress
          </h3>
          <p className="text-2xl font-bold text-foreground">
            {stats.completed} / {stats.total}
          </p>
        </div>

        {/* Streak and Score */}
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-warning-muted px-3 py-1.5 text-warning">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.47-.3 2.98-.93 4.03-1.92-.28 2.58-1.55 5.9-3.62 8.18z" />
              </svg>
              <span className="text-sm font-bold">{streak}</span>
            </div>
          )}

          {score > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1.5 text-accent">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span className="text-sm font-bold">{score}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-success to-success/80 transition-all duration-500"
            style={{ width: `${stats.progressPercent}%` }}
            role="progressbar"
            aria-valuenow={stats.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${stats.progressPercent}% complete`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{stats.progressPercent}% complete</span>
          {stats.skipped > 0 && (
            <span>{stats.skipped} skipped</span>
          )}
        </div>
      </div>

      {/* Exercise Indicators */}
      <div
        className="flex flex-wrap gap-2"
        role="list"
        aria-label="Exercise indicators"
      >
        {exercises.map((exercise, index) => {
          const isClickable = allowNavigation &&
            onExerciseClick &&
            (exercise.status === 'completed' || exercise.status === 'current');

          return (
            <button
              key={exercise.id}
              onClick={() => handleExerciseClick(index)}
              disabled={!isClickable}
              className={`
                relative flex h-8 w-8 items-center justify-center rounded-lg border-2 text-xs font-bold transition-all duration-200
                ${statusColors[exercise.status]}
                ${isClickable
                  ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                  : 'cursor-default'
                }
                ${exercise.status === 'current' ? 'ring-2 ring-accent ring-offset-2' : ''}
              `}
              role="listitem"
              aria-label={`Exercise ${index + 1}: ${exercise.status}, ${exercise.difficulty} difficulty`}
              aria-current={exercise.status === 'current' ? 'step' : undefined}
            >
              {/* Exercise number */}
              <span className={exercise.status === 'completed' ? 'text-white' : 'text-foreground'}>
                {index + 1}
              </span>

              {/* Completed checkmark overlay */}
              {exercise.status === 'completed' && (
                <svg
                  className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-background text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}

              {/* Skipped X overlay */}
              {exercise.status === 'skipped' && (
                <svg
                  className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-background text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Difficulty Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.entries(stats.byDifficulty) as [ExerciseDifficulty, { total: number; completed: number }][]).map(
          ([difficulty, data]) => {
            if (data.total === 0) return null;
            const colors = difficultyColors[difficulty];
            const percent = Math.round((data.completed / data.total) * 100);

            return (
              <div
                key={difficulty}
                className={`rounded-lg border p-3 ${colors.border} ${colors.bg}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold capitalize ${colors.text}`}>
                    {difficulty}
                  </span>
                  <span className={`text-xs ${colors.text}`}>
                    {data.completed}/{data.total}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/50">
                  <div
                    className={`h-full transition-all duration-500 ${
                      difficulty === 'easy'
                        ? 'bg-success'
                        : difficulty === 'medium'
                          ? 'bg-warning'
                          : 'bg-error'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Session Statistics */}
      {stats.completed > 0 && (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-card/50 p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Avg. Hints Used</p>
            <p className="text-lg font-bold text-foreground">
              {stats.avgHints.toFixed(1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="text-lg font-bold text-foreground">
              {Math.round((stats.completed / (stats.completed + stats.skipped || 1)) * 100)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
