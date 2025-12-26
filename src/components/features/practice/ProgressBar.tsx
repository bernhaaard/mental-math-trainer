'use client';

/**
 * Props for ProgressBar component.
 */
export interface ProgressBarProps {
  /** Number of problems completed */
  completed: number;
  /** Total number of problems (undefined for infinite mode) */
  total?: number;
  /** Number of correct answers */
  correct: number;
  /** Current accuracy percentage (0-100) */
  accuracy: number;
  /** Average time per problem in seconds */
  averageTime?: number;
  /** Whether to show detailed stats */
  showDetails?: boolean;
}

/**
 * Formats time in a compact format.
 */
function formatCompactTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

/**
 * Get color class based on accuracy percentage.
 */
function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-green-400';
  if (accuracy >= 70) return 'text-blue-400';
  if (accuracy >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Get progress bar gradient based on accuracy.
 */
function getProgressGradient(accuracy: number): string {
  if (accuracy >= 90) return 'from-green-600 to-green-500';
  if (accuracy >= 70) return 'from-blue-600 to-blue-500';
  if (accuracy >= 50) return 'from-yellow-600 to-yellow-500';
  return 'from-red-600 to-red-500';
}

/**
 * ProgressBar component displays session progress and statistics.
 * Shows completion percentage, accuracy, and optional detailed metrics.
 */
export function ProgressBar({
  completed,
  total,
  correct,
  accuracy,
  averageTime,
  showDetails = true
}: ProgressBarProps) {
  const progressPercentage = total ? (completed / total) * 100 : 0;
  const hasStarted = completed > 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        {/* Header with completion count */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-400">
            {total !== undefined ? (
              <>
                Progress: {completed} / {total}
              </>
            ) : (
              <>Problems Solved: {completed}</>
            )}
          </span>
          {total !== undefined && (
            <span className="font-mono font-semibold text-gray-300">
              {Math.round(progressPercentage)}%
            </span>
          )}
        </div>

        {/* Visual progress bar (only for finite sessions) */}
        {total !== undefined && (
          <div className="h-3 overflow-hidden rounded-full bg-gray-800 shadow-inner">
            <div
              className={`h-full bg-gradient-to-r ${getProgressGradient(accuracy)} transition-all duration-500 ease-out`}
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${Math.round(progressPercentage)}% complete`}
            />
          </div>
        )}
      </div>

      {/* Detailed statistics */}
      {showDetails && hasStarted && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {/* Accuracy */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Accuracy
              </span>
            </div>
            <div className="mt-1">
              <span className={`font-mono text-2xl font-bold ${getAccuracyColor(accuracy)}`}>
                {Math.round(accuracy)}%
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {correct} / {completed} correct
            </div>
          </div>

          {/* Average time */}
          {averageTime !== undefined && (
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Avg Time
                </span>
              </div>
              <div className="mt-1">
                <span className="font-mono text-2xl font-bold text-blue-400">
                  {formatCompactTime(averageTime)}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                per problem
              </div>
            </div>
          )}

          {/* Incorrect count */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Incorrect
              </span>
            </div>
            <div className="mt-1">
              <span className="font-mono text-2xl font-bold text-gray-300">
                {completed - correct}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              problems
            </div>
          </div>
        </div>
      )}

      {/* No data message */}
      {!hasStarted && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-4 text-center text-sm text-gray-500">
          Start solving problems to see your progress
        </div>
      )}

      {/* Accessibility label */}
      <div className="sr-only" role="status" aria-live="polite">
        {hasStarted ? (
          <>
            Completed {completed} {total !== undefined && `of ${total}`} problems.
            Accuracy: {Math.round(accuracy)}%. {correct} correct, {completed - correct} incorrect.
            {averageTime !== undefined && ` Average time: ${formatCompactTime(averageTime)}.`}
          </>
        ) : (
          <>No problems solved yet.</>
        )}
      </div>
    </div>
  );
}
