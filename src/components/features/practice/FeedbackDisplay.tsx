'use client';

/**
 * Props for FeedbackDisplay component.
 */
export interface FeedbackDisplayProps {
  /** Whether the answer was correct */
  isCorrect: boolean;
  /** The user's submitted answer */
  userAnswer: number;
  /** The correct answer */
  correctAnswer: number;
  /** Time taken to answer in seconds */
  timeTaken?: number;
  /** Callback when user wants to view the solution */
  onViewSolution: () => void;
  /** Callback when user wants to proceed to next problem */
  onNext: () => void;
  /** Whether the view solution button should be disabled */
  disableViewSolution?: boolean;
}

/**
 * Formats time taken in a human-readable format.
 */
function formatTimeTaken(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

/**
 * FeedbackDisplay component shows feedback after user submits an answer.
 * Displays correct/incorrect status, error magnitude, time taken, and action buttons.
 */
export function FeedbackDisplay({
  isCorrect,
  userAnswer,
  correctAnswer,
  timeTaken,
  onViewSolution,
  onNext,
  disableViewSolution = false
}: FeedbackDisplayProps) {
  const errorMagnitude = Math.abs(userAnswer - correctAnswer);

  return (
    <div
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Main feedback card */}
      <div
        className={`rounded-2xl border-2 p-8 shadow-2xl backdrop-blur-sm ${
          isCorrect
            ? 'border-green-500/50 bg-gradient-to-br from-green-900/30 to-green-800/20'
            : 'border-red-500/50 bg-gradient-to-br from-red-900/30 to-red-800/20'
        }`}
      >
        <div className="space-y-6">
          {/* Status indicator */}
          <div className="flex items-center justify-center">
            {isCorrect ? (
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/20 p-4">
                  <svg
                    className="h-16 w-16 text-green-400"
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
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-green-400">
                    Correct!
                  </h3>
                  <p className="text-lg text-green-300/80">
                    Well done!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-red-500/20 p-4">
                  <svg
                    className="h-16 w-16 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-red-400">
                    Not quite
                  </h3>
                  <p className="text-lg text-red-300/80">
                    Let&apos;s review the solution
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Answer details */}
          <div className="space-y-3 rounded-xl bg-black/20 p-6">
            {/* Your answer */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Your answer:
              </span>
              <span
                className={`font-mono text-2xl font-bold ${
                  isCorrect ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {userAnswer.toLocaleString()}
              </span>
            </div>

            {/* Correct answer (if wrong) */}
            {!isCorrect && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Correct answer:
                  </span>
                  <span className="font-mono text-2xl font-bold text-green-400">
                    {correctAnswer.toLocaleString()}
                  </span>
                </div>

                {/* Error magnitude */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    You were off by:
                  </span>
                  <span className="font-mono text-xl font-semibold text-orange-400">
                    {errorMagnitude.toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {/* Time taken */}
            {timeTaken !== undefined && (
              <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Time taken:
                </span>
                <span className="font-mono text-xl font-semibold text-blue-400">
                  {formatTimeTaken(timeTaken)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* View Solution button */}
        <button
          onClick={onViewSolution}
          disabled={disableViewSolution}
          className="rounded-xl border-2 border-purple-500/30 bg-purple-500/10 px-6 py-4 font-semibold text-purple-300 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/20 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            View Solution
          </span>
        </button>

        {/* Next Problem button */}
        <button
          onClick={onNext}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-500 hover:to-blue-400 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        >
          <span className="flex items-center justify-center gap-2">
            Next Problem
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </button>
      </div>

      {/* Accessibility announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {isCorrect
          ? `Correct! Your answer of ${userAnswer.toLocaleString()} is right.`
          : `Incorrect. Your answer was ${userAnswer.toLocaleString()}, but the correct answer is ${correctAnswer.toLocaleString()}. You were off by ${errorMagnitude.toLocaleString()}.`}
        {timeTaken !== undefined && ` Time taken: ${formatTimeTaken(timeTaken)}.`}
      </div>
    </div>
  );
}
