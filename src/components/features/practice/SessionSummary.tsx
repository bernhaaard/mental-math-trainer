'use client';

/**
 * Session Summary Component
 * Displays comprehensive statistics and feedback after completing a practice session.
 */

import Link from 'next/link';
import type { SessionStatistics, ProblemAttempt } from '@/lib/types/session';
import type { MethodName } from '@/lib/types/method';

interface SessionSummaryProps {
  statistics: SessionStatistics;
  problems: ProblemAttempt[];
  onPracticeAgain: () => void;
}

export function SessionSummary({
  statistics,
  problems,
  onPracticeAgain
}: SessionSummaryProps) {
  const { totalProblems, correctAnswers, accuracy, averageTime, methodBreakdown } = statistics;

  // Find problems that need review (incorrect or skipped)
  const problemsToReview = problems.filter(
    p => p.skipped || p.userAnswers[0] !== p.correctAnswer
  );

  // Get accuracy color based on percentage
  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return 'text-green-600 dark:text-green-400';
    if (acc >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Format time in seconds
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1) + 's';
  };

  // Convert methodBreakdown to array for rendering
  const methodStats = Object.entries(methodBreakdown).map(([methodKey, stats]) => ({
    ...stats,
    method: methodKey as MethodName
  }));

  // Sort methods by accuracy (worst first) for targeted practice recommendations
  const sortedMethodStats = [...methodStats].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Session Complete!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s how you performed
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="bg-card rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Overall Performance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Problems */}
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {totalProblems}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Problems Attempted
            </div>
          </div>

          {/* Accuracy */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getAccuracyColor(accuracy)}`}>
              {accuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Accuracy
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {correctAnswers} of {totalProblems} correct
            </div>
          </div>

          {/* Average Time */}
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {formatTime(averageTime)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Avg. Time per Problem
            </div>
          </div>

          {/* Problems to Review */}
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
              {problemsToReview.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              To Review
            </div>
          </div>
        </div>

        {/* Accuracy Bar */}
        <div className="mt-6">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                accuracy >= 90
                  ? 'bg-green-500'
                  : accuracy >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Method Breakdown */}
      {methodStats.length > 0 && (
        <div className="bg-card rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Performance by Method
          </h2>

          <div className="space-y-4">
            {sortedMethodStats.map((stat) => (
              <div
                key={stat.method}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {stat.method}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {stat.problemsSolved} problem{stat.problemsSolved !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getAccuracyColor(stat.accuracy)}`}>
                      {stat.accuracy.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(stat.averageTime)} avg
                    </div>
                  </div>
                </div>

                {/* Method accuracy bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      stat.accuracy >= 90
                        ? 'bg-green-500'
                        : stat.accuracy >= 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${stat.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problems to Review */}
      {problemsToReview.length > 0 && (
        <div className="bg-card rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Problems to Review ({problemsToReview.length})
          </h2>

          <div className="space-y-3">
            {problemsToReview.map((problem, index) => (
              <div
                key={problem.problem.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-mono text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {problem.problem.num1} × {problem.problem.num2}
                  </div>
                  {problem.skipped ? (
                    <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
                      Skipped
                    </span>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Your answer: {problem.userAnswers[0]} (Correct: {problem.correctAnswer})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onPracticeAgain}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Practice Again
        </button>

        <Link
          href="/"
          className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg shadow-md transition-colors text-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Return Home
        </Link>

        <Link
          href="/statistics"
          className="px-6 py-3 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-medium rounded-lg transition-colors text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          View Statistics
        </Link>
      </div>
    </div>
  );
}
