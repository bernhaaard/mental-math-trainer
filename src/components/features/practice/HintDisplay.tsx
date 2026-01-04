'use client';

import React, { useMemo } from 'react';
import type { Hint, HintState, HintResult } from '@/lib/core/hints';
import { HintLevel } from '@/lib/core/hints';

/**
 * Props for HintDisplay component.
 */
export interface HintDisplayProps {
  /** Current hint state */
  hintState: HintState;
  /** Hint result for current problem */
  hintResult: HintResult | null;
  /** Callback when user requests another hint */
  onRequestHint: () => void;
  /** Whether hints are disabled (e.g., during feedback) */
  disabled?: boolean;
  /** Whether to show compact version */
  compact?: boolean;
}

/**
 * Icon component for hint level visualization.
 */
function HintLevelIcon({ level }: { level: HintLevel }) {
  const icons: Record<HintLevel, React.ReactElement> = {
    [HintLevel.None]: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    [HintLevel.Method]: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    [HintLevel.FirstStep]: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    [HintLevel.MoreSteps]: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    [HintLevel.NearlyComplete]: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return icons[level] || icons[HintLevel.None];
}

/**
 * Single hint card component.
 */
function HintCard({ hint, isLatest }: { hint: Hint; isLatest: boolean }) {
  const levelColors: Record<HintLevel, string> = {
    [HintLevel.None]: 'border-muted bg-muted/30',
    [HintLevel.Method]: 'border-blue-500/30 bg-blue-500/10',
    [HintLevel.FirstStep]: 'border-purple-500/30 bg-purple-500/10',
    [HintLevel.MoreSteps]: 'border-amber-500/30 bg-amber-500/10',
    [HintLevel.NearlyComplete]: 'border-green-500/30 bg-green-500/10'
  };

  const levelTextColors: Record<HintLevel, string> = {
    [HintLevel.None]: 'text-muted-foreground',
    [HintLevel.Method]: 'text-blue-300',
    [HintLevel.FirstStep]: 'text-purple-300',
    [HintLevel.MoreSteps]: 'text-amber-300',
    [HintLevel.NearlyComplete]: 'text-green-300'
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-300 ${levelColors[hint.level]} ${
        isLatest ? 'ring-2 ring-primary/50 animate-in fade-in slide-in-from-top-2' : 'opacity-80'
      }`}
      role="article"
      aria-label={`${hint.title}: ${hint.content}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${levelTextColors[hint.level]}`}>
          <HintLevelIcon level={hint.level} />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className={`font-semibold ${levelTextColors[hint.level]}`}>
            {hint.title}
          </h3>
          <p className="text-foreground">{hint.content}</p>
          {hint.explanation && (
            <div className="mt-2 rounded bg-black/20 p-3 text-sm text-muted-foreground">
              <pre className="whitespace-pre-wrap font-sans">{hint.explanation}</pre>
            </div>
          )}
          {hint.revealedSteps && hint.revealedSteps.length > 0 && (
            <div className="mt-3 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Calculation Steps:</h4>
              <ul className="space-y-1 text-sm">
                {hint.revealedSteps.map((step, index) => (
                  <li key={index} className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span className="font-mono text-foreground">
                      {step.expression} = {step.result}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Progress indicator showing hint usage.
 */
function HintProgress({ current, total }: { current: number; total: number }) {
  const dots = useMemo(() => {
    return Array.from({ length: total }, (_, i) => ({
      filled: i < current,
      index: i
    }));
  }, [current, total]);

  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {dots.map(({ filled, index }) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-all duration-300 ${
            filled
              ? 'bg-purple-400 scale-110'
              : 'bg-muted-foreground/30'
          }`}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{current} of {total} hints used</span>
    </div>
  );
}

/**
 * HintDisplay component shows progressive hints for the current problem.
 *
 * Displays revealed hints in a stacked layout with visual progression
 * and a button to request more hints when available.
 */
export function HintDisplay({
  hintState,
  hintResult,
  onRequestHint,
  disabled = false,
  compact = false
}: HintDisplayProps) {
  // Don't render if no hints have been requested
  if (hintState.currentLevel === HintLevel.None) {
    return null;
  }

  const hasMoreHints = hintState.hasMoreHints;
  const hintsRemaining = hintState.totalHints - hintState.currentLevel;

  if (compact) {
    // Compact view: Only show the latest hint
    const latestHint = hintState.revealedHints[hintState.revealedHints.length - 1];

    if (!latestHint) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <HintProgress current={hintState.currentLevel} total={hintState.totalHints} />
          {hasMoreHints && (
            <button
              onClick={onRequestHint}
              disabled={disabled}
              className="text-sm text-purple-300 hover:text-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={`Get another hint (${hintsRemaining} remaining)`}
            >
              + More hints ({hintsRemaining})
            </button>
          )}
        </div>
        <HintCard hint={latestHint} isLatest={true} />
      </div>
    );
  }

  // Full view: Show all revealed hints
  return (
    <div
      className="space-y-4"
      role="region"
      aria-label="Progressive hints"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">Hints</h2>
          <HintProgress current={hintState.currentLevel} total={hintState.totalHints} />
        </div>
        {hasMoreHints && (
          <button
            onClick={onRequestHint}
            disabled={disabled}
            className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Get another hint (${hintsRemaining} remaining)`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            More Hints ({hintsRemaining})
          </button>
        )}
      </div>

      {/* Method info */}
      {hintResult && (
        <div className="text-sm text-muted-foreground">
          Using: <span className="font-medium text-foreground">{hintResult.methodDisplayName}</span>
        </div>
      )}

      {/* Hints stack */}
      <div className="space-y-3">
        {hintState.revealedHints.map((hint, index) => (
          <HintCard
            key={hint.level}
            hint={hint}
            isLatest={index === hintState.revealedHints.length - 1}
          />
        ))}
      </div>

      {/* No more hints message */}
      {!hasMoreHints && (
        <div className="rounded-lg border border-muted bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          All hints revealed. Try to complete the calculation!
        </div>
      )}
    </div>
  );
}
