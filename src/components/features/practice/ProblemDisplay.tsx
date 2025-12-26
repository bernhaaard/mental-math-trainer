'use client';

import { Problem, DifficultyLevel } from '@/lib/types/problem';
import { MethodName } from '@/lib/types/method';
import { useEffect, useState } from 'react';

/**
 * Props for ProblemDisplay component.
 */
export interface ProblemDisplayProps {
  /** The current problem to display */
  problem: Problem;
  /** Current problem number (1-indexed) */
  problemNumber: number;
  /** Total number of problems in session, or undefined for infinite */
  totalProblems?: number;
  /** Optional timer value in seconds */
  timeElapsed?: number;
  /** Whether to show a method hint */
  showMethodHint?: boolean;
  /** The optimal method for this problem (for hint) */
  optimalMethod?: MethodName;
  /** Whether the problem is being answered (for animation timing) */
  isActive?: boolean;
}

/**
 * Display name mappings for methods.
 */
const METHOD_DISPLAY_NAMES: Record<MethodName, string> = {
  [MethodName.Distributive]: 'Distributive Property',
  [MethodName.NearPower10]: 'Near Powers of 10',
  [MethodName.DifferenceSquares]: 'Difference of Squares',
  [MethodName.Factorization]: 'Factorization',
  [MethodName.Squaring]: 'Squaring',
  [MethodName.Near100]: 'Near 100'
};

/**
 * Difficulty level color classes.
 */
const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.Beginner]: 'bg-green-500/20 text-green-300 border-green-500/30',
  [DifficultyLevel.Intermediate]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [DifficultyLevel.Advanced]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  [DifficultyLevel.Expert]: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  [DifficultyLevel.Mastery]: 'bg-red-500/20 text-red-300 border-red-500/30'
};

/**
 * Formats time in MM:SS format.
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * ProblemDisplay component shows the current multiplication problem
 * with metadata like difficulty, progress, and optional hints.
 */
export function ProblemDisplay({
  problem,
  problemNumber,
  totalProblems,
  timeElapsed,
  showMethodHint = false,
  optimalMethod,
  isActive = true
}: ProblemDisplayProps) {
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger animation when problem changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [problem.id]);

  return (
    <div className="space-y-6">
      {/* Header with progress and metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Problem counter */}
        <div className="text-sm font-medium text-gray-400">
          Problem {problemNumber}
          {totalProblems !== undefined && ` of ${totalProblems}`}
        </div>

        {/* Right side metadata */}
        <div className="flex items-center gap-3">
          {/* Timer */}
          {timeElapsed !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg
                className="h-4 w-4"
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
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
          )}

          {/* Difficulty badge */}
          <div
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              DIFFICULTY_COLORS[problem.difficulty]
            }`}
          >
            {problem.difficulty}
          </div>
        </div>
      </div>

      {/* Main problem display */}
      <div
        key={animationKey}
        className={`rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 shadow-xl backdrop-blur-sm transition-all duration-500 ${
          isActive
            ? 'animate-in fade-in slide-in-from-bottom-4'
            : 'opacity-50'
        }`}
      >
        <div className="flex items-center justify-center">
          <div className="space-y-4 text-center">
            {/* The multiplication expression */}
            <div className="flex items-center justify-center gap-6 font-mono">
              <span className="text-6xl font-bold text-gray-100 sm:text-7xl md:text-8xl">
                {problem.num1.toLocaleString()}
              </span>
              <span className="text-5xl font-light text-gray-400 sm:text-6xl md:text-7xl">
                ×
              </span>
              <span className="text-6xl font-bold text-gray-100 sm:text-7xl md:text-8xl">
                {problem.num2.toLocaleString()}
              </span>
              <span className="text-5xl font-light text-gray-400 sm:text-6xl md:text-7xl">
                =
              </span>
              <span className="text-6xl font-bold text-blue-400 sm:text-7xl md:text-8xl">
                ?
              </span>
            </div>

            {/* Method hint (if enabled) */}
            {showMethodHint && optimalMethod && (
              <div className="animate-in fade-in slide-in-from-top-2 pt-4 duration-700">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 ring-1 ring-blue-500/20">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span>
                    Try using: {METHOD_DISPLAY_NAMES[optimalMethod]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accessibility label */}
      <div className="sr-only" role="status" aria-live="polite">
        Problem {problemNumber}
        {totalProblems !== undefined && ` of ${totalProblems}`}
        : What is {problem.num1} times {problem.num2}?
      </div>
    </div>
  );
}
